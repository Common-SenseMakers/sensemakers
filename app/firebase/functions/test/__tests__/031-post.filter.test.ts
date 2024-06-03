import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types/types';
import { SciFilterClassfication } from '../../src/@shared/types/types.parser';
import {
  PlatformPostCreate,
  PlatformPostPublishOrigin,
  PlatformPostPublishStatus,
} from '../../src/@shared/types/types.platform.posts';
import {
  AppPostCreate,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
  PostsQueryStatus,
} from '../../src/@shared/types/types.posts';
import { logger } from '../../src/instances/logger';
import { resetDB } from '../utils/db';
import { USE_REAL_NANOPUB, USE_REAL_PARSER, USE_REAL_TWITTER } from './setup';
import { getTestServices } from './test.services';

describe('031-filter', () => {
  const services = getTestServices({
    time: 'real',
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
            reviewedStatus: AppPostReviewStatus.IGNORED,
            republishedStatus: AppPostRepublishedStatus.PENDING,
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
            reviewedStatus: AppPostReviewStatus.IGNORED,
            republishedStatus: AppPostRepublishedStatus.PENDING,
            originalParsed: {
              filter_classification: SciFilterClassfication.NOT_RESEARCH,
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
            republishedStatus: AppPostRepublishedStatus.PENDING,
            originalParsed: {
              filter_classification: SciFilterClassfication.RESEARCH,
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
        status: PostsQueryStatus.ALL,
        fetchParams: { expectedAmount: 10 },
      });
      expect(posts).to.have.length(4);
    });
    it('gets all published posts from a user', async () => {
      const posts = await services.postsManager.getOfUser('test-user-id', {
        status: PostsQueryStatus.PUBLISHED,
        fetchParams: { expectedAmount: 10 },
      });
      expect(posts).to.have.length(1);
    });
    it('gets all for review posts from a user', async () => {
      const posts = await services.postsManager.getOfUser('test-user-id', {
        status: PostsQueryStatus.PENDING,
        fetchParams: { expectedAmount: 10 },
      });
      expect(posts).to.have.length(1);
    });
    it('gets all ignored posts from a user', async () => {
      const posts = await services.postsManager.getOfUser('test-user-id', {
        status: PostsQueryStatus.IGNORED,
        fetchParams: { expectedAmount: 10 },
      });
      expect(posts).to.have.length(2);
    });
  });
});
