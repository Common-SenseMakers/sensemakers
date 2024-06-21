import { firestore } from 'firebase-admin';

import { NotificationFreq } from '../@shared/types/types.notifications';
import {
  AppUser,
  AppUserCreate,
  AutopostOption,
  DefinedIfTrue,
  FetchedDetails,
  PLATFORM,
  UserDetailsBase,
  UserPlatformProfile,
  UserSettings,
  UserSettingsUpdate,
  UserWithPlatformIds,
} from '../@shared/types/types.user';
import { DBInstance } from '../db/instance';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';
import { UsersHelper } from './users.helper';
import { getPrefixedUserId } from './users.utils';

const DEBUG = false;

const getProfileId = (userId: string, platform: PLATFORM, user_id: string) =>
  `${userId}-${platform}-${user_id}`;

export class UsersRepository {
  constructor(protected db: DBInstance) {}

  protected async getUserRef(
    userId: string,
    manager: TransactionManager,
    onlyIfExists: boolean = false
  ) {
    const ref = this.db.collections.users.doc(userId);
    if (onlyIfExists) {
      const doc = await this.getUserDoc(userId, manager);

      if (!doc.exists) {
        throw new Error(`User ${userId} not found`);
      }
    }

    return ref;
  }

  protected async getUserDoc(userId: string, manager: TransactionManager) {
    const ref = await this.getUserRef(userId, manager);
    return manager.get(ref);
  }

  public async userExists(userId: string, manager: TransactionManager) {
    const doc = await this.getUserDoc(userId, manager);
    return doc.exists;
  }

