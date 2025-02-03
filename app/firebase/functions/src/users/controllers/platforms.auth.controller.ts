import { RequestHandler } from 'express';

import {
  IDENTITY_PLATFORM,
  PLATFORM,
} from '../../@shared/types/types.platforms';
import { getAuthenticatedUser, getServices } from '../../controllers.utils';
import { logger } from '../../instances/logger';
import { REPLACE_USER_TASK } from '../../posts/tasks/replace.user.task';
import { enqueueTask } from '../../tasksUtils/tasks.support';
import {
  blueskySignupDataSchema,
  mastodonGetSignupContextSchema,
  mastodonSignupDataSchema,
  orcidGetSignupContextSchema,
  orcidSignupDataSchema,
  twitterGetSignupContextSchema,
  twitterSignupDataSchema,
} from './auth.schema';

const DEBUG = false;
const DEBUG_PREFIX = '[AUTH-CONTROLLER]';

export const getSignupContextController: RequestHandler = async (
  request,
  response
) => {
  try {
    const services = getServices(request);

    const platform = request.params.platform as PLATFORM;

    const payload = await (async () => {
      if (platform === PLATFORM.Twitter) {
        return twitterGetSignupContextSchema.validate(request.body);
      }

      if (platform === PLATFORM.Orcid) {
        return orcidGetSignupContextSchema.validate(request.body);
      }

      if (platform === PLATFORM.Mastodon) {
        return mastodonGetSignupContextSchema.validate(request.body);
      }

      if (platform === PLATFORM.Bluesky) {
        return request.body;
      }

      throw new Error(`Unexpected platform ${platform}`);
    })();

    if (DEBUG) {
      logger.debug('getSignupContext', payload, DEBUG_PREFIX);
    }

    const context = await services.users.getSignupContext(platform, payload);

    response.status(200).send({ success: true, data: context });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};

export const handleSignupController: RequestHandler = async (
  request,
  response
) => {
  try {
    const platform = request.params.platform as IDENTITY_PLATFORM;

    const services = getServices(request);

    const payload = await (async () => {
      if (platform === PLATFORM.Twitter) {
        return twitterSignupDataSchema.validate(request.body);
      }

      if (platform === PLATFORM.Orcid) {
        return orcidSignupDataSchema.validate(request.body);
      }

      if (platform === PLATFORM.Mastodon) {
        return mastodonSignupDataSchema.validate(request.body);
      }

      if (platform === PLATFORM.Bluesky) {
        return blueskySignupDataSchema.validate(request.body);
      }

      throw new Error(`Unexpected platform ${platform}`);
    })();

    if (DEBUG) {
      logger.debug('handleSignupController', payload, DEBUG_PREFIX);
    }

    const debugId = (payload as any).code
      ? (payload as any).code
      : (payload as any).ethAddress;

    const result = await services.db.run(
      async (manager) => {
        const userId = await getAuthenticatedUser(
          request,
          services.users,
          manager,
          true
        );
        /** handle signup and refetch user posts */
        return services.users.handleSignup(platform, payload, manager, userId);
      },
      undefined,
      undefined,
      `handleSignupController ${debugId}`,
      DEBUG
    );

    if (result?.replaceLegacy) {
      await enqueueTask(REPLACE_USER_TASK, result.replaceLegacy, services);
    }

    if (result?.linkProfile) {
      /** update userId of posts and profiles */
      logger.debug('linkExistingUser', result.userId, DEBUG_PREFIX);
      await services.postsManager.linkExistingUser(result.userId);
    }

    response.status(200).send({ success: true, data: result });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
