import { RequestHandler } from 'express';
import { array, object, string } from 'yup';

import {
  AddProfilesPayload,
  GetClusterProfiles,
} from '../@shared/types/types.profiles';
import { GetProfilePayload } from '../@shared/types/types.profiles';
import {
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

export const getProfilesSchema = object({
  clusterId: string().optional(),
});

export const addProfilesSchema = object({
  profilesUrls: array(string()).required(),
  cluster: string().required(),
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
    const { profiles } = getServices(request);

    const publicProfile = await profiles.getPublicProfile(payload);

    if (DEBUG)
      logger.debug(`${request.path}: profile`, { profile: publicProfile });

    response.status(200).send({ success: true, data: publicProfile });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};

export const getProfilesController: RequestHandler = async (
  request,
  response
) => {
  try {
    const payload = (await getProfilesSchema.validate(
      request.body
    )) as GetClusterProfiles;

    logger.debug(`${request.path} - payload`, { payload });
    const { profiles } = getServices(request);

    const publicProfiles = await profiles.getProfiles(payload);

    if (DEBUG) logger.debug(`${request.path}: profile`, { profiles });

    response.status(200).send({ success: true, data: publicProfiles });
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
    const payload = (await addProfilesSchema.validate(
      request.body
    )) as AddProfilesPayload;

    if (DEBUG)
      logger.debug(`${request.path}: Starting addAccountsDataController`, {
        payload,
      });

    const { profiles } = getServices(request);

    await profiles.parseAndAdd(payload);

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
          return services.users.profiles.repo.getByPlatformUsername(
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

export const getClustersController: RequestHandler = async (
  request,
  response
) => {
  try {
    const { clusters } = getServices(request);

    const clustersIds = await clusters.getClustersIds();

    if (DEBUG) logger.debug(`${request.path}: profile`, { clustersIds });

    response.status(200).send({ success: true, data: clustersIds });
  } catch (error: any) {
    logger.error('error', error);
    response.status(500).send({ success: false, error: error.message });
  }
};
