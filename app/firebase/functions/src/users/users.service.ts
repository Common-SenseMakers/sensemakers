import { Magic } from '@magic-sdk/admin';
import * as jwt from 'jsonwebtoken';

import {
  HandleSignupResult,
  OurTokenConfig,
} from '../@shared/types/types.fetch';
import {
  ALL_IDENTITY_PLATFORMS,
  IDENTITY_PLATFORM,
  PLATFORM,
} from '../@shared/types/types.platforms';
import { AccountProfileCreate } from '../@shared/types/types.profiles';
import {
  AccountCredentials,
  AccountDetailsRead,
  AppUserRead,
  EmailDetails,
  UserSettings,
  UserSettingsUpdate,
} from '../@shared/types/types.user';
import { USER_INIT_SETTINGS } from '../config/config.runtime';
import { DBInstance } from '../db/instance';
import { TransactionManager } from '../db/transaction.manager';
import { EmailSenderService } from '../emailSender/email.sender.service';
import { logger } from '../instances/logger';
import {
  IdentityServicesMap,
  PlatformsMap,
} from '../platforms/platforms.service';
import { ProfilesRepository } from '../profiles/profiles.repository';
import { TimeService } from '../time/time.service';
import { UsersHelper } from './users.helper';
import { UsersRepository } from './users.repository';
import { getPrefixedUserId } from './users.utils';

const DEBUG = true;
const DEBUG_PREFIX = 'UsersService';

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
    public profiles: ProfilesRepository,
    public identityPlatforms: IdentityServicesMap,
    public platformServices: PlatformsMap,
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
    platform: IDENTITY_PLATFORM,
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

    const { accountDetails: authenticatedDetails, profile } =
      await this.getIdentityService(platform).handleSignupData(signupData);

    const prefixed_user_id = getPrefixedUserId(
      platform,
      authenticatedDetails.user_id
    );

    const existingUserWithAccountId =
      await this.profiles.getUserIdWithPlatformAccount(
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

        await this.repo.setAccountDetails(
          _userId,
          platform,
          authenticatedDetails,
          manager
        );

        /** create the profile when addint that account */
        const profileCreate: AccountProfileCreate = {
          ...profile,
          userId: _userId,
          platformId: platform,
        };

        this.profiles.create(profileCreate, manager);
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

        await this.repo.setAccountDetails(
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

        const userId = await this.repo.createUser(
          prefixed_user_id,
          {
            settings: initSettings,
            signupDate: this.time.now(),
            accounts: {
              [platform]: [authenticatedDetails],
            },
          },
          manager
        );

        /** create profile and link it to the user */
        /** create the profile when addint that account */
        const profileCreate: AccountProfileCreate = {
          ...profile,
          userId,
          platformId: platform,
        };

        this.profiles.create(profileCreate, manager);

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

  public async updateAccountCredentials(
    userId: string,
    platformId: PLATFORM,
    user_id: string,
    credentials: AccountCredentials,
    manager: TransactionManager
  ) {
    if (DEBUG)
      logger.debug(
        'getUserClientAndUpdateDetails - newCredentials',
        credentials,
        DEBUG_PREFIX
      );

    const user = await this.repo.getUser(userId, manager, true);

    if (platformId === PLATFORM.Local) {
      throw new Error('Cannot update local credentials');
    }

    const accounts = user.accounts[platformId];
    if (!accounts) {
      throw new Error('Unexpected accounts not found');
    }

    const account = accounts.find((c) => c.user_id === user_id);
    if (!account) {
      throw new Error(`Unexpected account for user_id ${user_id} not found`);
    }

    /** update the credentials */
    account.credentials = credentials;

    if (DEBUG)
      logger.debug(
        'getUserClientAndUpdateDetails - newDetails',
        account,
        DEBUG_PREFIX
      );

    await this.repo.setAccountDetails(
      userId,
      PLATFORM.Twitter,
      account,
      manager
    );
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

  public async getOrCreateProfile(
    platformId: PLATFORM,
    user_id: string,
    manager: TransactionManager
  ) {}
  public async getOrCreateProfileByUsername(
    platformId: IDENTITY_PLATFORM,
    username: string,
    manager: TransactionManager
  ) {
    const profileId = await this.profiles.getByPlatformUsername(
      platformId,
      'username',
      username,
      manager
    );

    if (profileId) {
      return await this.profiles.getByProfileId(profileId, manager);
    }

    const profile = await this.platformServices
      .get(platformId)
      ?.getProfileByUsername(username);

    if (!profile) {
      throw new Error('Profile not found');
    }
    const profileCreate: AccountProfileCreate = {
      ...profile,
      platformId: platformId,
    };
    this.profiles.create(profileCreate, manager);
    return profile;
  }

  public async getUserWithProfiles(
    userId: string,
    manager: TransactionManager
  ) {
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
      profiles: {},
    };

    /** extract the profile for each account */
    await Promise.all(
      ALL_IDENTITY_PLATFORMS.map(async (platform) => {
        const accounts = UsersHelper.getAccounts(user, platform);

        await Promise.all(
          accounts.map(async (account) => {
            const profile = await this.profiles.getProfile(
              platform,
              account.user_id,
              manager
            );

            if (profile) {
              const current = userRead.profiles[platform] || [];

              current.push({
                user_id: account.user_id,
                profile: profile.profile,
                read: account.credentials.read !== undefined,
                write: account.credentials.write !== undefined,
              });

              userRead.profiles[platform] =
                current as AccountDetailsRead<any>[];
            }
          })
        );
      })
    );

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
