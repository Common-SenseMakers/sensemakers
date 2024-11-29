import AtpAgent, { AtpSessionData } from '@atproto/api';
import { logger } from 'firebase-functions';
import { Request } from 'firebase-functions/v2/tasks';

import { firestore } from '..';
import { FetchParams } from '../@shared/types/types.fetch';
import { PLATFORM } from '../@shared/types/types.platforms';
import { AccountCredentials } from '../@shared/types/types.user';
import { Services } from '../instances/services';
import { getConfig } from '../services.config';
import { removeUndefinedFields } from './bluesky/bluesky.utils';

export const DEBUG = false;

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

  let credentials: AccountCredentials | undefined = undefined;

  if (platformId === PLATFORM.Bluesky) {
    const blueskyDoc = await firestore
      .collection('adminCredentials')
      .doc(platformId)
      .get();
    const { BLUESKY_APP_PASSWORD, BLUESKY_SERVICE_URL, BLUESKY_USERNAME } =
      getConfig().bluesky;
    const agent = new AtpAgent({ service: BLUESKY_SERVICE_URL });
    const blueskySession = await (async () => {
      if (!blueskyDoc.exists || !blueskyDoc.data()?.session) {
        await agent.login({
          identifier: BLUESKY_USERNAME,
          password: BLUESKY_APP_PASSWORD,
        });
        if (!agent.session) {
          throw new Error('Failed to login to Bluesky with admin credentials');
        }
        await firestore
          .collection('adminCredentials')
          .doc(platformId)
          .set({
            session: removeUndefinedFields(agent.session),
          });
        return agent.session;
      }
      return blueskyDoc.data()?.session as AtpSessionData;
    })();

    try {
      await agent.resumeSession(blueskySession);
    } catch (e) {
      await agent.login({
        identifier: BLUESKY_USERNAME,
        password: BLUESKY_APP_PASSWORD,
      });
    }

    if (!agent.session) {
      throw new Error(
        'Failed to resume Bluesky session with admin credentials'
      );
    }

    if (blueskySession.accessJwt !== agent.session.accessJwt) {
      await firestore
        .collection('adminCredentials')
        .doc(platformId)
        .set({
          session: removeUndefinedFields(agent.session),
        });
    }
    credentials = { read: agent.session, write: agent.session };
  }

  await services.db.run(async (manager) => {
    return services.postsManager.fetchAccount(
      platformId,
      profile?.user_id,
      fetchParams,
      manager,
      credentials
    );
  });

  if (DEBUG) logger.debug('Finished fetchPlatformAccountTask');
};
