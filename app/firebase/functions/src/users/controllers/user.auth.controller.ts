import { RequestHandler } from 'express';
import { logger } from 'firebase-functions/v1';

import { PLATFORM } from '../../@shared/types/types.user';
import { getAuthenticatedUser, getServices } from '../../controllers.utils';
import {
  nanopubSignupDataSchema,
  twitterSignupDataSchema,
} from './auth.schema';

export const handleSignupController: RequestHandler = async (
  request,
  response
) => {
  try {
    const platform = request.params.platform as PLATFORM;

    const services = getServices(request);
    const userId = getAuthenticatedUser(request);

    const payload = await (async () => {
      if (platform === PLATFORM.Twitter) {
        return twitterSignupDataSchema.validate(request.body);
      }

      if (platform === PLATFORM.Nanopub) {
        return nanopubSignupDataSchema.validate(request.body);
      }

      throw new Error(`Unexpected platform ${platform}`);
    })();

    const result = await services.db.run(async (manager) => {
      /** handle signup and refetch user posts */
      return await services.users.handleSignup(
        platform,
        payload,
        manager,
        userId
      );
    });

    response.status(200).send({ success: true, data: result });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
