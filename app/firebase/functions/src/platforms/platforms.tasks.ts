import { logger } from 'firebase-functions';
import { Request } from 'firebase-functions/v2/tasks';

import { FetchParams } from '../@shared/types/types.fetch';
import { PLATFORM } from '../@shared/types/types.platforms';
import { Services } from '../instances/services';

export const DEBUG = true;

export const FETCH_TWITTER_ACCOUNT_TASK = 'fetchTwitterAccount';
export const FETCH_MASTODON_ACCOUNT_TASK = 'fetchMastodonAccount';
export const FETCH_BLUESKY_ACCOUNT_TASK = 'fetchBlueskyAccount';

export const fetchPlatformAccountTask = async (
  req: Request,
  services: Services
) => {
  if (DEBUG)
    logger.debug('Starting fetchPlatformAccountTask', {
      profileId: req.data.profileId,
      platformId: req.data.platformId,
    });

  const profileId = req.data.profileId as string;
  const platformId = req.data.platformId as PLATFORM;

  if (DEBUG) logger.debug('Fetching profile');
  const profile = await services.db.run(async (manager) => {
    return services.users.getOrCreateProfile(profileId, manager);
  });

  if (!profile) {
    const error = `unable to find profile for ${profileId}`;
    logger.error(error);
    throw new Error(error);
  }

  if (DEBUG) logger.debug('Profile found', { profile });
  /** the value of sinceId or untilId doesn't matter, as long as it exists, then it will be converted to appropriate fetch params */
  const fetchParams: FetchParams = req.data.latest
    ? { expectedAmount: req.data.amount, sinceId: profile.user_id }
    : { expectedAmount: req.data.amount, untilId: profile.user_id };

  if (DEBUG) logger.debug('Fetching account with params', { fetchParams });

  await services.db.run(async (manager) => {
    return services.postsManager.fetchAccount(
      platformId,
      profile?.user_id,
      fetchParams,
      manager
    );
  });

  if (DEBUG) logger.debug('Finished fetchPlatformAccountTask');
};
