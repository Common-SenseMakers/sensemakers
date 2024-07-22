import { FetchParams } from '../../src/@shared/types/types.fetch';
import {
  PlatformPost,
  PlatformPostPublishOrigin,
  PlatformPostPublishStatus,
} from '../../src/@shared/types/types.platform.posts';
import {
  AppPost,
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
  GenericThread,
} from '../../src/@shared/types/types.posts';
import { TwitterThread } from '../../src/@shared/types/types.twitter';
import { PLATFORM } from '../../src/@shared/types/types.user';
import { activityEventCreatedHook } from '../../src/activity/activity.created.hook';
import { Services } from '../../src/instances/services';
import { postUpdatedHook } from '../../src/posts/hooks/post.updated.hook';
import { testCredentials } from '../__tests__/test.accounts';

export const getMockPost = (refPost: Partial<AppPostFull>) => {
  const authorId = refPost.authorId || 'test-author-id';
  const createdAtMs = refPost.createdAtMs || Date.now();

  const defaultGeneric: GenericThread = {
    thread: [
      {
        content: 'test content',
      },
    ],
    author: {
      id: '123456',
      name: 'test author',
      platformId: PLATFORM.Twitter,
      username: 'test_author',
    },
  };

  const twitterMirror: PlatformPost<TwitterThread> = {
    id: 'pp-id',
    platformId: PLATFORM.Twitter,
    publishOrigin: PlatformPostPublishOrigin.FETCHED,
    publishStatus: PlatformPostPublishStatus.PUBLISHED,
    posted: {
      post_id: '123456',
      timestampMs: createdAtMs,
      user_id: testCredentials[0].twitter.id,
      post: {
        conversation_id: '123456',
        tweets: [
          {
            id: '123456',
            created_at: '2021-01-01T00:00:00.000Z',
            author_id: '123456',
            conversation_id: '123456',
            text: 'test content',
          },
        ],
        author: {
          id: '123456',
          username: 'test_author',
          name: 'test author',
        },
      },
    },
  };

  const post: AppPostFull = {
    id: refPost.id || 'post-id',
    createdAtMs: createdAtMs,
    authorId: authorId,
    generic: refPost.generic || defaultGeneric,
    semantics: refPost.semantics || '',
    origin: PLATFORM.Twitter,
    parsedStatus: AppPostParsedStatus.PROCESSED,
    parsingStatus: AppPostParsingStatus.IDLE,
    reviewedStatus: AppPostReviewStatus.PENDING,
    republishedStatus: AppPostRepublishedStatus.PENDING,
    mirrors: [twitterMirror],
  };
  return post;
};

/**
 * We need to manually call the postUpdate hook that would have been called
 * when creating the AppPost as part of the fetch
 */
export const fetchPostsInTests = async (
  userId: string,
  params: FetchParams,
  services: Services
) => {
  /** fetch will store the posts in the DB */
  const postsCreated = await services.postsManager.fetchUser({
    userId: userId,
    params,
  });

  /**
   * We need to manually call the postUpdate hook that would have been called
   * when creating the AppPost as part of the fetch
   */
  await Promise.all(
    postsCreated.map((postCreated) =>
      postUpdatedHook(postCreated.post, services)
    )
  );
};

// auto triggfe the acivity create hook
export const postUpdatedHookOnTest = async (
  post: AppPost,
  services: Services,
  before?: AppPost
) => {
  const activities = await postUpdatedHook(post, services, before);

  await Promise.all(
    activities.map((activity) => activityEventCreatedHook(activity, services))
  );
};
