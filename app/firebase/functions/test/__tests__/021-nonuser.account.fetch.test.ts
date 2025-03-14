import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { getProfileId } from '../../src/@shared/utils/profiles.utils';
import { logger } from '../../src/instances/logger';
import { resetDB } from '../utils/db';
import { USE_REAL_PARSER, USE_REAL_TWITTER } from './setup';
import { getTestServices } from './test.services';

describe('021-nonuser account tests', () => {
  const services = getTestServices({
    time: 'mock',
    twitter: USE_REAL_TWITTER ? undefined : { publish: true, signup: true },
    parser: USE_REAL_PARSER ? 'real' : 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('create a non user account with autofetch true', () => {
    it('gets all autofetched profiles', async () => {
      const nonUserProfile = await services.db.run(async (manager) =>
        services.profiles.getOrCreateProfile(
          { platform: PLATFORM.Bluesky, username: 'wesleyfinck.org' },
          manager
        )
      );
      if (!nonUserProfile) {
        throw new Error('the profile was not created in firestore');
      }

      const fetchedProfile = await services.db.run(async (manager) =>
        services.profiles.repo.getByProfileId(
          getProfileId(PLATFORM.Bluesky, nonUserProfile.user_id),
          manager,
          true
        )
      );

      expect(fetchedProfile).to.not.be.undefined;
      const profiles = await services.profiles.repo.getMany({
        autofetch: true,
        platformId: PLATFORM.Bluesky,
        userIdDefined: false,
      });
      expect(profiles.length).to.be.equal(1);

      const userProfiles = await services.profiles.repo.getMany({
        autofetch: true,
        platformId: PLATFORM.Bluesky,
        userIdDefined: true,
      });
      expect(userProfiles.length).to.be.equal(0);
    });
  });
});
