import { FieldValue } from 'firebase-admin/firestore';

import { AppUser, AppUserCreate, DefinedIfTrue } from '../@shared/types';
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

  public async setUser(userId: string, user: AppUserCreate) {
    const ref = await this.getUserRef(userId);
    await ref.create(user);
    return ref.id;
  }

  public async setUserEthDetails(userId: string, details: AppUser['eth']) {
    const ref = await this.getUserRef(userId, true);
    await ref.set({ eth: details }, { merge: true });
  }

  public async setUserTwitterCredentials(
    userId: string,
    credentials: AppUser['twitter']
  ) {
    const ref = await this.getUserRef(userId, true);
    await ref.set({ twitter: credentials }, { merge: true });
  }

  public async removeTwitter(userId: string) {
    const ref = await this.getUserRef(userId, true);
    await ref.update({ twitter: FieldValue.delete() });
  }

  public async getAll() {
    const snapshot = await this.db.collections.users.get();
    snapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, ' => ', doc.data());
    });
  }
}
