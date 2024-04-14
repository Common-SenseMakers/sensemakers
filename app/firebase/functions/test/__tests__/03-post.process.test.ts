import { expect } from 'chai';
import { TweetV2SingleResult } from 'twitter-api-v2';

import { AppUser, PLATFORM } from '../../src/@shared/types/types';
import {
  PlatformPost,
  PlatformPostPosted,
} from '../../src/@shared/types/types.platform.posts';
import { AppPost } from '../../src/@shared/types/types.posts';
import { HandleWithTxManager } from '../../src/db/transaction.manager';
import { logger } from '../../src/instances/logger';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { resetDB } from '../__tests_support__/db';
import { createTestAppUsers } from '../utils/user.factory';
import { MOCK_TWITTER } from './setup';
import { getTestServices } from './test.services';

describe('03-process', () => {
  const services = getTestServices();

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('create and process', () => {
    let appUser: AppUser | undefined;
    let content = `This is a test post ${Date.now()}`;
    let tweet: PlatformPostPosted<TweetV2SingleResult>;

    before(async () => {
      const func: HandleWithTxManager = async (manager) => {
        const users = await createTestAppUsers(services, manager);
        appUser = users[0];
      };

      await services.db.run(func);
    });

    /** skip for now because we have not yet granted write access */
    it('publish a post in the name of the test user', async () => {
      const func: HandleWithTxManager = async (manager) => {
        if (!appUser) {
          throw new Error('appUser not created');
        }
        const user_id = appUser[PLATFORM.Twitter]?.[0].user_id;
        if (!user_id) {
          throw new Error('Unexpected');
        }

        const user = await services.users.repo.getUserWithPlatformAccount(
          PLATFORM.Twitter,
          user_id,
          manager,
          true
        );

        const accounts = user[PLATFORM.Twitter];
        if (!accounts) {
          throw new Error('Unexpected');
        }
        const account = accounts[0];
        if (!account) {
          throw new Error('Unexpected');
        }

        tweet = await services.platforms
          .get<TwitterService>(PLATFORM.Twitter)
          .publish(
            {
              draft: { text: content },
              userDetails: account,
            },
            manager
          );

        /** set lastFetched to one second before the last tweet timestamp */
        await services.users.repo.setLastFetched(
          PLATFORM.Twitter,
          user_id,
          tweet.timestampMs - 1000,
          manager
        );

        expect(tweet).to.not.be.undefined;

        if (!MOCK_TWITTER) {
          await new Promise<void>((resolve) => setTimeout(resolve, 6 * 1000));
        }
      };

      await services.db.run(func);
    });

    it('fetch all posts from all platforms', async () => {
      /**
       * high-level trigger to process all new posts from
       * all registered users
       */
      const fetched = await services.postsManager.fetchAll();
      expect(fetched).to.have.length(1);

      const postFetched = fetched[0].post;
      const platformPostFetched = fetched[0].platformPost;

      const postRead = await services.postsManager.processing.posts.get(
        postFetched.id,
        true
      );
      const platformPostRead =
        await services.postsManager.processing.platformPosts.get(
          platformPostFetched.id,
          true
        );

      if (!appUser) {
        throw new Error('appUser not created');
      }

      const refAppPost: AppPost = {
        id: postFetched.id,
        authorId: appUser.userId,
        origin: PLATFORM.Twitter,
        parseStatus: 'unprocessed',
        content,
        mirrorsIds: [platformPostRead.id],
        reviewedStatus: 'pending',
      };

      const refPlatformPost: PlatformPost = {
        id: platformPostFetched.id,
        platformId: PLATFORM.Twitter,
        publishOrigin: 'fetched',
        publishStatus: 'published',
        posted: {
          post_id: tweet.post.data.id,
          user_id: (appUser[PLATFORM.Twitter] as any)[0].user_id,
          timestampMs: tweet.timestampMs,
          post: tweet.post.data,
        },
      };

      expect(postRead).to.not.be.undefined;

      expect(postRead).to.deep.equal(refAppPost);
      expect(postFetched).to.deep.equal(refAppPost);

      expect(platformPostRead).to.deep.equal(refPlatformPost);
      expect(platformPostFetched).to.deep.equal(refPlatformPost);
    });
  });
});
