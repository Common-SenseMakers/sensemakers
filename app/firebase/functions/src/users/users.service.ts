import { HandleSignupResult } from '../@shared/types/types.fetch';
import {
  ALL_IDENTITY_PLATFORMS,
  IDENTITY_PLATFORM,
  PLATFORM,
} from '../@shared/types/types.platforms';
import {
  AccountProfileCreate,
  AccountProfileRead,
} from '../@shared/types/types.profiles';
import {
  AccountCredentials,
  AccountDetailsBase,
  AccountDetailsRead,
  AppUserPublicRead,
  AppUserRead,
  EmailDetails,
  UserSettings,
  UserSettingsUpdate,
} from '../@shared/types/types.user';
import { USER_INIT_SETTINGS } from '../config/config.runtime';
import { DBInstance } from '../db/instance';
import { removeUndefined } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';
import {
  IdentityServicesMap,
  PlatformsMap,
} from '../platforms/platforms.service';
import { ProfilesService } from '../profiles/profiles.service';
import { TimeService } from '../time/time.service';
import { UsersHelper } from './users.helper';
import { UsersRepository } from './users.repository';
import { getPrefixedUserId } from './users.utils';

const DEBUG = false;
const DEBUG_PREFIX = 'UsersService';

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
    public profiles: ProfilesService,
    public identityPlatforms: IdentityServicesMap,
    public platformServices: PlatformsMap,
    public time: TimeService
  ) {}

  private getIdentityService(platform: PLATFORM) {
    const service = this.identityPlatforms.get(platform);
    if (!service) {
      throw new Error(`Identity service ${platform} not found`);
    }
    return service;
  }

  public async createUser(clerkId: string, manager: TransactionManager) {
    const initSettings: UserSettings = USER_INIT_SETTINGS;

    const userId = await this.repo.createUser(
      {
        clerkId,
        settings: initSettings,
        signupDate: this.time.now(),
        accounts: {},
      },
      manager
    );

    return userId;
  }

  /**
   * This method request the user signup context and stores it in the user profile.
   * If the user is not defined (first time), the details are stored on a temporary
   * collection and associated to a random signup_token
   */
  public async getSignupContext<R = any>(
    platform: PLATFORM,
    params?: any
  ): Promise<R> {
    const context =
      await this.getIdentityService(platform).getSignupContext(params);

    if (DEBUG)
      logger.debug('UsersService: getSignupContext', {
        platform,
        params,
        context,
      });

    return context;
  }

  /**
   * This method validates the signup (connect platform) data and stores it in the user profile.
   * A userId must be provided the user must exist and a new platform is added to it,
   */
  public async handleSignup<T = any>(
    platform: IDENTITY_PLATFORM,
    signupData: T,
    manager: TransactionManager,
    userId: string // MUST be the authenticated userId if provided
  ): Promise<HandleSignupResult | undefined> {
    /**
     * validate the signup data for this platform and convert it into
     * user details
     */
    if (DEBUG)
      logger.debug('UsersService: handleSignup', {
        platform,
        signupData,
        userId,
      });

    const { accountDetails: authenticatedDetails, profile } =
      await this.getIdentityService(platform).handleSignupData(signupData);

    const prefixed_user_id = getPrefixedUserId(
      platform,
      authenticatedDetails.user_id
    );

    const existingUserWithAccountId =
      await this.repo.getUserIdWithPlatformAccount(
        platform,
        authenticatedDetails.user_id,
        manager
      );

    if (DEBUG)
      logger.debug('UsersService: handleSignup', {
        authenticatedDetails,
        prefixed_user_id,
        existingUserWithAccountId,
      });

    /** If existing user and the new userId is different, we consider this a replace legacy user operation */
    if (existingUserWithAccountId && existingUserWithAccountId !== userId) {
      await this.replaceLegacyUser(
        existingUserWithAccountId,
        userId,
        platform,
        authenticatedDetails,
        manager
      );

      return {
        userId,
        linkProfile: false,
        replaceLegacy: {
          existingUserId: existingUserWithAccountId,
          newUserId: userId,
        },
      };
    }

    /** If existing user and the new userId is the same, we consider this a reconnect account operation */
    if (existingUserWithAccountId && existingUserWithAccountId === userId) {
      await this.repo.setAccountDetails(
        userId,
        platform,
        { ...authenticatedDetails, isDisconnected: false },
        manager
      );
      return {
        userId,
        linkProfile: false,
      };
    }

    /**
     * the user has not registered this platform user_id, then store it as a new entry on the [platform] array
     * of the AppUser object
     * */
    if (DEBUG)
      logger.debug(
        'the user has not registered this platform user_id, then store it',
        { userId, platform, authenticatedDetails }
      );

    await this.repo.setAccountDetails(
      userId,
      platform,
      authenticatedDetails,
      manager
    );

    /** create the profile when adding that account */
    const profileCreate: AccountProfileCreate = {
      ...profile,
      userId,
      platformId: platform,
    };

    await this.profiles.upsertProfile(profileCreate, manager);

    return {
      userId,
      linkProfile: true,
    };
  }

  protected async replaceLegacyUser(
    existingUserId: string,
    newUserId: string,
    platform: PLATFORM,
    details: AccountDetailsBase,
    manager: TransactionManager
  ) {
    const existingUser = await this.repo.getUser(existingUserId, manager, true);

    /** copy accounts from legacy user */
    await this.repo.setAccounts(newUserId, existingUser.accounts, manager);

    /** set the just-used account details */
    await this.repo.setAccountDetails(newUserId, platform, details, manager);

    /** update all profiles to be of the new userId */
    const profiles = await this.profiles.repo.getOfUser(
      existingUserId,
      manager
    );

    await Promise.all(
      profiles.map(async (profile) => {
        await this.profiles.repo.update(
          profile.id,
          { userId: newUserId },
          manager
        );
      })
    );
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
    account.credentials = removeUndefined(credentials);

    if (DEBUG)
      logger.debug(
        'getUserClientAndUpdateDetails - newDetails',
        account,
        DEBUG_PREFIX
      );

    await this.repo.setAccountDetails(userId, platformId, account, manager);
  }
  public async updateAccountDisconnectedStatus(
    userId: string,
    platformId: PLATFORM,
    user_id: string,
    isDisconnected: boolean,
    manager: TransactionManager
  ) {
    if (DEBUG)
      logger.debug(
        'updateAccountDisconnectedStatus - isDisconnected status',
        isDisconnected,
        DEBUG_PREFIX
      );

    const user = await this.repo.getUser(userId, manager, true);

    if (platformId === PLATFORM.Local) {
      throw new Error('Cannot update local account status');
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
    account.isDisconnected = isDisconnected;

    if (DEBUG)
      logger.debug(
        'getUserClientAndUpdateDetails - newDetails',
        account,
        DEBUG_PREFIX
      );

    await this.repo.setAccountDetails(userId, platformId, account, manager);
  }

  public async getUserReadProfiles(
    userId: string,
    manager: TransactionManager
  ) {
    const user = await this.repo.getUser(userId, manager, true);
    const profiles: AppUserRead['profiles'] = {};

    /** extract the profile for each account */
    await Promise.all(
      ALL_IDENTITY_PLATFORMS.map(async (platform) => {
        const accounts = UsersHelper.getAccounts(user, platform);

        await Promise.all(
          accounts.map(async (account) => {
            const profile = await this.profiles.repo.getProfile(
              platform,
              account.user_id,
              manager
            );

            if (profile && profile.profile) {
              const current = profiles[platform] || [];

              current.push({
                user_id: account.user_id,
                platformId: platform,
                profile: profile.profile,
                read: account.credentials.read !== undefined,
                write: account.credentials.write !== undefined,
                isDisconnected: account.isDisconnected,
              });

              profiles[platform] = current as AccountDetailsRead<any>[];
            }
          })
        );
      })
    );

    return profiles;
  }

  /** get a user and their public profiles data */
  public async getPublicUserWithProfiles(
    userId: string,
    manager: TransactionManager
  ): Promise<AppUserPublicRead> {
    const readProfiles = await this.getUserReadProfiles(userId, manager);
    const publicProfiles: AppUserPublicRead['profiles'] = {};

    (Array.from(Object.keys(readProfiles)) as IDENTITY_PLATFORM[]).forEach(
      (platform: IDENTITY_PLATFORM) => {
        const accounts = readProfiles[platform];
        if (accounts) {
          publicProfiles[platform] = accounts.map((account) => {
            const profile: AccountProfileRead = {
              platformId: account.platformId,
              user_id: account.user_id,
              userId: userId,
              profile: account.profile,
            };
            return profile;
          });
        }
      }
    );

    return {
      userId,
      profiles: publicProfiles,
    };
  }

  public async getLoggedUserWithProfiles(
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

    const readProfiles = await this.getUserReadProfiles(userId, manager);

    const userRead: AppUserRead = {
      userId,
      clerkId: user.clerkId,
      email,
      signupDate: user.signupDate,
      settings: user.settings,
      profiles: readProfiles,
      details: user.details,
    };

    return userRead;
  }

  updateSettings(
    userId: string,
    settings: UserSettingsUpdate,
    manager: TransactionManager
  ) {
    // set timestamp
    return this.repo.updateSettings(userId, settings, manager);
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

  async setOnboarded(userId: string, manager: TransactionManager) {
    await this.repo.setOnboarded(userId, manager);
  }
}
