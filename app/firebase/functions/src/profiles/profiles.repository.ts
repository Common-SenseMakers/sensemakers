import {
  ALL_IDENTITY_PLATFORMS,
  PLATFORM,
} from '../@shared/types/types.platforms';
import {
  AccountProfile,
  AccountProfileCreate,
  FetchedDetails,
} from '../@shared/types/types.profiles';
import { DefinedIfTrue } from '../@shared/types/types.user';
import { DBInstance } from '../db/instance';
import { TransactionManager } from '../db/transaction.manager';

export const getProfileId = (platform: PLATFORM, user_id: string) =>
  `${platform}-${user_id}`;

export const splitProfileId = (profileId: string) => {
  for (const platform of ALL_IDENTITY_PLATFORMS) {
    if (profileId.startsWith(`${platform}-`)) {
      return {
        platform,
        user_id: profileId.replace(`${platform}-`, ''),
      };
    }
  }
  throw new Error(`Cant split unexpected profileId ${profileId}`);
};

export class ProfilesRepository {
  constructor(protected db: DBInstance) {}

  /**  creates an AccountProfile. It does not set the fetched property */
  public create(
    accountProfile: AccountProfileCreate,
    manager: TransactionManager
  ) {
    const profileRef = this.db.collections.profiles.doc(
      getProfileId(accountProfile.platformId, accountProfile.user_id)
    );

    manager.create(profileRef, accountProfile);

    return profileRef.id;
  }

  protected async getRef(
    profileId: string,
    manager: TransactionManager,
    onlyIfExists: boolean = false
  ) {
    const ref = this.db.collections.profiles.doc(profileId);
    if (onlyIfExists) {
      const doc = await this.getDoc(profileId, manager);

      if (!doc.exists) {
        throw new Error(`Profile ${profileId} not found`);
      }
    }

    return ref;
  }

  protected async getDoc(profileId: string, manager: TransactionManager) {
    const ref = await this.getRef(profileId, manager);
    return manager.get(ref);
  }

  public async getByProfileId<T extends boolean, P = any>(
    profileId: string,
    manager: TransactionManager,
    shouldThrow?: T
  ) {
    const doc = await this.getDoc(profileId, manager);

    const _shouldThrow = shouldThrow !== undefined ? shouldThrow : false;

    const data = doc.data();
    if (!doc.exists || !data || Object.keys(data).length === 0) {
      if (_shouldThrow) throw new Error(`Profile ${profileId} not found`);
      else return undefined as DefinedIfTrue<T, AccountProfile<P>>;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as unknown as DefinedIfTrue<T, AccountProfile<P>>;
  }

  public async getProfile<T extends boolean>(
    platformId: PLATFORM,
    user_id: string,
    manager: TransactionManager,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, AccountProfile>> {
    const profileId = getProfileId(platformId, user_id);
    return this.getByProfileId(profileId, manager, shouldThrow);
  }

  public async getOfUser(userId: string, manager: TransactionManager) {
    const userId_property: keyof AccountProfile = 'userId';

    const query = this.db.collections.profiles.where(
      userId_property,
      '==',
      userId
    );

    const snap = await manager.query(query);

    const profiles = snap.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      } as AccountProfile;
    });

    return profiles;
  }

  public async getByPlatformUsername<T extends boolean>(
    platformId: PLATFORM,
    usernameTag: string,
    username: string,
    manager: TransactionManager,
    shouldThrow?: T
  ) {
    const platformId_property: keyof AccountProfile = 'platformId';
    const profile_property: keyof AccountProfile = 'profile';

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

    const profileId = snap.docs[0].id;
    return profileId as DefinedIfTrue<T, string>;
  }

  /** Sensistive method! Call only if the platform and user_id were authenticated */
  public async getUserIdWithPlatformAccount<T extends boolean>(
    platform: PLATFORM,
    user_id: string,
    manager: TransactionManager,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, string>> {
    const profile = await this.getProfile(
      platform,
      user_id,
      manager,
      shouldThrow
    );

    const _shouldThrow = shouldThrow !== undefined ? shouldThrow : false;

    if (!profile) {
      if (_shouldThrow)
        throw new Error(
          `AccountProfile with user_id: ${user_id} and platform ${platform} not found`
        );
      else return undefined as DefinedIfTrue<T, string>;
    }

    /** should not return the data as it does not include the tx manager cache */
    return profile.userId as DefinedIfTrue<T, string>;
  }

  public async setAccountProfileFetched(
    platform: PLATFORM,
    user_id: string,
    fetched: FetchedDetails,
    manager: TransactionManager
  ) {
    const current = await this.getProfile(platform, user_id, manager, true);

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

    const profileRef = await this.getRef(
      getProfileId(platform, user_id),
      manager,
      true
    );

    /** overwrite all the user account credentials */
    manager.update(profileRef, { fetched: newFetched });
  }
}
