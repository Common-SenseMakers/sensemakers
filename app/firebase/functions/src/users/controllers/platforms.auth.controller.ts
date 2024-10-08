import { RequestHandler } from 'express';

import {
  IDENTITY_PLATFORM,
  PLATFORM,
} from '../../@shared/types/types.platforms';
import { getAuthenticatedUser, getServices } from '../../controllers.utils';
import { logger } from '../../instances/logger';
import {
  blueskySignupDataSchema,
  mastodonGetSignupContextSchema,
  mastodonSignupDataSchema,
  nanopubGetSignupContextSchema,
  nanopubSignupDataSchema,
  orcidGetSignupContextSchema,
  orcidSignupDataSchema,
  twitterGetSignupContextSchema,
  twitterSignupDataSchema,
} from './auth.schema';

const DEBUG = true;
const DEBUG_PREFIX = '[AUTH-CONTROLLER]';

export const getSignupContextController: RequestHandler = async (
  request,
  response
) => {
  try {
    const userId = getAuthenticatedUser(request);
    const services = getServices(request);

    const platform = request.params.platform as PLATFORM;

    const payload = await (async () => {
      if (platform === PLATFORM.Twitter) {
        return twitterGetSignupContextSchema.validate(request.body);
      }

      if (platform === PLATFORM.Nanopub) {
        return nanopubGetSignupContextSchema.validate(request.body);
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

    const context = await services.users.getSignupContext(
      platform,
      userId,
      payload
    );

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
    const userId = getAuthenticatedUser(request);

    const payload = await (async () => {
      if (platform === PLATFORM.Twitter) {
        return twitterSignupDataSchema.validate(request.body);
      }

      if (platform === PLATFORM.Nanopub) {
        return nanopubSignupDataSchema.validate(request.body);
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
        /** handle signup and refetch user posts */
        return await services.users.handleSignup(
          platform,
          payload,
          manager,
          userId
        );
      },
      undefined,
      undefined,
      `handleSignupController ${debugId}`,
      DEBUG
    );

    response.status(200).send({ success: true, data: result });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
