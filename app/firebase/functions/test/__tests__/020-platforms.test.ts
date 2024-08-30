import { expect } from 'chai';

import { FetchParams } from '../../src/@shared/types/types.fetch';
import { RSAKeys } from '../../src/@shared/types/types.nanopubs';
import { PlatformPostCreate } from '../../src/@shared/types/types.platform.posts';
import { AppTweet, TwitterThread } from '../../src/@shared/types/types.twitter';
import { AppUser, PLATFORM } from '../../src/@shared/types/types.user';
import { signNanopublication } from '../../src/@shared/utils/nanopub.sign.util';
import { getRSAKeys } from '../../src/@shared/utils/rsa.keys';
import { USE_REAL_EMAIL } from '../../src/config/config.runtime';
import { logger } from '../../src/instances/logger';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { convertToAppTweets } from '../../src/platforms/twitter/twitter.utils';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { getMockPost } from '../utils/posts.utils';
import { createUsers } from '../utils/users.utils';
import {
  USE_REAL_NANOPUB,
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
  testUsers,
} from './setup';
import { testCredentials } from './test.accounts';
import { getTestServices } from './test.services';

describe('02-platforms', () => {
  let rsaKeys: RSAKeys | undefined;
  let user: AppUser | undefined;

  const services = getTestServices({
    time: 'mock',
    twitter: USE_REAL_TWITTER ? undefined : { publish: true, signup: true },
    nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
    parser: USE_REAL_PARSER ? 'real' : 'mock',
    emailSender: USE_REAL_EMAIL ? 'spy' : 'mock',
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
      const testUser = testCredentials[0];

      user = users.find(
        (u) =>
          UsersHelper.getAccount(u, PLATFORM.Twitter, testUser.twitter.id) !==
          undefined
      );
    });
  });

  // TODO, fix this test
  describe.skip('twitter', () => {
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
      expect(threads.platformPosts.length).to.be.greaterThanOrEqual(1);
    });

    it('includes quote tweets in platform post and app post', async () => {
      const postIds = [
        '1798791421152911644', // https://x.com/sense_nets_bot/status/1798791421152911644 quotes https://x.com/sense_nets_bot/status/1795069204418175459
        '1798791660668698927', // https://x.com/sense_nets_bot/status/1798791660668698927 quotes https://x.com/sense_nets_bot/status/1798782358201508331
        '1798792109031559184', // https://x.com/sense_nets_bot/status/1798792109031559184 quotes https://x.com/rtk254/status/1798549107507974626
      ];

      if (!user) {
        throw new Error('appUser not created');
      }
      const twitterId = user[PLATFORM.Twitter]?.[0]?.user_id;

      const twitterService = services.platforms.get(
        PLATFORM.Twitter
      ) as TwitterService;

      try {
        const result = await services.db.run(async (manager) => {
          return twitterService.getPosts(postIds, manager, twitterId);
        });
        const appTweets = convertToAppTweets(result.data, result.includes);
        expect(appTweets).to.not.be.undefined;
        expect(appTweets.length).to.be.equal(3);

        const author = result.includes?.users?.find(
          (user) => user.id === result.data[0].author_id
        );
        expect(author).to.not.be.undefined;

        const quotedTweetIds = [
          '1795069204418175459',
          '1798782358201508331',
          '1798549107507974626',
        ];

        appTweets.forEach((appTweet: AppTweet) => {
          expect(quotedTweetIds).to.include(appTweet.quoted_tweet?.id);
        });

        /** check that it converts the thread into a generic app post properly */
        const platformPost = {
          posted: {
            post: {
              conversation_id: appTweets[0].conversation_id,
              tweets: appTweets,
              author,
            },
          },
        };

        const genericPost = await twitterService.convertToGeneric(
          platformPost as any as PlatformPostCreate<TwitterThread>
        );

        if (USE_REAL_TWITTER) {
          genericPost.thread.forEach((post) => {
            expect(post.quotedThread).to.not.be.undefined;
            expect(
              quotedTweetIds.some((id) => post.quotedThread?.url?.includes(id))
            ).to.be.true;
          });
        }
      } catch (error) {
        console.error('error: ', error);
        throw error;
      }
    });
  });

  describe('nanopub', () => {
    it('creates a draft nanopub, sign and publish', async () => {
      if (!user) {
        throw new Error('appUser not created');
      }

      try {
        const post = getMockPost({ authorId: user.userId, id: 'post-id-1' });

        const nanopubService = services.platforms.get(PLATFORM.Nanopub);

        const nanopub = await nanopubService.convertFromGeneric({
          post,
          author: user,
        });

        if (!nanopub) {
          throw new Error('Post not created');
        }

        if (!rsaKeys) {
          throw new Error('RSA keys not created');
        }

        const signed = await signNanopublication(
          nanopub.unsignedPost,
          rsaKeys,
          ''
        );
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

  describe('mastodon', () => {
    it('fetches the latest posts', async () => {
      if (!user) {
        throw new Error('appUser not created');
      }

      const mastodonService = services.platforms.get(PLATFORM.Mastodon);
      const userDetails: MastodonUserDetails = {
        user_id: 'test_user_id',
        signupDate: Date.now(),
        profile: {
          id: 'test_user_id',
          username: 'test_username',
          displayName: 'Test User',
          avatar: 'https://example.com/avatar.jpg',
          mastodonServer: process.env.MASTODON_SERVER_DOMAIN as string,
        },
        read: {
          accessToken: process.env.MASTODON_ACCESS_TOKEN as string,
        },
      };

      const fetchParams: PlatformFetchParams = {
        expectedAmount: 5,
      };

      const result = await services.db.run((manager) =>
        mastodonService.fetch(fetchParams, userDetails, manager)
      );

      expect(result).to.not.be.undefined;
      expect(result.platformPosts.length).to.be.greaterThan(0);
      expect(result.platformPosts[0].post).to.have.property('id');
      expect(result.platformPosts[0].post).to.have.property('content');
    });
  });
});
