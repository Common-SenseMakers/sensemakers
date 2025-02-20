import {
  PLATFORM,
  PUBLISHABLE_PLATFORM,
} from '../@shared/types/types.platforms';
import {
  AccountProfile,
  AccountProfileCreate,
  AccountProfileRead,
  AddProfilesPayload,
  GetClusterProfiles,
  GetProfilePayload,
  PlatformAccountProfile,
  PlatformProfile,
  ProfileIdentifier,
} from '../@shared/types/types.profiles';
import { DefinedIfTrue } from '../@shared/types/types.user';
import {
  ParsedProfile,
  getProfileId,
  parseProfileUrl,
  splitProfileId,
} from '../@shared/utils/profiles.utils';
import { DBInstance } from '../db/instance';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';
import { Services } from '../instances/services';
import { IdentityServicesMap } from '../platforms/platforms.service';
import { FETCH_ACCOUNT_TASKS } from '../platforms/platforms.tasks.config';
import { chunkNumber } from '../tasks/tasks.support';
import { TASKS_NAMES } from '../tasks/types.tasks';
import { ProfilesRepository } from './profiles.repository';

const DEBUG = false;

export class ProfilesService {
  constructor(
    public repo: ProfilesRepository,
    public identityPlatforms: IdentityServicesMap,
    protected db: DBInstance
  ) {}

  private getIdentityService(platform: PLATFORM) {
    const service = this.identityPlatforms.get(platform);
    if (!service) {
      throw new Error(`Identity service ${platform} not found`);
    }
    return service;
  }

  async createProfile<P extends PlatformProfile = PlatformProfile>(
    profileCreate: AccountProfileCreate,
    manager: TransactionManager,
    clusters?: string[]
  ) {
    const id = this.repo.createProfile(profileCreate, manager);
    const profile = {
      id,
      ...profileCreate,
    } as AccountProfile<P>;

    if (clusters) {
      await this.addClusters(profile.id, clusters, manager);
      profile.clusters = clusters;
    }

    return profile;
  }

  async fetchProfile<T extends boolean, R = PlatformAccountProfile>(
    profileIdentifier: ProfileIdentifier,
    credentials?: any,
    shouldThrow?: T
  ): Promise<DefinedIfTrue<T, R>> {
    const _shouldThrow = shouldThrow !== undefined ? shouldThrow : false;
    let base: PlatformAccountProfile | undefined = undefined;

    if (profileIdentifier.profileId) {
      const { platform, user_id } = splitProfileId(profileIdentifier.profileId);
      base = await this.getIdentityService(platform).getProfile(
        user_id,
        credentials
      );
    }

    if (profileIdentifier.platform && profileIdentifier.username) {
      base = await this.getIdentityService(
        profileIdentifier.platform
      ).getProfileByUsername(profileIdentifier.username, credentials);
    }

    if (_shouldThrow && !base) {
      throw new Error('Invalid profileId');
    }

    return base as DefinedIfTrue<T, R>;
  }

  async fetchAndCreateProfile<P extends PlatformProfile = PlatformProfile>(
    profileIdentifier: ProfileIdentifier,
    manager: TransactionManager,
    clusters?: string[],
    credentials?: any
  ): Promise<AccountProfile<P>> {
    const profileBase = await this.fetchProfile(
      profileIdentifier,
      credentials,
      true
    );

    if (!profileBase) {
      throw new Error(
        `Profile for user not found for ${JSON.stringify(profileIdentifier)}`
      );
    }

    const platform = profileIdentifier.profileId
      ? splitProfileId(profileIdentifier.profileId).platform
      : profileIdentifier.platform;

    if (!platform) {
      throw new Error('Unexpected');
    }

    const profileCreate: AccountProfileCreate = {
      ...profileBase,
      userId: null,
      platformId: platform,
    };

    const profile = await this.createProfile<P>(
      profileCreate,
      manager,
      clusters
    );

    return profile;
  }

  /**  */
  async upsertProfile<P extends PlatformProfile = PlatformProfile>(
    profile: AccountProfileCreate,
    manager: TransactionManager,
    clusters?: string[]
  ) {
    const profileId = getProfileId(profile.platformId, profile.user_id);
    const exisiting = await this.repo.getByProfileId<false, P>(
      profileId,
      manager
    );

    if (!exisiting) {
      return this.createProfile<P>(profile, manager, clusters);
    }

    return profile;
  }

