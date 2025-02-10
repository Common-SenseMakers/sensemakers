import { FieldValue } from 'firebase-admin/firestore';

import { PLATFORM } from '../@shared/types/types.platforms';
import {
  AccountProfile,
  AccountProfileCreate,
  FetchedDetails,
  PlatformProfile,
  ProfileUpdate,
  ProfilesQueryParams,
  profileDefaults,
} from '../@shared/types/types.profiles';
import { DefinedIfTrue } from '../@shared/types/types.user';
import { CollectionNames } from '../@shared/utils/collectionNames';
import { getProfileId } from '../@shared/utils/profiles.utils';
import { DBInstance, Query } from '../db/instance';
import { BaseRepository, removeUndefined } from '../db/repo.base';
import { TransactionManager } from '../db/transaction.manager';

export class ProfilesRepository extends BaseRepository<
  AccountProfile,
  AccountProfile
> {
  constructor(protected db: DBInstance) {
    super(db.firestore.collection(CollectionNames.Profiles));
  }

  /**  creates an AccountProfile. It does not set the fetched property */
  public createProfile(
    accountProfile: AccountProfileCreate,
    manager: TransactionManager
  ) {
    const profileRef = this.db.collections.profiles.doc(
      getProfileId(accountProfile.platformId, accountProfile.user_id)
    );

    const profile: AccountProfileCreate = {
      ...profileDefaults,
      ...removeUndefined(accountProfile),
    };

    manager.create(profileRef, profile);

    return profileRef.id;
  }

  protected async getDoc(profileId: string, manager: TransactionManager) {
    const ref = this.getRef(profileId);
    return manager.get(ref);
  }

  public async getByProfileId<
    T extends boolean,
    P extends PlatformProfile = PlatformProfile,
  >(profileId: string, manager: TransactionManager, shouldThrow?: T) {
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
    username: string,
    manager: TransactionManager,
    shouldThrow?: T
  ) {
    const platformId_property: keyof AccountProfile = 'platformId';
    const profile_property: keyof AccountProfile = 'profile';
    const usernameTag: keyof PlatformProfile = 'username';

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

    const profileRef = await this.getRef(getProfileId(platform, user_id));

    /** overwrite all the user account credentials */
    manager.update(profileRef, { fetched: newFetched });
  }

  async update(
    profileId: string,
    update: ProfileUpdate,
    manager: TransactionManager
  ) {
    const profileRef = this.getRef(profileId);
    manager.update(profileRef, update);
  }

  delete(profileId: string, manager: TransactionManager) {
    const ref = this.db.collections.profiles.doc(profileId);
    manager.delete(ref);
  }

  async getMany(queryParams: ProfilesQueryParams) {
    const autofetch_property: keyof ProfilesQueryParams = 'autofetch';
    const platformId_property: keyof ProfilesQueryParams = 'platformId';
    const userId_property: keyof ProfilesQueryParams = 'userId';

    const start = queryParams.clusterId
      ? this.getClusterProfilesCollection(queryParams.clusterId)
      : this.db.collections.profiles;

    let baseQuery = ((_base: Query) => {
      if (queryParams.autofetch !== undefined) {
        return _base.where(autofetch_property, '==', queryParams.autofetch);
      }
      return _base;
    })(start);

    baseQuery = ((_base: Query) => {
      if (queryParams.platformId) {
        return _base.where(platformId_property, '==', queryParams.platformId);
      }
      return _base;
    })(baseQuery);

    baseQuery = ((_base: Query) => {
      if (queryParams.userId) {
        return _base.where(userId_property, '==', queryParams.userId);
      }
      return _base;
    })(baseQuery);

    baseQuery = ((_base: Query) => {
      if (queryParams.userIdDefined !== undefined) {
        if (queryParams.userIdDefined) {
          return _base.where(userId_property, '!=', null);
        } else {
          return _base.where(userId_property, '==', null);
        }
      }
      return _base;
    })(baseQuery);

    const paginated = await (async (_base: Query) => {
      if (queryParams.limit) {
        return _base.limit(queryParams.limit);
      }
      return _base;
    })(baseQuery);

    const snapshot = await paginated.get();

    return snapshot.docs.map((doc) => {
      return doc.id;
    });
  }

  async getClusters(profileId: string, manager: TransactionManager) {
    const profile = await this.getByProfileId(profileId, manager, true);
    return profile.clusters || [];
  }

  getClusterRef(clusterId: string) {
    return this.db.collections.clusters.doc(clusterId);
  }

  getClusterProfilesCollection(clusterId: string) {
    return this.getClusterRef(clusterId).collection(
      CollectionNames.ClusterProfiles
    );
  }

  getClusterProfileRef(clusterId: string, profileId: string) {
    return this.getClusterProfilesCollection(clusterId).doc(profileId);
  }

  async addClusterToProfile(
    profileId: string,
    clusterId: string,
    manager: TransactionManager
  ) {
    const profileRef = this.getRef(profileId);
    manager.update(profileRef, { clusters: FieldValue.arrayUnion(clusterId) });

    const clusterRef = this.getClusterRef(clusterId);
    const clusterProfileRef = this.getClusterProfileRef(clusterId, profileId);

    manager.set(clusterProfileRef, { profileId });

    /** set clusterId as property of all clusters */
    manager.set(clusterRef, { clusterId });
  }

  async removeCluster(
    profileId: string,
    clusterId: string,
    manager: TransactionManager
  ) {
    const ref = this.getRef(profileId);
    manager.update(ref, { clusters: FieldValue.arrayRemove(clusterId) });

    const clusterRef = this.getClusterRef(clusterId);

    manager.delete(clusterRef);
  }
}
