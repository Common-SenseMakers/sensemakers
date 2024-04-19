import { expect } from 'chai';
import { TweetV2SingleResult } from 'twitter-api-v2';

import { AppUser, PLATFORM } from '../../src/@shared/types/types';
import { RSAKeys } from '../../src/@shared/types/types.nanopubs';
import {
  PlatformPost,
  PlatformPostPosted,
} from '../../src/@shared/types/types.platform.posts';
import { AppPost } from '../../src/@shared/types/types.posts';
import { getRSAKeys } from '../../src/@shared/utils/rsa.keys';
import { logger } from '../../src/instances/logger';
import { signNanopublication } from '../../src/platforms/nanopub/sign.util';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { resetDB } from '../utils/db';
import { createTestAppUsers } from '../utils/user.factory';
import { MOCK_TWITTER } from './setup';
import {
  MOCKED_PARSER_RESULT,
  MOCKED_SEMANTICS,
  getTestServices,
} from './test.services';

describe.only('03-process', () => {
  let rsaKeys: RSAKeys | undefined;
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
      await services.db.run(async (manager) => {
        const users = await createTestAppUsers(services, manager);
        appUser = users[0];
        rsaKeys = getRSAKeys('');
      });
    });

    /** skip for now because we have not yet granted write access */
    it('publish a post in the name of the test user', async () => {
      await services.db.run(async (manager) => {
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
      });
    });

    it('fetch user posts from all platforms', async () => {
      if (!appUser) {
        throw new Error('appUser not created');
      }

      /** fetch user posts */
      await services.postsManager.fetchUser(appUser);

      /** read user post */
      const postsRead = await services.postsManager.getPendingOfUser(
        appUser.userId
      );

      expect(postsRead).to.not.be.undefined;

      const postRead = postsRead[0];
      expect(postRead).to.not.be.undefined;
      expect(postRead.mirrors).to.have.length(2);

      expect(postRead.semantics).to.not.be.undefined;
      expect(postRead.originalParsed).to.not.be.undefined;

      const tweetRead = postRead.mirrors.find(
        (m) => m.platformId === PLATFORM.Twitter
      );

      const nanopubRead = postRead.mirrors.find(
        (m) => m.platformId === PLATFORM.Nanopub
      );

      if (!tweetRead) {
        throw new Error('tweetRead not created');
      }

      if (!nanopubRead) {
        throw new Error('tweetRead not created');
      }

      if (!appUser) {
        throw new Error('appUser not created');
      }

      /** mirrors are not part of the reference posts */
      postsRead.forEach((p) => delete (p as any).mirrors);

      const refAppPost: AppPost = {
        id: postRead.id,
        authorId: appUser.userId,
        origin: PLATFORM.Twitter,
        reviewedStatus: 'pending',
        parseStatus: 'processed',
        content,
        mirrorsIds: [tweetRead.id, nanopubRead.id],
        semantics: MOCKED_SEMANTICS,
        originalParsed: MOCKED_PARSER_RESULT,
      };

      const refTweet: PlatformPost = {
        id: tweetRead.id,
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
      expect(tweetRead).to.deep.equal(refTweet);
    });

    it('fetch one user pending posts', async () => {
      if (!appUser) {
        throw new Error('appUser not created');
      }

      /** get pending posts of user */
      const pendingPosts = await services.postsManager.getPendingOfUser(
        appUser.userId
      );

      expect(pendingPosts).to.have.length(1);
      const pendingPost = pendingPosts[0];
      const nanopub = pendingPost.mirrors.find(
        (m) => m.platformId === PLATFORM.Nanopub
      );

      if (!nanopub?.draft) {
        throw new Error('draft not created');
      }

      const draft = nanopub.draft.post;

      if (!rsaKeys) {
        throw new Error('draft not created');
      }

      /** sign */
      const signed = await signNanopublication(draft, rsaKeys, '');
      nanopub.draft.post = signed.rdf();
      nanopub.draft.postApproval = 'approved';

      /** send updated post (content and semantics did not changed) */
      await services.postsManager.approvePost(pendingPost, appUser.userId);

      const approved = await services.postsManager.getPost(
        pendingPost.id,
        true
      );

      expect(approved).to.not.be.undefined;
      expect(approved.reviewedStatus).to.equal('reviewed');
    });
  });
});
