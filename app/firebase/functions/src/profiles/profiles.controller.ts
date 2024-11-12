import { RequestHandler } from 'express';
import { object, string } from 'yup';

import { GetProfilePayload } from '../@shared/types/types.user';
import { getProfileId } from '../@shared/utils/profiles.utils';
import { getServices } from '../controllers.utils';
import { logger } from '../instances/logger';

const DEBUG = false;

export const getProfileSchema = object({
  platformId: string().required(),
  user_id: string().optional(),
  username: string().optional(),
});

/**
 * get user posts from the DB (does not fetch for more)
 * */
export const getProfileController: RequestHandler = async (
  request,
  response
) => {
  try {
    const payload = (await getProfileSchema.validate(
      request.body
    )) as GetProfilePayload;

    logger.debug(`${request.path} - payload`, { payload });
    const { users, db } = getServices(request);

    const profile = await db.run(async (manager) => {
      if (payload.user_id) {
        return users.profiles.getByProfileId(
          getProfileId(payload.platformId, payload.user_id),
          manager,
          false
        );
      }

      const profileId = await users.profiles.getByPlatformUsername(
        payload.platformId,
        payload.username!,
        manager,
        false
      );

      if (!profileId) return undefined;

      return users.profiles.getByProfileId(profileId, manager, false);
    });

    if (DEBUG) logger.debug(`${request.path}: profile`, { profile });
    response.status(200).send({ success: true, data: profile });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
