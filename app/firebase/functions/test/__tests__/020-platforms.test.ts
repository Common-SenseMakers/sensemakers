import { expect } from 'chai';

import { AppUser, FetchParams, PLATFORM } from '../../src/@shared/types/types';
import { RSAKeys } from '../../src/@shared/types/types.nanopubs';
import {
  PlatformPostDraft,
  PlatformPostPublishOrigin,
  PlatformPostPublishStatus,
} from '../../src/@shared/types/types.platform.posts';
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
import { TWITTER_USER_ID_MOCKS } from '../../src/platforms/twitter/mock/twitter.service.mock';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { createUsers } from '../utils/users.utils';
import {
  USE_REAL_NANOPUB,
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
  testUsers,
} from './setup';
import { getTestServices } from './test.services';

describe('02-platforms', () => {
  let rsaKeys: RSAKeys | undefined;
  let user: AppUser | undefined;

  const services = getTestServices({
    time: 'real',
    twitter: USE_REAL_TWITTER ? 'real' : 'mock-publish',
    nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
    parser: USE_REAL_PARSER ? 'real' : 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();

    rsaKeys = getRSAKeys('');

    await services.db.run(async (manager) => {
      const users = await createUsers(
        services,
        Array.from(testUsers.values()),
        manager
      );
      user = users.find(
        (u) =>
          UsersHelper.getAccount(u, PLATFORM.Twitter, TWITTER_USER_ID_MOCKS) !==
          undefined
      );
    });
  });

  describe('twitter', () => {
    it('fetch the latest 5 threads', async () => {
      if (!user) {
        throw new Error('appUser not created');
      }
      const allUserDetails = user[PLATFORM.Twitter];
      if (!allUserDetails || allUserDetails.length < 0) {
        throw new Error('Unexpected');
      }
      const twitterService = services.platforms.get(PLATFORM.Twitter);
      const userDetails = allUserDetails[0];
      if (userDetails.read === undefined) {
        throw new Error('Unexpected');
      }

      const twitter = user[PLATFORM.Twitter];

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
        expect(threads.platformPosts.length).to.be.equal(5);
      }
    });
  });

  describe('nanopub', () => {
    let nanopub: PlatformPostDraft | undefined;

    it('creates a draft nanopub', async () => {
      const nanopubService = services.platforms.get(PLATFORM.Nanopub);

      if (!user) {
        throw new Error('appUser not created');
      }

      try {
        const post: AppPostFull = {
          id: 'post-id',
          createdAtMs: Date.now(),
          authorId: user.userId,
          content: 'test content',
          semantics: '',
          origin: PLATFORM.Twitter,
          parsedStatus: AppPostParsedStatus.PROCESSED,
          parsingStatus: AppPostParsingStatus.IDLE,
          reviewedStatus: AppPostReviewStatus.PENDING,
          republishedStatus: AppPostRepublishedStatus.PENDING,
          mirrors: [
            {
              id: 'pp-id',
              platformId: PLATFORM.Twitter,
              publishOrigin: PlatformPostPublishOrigin.FETCHED,
              publishStatus: PlatformPostPublishStatus.PUBLISHED,
              posted: {
                post_id: '123456',
                timestampMs: Date.now(),
                user_id: TWITTER_USER_ID_MOCKS,
                post: {
                  id: 'post-id',
                  createdAtMs: Date.now(),
                  authorId: user.userId,
                  content: 'test content',
                  semantics: `
                    @prefix ns1: <http://purl.org/spar/cito/> .
                    @prefix schema: <https://schema.org/> .
                    
                    <http://purl.org/nanopub/temp/mynanopub#assertion> 
                      ns1:discusses <https://twitter.com/ori_goldberg/status/1781281656071946541> ;    
                      ns1:includesQuotationFrom <https://twitter.com/ori_goldberg/status/1781281656071946541> ;    
                      schema:keywords "ExternalSecurity",        "Geopolitics",        "Israel",        "Kissinger",        "PoliticalScience",        "Security" .
                    `,

                  origin: PLATFORM.Twitter,
                  parsedStatus: AppPostParsedStatus.PROCESSED,
                  parsingStatus: AppPostParsingStatus.IDLE,
                  reviewedStatus: AppPostReviewStatus.PENDING,
                  republishedStatus: AppPostRepublishedStatus.PENDING,
                },
              },
            },
          ],
        };

        nanopub = await nanopubService.convertFromGeneric({
          post,
          author: user,
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
