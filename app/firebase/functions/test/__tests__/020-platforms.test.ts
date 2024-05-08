import { expect } from 'chai';

import { AppUser, FetchParams, PLATFORM } from '../../src/@shared/types/types';
import { RSAKeys } from '../../src/@shared/types/types.nanopubs';
import { PlatformPostDraft } from '../../src/@shared/types/types.platform.posts';
import {
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
} from '../../src/@shared/types/types.posts';
import { signNanopublication } from '../../src/@shared/utils/nanopub.sign.util';
import { getRSAKeys } from '../../src/@shared/utils/rsa.keys';
import { logger } from '../../src/instances/logger';
import { resetDB } from '../utils/db';
import { createTestAppUsers } from '../utils/user.factory';
import { USE_REAL_NANOPUB, USE_REAL_PARSER, USE_REAL_TWITTER } from './setup';
import { getTestServices } from './test.services';

describe('02-platforms', () => {
  let rsaKeys: RSAKeys | undefined;
  let appUser: AppUser | undefined;

  const services = getTestServices({
    twitter: USE_REAL_TWITTER ? 'real' : 'mock-publish',
    nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
    parser: USE_REAL_PARSER ? 'real' : 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();

    rsaKeys = getRSAKeys('');

    const users = await services.db.run((manager) =>
      createTestAppUsers(services, manager)
    );
    appUser = users[0];
  });

  describe('twitter', () => {
    it('fetch the latest 5 threads', async () => {
      if (!appUser) {
        throw new Error('appUser not created');
      }
      const allUserDetails = appUser[PLATFORM.Twitter];
      if (!allUserDetails || allUserDetails.length < 0) {
        throw new Error('Unexpected');
      }
      const twitterService = services.platforms.get(PLATFORM.Twitter);
      const userDetails = allUserDetails[0];
      if (userDetails.read === undefined) {
        throw new Error('Unexpected');
      }

      const twitter = appUser[PLATFORM.Twitter];

      if (!twitter) {
        throw new Error('User does not have Twitter credentials');
      }

      const fetchParams: FetchParams = {
        expectedAmount: 5,
      };

      const threads = await services.db.run((manager) =>
        twitterService.fetch(fetchParams, userDetails, manager)
      );

      expect(threads).to.not.be.undefined;
      if (!USE_REAL_TWITTER) {
        expect(threads.platformPosts.length).to.be.equal(4);
      }
    });
  });

  describe('nanopub', () => {
    let nanopub: PlatformPostDraft | undefined;

    it('creates a draft nanopub', async () => {
      const nanopubService = services.platforms.get(PLATFORM.Nanopub);

      if (!appUser) {
        throw new Error('appUser not created');
      }

      try {
        const post: AppPostFull = {
          id: 'test-id',
          createdAtMs: Date.now(),
          authorId: appUser.userId,
          content: 'test content',
          semantics: '',
          origin: PLATFORM.Twitter,
          parsedStatus: AppPostParsedStatus.PROCESSED,
          parsingStatus: AppPostParsingStatus.IDLE,
          reviewedStatus: AppPostReviewStatus.PENDING,
          republishedStatus: AppPostRepublishedStatus.PENDING,
          mirrors: [],
        };

        nanopub = await nanopubService.convertFromGeneric({
          post,
          author: appUser,
        });
      } catch (error) {
        console.error('error: ', error);
        throw error;
      }
    });

    it('publish signed nanopub', async () => {
      try {
        const nanopubService = services.platforms.get(PLATFORM.Nanopub);

        if (!nanopub) {
          throw new Error('Post not created');
        }

        if (!rsaKeys) {
          throw new Error('RSA keys not created');
        }

        const signed = await signNanopublication(nanopub.post, rsaKeys, '');
        expect(signed).to.not.be.undefined;

        const published = await services.db.run((manager) =>
          nanopubService.publish(
            {
              draft: signed.rdf(),
              userDetails: {
                signupDate: 0,
                user_id: '123456',
              },
            },
            manager
          )
        );
        expect(published).to.not.be.undefined;
      } catch (error) {
        console.error('error: ', error);
        throw error;
      }
    });
  });
});
