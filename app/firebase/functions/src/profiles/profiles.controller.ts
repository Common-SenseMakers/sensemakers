import { RequestHandler } from 'express';
import { object, string } from 'yup';

import { AccountProfileRead } from '../@shared/types/types.profiles';
import { GetProfilePayload } from '../@shared/types/types.user';
import {
  getProfileId,
  parseProfileUrl,
  splitProfileId,
} from '../@shared/utils/profiles.utils';
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

    const publicProfile: AccountProfileRead | undefined = profile && {
      platformId: profile.platformId,
      user_id: profile.user_id,
      profile: profile.profile,
      userId: profile.userId,
    };

    if (DEBUG)
      logger.debug(`${request.path}: profile`, { profile: publicProfile });
    response.status(200).send({ success: true, data: profile });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};

export const addNonUserProfilesController: RequestHandler = async (
  request,
  response
) => {
  try {
    if (DEBUG)
      logger.debug(`${request.path}: Starting addAccountsDataController`, {
        payloads: request.body,
      });

    const { profiles } = getServices(request);
    await profiles.parseAndAdd(request.body);

    if (DEBUG)
      logger.debug(`${request.path}: Successfully completed addAccountsData`, {
        totalPayloads: parsedProfiles.length,
      });

    response.status(200).send({ success: true });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};

export const deleteProfilesController: RequestHandler = async (
  request,
  response
) => {
  try {
    if (DEBUG)
      logger.debug(`${request.path}: Starting addAccountsDataController`, {
        payloads: request.body,
      });

    const services = getServices(request);
    const profileUrls = request.body as string[];
    const parsedProfiles = profileUrls
      .map((profileUrl) => {
        const parsed = parseProfileUrl(profileUrl);
        return parsed;
      })
      .filter((profile) => profile);

    for (const parsedProfile of parsedProfiles) {
      if (!parsedProfile) {
        continue;
      }
      if (DEBUG)
        logger.debug('Fetching profile', {
          platformId: parsedProfile.platformId,
          username: parsedProfile.username,
        });

      let profileId: string | undefined;
      try {
        profileId = await services.db.run(async (manager) => {
          return services.users.profiles.getByPlatformUsername(
            parsedProfile.platformId,
            parsedProfile.username,
            manager
          );
        });
      } catch (error) {
        logger.error('error', error);
        continue;
      }

      if (!profileId) {
        const error = `unable to find profile for ${parsedProfile.username} on ${parsedProfile.platformId}`;
        logger.error(error);
        continue;
      }

      if (DEBUG) logger.debug('Profile found', { profileId });

      const { platform, user_id } = splitProfileId(profileId);
      await services.postsManager.deleteAccountFull(platform, user_id);
    }

    if (DEBUG)
      logger.debug(`${request.path}: Successfully completed addAccountsData`, {
        totalPayloads: parsedProfiles.length,
      });

    response.status(200).send({ success: true });
  } catch (error) {
    logger.error('error', error);
    response.status(500).send({ success: false, error });
  }
};
