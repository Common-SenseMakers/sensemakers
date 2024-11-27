import { FetchParams } from '../../src/@shared/types/types.fetch';
import { MastodonThread } from '../../src/@shared/types/types.mastodon';
import {
  PlatformPost,
  PlatformPostPublishOrigin,
  PlatformPostPublishStatus,
} from '../../src/@shared/types/types.platform.posts';
import {
  PLATFORM,
  PUBLISHABLE_PLATFORM,
} from '../../src/@shared/types/types.platforms';
import {
  AppPost,
  AppPostEditStatus,
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  GenericThread,
} from '../../src/@shared/types/types.posts';
import { TwitterThread } from '../../src/@shared/types/types.twitter';
import { getProfileId } from '../../src/@shared/utils/profiles.utils';
import { activityEventCreatedHook } from '../../src/activity/activity.created.hook';
import { Services } from '../../src/instances/services';
import { postUpdatedHook } from '../../src/posts/hooks/post.updated.hook';
import { testCredentials } from '../__tests__/test.accounts';

export const getMockPost = (
  refPost: Partial<AppPostFull>,
  platformId?: PLATFORM
) => {
  const authorId = refPost.authorUserId || 'test-author-id';
  const createdAtMs = refPost.createdAtMs || Date.now();

  const defaultGeneric: GenericThread = {
    thread: [
      {
        content: 'test content',
      },
      {
        content: 'test content 2',
      },
      {
        content: 'test content 3',
      },
    ],
    author: {
      id: '123456',
      name: 'test author',
      platformId: platformId || PLATFORM.Twitter,
      username: 'test_author',
    },
  };

  const platformMirror: PlatformPost<MastodonThread | TwitterThread> = (() => {
    if (platformId === PLATFORM.Mastodon) {
      return {
        id: 'pp-mastodon-id',
        platformId: PLATFORM.Mastodon,
        publishOrigin: PlatformPostPublishOrigin.FETCHED,
        publishStatus: PlatformPostPublishStatus.PUBLISHED,
        posted: {
          post_id: '113093259230165857',
          user_id: testCredentials[0].mastodon.id,
          timestampMs: createdAtMs,
          post: {
            thread_id: '113093259230165857',
            posts: [
              {
                id: '113093259230165857',
                createdAt: '2024-09-06T23:43:06.984Z',
                inReplyToId: null,
                inReplyToAccountId: null,
                sensitive: false,
                spoilerText: '',
                visibility: 'public',
                language: 'en',
                uri: 'https://cosocial.ca/users/weswalla/statuses/113093259230165857',
                url: 'https://cosocial.ca/@weswalla/113093259230165857',
                repliesCount: 1,
                reblogsCount: 0,
                favouritesCount: 0,
                editedAt: null,
                favourited: false,
                reblogged: false,
                muted: false,
                bookmarked: false,
                pinned: false,
                content:
                  '<p>I like to try and ground my understanding of reality and what is possible in the future in ecological systems science <a href="https://www.sciencedirect.com/science/article/pii/S0921800919310067" target="_blank" rel="nofollow noopener noreferrer" translate="no"><span class="invisible">https://www.</span><span class="ellipsis">sciencedirect.com/science/arti</span><span class="invisible">cle/pii/S0921800919310067</span></a></p>',
                filtered: [],
                reblog: null,
                application: {
                  name: 'Web',
                  website: null,
                },
                account: {
                  id: '111971425782516559',
                  username: 'weswalla',
                  acct: 'weswalla',
                  displayName: 'Wesley Finck',
                  locked: false,
                  bot: false,
                  discoverable: null,
                  group: false,
                  createdAt: '2024-02-21T00:00:00.000Z',
                  note: '<p>Full-Stack Engineer building knowledge management and sense-making tooling<br />prev: Holochain dev</p>',
                  url: 'https://cosocial.ca/@weswalla',
                  uri: 'https://cosocial.ca/users/weswalla',
                  avatar:
                    'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
                  avatarStatic:
                    'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
                  header: 'https://cosocial.ca/headers/original/missing.png',
                  headerStatic:
                    'https://cosocial.ca/headers/original/missing.png',
                  followersCount: 11,
                  followingCount: 18,
                  statusesCount: 21,
                  lastStatusAt: '2024-09-07',
                  noindex: false,
                  emojis: [],
                  roles: [],
                  fields: [],
                },
                mediaAttachments: [],
                mentions: [],
                tags: [],
                emojis: [],
                card: null,
                poll: null,
              },
              {
                id: '113093358996832469',
                createdAt: '2024-09-07T00:08:29.299Z',
                inReplyToId: '113093259230165857',
                inReplyToAccountId: '111971425782516559',
                sensitive: false,
                spoilerText: '',
                visibility: 'public',
                language: 'en',
                uri: 'https://cosocial.ca/users/weswalla/statuses/113093358996832469',
                url: 'https://cosocial.ca/@weswalla/113093358996832469',
                repliesCount: 0,
                reblogsCount: 0,
                favouritesCount: 0,
                editedAt: null,
                favourited: false,
                reblogged: false,
                muted: false,
                bookmarked: false,
                pinned: false,
                content:
                  '<p>there&#39;s a great podcast all about this by the paper&#39;s author: <a href="https://www.thegreatsimplification.com/" target="_blank" rel="nofollow noopener noreferrer" translate="no"><span class="invisible">https://www.</span><span class="">thegreatsimplification.com/</span><span class="invisible"></span></a></p>',
                filtered: [],
                reblog: null,
                application: {
                  name: 'Web',
                  website: null,
                },
                account: {
                  id: '111971425782516559',
                  username: 'weswalla',
                  acct: 'weswalla',
                  displayName: 'Wesley Finck',
                  locked: false,
                  bot: false,
                  discoverable: null,
                  group: false,
                  createdAt: '2024-02-21T00:00:00.000Z',
                  note: '<p>Full-Stack Engineer building knowledge management and sense-making tooling<br />prev: Holochain dev</p>',
                  url: 'https://cosocial.ca/@weswalla',
                  uri: 'https://cosocial.ca/users/weswalla',
                  avatar:
                    'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
                  avatarStatic:
                    'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
                  header: 'https://cosocial.ca/headers/original/missing.png',
                  headerStatic:
                    'https://cosocial.ca/headers/original/missing.png',
                  followersCount: 11,
                  followingCount: 18,
                  statusesCount: 21,
                  lastStatusAt: '2024-09-07',
                  noindex: false,
                  emojis: [],
                  roles: [],
                  fields: [],
                },
                mediaAttachments: [],
                mentions: [],
                tags: [],
                emojis: [],
                card: {
                  url: 'https://www.thegreatsimplification.com',
                  title: 'The Great Simplification with Nate Hagens',
                  description:
                    'The Great Simplification with Nate Hagens explores money, energy, economy, and the environment with world experts and leaders to understand how everything fits together, and where we go from here.',
                  language: 'en',
                  type: 'link',
                  authorName: '',
                  authorUrl: '',
                  providerName: 'The Great Simplification',
                  providerUrl: '',
                  html: '',
                  width: 1500,
                  height: 844,
                  image:
                    'https://media.cosocial.ca/cache/preview_cards/images/000/843/310/original/fb0235e0afb9c5c6.jpg',
                  imageDescription: '',
                  embedUrl: '',
                  blurhash: 'UN9%xU-q4,D$?Jog9XITj]j[j?a{R%j[t8s;',
                  publishedAt: null,
                },
                poll: null,
              },
            ],
            author: {
              id: '111971425782516559',
              username: 'weswalla',
              acct: 'weswalla',
              displayName: 'Wesley Finck',
              locked: false,
              bot: false,
              discoverable: null,
              group: false,
              createdAt: '2024-02-21T00:00:00.000Z',
              note: '<p>Full-Stack Engineer building knowledge management and sense-making tooling<br />prev: Holochain dev</p>',
              url: 'https://cosocial.ca/@weswalla',
              uri: 'https://cosocial.ca/users/weswalla',
              avatar:
                'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
              avatarStatic:
                'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
              header: 'https://cosocial.ca/headers/original/missing.png',
              headerStatic: 'https://cosocial.ca/headers/original/missing.png',
              followersCount: 11,
              followingCount: 18,
              statusesCount: 21,
              lastStatusAt: '2024-09-07',
              noindex: false,
              emojis: [],
              roles: [],
              fields: [],
            },
          },
        },
      };
    }

    return {
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
  })();

  const post: AppPostFull = {
    id: refPost.id || 'post-id',
    createdAtMs: createdAtMs,
    authorProfileId: getProfileId(
      platformMirror.platformId,
      platformMirror.posted?.post.author.id as string
    ),
    authorUserId: authorId,
    generic: refPost.generic || defaultGeneric,
    semantics: refPost.semantics || '',
    origin: platformId || PLATFORM.Twitter,
    parsedStatus: AppPostParsedStatus.PROCESSED,
    parsingStatus: AppPostParsingStatus.IDLE,
    editStatus: refPost.editStatus || AppPostEditStatus.PENDING,
    mirrors: refPost.mirrors
      ? [...refPost.mirrors, platformMirror]
      : [platformMirror],
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

export const fetchPostInTests = async (
  userId: string,
  post_id: string,
  services: Services,
  platform: PUBLISHABLE_PLATFORM
) => {
  /** fetch will store the posts in the DB */
  const { post } = await services.db.run(
    (manager) =>
      services.postsManager.fetchPostFromPlatform(
        userId,
        platform,
        post_id,
        manager
      ),
    undefined,
    undefined,
    `fetchPostInTests ${userId} ${post_id} ${platform}`
  );
  if (post) {
    /**
     * We need to manually call the postUpdate hook that would have been called
     * when creating the AppPost as part of the fetch
     */
    await postUpdatedHookOnTest(post, services);
  }

  return post;
};
