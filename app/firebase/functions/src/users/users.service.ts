import { Magic } from '@magic-sdk/admin';
import * as jwt from 'jsonwebtoken';

import {
  HandleSignupResult,
  OurTokenConfig,
} from '../@shared/types/types.fetch';
import {
  ALL_IDENTITY_PLATFORMS,
  AccountDetailsRead,
  AppUserRead,
  EmailDetails,
  PLATFORM,
  UserSettings,
  UserSettingsUpdate,
} from '../@shared/types/types.user';
import { USER_INIT_SETTINGS } from '../config/config.runtime';
import { DBInstance } from '../db/instance';
import { TransactionManager } from '../db/transaction.manager';
import { EmailSenderService } from '../emailSender/email.sender.service';
import { logger } from '../instances/logger';
import { IdentityServicesMap } from '../platforms/platforms.service';
import { TimeService } from '../time/time.service';
import { UsersHelper } from './users.helper';
import { UsersRepository } from './users.repository';
import { getPrefixedUserId, getUsernameTag } from './users.utils';

const DEBUG = true;

interface TokenData {
  userId: string;
}

/**
 * A user profile is made up of a dictionary of PLATFORM => Arrray<AuthenticationDetails>
 * One user can have multiple profiles on each platform.
 *
 * Authentication details may be OAuth access tokens, or validated details about the user
 * identity like its public key/address.
 */
export class UsersService {
  constructor(
    public db: DBInstance,
    public repo: UsersRepository,
    public identityPlatforms: IdentityServicesMap,
    public time: TimeService,
    public emailSender: EmailSenderService,
    protected ourToken: OurTokenConfig
  ) {}

  private getIdentityService(platform: PLATFORM) {
    const service = this.identityPlatforms.get(platform);
    if (!service) {
      throw new Error(`Identity service ${platform} not found`);
    }
    return service;
  }

  /**
   * This method request the user signup context and stores it in the user profile.
   * If the user is not defined (first time), the details are stored on a temporary
   * collection and associated to a random signup_token
   */
  public async getSignupContext<R = any>(
    platform: PLATFORM,
    userId?: string,
    params?: any
  ): Promise<R> {
    const context = await this.getIdentityService(platform).getSignupContext(
      userId,
      params
    );

    if (DEBUG)
      logger.debug('UsersService: getSignupContext', {
        userId,
        platform,
        params,
        context,
      });

    return context;
  }

  /**
   * This method validates the signup data and stores it in the user profile. If
   * a userId is provided the user must exist and a new platform is added to it,
   * otherewise a new user is created.
   */
  public async handleSignup<T = any>(
    platform: PLATFORM,
    signupData: T,
    manager: TransactionManager,
    _userId?: string // MUST be the authenticated userId if provided
  ): Promise<HandleSignupResult | undefined> {
    /**
     * validate the signup data for this platform and convert it into
     * user details
     */
    if (DEBUG)
      logger.debug('UsersService: handleSignup', {
        platform,
        signupData,
        userId: _userId,
      });

    const authenticatedDetails =
      await this.getIdentityService(platform).handleSignupData(signupData);

    const prefixed_user_id = getPrefixedUserId(
      platform,
      authenticatedDetails.user_id
    );

    const existingUserWithAccountId =
      await this.repo.getUserWithPlatformAccount(
        platform,
        authenticatedDetails.user_id,
        manager
      );

    const existingUserWithAccount = existingUserWithAccountId
      ? await this.repo.getUser(existingUserWithAccountId, manager)
      : undefined;

    if (DEBUG)
      logger.debug('UsersService: handleSignup', {
        authenticatedDetails,
        prefixed_user_id,
        existingUserWithAccount,
      });

    if (_userId) {
      /**
       * authenticated userId is provided: then the users exists and may or may not have
       * already registered this platform user_id
       * */

      if (existingUserWithAccount) {
        /**
         * a user has already registered this platform user_id, then check which user registered it.
         * */

        if (existingUserWithAccount.userId !== _userId) {
          /**
           * the user with this platform user_id is another userId then we have a problem. This person has two
           *  user profiles on our app and the should be merged.
           * */

          throw new Error(
            `Unexpected, existing user ${existingUserWithAccount.userId} with this platform user_id ${prefixed_user_id} does not match the userId provided ${_userId}`
          );
        }

        /**
         * the user with this platform user_id is the same authenticated userId, then simply return. The current
         * ourAccessToken is valid and this is an unexpected call since there was no need to signup with this platform
         * and user_id
         * */
        if (DEBUG)
          logger.debug(
            'the user with this platform user_id is the same authenticated userId'
          );

        return {
          userId: _userId,
        };
      } else {
        /**
         * the user has not registered this platform user_id, then store it as a new entry on the [platform] array
         * of the AppUser object
         * */
        if (DEBUG)
          logger.debug(
            'the user has not registered this platform user_id, then store it',
            { _userId, platform, authenticatedDetails }
          );

        await this.repo.setPlatformDetails(
          _userId,
          platform,
          authenticatedDetails,
          manager
        );
      }
    } else {
      /**
       * authenticated userId not provided: the user may or may not exist
       * */

      if (existingUserWithAccount) {
        /**
         * a user exist with this platform user_id, then return an accessToken and consider this a login for that userId
         * */

        const userId = existingUserWithAccount.userId;

        if (DEBUG)
          logger.debug(
            ' user exist with this platform user_id, then return an accessToken'
          );

        await this.repo.setPlatformDetails(
          userId,
          platform,
          authenticatedDetails,
          manager
        );

        return {
          ourAccessToken: this.generateOurAccessToken({
            userId,
          }),
          userId,
        };
      } else {
        /**
         * a user does not exist with this platform user_id then this is the first time that platform is used to signin
         * and we need to create a new user.
         * */

        const initSettings: UserSettings = USER_INIT_SETTINGS;

        await this.repo.createUser(
          prefixed_user_id,
          {
            settings: initSettings,
            signupDate: this.time.now(),
            platformIds: [prefixed_user_id],
            [platform]: [authenticatedDetails],
          },
          manager
        );

        if (DEBUG)
          logger.debug(
            'a user does not exist with this platform user_id then this is the first time that platform is used to signin and we need to create a new user.'
          );

        return {
          ourAccessToken: this.generateOurAccessToken({
            userId: prefixed_user_id,
          }),
          userId: prefixed_user_id,
        };
      }
    }

    return;
  }