  public async getUser<T extends boolean>(
    userId: string,
    manager: TransactionManager,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, AppUser>> {
    const doc = await this.getUserDoc(userId, manager);

    const _shouldThrow = shouldThrow !== undefined ? shouldThrow : false;

    const data = doc.data();
    if (!doc.exists || !data || Object.keys(data).length === 0) {
      if (_shouldThrow) throw new Error(`User ${userId} not found`);
      else return undefined as DefinedIfTrue<T, AppUser>;
    }

    return {
      userId,
      ...doc.data(),
    } as unknown as DefinedIfTrue<T, AppUser>;
  }

  /** Sensistive method! Call only if the platform and user_id were authenticated */
  public async getUserWithPlatformAccount<T extends boolean>(
    platform: PLATFORM,
    user_id: string,
    manager: TransactionManager,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, string>> {
    const prefixed_user_id = getPrefixedUserId(platform, user_id);

    /** protect against changes in the property name */
    const platformIds_property: keyof UserWithPlatformIds = 'platformIds';
    const query = this.db.collections.users.where(
      platformIds_property,
      'array-contains',
      prefixed_user_id
    );
    const snap = await manager.query(query);

    const _shouldThrow = shouldThrow !== undefined ? shouldThrow : false;

    if (snap.empty) {
      if (_shouldThrow)
        throw new Error(
          `User with user_id: ${user_id} and platform ${platform} not found`
        );
      else return undefined as DefinedIfTrue<T, string>;
    }

    if (snap.size > 1) {
      throw new Error(
        `Data corrupted. Unexpected multiple users with the same platform user_id ${prefixed_user_id}`
      );
    }

    /** should not return the data as it does not include the tx manager cache */
    return snap.docs[0].id as DefinedIfTrue<T, string>;
  }

  public async getByPlatformUsername<T extends boolean>(
    platformId: PLATFORM,
    usernameTag: string,
    username: string,
    manager: TransactionManager,
    shouldThrow?: T
  ) {
    const platformId_property: keyof UserPlatformProfile = 'platformId';
    const profile_property: keyof UserPlatformProfile = 'profile';

    const query = this.db.collections.profiles
      .where(platformId_property, '==', platformId)
      .where(`${profile_property}.${usernameTag}`, '==', username);

    const snap = await manager.query(query);

    const _shouldThrow = shouldThrow !== undefined ? shouldThrow : false;

    if (snap.empty) {
      if (_shouldThrow)
        throw new Error(
          `User with profile.username: ${username} and platform ${platformId} not found`
        );
      else return undefined as DefinedIfTrue<T, string>;
    }

    if (snap.size > 1) {
      throw new Error(
        `Data corrupted. Unexpected multiple users with the same platform username ${username}`
      );
    }

    const userId = (snap.docs[0].data() as UserPlatformProfile).userId;
    return userId as DefinedIfTrue<T, string>;
  }

  public async createUser(
    userId: string,
    user: AppUserCreate,
    manager: TransactionManager
  ) {
    const ref = await this.getUserRef(userId, manager);
    manager.create(ref, user);

    /** keep the profiles collection in sync */
    const platformAccounts = UsersHelper.getAllAccounts(user);
    platformAccounts.forEach((platformAccount) => {
      if (platformAccount.account.profile) {
        const profileRef = this.db.collections.profiles.doc(
          getProfileId(
            userId,
            platformAccount.platform,
            platformAccount.account.user_id
          )
        );
        const data: UserPlatformProfile = {
          userId,
          profile: platformAccount.account.profile,
          platformId: platformAccount.platform,
          user_id: platformAccount.account.user_id,
        };
        manager.create(profileRef, data);
      }
    });

    return ref.id;
  }

  /**
   * Just update the lastFetchedMs value of a given account
   * */
  public async setAccountFetched(
    platform: PLATFORM,
    user_id: string,
    fetched: FetchedDetails,
    manager: TransactionManager
  ) {
    /** check if this platform user_id already exists */
    const existingUserId = await this.getUserWithPlatformAccount(
      platform,
      user_id,
      manager,
      true
    );

    const existingUser = await this.getUser(existingUserId, manager, true);

    if (platform === PLATFORM.Local) {
      throw new Error('Unexpected');
    }

    const accounts = existingUser[platform];
    if (accounts === undefined) {
      throw new Error(`User accounts not found`);
    }

    /** find the ix */
    const ix = accounts.findIndex((a) => a.user_id === user_id);

    if (ix === -1) {
      throw new Error(`Account ${platform}:${user_id} not found`);
    }

    const current = accounts[ix];

    /** merge the new fetched value with the current one */
    const newFetched = (() => {
      const currentFetched = current.fetched || {};
      if (fetched.newest_id) {
        currentFetched.newest_id = fetched.newest_id;
      }

      if (fetched.oldest_id) {
        currentFetched.oldest_id = fetched.oldest_id;
      }

      return currentFetched;
    })();

    current.fetched = newFetched;

    const userRef = await this.getUserRef(existingUser.userId, manager, true);

    /** overwrite all the user account credentials */
    manager.update(userRef, { [platform]: accounts });
  }

  /** append or overwrite userDetails for an account of a given platform */
  public async setPlatformDetails(
    userId: string,
    platform: PLATFORM,
    details: UserDetailsBase,
    manager: TransactionManager
  ) {
    /**
     * the user is either the existing with that account, or the
     * one from userId
     */
    const user = await (async () => {
      const existWithAccountId = await this.getUserWithPlatformAccount(
        platform,
        details.user_id,
        manager
      );

      const existWithAccount = existWithAccountId
        ? await this.getUser(existWithAccountId, manager)
        : undefined;

      if (existWithAccount) {
        if (DEBUG)
          logger.debug(`setPlatformDetails existWithAccount`, {
            existWithAccount,
          });
        return existWithAccount;
      }

      if (DEBUG) logger.debug(`setPlatformDetails new account`, { userId });
      return this.getUser(userId, manager, true);
    })();

    /** set the user account */
    const { accounts, platformIds } = await (async () => {
      /**  overwrite previous details for that user account*/
      if (platform === PLATFORM.Local) {
        throw new Error('Unexpected');
      }

      const accounts: UserDetailsBase[] = user[platform] || [];
      let platformIds = user.platformIds;

      if (DEBUG)
        logger.debug(`setPlatformDetails accounts`, {
          accounts,
          platformIds,
          details,
        });

      /** find the specific account */
      const ix = accounts.findIndex((a) => a.user_id === details.user_id);
      if (ix !== -1) {
        /** set the new details of that account */
        if (DEBUG)
          logger.debug(`setPlatformDetails account found - overwritting`);
        /** keep the fetched details */
        accounts[ix] = { ...accounts[ix], ...details };
      } else {
        if (DEBUG)
          logger.debug(`setPlatformDetails account not found - creating`);
        accounts.push(details);
        platformIds.push(getPrefixedUserId(platform, details.user_id));
      }

      return { accounts, platformIds };
    })();

    if (DEBUG)
      logger.debug(`setPlatformDetails accounts and platformIds`, {
        accounts,
        platformIds,
      });

    const userRef = await this.getUserRef(userId, manager, true);
    const platformIds_property: keyof UserWithPlatformIds = 'platformIds';
    const update: Partial<AppUser> = {
      [platformIds_property]: platformIds,
      [platform]: accounts,
    };

    if (DEBUG) logger.debug(`Updating user ${userId}`, { update });

    manager.update(userRef, update);

    // update mirror collection profiles
    if (details.profile) {
      const profileRef = this.db.collections.profiles.doc(
        getProfileId(userId, platform, details.user_id)
      );
      manager.set(profileRef, { profile: details.profile }, { merge: true });
    }
  }

  /** remove userDetails of a given platform */
  public async removePlatformDetails(
    userId: string,
    platform: PLATFORM,
    user_id: string,
    manager: TransactionManager
  ) {
    const doc = await this.getUserDoc(userId, manager);

    if (!doc.exists) {
      throw new Error(`User ${userId} not found`);
    }

    const user = doc.data();

    if (
      !user ||
      !Array.isArray(user[platform]) ||
      user[platform].length === 0
    ) {
      throw new Error(`User ${userId} data as expected`);
    }

    const details = (user[platform] as Array<UserDetailsBase>).find(
      (details) => details.user_id === user_id
    );

    if (!details) {
      throw new Error(`Details for user ${userId} not found`);
    }

    manager.update(doc.ref, {
      [platform]: firestore.FieldValue.arrayRemove(details),
    });
  }

  public async getWithAutopostValues(
    platformId: PLATFORM,
    values: AutopostOption[]
  ): Promise<string[]> {
    const settingsKey: keyof AppUser = 'settings';
    const autopostKey: keyof UserSettings = 'autopost';

    const query = this.db.collections.users.where(
      `${settingsKey}.${autopostKey}.${platformId}.value`,
      'in',
      values
    );

    const result = await query.get();
    return result.docs.map((doc) => doc.id) as string[];
  }

  public async getAll() {
    const snapshot = await this.db.collections.users.get();
    return snapshot.docs.map((doc) => doc.id);
  }

  public async getAllIds() {
    const snapshot = await this.db.collections.users.get();
    const usersIds: string[] = [];
    snapshot.forEach((doc) => {
      usersIds.push(doc.id);
    });

    return usersIds;
  }

  public async updateSettings(
    userId: string,
    updateSettings: UserSettingsUpdate,
    manager: TransactionManager
  ) {
    const ref = await this.getUserRef(userId, manager, true);
    const existing = await this.getUser(userId, manager, true);

    const newSettings: UserSettings = {
      ...existing.settings,
      ...updateSettings,
    };

    manager.update(ref, {
      settings: newSettings,
    });
  }

  public async getWithNotificationFrequency(
    notificationFrequency: NotificationFreq
  ) {
    const settingsKey: keyof AppUser = 'settings';
    const notificationFrequencyKey: keyof UserSettings = 'notificationFreq';

    const query = this.db.collections.users.where(
      `${settingsKey}.${notificationFrequencyKey}`,
      '==',
      notificationFrequency
    );

    const result = await query.get();

    return result.docs.map((doc) => doc.id) as string[];
  }

  public async updateEmail(
    userId: string,
    email: string,
    manager: TransactionManager
  ) {
    const ref = await this.getUserRef(userId, manager, true);
    manager.update(ref, { email });
  }
}
