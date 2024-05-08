import { expect } from 'chai';
import { TweetV2SingleResult } from 'twitter-api-v2';

import { AppUser, PLATFORM } from '../../src/@shared/types/types';
import { RSAKeys } from '../../src/@shared/types/types.nanopubs';
import { SciFilterClassfication } from '../../src/@shared/types/types.parser';
import {
  PlatformPostCreate,
  PlatformPostDraftApprova,
  PlatformPostPosted,
  PlatformPostPublishOrigin,
  PlatformPostPublishStatus,
} from '../../src/@shared/types/types.platform.posts';
import {
  AppPostCreate,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
  PostsQueryStatusParam,
} from '../../src/@shared/types/types.posts';
import { signNanopublication } from '../../src/@shared/utils/nanopub.sign.util';
import { getRSAKeys } from '../../src/@shared/utils/rsa.keys';
import { logger } from '../../src/instances/logger';
import { TWITTER_USER_ID_MOCKS } from '../../src/platforms/twitter/mock/twitter.service.mock';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { parseUserPostsTask } from '../../src/posts/posts.task';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { createTestAppUsers } from '../utils/user.factory';
import { USE_REAL_NANOPUB, USE_REAL_PARSER, USE_REAL_TWITTER } from './setup';
import { getTestServices } from './test.services';

describe('031-filter', () => {
  let rsaKeys: RSAKeys | undefined;
  const services = getTestServices({
    twitter: USE_REAL_TWITTER ? 'real' : 'mock-publish',
    nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
    parser: USE_REAL_PARSER ? 'real' : 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('query and filter', async () => {
    before(async () => {
      const { posts, platformPosts } = services.postsManager.processing;
      const appPostCreates: [AppPostCreate, PlatformPostCreate][] = [
        /** Published posts */
        [
          {
            content: 'test content 1',
            authorId: 'test-user-id',
            origin: PLATFORM.Nanopub,
            createdAtMs: 12345678,
            parsingStatus: AppPostParsingStatus.IDLE,
            parsedStatus: AppPostParsedStatus.PROCESSED,
            reviewedStatus: AppPostReviewStatus.APPROVED,
            republishedStatus: AppPostRepublishedStatus.REPUBLISHED,
            semantics: 'semantics',
            mirrorsIds: [],
          },
          {
            platformId: PLATFORM.Nanopub,
            publishStatus: PlatformPostPublishStatus.PUBLISHED,
            publishOrigin: PlatformPostPublishOrigin.POSTED,
          },
        ],
        /** Ignored posts */
        [
          {
            content: 'test content 2',
            authorId: 'test-user-id',
            origin: PLATFORM.Nanopub,
            createdAtMs: 12345678,
            parsingStatus: AppPostParsingStatus.IDLE,
            parsedStatus: AppPostParsedStatus.PROCESSED,
            reviewedStatus: AppPostReviewStatus.APPROVED,
            republishedStatus: AppPostRepublishedStatus.REPUBLISHED,
            semantics: 'semantics',
            mirrorsIds: [],
          },
          {
            platformId: PLATFORM.Nanopub,
            publishStatus: PlatformPostPublishStatus.DRAFT,
            publishOrigin: PlatformPostPublishOrigin.POSTED,
          },
        ],
        [
          {
            content: 'test content 3',
            authorId: 'test-user-id',
            origin: PLATFORM.Nanopub,
            createdAtMs: 12345678,
            parsingStatus: AppPostParsingStatus.IDLE,
            parsedStatus: AppPostParsedStatus.PROCESSED,
            reviewedStatus: AppPostReviewStatus.PENDING,
            republishedStatus: AppPostRepublishedStatus.REPUBLISHED,
            originalParsed: {
              filter_clasification: SciFilterClassfication.NOT_RESEARCH,
              semantics: 'semantics',
            },
            semantics: 'semantics',
            mirrorsIds: [],
          },
          {
            platformId: PLATFORM.Nanopub,
            publishStatus: PlatformPostPublishStatus.DRAFT,
            publishOrigin: PlatformPostPublishOrigin.POSTED,
          },
        ],
        /** For review posts */
        [
          {
            content: 'test content 4',
            authorId: 'test-user-id',
            origin: PLATFORM.Nanopub,
            createdAtMs: 12345678,
            parsingStatus: AppPostParsingStatus.IDLE,
            parsedStatus: AppPostParsedStatus.PROCESSED,
            reviewedStatus: AppPostReviewStatus.PENDING,
            republishedStatus: AppPostRepublishedStatus.REPUBLISHED,
            originalParsed: {
              filter_clasification: SciFilterClassfication.RESEARCH,
              semantics: 'semantics',
            },
            semantics: 'semantics',
            mirrorsIds: [],
          },
          {
            platformId: PLATFORM.Nanopub,
            publishStatus: PlatformPostPublishStatus.DRAFT,
            publishOrigin: PlatformPostPublishOrigin.POSTED,
          },
        ],
      ];

      await services.db.run(async (manager) => {
        appPostCreates.forEach(([appPostCreate, platformPostCreate]) => {
          const appPost = posts.create(appPostCreate, manager);
          const platformPost = platformPosts.create(
            platformPostCreate,
            manager
          );
          posts.addMirror(appPost.id, platformPost.id, manager);
        });
      });
    });
    it('gets all posts from a user', async () => {
      const posts = await services.postsManager.getOfUser('test-user-id', {
        status: PostsQueryStatusParam.ALL,
        fetchParams: { expectedAmount: 10 },
      });
      expect(posts).to.have.length(4);
    });
    it('gets all published posts from a user', async () => {
      const posts = await services.postsManager.getOfUser('test-user-id', {
        status: PostsQueryStatusParam.PUBLISHED,
        fetchParams: { expectedAmount: 10 },
      });
      expect(posts).to.have.length(1);
    });
    it('gets all for review posts from a user', async () => {
      const posts = await services.postsManager.getOfUser('test-user-id', {
        status: PostsQueryStatusParam.PENDING,
        fetchParams: { expectedAmount: 10 },
      });
      expect(posts).to.have.length(1);
    });
    it('gets all ignored posts from a user', async () => {
      const posts = await services.postsManager.getOfUser('test-user-id', {
        status: PostsQueryStatusParam.IGNORED,
        fetchParams: { expectedAmount: 10 },
      });
      expect(posts).to.have.length(2);
    });
  });
});