  protected generateOurAccessToken(data: TokenData) {
    return jwt.sign(data, this.ourToken.tokenSecret, {
      expiresIn: this.ourToken.expiresIn,
    });
  }

  public verifyAccessToken(token: string) {
    const verified = jwt.verify(token, this.ourToken.tokenSecret, {
      complete: true,
    }) as unknown as jwt.JwtPayload & TokenData;
    return verified.payload.userId;
  }

  public async getUserProfileFromPlatformUsername(
    platformId: PLATFORM,
    username: string
  ) {
    const profile = await this.db.run(async (manager) => {
      const usernameTag = getUsernameTag(platformId);
      const userId = await this.repo.getByPlatformUsername(
        platformId,
        usernameTag,
        username,
        manager,
        true
      );

      return this.getUserProfile(userId, manager);
    });

    return profile;
  }

  public async getUserProfile(userId: string, manager: TransactionManager) {
    const user = await this.repo.getUser(userId, manager, true);

    /** delete the token, from the public profile */
    const email: EmailDetails | undefined = user.email
      ? {
          ...user.email,
        }
      : undefined;

    const userRead: AppUserRead = {
      userId,
      email,
      signupDate: user.signupDate,
      settings: user.settings,
    };

    /** extract the profile for each account */
    ALL_IDENTITY_PLATFORMS.forEach((platform) => {
      const accounts = UsersHelper.getAccounts(user, platform);

      accounts.forEach((account) => {
        const current = userRead[platform] || [];
        current.push({
          user_id: account.user_id,
          profile: account.profile,
          read: account.read !== undefined,
          write: account.write !== undefined,
        });

        userRead[platform] = current as AccountDetailsRead<any>[];
      });
    });

    return userRead;
  }

  updateSettings(userId: string, settings: UserSettingsUpdate) {
    return this.db.run(async (manager) => {
      // set timestamp
      if (settings.autopost) {
        settings.autopost[PLATFORM.Nanopub] = {
          value: settings.autopost[PLATFORM.Nanopub].value,
          after: this.time.now(),
        };
      }

      await this.repo.updateSettings(userId, settings, manager);
    });
  }

  setEmail(userId: string, emailDetails: EmailDetails) {
    return this.db.run(async (manager) => {
      const user = await this.repo.getUser(userId, manager, true);
      if (user.email) {
        throw new Error('Email already set');
      }

      await this.repo.setEmail(user.userId, emailDetails, manager);
    });
  }

  async setEmailFromMagic(userId: string, idToken: string, magic: Magic) {
    const userMetadata = await magic.users.getMetadataByToken(idToken);
    if (DEBUG) {
      logger.debug('setEmailFromMagic', { userId, userMetadata });
    }

    await this.db.run(async (manager) => {
      const user = await this.repo.getUser(userId, manager, true);
      if (user.email) {
        throw new Error('Email already set');
      }

      const accounts = UsersHelper.getAccounts(user, PLATFORM.Nanopub);
      const addresses = accounts.map((a) => a.user_id.toLocaleLowerCase());

      if (DEBUG) {
        logger.debug('setEmailFromMagic - addresses', { accounts, addresses });
      }

      /** check the magic user has a wallet that is owned by the logged in user */
      if (
        userMetadata.publicAddress &&
        addresses.includes(userMetadata.publicAddress.toLocaleLowerCase())
      ) {
        if (userMetadata.email) {
          if (DEBUG) {
            logger.debug('setEmailFromMagic- email', {
              email: userMetadata.email,
            });
          }

          await this.repo.setEmail(
            user.userId,
            { email: userMetadata.email, source: 'MAGIC' },
            manager
          );
        } else {
          throw new Error('No email found');
        }
      } else {
        throw new Error('No wallet found');
      }
    });

    await this.emailSender.sendAdminEmail(
      'User signup',
      `User ${userMetadata.email} signed up`
    );
  }
}
