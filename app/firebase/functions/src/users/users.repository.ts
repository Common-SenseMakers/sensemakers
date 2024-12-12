import { PLATFORM } from '../@shared/types/types.platforms';
import {
  AccountDetailsBase,
  AppUser,
  AppUserCreate,
  DefinedIfTrue,
  EmailDetails,
  UserSettings,
  UserWithAccounts,
} from '../@shared/types/types.user';
import { getProfileId } from '../@shared/utils/profiles.utils';
import { DBInstance } from '../db/instance';
import { removeUndefined } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';
import { ProfilesRepository } from '../profiles/profiles.repository';
import { UsersHelper } from './users.helper';

const DEBUG = true;

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
    let doc = await this.getUserDoc(userId, manager);

    if (!doc.exists) {
      const ref = this.db.collections.users.doc(userId);
      doc = await manager.get(ref);
    }

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
    const accountsIds = UsersHelper.accountsToAccountsIds(user.accounts);
    const userWithAccountsIds: AppUserCreate & {
      accountsIds: AppUser['accountsIds'];
    } = {
      ...user,
      accountsIds,
    };

    manager.create(ref, removeUndefined(userWithAccountsIds));
    return ref.id;
  }

  public async deleteUser(userId: string, manager: TransactionManager) {
    const ref = await this.getUserRef(userId, manager);
    manager.delete(ref);
  }

  public async getUserIdWithPlatformAccount<T extends boolean>(
    platform: PLATFORM,
    user_id: string,
    manager: TransactionManager,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, string>> {
    const profile_id = getProfileId(platform, user_id);

    /** protect against changes in the property name */
    const accountsIds_property: keyof UserWithAccounts = 'accountsIds';

    const query = this.db.collections.users.where(
      accountsIds_property,
      'array-contains',
      profile_id
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
        `Data corrupted. Unexpected multiple users with the same platform user_id ${profile_id}`
      );
    }

    /** should not return the data as it does not include the tx manager cache */
    return snap.docs[0].id as DefinedIfTrue<T, string>;
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
      const existWithAccountId = await this.getUserIdWithPlatformAccount(
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

    const newAccounts = { ...user.accounts, [platform]: platformAccounts };
    const newAccountsIds = UsersHelper.accountsToAccountsIds(newAccounts);

    /** store a redundant list of profileIds */
    const update: Partial<AppUser> = {
      accounts: newAccounts,
      accountsIds: newAccountsIds,
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
    const userId = await this.getUserIdWithPlatformAccount(
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

    /** keep details of other accounts */
    const newPlatformAccounts = (
      user.accounts[platform] as Array<AccountDetailsBase>
    ).filter((details) => details.user_id !== user_id);

    const newAccounts = { ...user.accounts };
    newAccounts[platform] = newPlatformAccounts;

    const newAccountsIds = UsersHelper.accountsToAccountsIds(newAccounts);
    manager.update(doc.ref, {
      accounts: newAccounts,
      accountsIds: newAccountsIds,
    });
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

  public async setOnboarded(userId: string, manager: TransactionManager) {
    if (DEBUG) logger.debug(`setOnboarded`, { userId });

    const update: Partial<AppUser> = { details: { onboarded: true } };
    const ref = await this.getUserRef(userId, manager, true);
    manager.update(ref, update);
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
      id: doc.id,
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
