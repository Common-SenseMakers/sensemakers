import { expect } from 'chai';

import {
  PlatformPostDraftApproval,
  PlatformPostSignerType,
} from '../../src/@shared/types/types.platform.posts';
import {
  AppPostFull,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
  GenericThread,
  PostsQueryStatus,
} from '../../src/@shared/types/types.posts';
import { AppUser, PLATFORM } from '../../src/@shared/types/types.user';
import { signNanopublication } from '../../src/@shared/utils/nanopub.sign.util';
import { getRSAKeys } from '../../src/@shared/utils/rsa.keys';
import { USE_REAL_EMAIL } from '../../src/config/config.runtime';
import { logger } from '../../src/instances/logger';
import { resetDB } from '../utils/db';
import {
  _01_createAndFetchUsers,
  _02_publishTweet,
  _03_fetchAfterPublish,
} from './reusable/create-post-fetch';
import {
  TEST_THREADS,
  USE_REAL_NANOPUB,
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
} from './setup';
import { testCredentials } from './test.accounts';
import { getTestServices } from './test.services';

const DEBUG_PREFIX = `030-process`;
const DEBUG = false;

describe('030-process', () => {
  let rsaKeys = getRSAKeys('');

  const services = getTestServices({
    time: 'mock',
    twitter: USE_REAL_TWITTER
      ? undefined
      : { publish: true, signup: true, fetch: true },
    nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
    parser: USE_REAL_PARSER ? 'real' : 'mock',
    emailSender: USE_REAL_EMAIL ? 'spy' : 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('create and process', () => {
    let user: AppUser | undefined;

    before(async () => {
      const testUser = testCredentials[0];
      user = await _01_createAndFetchUsers(services, testUser.twitter.id, {
        DEBUG,
        DEBUG_PREFIX,
      });
    });

    it('publish a tweet in the name of the test user', async () => {
      const TEST_CONTENT = `This is a test post ${USE_REAL_TWITTER ? Date.now() : ''}`;
      await _02_publishTweet(services, TEST_CONTENT, user);
    });

    it('fetch user posts from all platforms', async () => {
      await _03_fetchAfterPublish(services, user?.userId);
    });

    it('signs and approves/publishes pending post', async () => {
      if (!user) {
        throw new Error('user not created');
      }

      /** get pending posts of user */
      const pendingPosts = await services.postsManager.getOfUser(user.userId, {
        status: PostsQueryStatus.PENDING,
        fetchParams: { expectedAmount: 10 },
      });

      if (!USE_REAL_TWITTER && TEST_THREADS.length > 1) {
        expect(pendingPosts).to.have.length(TEST_THREADS.length + 1 - 1); // one post is ignored
      }

      await Promise.all(
        pendingPosts.slice(0, 2).map(async (pendingPost) => {
          const nanopub = pendingPost.mirrors.find(
            (m) => m.platformId === PLATFORM.Nanopub
          );

          if (!nanopub?.draft) {
            throw new Error('draft not created');
          }

          const draft = nanopub.draft.unsignedPost;

          if (!rsaKeys) {
            throw new Error('rsaKeys undefined');
          }

          /** sign */
          const signed = await signNanopublication(draft, rsaKeys, '');
          nanopub.draft.signedPost = signed.rdf();
          nanopub.draft.postApproval = PlatformPostDraftApproval.APPROVED;
          nanopub.draft.signerType = PlatformPostSignerType.USER;

          if (!user) {
            throw new Error('user not created');
          }

          const rootNanopubUri = nanopub?.post_id;
          const latestNanopubUri = nanopub?.posted?.post_id;
          expect(rootNanopubUri).to.be.undefined;
          expect(latestNanopubUri).to.be.undefined;

          /** send updated post (content and semantics did not changed) */
          await services.postsManager.publishPost(
            pendingPost,
            [PLATFORM.Nanopub],
            user.userId
          );

          const published = await services.postsManager.getPost(
            pendingPost.id,
            true
          );

          const publishedNanopubPlatformPost = published.mirrors.find(
            (platformPost) => platformPost.platformId === PLATFORM.Nanopub
          );
          const publishedRootNanopubUri = publishedNanopubPlatformPost?.post_id;
          const publishedLatestNanopubUri =
            publishedNanopubPlatformPost?.posted?.post_id;
          expect(publishedRootNanopubUri).to.not.be.undefined;
          expect(publishedLatestNanopubUri).to.not.be.undefined;
          expect(publishedRootNanopubUri).to.equal(publishedLatestNanopubUri);

          expect(published).to.not.be.undefined;
          expect(published.reviewedStatus).to.equal(
            AppPostReviewStatus.APPROVED
          );
          expect(published.republishedStatus).to.equal(
            AppPostRepublishedStatus.REPUBLISHED
          );
        })
      );
    });

    it('approves/publishes an unsigned pending post', async () => {
      if (!user) {
        throw new Error('user not created');
      }

      /** get pending posts of user */
      const pendingPosts = await services.postsManager.getOfUser(user.userId, {
        status: PostsQueryStatus.PENDING,
        fetchParams: { expectedAmount: 10 },
      });

      if (!USE_REAL_TWITTER) {
        if (TEST_THREADS.length > 1) {
          expect(pendingPosts).to.have.length(TEST_THREADS.length - 1 - 1); // 1 ifnored post
        } else {
          expect(pendingPosts).to.have.length(0);
        }
      }

      await Promise.all(
        pendingPosts.map(async (pendingPost) => {
          const nanopub = pendingPost.mirrors.find(
            (m) => m.platformId === PLATFORM.Nanopub
          );

          if (!nanopub?.draft) {
            throw new Error('draft not created');
          }

          /** sign */
          nanopub.draft.postApproval = PlatformPostDraftApproval.APPROVED;
          nanopub.draft.signerType = PlatformPostSignerType.DELEGATED;

          if (!user) {
            throw new Error('user not created');
          }

          const rootNanopubUri = nanopub?.post_id;
          const latestNanopubUri = nanopub?.posted?.post_id;
          expect(rootNanopubUri).to.be.undefined;
          expect(latestNanopubUri).to.be.undefined;
          /** send updated post (content and semantics did not changed) */
          await services.postsManager.publishPost(
            pendingPost,
            [PLATFORM.Nanopub],
            user.userId
          );

          const published = await services.postsManager.getPost(
            pendingPost.id,
            true
          );

          const publishedNanopubPlatformPost = published.mirrors.find(
            (platformPost) => platformPost.platformId === PLATFORM.Nanopub
          );
          const publishedRootNanopubUri = publishedNanopubPlatformPost?.post_id;
          const publishedLatestNanopubUri =
            publishedNanopubPlatformPost?.posted?.post_id;
          expect(publishedRootNanopubUri).to.not.be.undefined;
          expect(publishedLatestNanopubUri).to.not.be.undefined;
          expect(publishedRootNanopubUri).to.equal(publishedLatestNanopubUri);

          expect(published).to.not.be.undefined;
          expect(published.reviewedStatus).to.equal(
            AppPostReviewStatus.APPROVED
          );
          expect(published.republishedStatus).to.equal(
            AppPostRepublishedStatus.REPUBLISHED
          );
        })
      );
    });

    it('edits a published post', async () => {
      if (!user) {
        throw new Error('user not created');
      }

      /** get published posts of user */
      const publishedPosts = await services.postsManager.getOfUser(
        user.userId,
        {
          status: PostsQueryStatus.PUBLISHED,
          fetchParams: { expectedAmount: 10 },
        }
      );

      expect(publishedPosts).to.have.length(TEST_THREADS.length + 1 - 1); // 1 ignored post

      const post = publishedPosts[0];

      const threadPrev = post.generic.thread;
      const newThread = threadPrev.map((genericPostPrev) => {
        return {
          ...genericPostPrev,
          content: `${genericPostPrev.content} - edited`,
        };
      });

      const newGeneric: GenericThread = {
        author: post.generic.author,
        url: post.generic.url,
        thread: newThread,
      };

      const newPost: AppPostFull = {
        ...post,
        generic: newGeneric,
      };

      const nanopubPlatformPost = post.mirrors.find(
        (platformPost) => platformPost.platformId === PLATFORM.Nanopub
      );
      const rootNanopubUri = nanopubPlatformPost?.post_id;
      const latestNanopubUri = nanopubPlatformPost?.posted?.post_id;
      expect(rootNanopubUri).to.not.be.undefined;
      expect(latestNanopubUri).to.not.be.undefined;
      expect(rootNanopubUri).to.equal(latestNanopubUri);

      /** send updated post (content and semantics did not changed) */
      await services.postsManager.publishPost(
        newPost,
        [PLATFORM.Nanopub],
        user.userId
      );

      const readPost = await services.postsManager.getPost(post.id, true);

      expect(readPost.generic.thread).to.have.length(threadPrev.length);
      expect(readPost.generic.thread[0].content).to.equal(newThread[0].content);
      const updatedNanopubPlatformPost = readPost.mirrors.find(
        (platformPost) => platformPost.platformId === PLATFORM.Nanopub
      );
      const updatedRootNanopubUri = updatedNanopubPlatformPost?.post_id;
      const updatedLatestNanopubUri =
        updatedNanopubPlatformPost?.posted?.post_id;
      expect(updatedRootNanopubUri).to.not.be.undefined;
      expect(updatedLatestNanopubUri).to.not.be.undefined;
      expect(rootNanopubUri).to.equal(updatedRootNanopubUri);
      expect(latestNanopubUri).to.not.equal(updatedLatestNanopubUri);
    });
  });
});
