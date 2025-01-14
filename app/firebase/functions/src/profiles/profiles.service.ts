import {
  IDENTITY_PLATFORM,
  PLATFORM,
  PUBLISHABLE_PLATFORM,
} from '../@shared/types/types.platforms';
import {
  AccountProfile,
  AccountProfileCreate,
  AccountProfileRead,
  AddProfilesPayload,
  PlatformProfile,
} from '../@shared/types/types.profiles';
import { GetProfilePayload } from '../@shared/types/types.user';
import {
  ParsedProfile,
  getProfileId,
  parseProfileUrl,
  splitProfileId,
} from '../@shared/utils/profiles.utils';
import { DBInstance } from '../db/instance';
import { TransactionManager } from '../db/transaction.manager';
import { logger } from '../instances/logger';
import { useBlueskyAdminCredentials } from '../platforms/bluesky/bluesky.utils';
import { IdentityServicesMap } from '../platforms/platforms.service';
import { FETCH_ACCOUNT_TASKS } from '../platforms/platforms.tasks.config';
import { chunkNumber, enqueueTask } from '../tasksUtils/tasks.support';
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

  createProfile<P extends PlatformProfile = PlatformProfile>(
    profileCreate: AccountProfileCreate,
    manager: TransactionManager
  ) {
    const id = this.repo.create(profileCreate, manager);
    const profile = {
      id,
      ...profileCreate,
    } as AccountProfile<P>;

    return profile;
  }

  async fetchAndCreateProfile<P extends PlatformProfile = PlatformProfile>(
    profileId: string,
    manager: TransactionManager,
    clusters?: string[],
    credentials?: any
  ): Promise<AccountProfile<P>> {
    const { platform, user_id } = splitProfileId(profileId);

    const profileBase = await this.getIdentityService(platform).getProfile(
      user_id,
      credentials
    );

    if (!profileBase) {
      throw new Error(`Profile for user ${user_id} not found in ${platform}`);
    }

    const profileCreate: AccountProfileCreate = {
      ...profileBase,
      userId: null,
      platformId: platform,
      clusters: clusters || [],
    };

    return this.createProfile(profileCreate, manager);
  }

  /**  */
  async upsertProfile<P extends PlatformProfile = PlatformProfile>(
    profile: AccountProfileCreate,
    manager: TransactionManager
  ) {
    const profileId = getProfileId(profile.platformId, profile.user_id);
    const exisiting = await this.repo.getByProfileId<false, P>(
      profileId,
      manager
    );

    if (!exisiting) {
      return this.createProfile<P>(profile, manager);
    }

    return profile;
  }

  /** Get or create an account profile */
  async getOrCreateProfile<P extends PlatformProfile = PlatformProfile>(
    profileId: string,
    manager: TransactionManager,
    clusters?: string[],
    credentials?: any
  ) {
    const profile = await this.repo.getByProfileId<false, P>(
      profileId,
      manager
    );

    if (!profile) {
      return this.fetchAndCreateProfile<P>(
        profileId,
        manager,
        clusters,
        credentials
      );
    }

    return profile;
  }

  public async getOrCreateProfileByUsername(
    platformId: IDENTITY_PLATFORM,
    username: string,
    manager: TransactionManager,
    clusters?: string[],
    credentials?: any
  ) {
    const profileId = getProfileId(platformId, username);
    return this.getOrCreateProfile(profileId, manager, clusters, credentials);
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

    const publicProfile: AccountProfileRead | undefined = profile && {
      platformId: profile.platformId,
      user_id: profile.user_id,
      profile: profile.profile,
      userId: profile.userId,
    };

    return publicProfile;
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
            return this.addAndTriggerFetch(
              parsedProfile,
              input.cluster,
              manager
            );
          });
        }
      })
    );
  }

  async addAndTriggerFetch(
    parsedProfile: ParsedProfile,
    cluster: string,
    manager: TransactionManager
  ) {
    const profile = await this.addProfile(parsedProfile, cluster, manager);
    await this.triggerProfileFetch(profile.id);
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

    /** ? */
    const credentials =
      parsedProfile.platformId === PLATFORM.Bluesky
        ? await useBlueskyAdminCredentials(this.db.firestore)
        : undefined;

    const profile = await this.getOrCreateProfileByUsername(
      parsedProfile.platformId,
      parsedProfile.username,
      manager,
      [cluster],
      credentials?.read
    );

    if (DEBUG) logger.debug('Profile added', { profile });
    return profile;
  }

  async triggerProfileFetch(profileId: string) {
    const { platform } = splitProfileId(profileId);

    const chunkSize = 50;
    const amount = 10;
    const fetchAmountChunks = chunkNumber(amount, chunkSize);

    for (const fetchAmountChunk of fetchAmountChunks) {
      const taskName = FETCH_ACCOUNT_TASKS[platform as PUBLISHABLE_PLATFORM];

      const taskData = {
        profileId,
        platformId: platform,
        latest: false,
        amount: fetchAmountChunk,
      };

      if (DEBUG) logger.debug('Enqueueing task', { taskName, taskData });
      await enqueueTask(taskName, taskData);
    }
  }
}
