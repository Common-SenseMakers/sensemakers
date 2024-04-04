import { firestore } from 'firebase-admin';

import {
  AppUser,
  AppUserCreate,
  DefinedIfTrue,
  PLATFORM,
  UserDetailsBase,
  UserWithId,
} from '../@shared/types';
import { DBInstance } from '../db/instance';
import { getPrefixedUserId } from './users.utils';

export class UsersRepository {
  constructor(protected db: DBInstance) {}

  protected async getUserRef(userId: string, onlyIfExists: boolean = false) {
    const ref = this.db.collections.users.doc(userId);
    if (onlyIfExists) {
      const doc = await this.getUserDoc(userId);

      if (!doc.exists) {
        throw new Error(`User ${userId} not found`);
      }
    }

    return ref;
  }

  protected async getUserDoc(userId: string) {
    const ref = await this.getUserRef(userId);
    return ref.get();
  }

  public async userExists(userId: string) {
    const doc = await this.getUserDoc(userId);
    return doc.exists;
  }

  public async getUser<T extends boolean>(
    userId: string,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, AppUser>> {
    const doc = await this.getUserDoc(userId);

    const _shouldThrow = shouldThrow !== undefined ? shouldThrow : false;

    if (!doc.exists) {
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
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, AppUser>> {
    const prefixed_user_id = getPrefixedUserId(platform, user_id);

    /** protect against changes in the property name */
    const platformIds_property: keyof UserWithId = 'platformIds';
    const query = this.db.collections.users.where(
      platformIds_property,
      'array-contains',
      prefixed_user_id
    );
    const snap = await query.get();

    const _shouldThrow = shouldThrow !== undefined ? shouldThrow : false;

    if (snap.empty) {
      if (_shouldThrow)
        throw new Error(
          `User with user_id: ${user_id} and platform ${platform} not found`
        );
      else return undefined as DefinedIfTrue<T, AppUser>;
    }

    if (snap.size > 1) {
      throw new Error(
        `Data corrupted. Unexpected multiple users with the same platform user_id ${prefixed_user_id}`
      );
    }

    return { userId: snap.docs[0].id, ...snap.docs[0].data() } as DefinedIfTrue<
      T,
      AppUser
    >;
  }

  public async createUser(userId: string, user: AppUserCreate) {
    const ref = await this.getUserRef(userId);
    await ref.create(user);
    return ref.id;
  }

  /**
   * Just update the lastFetchedMs value of a given account
   * */
  public async setLastFetched(
    platform: PLATFORM,
    user_id: string,
    lastFetchedMs: number
  ) {
    /** check if this platform user_id already exists */
    const existingUser = await this.getUserWithPlatformAccount(
      platform,
      user_id
    );

    if (!existingUser) {
      throw new Error(`User not found ${platform}:${user_id}`);
    }

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

    if (!current.read) {
      throw new Error(
        `Account ${platform}:${user_id} dont have read credentials`
      );
    }

    /** overwrite the lastFeched value */
    current.read.lastFetchedMs = lastFetchedMs;

    const userRef = await this.getUserRef(existingUser.userId, true);

    /** overwrite all the user account credentials */
    await userRef.update({ [platform]: accounts });
  }

  /** append or overwrite userDetails for an account of a given platform */
  public async setPlatformDetails(
    userId: string,
    platform: PLATFORM,
    details: UserDetailsBase
  ) {
    const prefixed_user_id = getPrefixedUserId(platform, details.user_id);

    /** check if this platform user_id already exists */
    const existingUser = await this.getUserWithPlatformAccount(
      platform,
      details.user_id
    );

    const userRef = await this.getUserRef(userId, true);

    if (existingUser) {
      if (existingUser.userId !== userId) {
        throw new Error(
          `Unexpected, existing user ${existingUser.userId} with this platform user_id ${prefixed_user_id} does not match the userId provided ${userId}`
        );
      }

      /**  overwrite previous details for that user */
      if (platform === PLATFORM.Local) {
        throw new Error('Unexpected');
      }

      const accounts = existingUser[platform];
      if (accounts === undefined) {
        throw new Error('Unexpected');
      }

      /** replace existing details */
      const ix = accounts.findIndex((a) => a.user_id === details.user_id);
      accounts[ix] = details;

      /** replace entire array */
      await userRef.update({
        [platform]: accounts,
      });

      return;
    } else {
      const existingUser = await this.getUser(userId);
      const platformIds = existingUser ? existingUser.platformIds : [];
      /**
       * append a new details entry in the platform array and store the
       * prefixed platform id in the platformIds array
       * */
      const platformIds_property: keyof UserWithId = 'platformIds';
      await userRef.update({
        [platformIds_property]: platformIds.push(prefixed_user_id),
        [platform]: firestore.FieldValue.arrayUnion(details),
      });
    }
  }

  /** remove userDetails of a given platform */
  public async removePlatformDetails(
    userId: string,
    platform: PLATFORM,
    user_id: string
  ) {
    const doc = await this.getUserDoc(userId);

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

    await doc.ref.update({
      [platform]: firestore.FieldValue.arrayRemove(details),
    });
  }

  public async getAll() {
    const snapshot = await this.db.collections.users.get();
    const users: AppUser[] = [];
    snapshot.forEach((doc) => {
      users.push({
        userId: doc.id,
        ...(doc.data() as Omit<AppUser, 'userId'>),
      });
    });

    return users;
  }

  public async getAllIds() {
    const snapshot = await this.db.collections.users.get();
    const usersIds: string[] = [];
    snapshot.forEach((doc) => {
      usersIds.push(doc.id);
    });

    return usersIds;
  }
}