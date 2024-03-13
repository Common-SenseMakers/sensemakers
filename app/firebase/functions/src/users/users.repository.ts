import { firestore } from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

import {
  AppUser,
  AppUserCreate,
  DefinedIfTrue,
  PLATFORM,
  UserDetailsBase,
} from '../@shared/types';
import { DBInstance } from '../db/instance';

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
      ...doc.data(),
    } as unknown as DefinedIfTrue<T, AppUser>;
  }

  public async createUser(userId: string, user: AppUserCreate) {
    const ref = await this.getUserRef(userId);
    await ref.create(user);
    return ref.id;
  }

  /** append userDetails of a given platform */
  public async addUserDetails(
    userId: string,
    platform: PLATFORM,
    details: any
  ) {
    const ref = await this.getUserRef(userId, true);
    await ref.update({
      [platform]: firestore.FieldValue.arrayUnion(details),
    });
  }

  /** remove userDetails of a given platform */
  public async removeUserDetails(
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
    snapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, ' => ', doc.data());
    });
  }
}
