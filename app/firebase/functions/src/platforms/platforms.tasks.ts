import { logger } from 'firebase-functions';

import { FetchParams } from '../@shared/types/types.fetch';
import { FetchPlatfomAccountTaskData } from '../@shared/types/types.profiles';
import { splitProfileId } from '../@shared/utils/profiles.utils';
import { Services } from '../instances/services';

export const DEBUG = false;

export const fetchPlatformAccountTask = async (
  req: {
    data: FetchPlatfomAccountTaskData;
  },
  services: Services
) => {
  if (DEBUG)
    logger.debug('Starting fetchPlatformAccountTask', {
      profileId: req.data.profileId,
    });

  const profileId = req.data.profileId as string;
  const { platform: platformId } = splitProfileId(profileId);

  if (DEBUG) logger.debug('Fetching profile');
  const profile = await services.db.run(async (manager) => {
    return services.profiles.getOrCreateProfile({ profileId }, manager);
  });

  if (!profile) {
    const error = `unable to find profile for ${profileId}`;
    logger.error(error);
    throw new Error(error);
  }

  if (DEBUG) logger.debug('Profile found', { profile });
  /** the value of sinceId or untilId doesn't matter, as long as it exists, then it will be converted to appropriate fetch params */
  const fetchParams: FetchParams = req.data.latest
    ? { expectedAmount: req.data.amount, sinceId: 'dummy' }
    : { expectedAmount: req.data.amount, untilId: 'dummy' };

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