  async getByIdentifier<T extends boolean, R = AccountProfile>(
    profileIdentifier: ProfileIdentifier,
    manager: TransactionManager,
    shouldThrow?: boolean
  ): Promise<DefinedIfTrue<T, R>> {
    if (profileIdentifier.profileId) {
      return this.repo.getByProfileId(
        profileIdentifier.profileId,
        manager,
        shouldThrow
      ) as DefinedIfTrue<T, R>;
    }

    if (profileIdentifier.platform && profileIdentifier.username) {
      const profileId = await this.repo.getByPlatformUsername(
        profileIdentifier.platform,
        profileIdentifier.username,
        manager,
        shouldThrow
      );
      if (profileId) {
        return this.repo.getByProfileId(
          profileId,
          manager,
          shouldThrow
        ) as DefinedIfTrue<T, R>;
      } else {
        return undefined as DefinedIfTrue<T, R>;
      }
    }

    throw new Error('Invalid profileIdentifier');
  }

  async addClusters(
    profileId: string,
    clustersIds: string[],
    manager: TransactionManager
  ) {
    await Promise.all(
      clustersIds.map((clusterId) => {
        this.repo.addClusterToProfile(profileId, clusterId, manager);
      })
    );
  }

  /** Get or create an account profile */
  async getOrCreateProfile<P extends PlatformProfile = PlatformProfile>(
    profileIdentifier: ProfileIdentifier,
    manager: TransactionManager,
    clusters?: string[],
    credentials?: any
  ): Promise<AccountProfile> {
    const profile = await this.getByIdentifier(
      profileIdentifier,
      manager,
      false
    );

    if (!profile) {
      return this.fetchAndCreateProfile<P>(
        profileIdentifier,
        manager,
        clusters,
        credentials
      );
    } else {
      // add clusters
      if (clusters) {
        await this.addClusters(profile.id, clusters, manager);
      }
    }

    return profile;
  }

  toPublicProfile(profile?: AccountProfile): AccountProfileRead | undefined {
    const publicProfile: AccountProfileRead | undefined = profile && {
      platformId: profile.platformId,
      user_id: profile.user_id,
      profile: profile.profile,
      userId: profile.userId,
    };

    return publicProfile;
  }

  async getPublicProfile(payload: GetProfilePayload) {
    const profile = await this.db.run(async (manager) => {
      if (payload.user_id) {
        return this.repo.getByProfileId(
          getProfileId(payload.platformId, payload.user_id),
          manager,
          false
        );
      }

      const profileId = await this.repo.getByPlatformUsername(
        payload.platformId,
        payload.username!,
        manager,
        false
      );

      if (!profileId) return undefined;

      return this.repo.getByProfileId(profileId, manager, false);
    });

    return this.toPublicProfile(profile);
  }

  async getProfiles(payload: GetClusterProfiles) {
    const profilesIds = await this.repo.getMany({
      clusterId: payload.clusterId,
    });
    return this.repo.getFromIds(profilesIds);
  }

  async parseAndAdd(input: AddProfilesPayload): Promise<void> {
    const parsedProfiles = input.profilesUrls
      .map((profileUrl) => {
        const parsed = parseProfileUrl(profileUrl);
        return parsed;
      })
      .filter((profile) => profile);

    await Promise.all(
      parsedProfiles.map(async (parsedProfile) => {
        if (parsedProfile) {
          return this.db.run(async (manager) => {
            return this.addProfile(parsedProfile, input.cluster, manager);
          });
        }
        return;
      })
    );
  }

  async addProfile(
    parsedProfile: ParsedProfile,
    cluster: string,
    manager: TransactionManager
  ) {
    if (DEBUG)
      logger.debug('Fetching profile', {
        platformId: parsedProfile.platformId,
        username: parsedProfile.username,
      });

    const profile = await this.getOrCreateProfile(
      { platform: parsedProfile.platformId, username: parsedProfile.username },
      manager,
      [cluster]
    );

    if (DEBUG) logger.debug('Profile added', { profile });
    return profile;
  }

  async triggerProfileFetch(profileId: string, services: Services) {
    const { platform } = splitProfileId(profileId);

    const chunkSize = 50;
    const amount = 10;
    const fetchAmountChunks = chunkNumber(amount, chunkSize);

    for (const fetchAmountChunk of fetchAmountChunks) {
      const taskName = FETCH_ACCOUNT_TASKS[
        platform as PUBLISHABLE_PLATFORM
      ] as TASKS_NAMES;

      const taskData = {
        profileId,
        latest: false,
        amount: fetchAmountChunk,
      };

      if (DEBUG) logger.debug('Enqueueing task', { taskName, taskData });
      await services.tasks.enqueue(taskName, taskData, services);
    }
  }
}
