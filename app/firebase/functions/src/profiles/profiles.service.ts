import {
  IDENTITY_PLATFORM,
  PLATFORM,
  PUBLISHABLE_PLATFORM,
} from '../@shared/types/types.platforms';
import {
  AccountProfile,
  AccountProfileCreate,
  PlatformProfile,
} from '../@shared/types/types.profiles';
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

  async readAndCreateProfile<P extends PlatformProfile = PlatformProfile>(
    profileId: string,
    manager: TransactionManager,
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
      clusters: [],
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
    credentials?: any
  ) {
    const profile = await this.repo.getByProfileId<false, P>(
      profileId,
      manager
    );

    if (!profile) {
      return this.readAndCreateProfile<P>(profileId, manager, credentials);
    }

    return profile;
  }

  public async getOrCreateProfileByUsername(
    platformId: IDENTITY_PLATFORM,
    username: string,
    manager: TransactionManager,
    credentials?: any
  ) {
    const profileId = getProfileId(platformId, username);
    return this.getOrCreateProfile(profileId, manager, credentials);
  }

  async parseAndAdd(profileUrls: string[]): Promise<void> {
    const parsedProfiles = profileUrls
      .map((profileUrl) => {
        const parsed = parseProfileUrl(profileUrl);
        return parsed;
      })
      .filter((profile) => profile);

    await Promise.all(
      parsedProfiles.map(
        (parsedProfile) => parsedProfile && this.addProfile(parsedProfile)
      )
    );
  }

  async addAndTriggerFetch() {}

  async addProfile(parsedProfile: ParsedProfile) {
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

    const profile = await this.db.run(async (manager) => {
      return this.getOrCreateProfileByUsername(
        parsedProfile.platformId,
        parsedProfile.username,
        manager,
        credentials?.read
      );
    });

    if (DEBUG) logger.debug('Profile added', { profile });
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
