import { expect } from 'chai';

import { AppUser, PLATFORM } from '../../src/@shared/types/types';
import { RSAKeys } from '../../src/@shared/types/types.nanopubs';
import { PlatformPostDraft } from '../../src/@shared/types/types.platform.posts';
import { AppPostFull } from '../../src/@shared/types/types.posts';
import { signNanopublication } from '../../src/@shared/utils/nanopub.sign.util';
import { getRSAKeys } from '../../src/@shared/utils/rsa.keys';
import { logger } from '../../src/instances/logger';
import { FetchUserPostsParams } from '../../src/platforms/platforms.interface';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { resetDB } from '../utils/db';
import { createTestAppUsers } from '../utils/user.factory';
import { USE_REAL_NANOPUB, USE_REAL_PARSER, USE_REAL_TWITTER } from './setup';
import { getTestServices } from './test.services';

describe.only('02-platforms', () => {
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
    it.only("get's the latest 5 threads", async () => {
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
      try {
        const twitter = appUser[PLATFORM.Twitter];

        if (!twitter) {
          throw new Error('User does not have Twitter credentials');
        }

        const fetchParams: FetchUserPostsParams = {
          userDetails: {
            ...userDetails,
            user_id: '1773032135814717440',
          },
          end_time: 1714786027000,
          max_results: 5,
        };

        const threads = await services.db.run((manager) =>
          twitterService.fetch(fetchParams, manager)
        );

        expect(threads).to.not.be.undefined;
        expect(threads.length).to.be.equal(5);
        expect(threads[0].post.tweets.length).to.be.equal(5);
        expect(threads[0].post.conversation_id).to.be.equal(
          '1786430246264152195'
        );
      } catch (error) {
        console.error('error: ', error);
        throw error;
      }
    });

    it.skip('refreshes the access token if it has expired when using the twitter service', async () => {
      if (!appUser) {
        throw new Error('appUser not created');
      }
      const allUserDetails = appUser[PLATFORM.Twitter];
      if (!allUserDetails || allUserDetails.length < 0) {
        throw new Error('Unexpected');
      }
      const userDetails = allUserDetails[0];
      const twitterService = new TwitterService(
        services.time,
        services.users.repo,
        {
          clientId: process.env.TWITTER_CLIENT_ID as string,
          clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
        }
      );

      await services.db.run(async (manager) => {
        const tweets = await twitterService.fetch(
          {
            userDetails,
            start_time: Date.now() - 1000,
          },
          manager
        );

        expect(tweets).to.not.be.undefined;

        const user = await services.users.repo.getUserWithPlatformAccount(
          PLATFORM.Twitter,
          userDetails.user_id,
          manager,
          true
        );

        const newUserDetails = user[PLATFORM.Twitter];
        if (!newUserDetails || newUserDetails.length != 1) {
          throw new Error('Unexpected');
        }

        expect(newUserDetails[0]).to.not.deep.equal(userDetails);
      });
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
          parsedStatus: 'processed',
          parsingStatus: 'idle',
          reviewedStatus: 'pending',
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
                lastFetchedMs: 0,
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
