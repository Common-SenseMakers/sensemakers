import { FieldValue } from 'firebase-admin/firestore';

import { NotificationFreq } from '../@shared/types/types.notifications';
import { PLATFORM } from '../@shared/types/types.platforms';
import {
  AccountDetailsBase,
  AppUser,
  AppUserCreate,
  AutopostOption,
  DefinedIfTrue,
  EmailDetails,
  UserSettings,
} from '../@shared/types/types.user';
import { DBInstance } from '../db/instance';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';
import { ProfilesRepository } from '../profiles/profiles.repository';
import { decodeId, encodeId } from './users.utils';

const DEBUG = false;

export class UsersRepository {
  constructor(
    protected db: DBInstance,
    protected profiles: ProfilesRepository
  ) {}

  protected async getUserRef(
    userId: string,
    manager: TransactionManager,
    onlyIfExists: boolean = false
  ) {
    const ref = this.db.collections.users.doc(encodeId(userId));
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

  public async createUser(
    userId: string,
    user: AppUserCreate,
    manager: TransactionManager
  ) {
    const ref = await this.getUserRef(userId, manager);
    manager.create(ref, user);
    return decodeId(ref.id);
  }

  /** append or overwrite userDetails for an account of a given platform */
  public async setAccountDetails(
    userId: string,
    platform: PLATFORM,
    details: AccountDetailsBase,
    manager: TransactionManager
  ) {
    /**
     * the user is either the existing with that account, or the
     * one from userId
     */
    const user = await (async () => {
      const existWithAccountId =
        await this.profiles.getUserIdWithPlatformAccount(
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
    const { platformAccounts } = await (async () => {
      /**  overwrite previous details for that user account*/
      if (platform === PLATFORM.Local) {
        throw new Error('Unexpected');
      }

      const platformAccounts: AccountDetailsBase[] =
        user.accounts[platform] || [];

      if (DEBUG)
        logger.debug(`setPlatformDetails accounts`, {
          platformAccounts,
          details,
        });

      /** find the specific account */
      const ix = platformAccounts.findIndex(
        (a) => a.user_id === details.user_id
      );

      if (ix !== -1) {
        /** set the new details of that account */
        if (DEBUG)
          logger.debug(`setPlatformDetails account found - overwritting`);
        /** keep the fetched details */
        platformAccounts[ix] = { ...platformAccounts[ix], ...details };
      } else {
        if (DEBUG)
          logger.debug(`setPlatformDetails account not found - creating`);
        platformAccounts.push(details);
      }

      return { platformAccounts };
    })();

    if (DEBUG)
      logger.debug(`setPlatformDetails accounts and platformIds`, {
        accounts: platformAccounts,
      });

    const userRef = await this.getUserRef(userId, manager, true);

    const update: Partial<AppUser> = {
      accounts: { ...user.accounts, [platform]: platformAccounts },
    };

    if (DEBUG) logger.debug(`Updating user ${userId}`, { update });

    manager.update(userRef, update);
  }

  /** remove userDetails of a given platform */
  public async removeAccountDetails(
    platform: PLATFORM,
    user_id: string,
    manager: TransactionManager
  ) {
    const userId = await this.profiles.getUserIdWithPlatformAccount(
      platform,
      user_id,
      manager,
      true
    );

    const doc = await this.getUserDoc(userId, manager);

    if (!doc.exists) {
      throw new Error(`User ${userId} not found`);
    }

    const user = doc.data() as AppUser;

    if (platform === PLATFORM.Local) {
      throw new Error('Unexpected');
    }

    if (
      !user ||
      !Array.isArray(user.accounts[platform]) ||
      user.accounts[platform].length === 0
    ) {
      throw new Error(`User ${userId} data as expected`);
    }

    const details = (user.accounts[platform] as Array<AccountDetailsBase>).find(
      (details) => details.user_id === user_id
    );

    if (!details) {
      throw new Error(`Details for user ${userId} not found`);
    }

    manager.update(doc.ref, {
      [platform]: FieldValue.arrayRemove(details),
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
    return result.docs.map((doc) => decodeId(doc.id)) as string[];
  }

  public async getAll() {
    const snapshot = await this.db.collections.users.get();
    return snapshot.docs.map((doc) => decodeId(doc.id));
  }

  public async getAllIds() {
    const snapshot = await this.db.collections.users.get();
    const usersIds: string[] = [];
    snapshot.forEach((doc) => {
      usersIds.push(decodeId(doc.id));
    });

    return usersIds;
  }

  public async updateSettings(
    userId: string,
    updateSettings: Partial<UserSettings>,
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

  public async getByNotificationFreq(
    notificationFrequency: NotificationFreq,
    manager: TransactionManager
  ) {
    const settingsKey: keyof AppUser = 'settings';
    const notificationFrequencyKey: keyof UserSettings = 'notificationFreq';

    const query = this.db.collections.users.where(
      `${settingsKey}.${notificationFrequencyKey}`,
      '==',
      notificationFrequency
    );

    const result = await manager.query(query);

    return result.docs.map((doc) => decodeId(doc.id)) as string[];
  }

  public async getByEmail<T extends boolean, R = string>(
    email: string,
    manager: TransactionManager,
    _shouldThrow?: boolean
  ) {
    const emailKey: keyof AppUser = 'email';
    const emailStrKey: keyof EmailDetails = 'email';

    const query = this.db.collections.users.where(
      `${emailKey}.${emailStrKey}`,
      '==',
      email
    );
    const users = await manager.query(query);

    const shouldThrow = _shouldThrow !== undefined ? _shouldThrow : false;

    if (users.empty) {
      if (shouldThrow) throw new Error(`User with email:${email} not found`);
      else return undefined as DefinedIfTrue<T, R>;
    }

    const doc = users.docs[0];

    return {
      id: decodeId(doc.id),
      ...doc.data(),
    } as unknown as DefinedIfTrue<T, R>;
  }

  public async setEmail(
    userId: string,
    email: AppUser['email'],
    manager: TransactionManager
  ) {
    if (!email) {
      throw new Error(`Email details expected`);
    }
    const existing = await this.getByEmail(email.email, manager);
    if (existing) {
      throw new Error(`User with email ${email.email} already exist`);
    }

    const ref = await this.getUserRef(userId, manager, true);
    manager.update(ref, { email });
  }
}
