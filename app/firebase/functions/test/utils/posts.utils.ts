import { FetchParams } from '../../src/@shared/types/types.fetch';
import { MastodonThread } from '../../src/@shared/types/types.mastodon';
import { ParsePostResult } from '../../src/@shared/types/types.parser';
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
  AppPostFull,
  AppPostParsedStatus,
  AppPostParsingStatus,
  AppPostRepublishedStatus,
  AppPostReviewStatus,
  GenericThread,
} from '../../src/@shared/types/types.posts';
import { TwitterThread } from '../../src/@shared/types/types.twitter';
import { activityEventCreatedHook } from '../../src/activity/activity.created.hook';
import { Services } from '../../src/instances/services';
import { postUpdatedHook } from '../../src/posts/hooks/post.updated.hook';
import { getProfileId } from '../../src/profiles/profiles.repository';
import { testCredentials } from '../__tests__/test.accounts';

export const getMockPostNew = () => {
  const authorUserId = 'test-author-id';
  const authorProfileId = 'test-profile-id';
  const createdAtMs = Date.now();

  const defaultGeneric: GenericThread = {
    thread: [
      {
        content: 'this is such a cool idea! https://arxiv.org/abs/2312.05230',
      },
    ],
    author: {
      id: '123456',
      name: 'test author',
      platformId: PLATFORM.Twitter,
      username: 'test_author',
    },
  };

  const originalParsed: ParsePostResult =
    last_output as unknown as ParsePostResult;

  const post: AppPostFull = {
    id: 'post-id',
    createdAtMs: createdAtMs,
    authorProfileId: authorProfileId,
    authorUserId: authorUserId,
    generic: defaultGeneric,
    semantics: last_output.semantics,
    origin: PLATFORM.Twitter,
    parsedStatus: AppPostParsedStatus.PROCESSED,
    parsingStatus: AppPostParsingStatus.IDLE,
    reviewedStatus: AppPostReviewStatus.PENDING,
    republishedStatus: AppPostRepublishedStatus.PENDING,
    originalParsed,
    mirrors: [
      {
        id: 'pp-id',
        platformId: PLATFORM.Twitter,
        publishOrigin: PlatformPostPublishOrigin.FETCHED,
        publishStatus: PlatformPostPublishStatus.PUBLISHED,
        posted: {
          post_id: '123456',
          timestampMs: createdAtMs,
          user_id: '123412341234',
          post: {
            conversation_id: '123456',
            tweets: [],
            id: 'post-id',
            createdAtMs: createdAtMs,
            authorId: authorProfileId,
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
  return post;
};

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
    reviewedStatus: AppPostReviewStatus.PENDING,
    republishedStatus: AppPostRepublishedStatus.PENDING,
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

const last_output = {
  semantics:
    '@prefix ns1: <https://sense-nets.xyz/> .\n@prefix ns2: <http://purl.org/spar/cito/> .\n@prefix schema: <https://schema.org/> .\n\nns1:mySemanticPost ns2:agreesWith <https://x.com/FDAadcomms/status/1798104612635070611> ;\n    ns2:discusses <https://journals.sagepub.com/doi/10.1177/20451253231198466> ;\n    ns2:includesQuotationFrom <https://x.com/FDAadcomms/status/1798104612635070611>,\n        <https://x.com/FDAadcomms/status/1798107142219796794>,\n        <https://x.com/eturnermd1/status/1798046087737180395> ;\n    ns2:linksTo <https://x.com/FDAadcomms/status/12345> ;\n    schema:keywords "FDA",\n        "MDMA",\n        "PTSD",\n        "conflicts-of-interest",\n        "review-paper" ;\n    ns1:announcesResource <https://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E> ;\n    ns1:quotesPost <https://x.com/FDAadcomms/status/1798104612635070611> .\n\n<https://journals.sagepub.com/doi/10.1177/20451253231198466> ns1:hasZoteroItemType "journalArticle" .\n\n<https://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E> ns1:hasZoteroItemType "videoRecording" .\n\n<https://x.com/FDAadcomms/status/1798107142219796794> ns2:linksTo <https://x.com/FDAadcomms/status/12345> ;\n    ns1:hasZoteroItemType "forumPost" .\n\n<https://x.com/eturnermd1/status/1798046087737180395> ns1:hasZoteroItemType "forumPost" .\n\n<https://x.com/FDAadcomms/status/12345> ns1:hasZoteroItemType "forumPost" .\n\n<https://x.com/FDAadcomms/status/1798104612635070611> ns1:hasZoteroItemType "forumPost" .\n\n',
  support: {
    ontology: {
      semantic_predicates: [
        {
          name: 'other',
          uri: 'https://sense-nets.xyz/other',
          versions: ['v0'],
          label: 'other',
          display_name: '⬜ other',
          prompt:
            'This is a special tag. Use this tag if none of the tags above are suitable. If you tag a post with <other>, no other tag should be assigned to the post.',
          prompt_zero_ref:
            'This is a special tag. Use this tag if none of the tags above are suitable. If you tag a post with <other>, no other tag should be assigned to the post.',
          prompt_single_ref: null,
          prompt_multi_ref: null,
          valid_subject_types: ['post'],
          valid_object_types: ['nan'],
        },
        {
          name: 'disagreesWith',
          uri: 'http://purl.org/spar/cito/disagreesWith',
          versions: ['v0'],
          label: 'disagrees',
          display_name: '👎 disagrees-with',
          prompt:
            'this post disputes or expresses disagreement with statements, ideas or conclusions presented in the mentioned reference.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'this post disputes or expresses disagreement with statements, ideas or conclusions presented in the mentioned reference.',
          prompt_multi_ref:
            'this reference is being disputed by the post. The post expresses disagreement with statements, ideas or conclusions presented in the mentioned reference.',
          valid_subject_types: ['post', 'ref'],
          valid_object_types: ['ref'],
        },
        {
          name: 'possibleMissingReference',
          uri: 'https://sense-nets.xyz/possibleMissingReference',
          versions: ['v0'],
          label: 'missing-ref',
          display_name: '⬛ possible-missing-reference',
          prompt:
            'this post seems to be referring to a reference by name but has not explicitly provided a URL link to the reference. For example, a post that discusses a book and mentions it by title, but contains no link to the book.',
          prompt_zero_ref:
            'this post seems to be referring to a reference by name but has not explicitly provided a URL link to the reference. For example, a post that discusses a book and mentions it by title, but contains no link to the book.',
          prompt_single_ref: null,
          prompt_multi_ref: null,
          valid_subject_types: ['post'],
          valid_object_types: ['nan'],
        },
        {
          name: 'reviews',
          uri: 'http://purl.org/spar/cito/reviews',
          versions: ['v0'],
          label: 'review',
          display_name: '🧐 reviews',
          prompt:
            'this post contains a review of another reference, such as a book, article or movie. The review could be positive or negative. A review can be detailed or a simple short endorsement.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'this post contains a review of another reference, such as a book, article or movie. The review could be positive or negative. A review can be detailed or a simple short endorsement.',
          prompt_multi_ref:
            'the reference is being reviewed by the post. The reference could be a book, article or movie, or other media content. The review could be positive or negative.',
          valid_subject_types: ['post', 'ref'],
          valid_object_types: ['ref'],
        },
        {
          name: 'question',
          uri: 'https://schema.org/Question',
          versions: ['v0'],
          label: 'dg-question',
          display_name: ' ❓ discourse-graph/question',
          prompt: 'this post is raising a research question.',
          prompt_zero_ref: 'this post is raising a research question.',
          prompt_single_ref: null,
          prompt_multi_ref: null,
          valid_subject_types: ['post'],
          valid_object_types: ['nan'],
        },
        {
          name: 'announcesResource',
          uri: 'https://sense-nets.xyz/announcesResource',
          versions: ['v0'],
          label: 'announce',
          display_name: '📢 announces',
          prompt:
            'this post contains an announcement of new research. The announcement is likely made by the authors but may be a third party. We use a broad definition of research that includes classic and non-traditional outputs. Classic outputs include papers, datasets or code. Non traditional outputs can include a podcast, blog post, video explainers, etc.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'this post contains an announcement of new research. The announcement is likely made by the authors but may be a third party. We use a broad definition of research that includes classic and non-traditional outputs. Classic outputs include papers, datasets or code. Non traditional outputs can include a podcast, blog post, video explainers, etc.',
          prompt_multi_ref:
            'the reference is a new research output being announced by the post. The announcement is likely made by the authors but may be a third party. A research output could be a paper, dataset or other type of research that is being announced publicly.',
          valid_subject_types: ['post', 'ref'],
          valid_object_types: ['ref'],
        },
        {
          name: 'endorses',
          uri: 'https://sense-nets.xyz/endorses',
          versions: ['v0'],
          label: 'endorses',
          display_name: '➕ endorses',
          prompt:
            'this post endorses the mentioned reference. This label can also be used for cases of implicit recommendation, where the author is expressing enjoyment of some content but not explicitly recommending it.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'this post endorses the mentioned reference. This label can also be used for cases of implicit recommendation, where the author is expressing enjoyment of some content but not explicitly recommending it.',
          prompt_multi_ref:
            'the post endorses this reference. This label can also be used for cases of implicit recommendation, where the author is expressing enjoyment of some content but not explicitly recommending it.',
          valid_subject_types: ['post', 'ref'],
          valid_object_types: ['ref'],
        },
        {
          name: 'discusses',
          uri: 'http://purl.org/spar/cito/discusses',
          versions: ['v0'],
          label: 'discussion',
          display_name: '🗣️ discusses',
          prompt:
            'this post discusses how the cited reference relates to other facts or claims. For example, post might discuss how the cited reference informs questions, provides evidence, or supports or opposes claims.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'this post discusses how the cited reference relates to other facts or claims. For example, post might discuss how the cited reference informs questions, provides evidence, or supports or opposes claims.',
          prompt_multi_ref:
            'this post discusses how the cited reference relates to other facts or claims. For example, post might discuss how the cited reference informs questions, provides evidence, or supports or opposes claims.',
          valid_subject_types: ['post', 'ref'],
          valid_object_types: ['ref'],
        },
        {
          name: 'mentionsListeningStatus',
          uri: 'https://sense-nets.xyz/mentionsListeningStatus',
          versions: ['v0'],
          label: 'listening',
          display_name: '🎧 listening-status',
          prompt:
            'this post describes the listening status of the author in relation to a reference, such as a podcast or radio station. The author may have listened to the content in the past, is listening to the content in the present, or is looking forward to listening the content in the future.',
          prompt_zero_ref:
            'this post describes the listening status of the author in relation to a reference, such as a podcast or radio station. The author may have listened to the content in the past, is listening to the content in the present, or is looking forward to listening the content in the future.',
          prompt_single_ref:
            'this post describes the listening status of the author in relation to a reference, such as a podcast or radio station. The author may have listened to the content in the past, is listening to the content in the present, or is looking forward to listening the content in the future.',
          prompt_multi_ref:
            'this post describes the listening status of the author in relation to this reference, such as a podcast or radio station. The author may have listened to the content in the past, is listening to the content in the present, or is looking forward to listening the content in the future.',
          valid_subject_types: ['post'],
          valid_object_types: ['ref', 'nan'],
        },
        {
          name: 'recommends',
          uri: 'https://sense-nets.xyz/recommends',
          versions: ['v0'],
          label: 'recommendation',
          display_name: '👌 recommends',
          prompt:
            'The author is recommending any kind of content: an article, a movie, podcast, book, another post, etc.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'The author is recommending any kind of content: an article, a movie, podcast, book, another post, etc.',
          prompt_multi_ref:
            'The author is recommending the reference, which can be any kind of content: an article, a movie, podcast, book, another post, etc. This tag can also be used for cases of implicit recommendation, where the author is expressing enjoyment of some content but not explicitly recommending it.',
          valid_subject_types: ['post', 'ref'],
          valid_object_types: ['ref'],
        },
        {
          name: 'mentionsCallForPapers',
          uri: 'https://sense-nets.xyz/mentionsCallForPapers',
          versions: ['v1'],
          label: 'call-for-papers',
          display_name: '📜 mentions-call-for-papers',
          prompt:
            'this post contains a call for research papers, for example to a journal, conference or workshop.',
          prompt_zero_ref:
            'this post contains a call for research papers, for example to a journal, conference or workshop.',
          prompt_single_ref:
            'this post contains a call for research papers, for example to a journal, conference or workshop.',
          prompt_multi_ref:
            'this reference contains a call for research papers, for example to a journal, conference or workshop.',
          valid_subject_types: ['post'],
          valid_object_types: ['ref', 'nan'],
        },
        {
          name: 'includesQuotationFrom',
          uri: 'http://purl.org/spar/cito/includesQuotationFrom',
          versions: ['v0'],
          label: 'quote',
          display_name: '📝 quotes-from',
          prompt:
            'this post is quoting text from an article it\'s referring to. Symbols like ">" or quotation marks are often used to indicate quotations.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'this post is quoting text from an article it\'s referring to. Symbols like ">" or quotation marks are often used to indicate quotations.',
          prompt_multi_ref:
            'this reference is being quoted in the post. Symbols like ">" or quotation marks are often used to indicate quotations. ',
          valid_subject_types: ['post', 'ref'],
          valid_object_types: ['ref'],
        },
        {
          name: 'asksQuestionAbout',
          uri: 'https://sense-nets.xyz/asksQuestionAbout',
          versions: ['v0'],
          label: 'question',
          display_name: '❔ ask-question-about',
          prompt:
            "this post is raising a question or questions about some content it's referring to. The content could be a research paper or other media like a podcast, video or blog post.",
          prompt_zero_ref: null,
          prompt_single_ref:
            "this post is raising a question or questions about some content it's referring to. The content could be a research paper or other media like a podcast, video or blog post.",
          prompt_multi_ref:
            'this post is raising a question or questions about the reference. The content could be a research paper or other media like a podcast, video or blog post.',
          valid_subject_types: ['post', 'ref'],
          valid_object_types: ['ref'],
        },
        {
          name: 'agreesWith',
          uri: 'http://purl.org/spar/cito/agreesWith',
          versions: ['v0'],
          label: 'agrees',
          display_name: '👍 agrees-with',
          prompt:
            'this post expresses agreement with statements, ideas or conclusions presented in the mentioned reference.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'this post expresses agreement with statements, ideas or conclusions presented in the mentioned reference.',
          prompt_multi_ref:
            'this post expresses agreement with statements, ideas or conclusions presented in this reference.',
          valid_subject_types: ['post', 'ref'],
          valid_object_types: ['ref'],
        },
        {
          name: 'observation',
          uri: 'https://schema.org/Observation',
          versions: ['v0'],
          label: 'dg-observation',
          display_name: '🔭 discourse-graph/observation',
          prompt:
            'this post is articulating a single, highly observation. The intuition is that observation notes should be as close to “the data” as possible. They should be similar to how results are described in results sections of academic publications.',
          prompt_zero_ref:
            'this post is articulating a single, highly observation. The intuition is that observation notes should be as close to “the data” as possible. They should be similar to how results are described in results sections of academic publications.',
          prompt_single_ref: null,
          prompt_multi_ref: null,
          valid_subject_types: ['post'],
          valid_object_types: ['nan'],
        },
        {
          name: 'claim',
          uri: 'https://schema.org/Claim',
          versions: ['v0'],
          label: 'dg-claim',
          display_name: '🫴 discourse-graph/claim',
          prompt: 'this post is articulating an idea or a claim',
          prompt_zero_ref: 'this post is articulating an idea or a claim',
          prompt_single_ref: null,
          prompt_multi_ref: null,
          valid_subject_types: ['post'],
          valid_object_types: ['nan'],
        },
        {
          name: 'mentionsFundingOpportunity',
          uri: 'https://sense-nets.xyz/mentionsFundingOpportunity',
          versions: ['v1'],
          label: 'funding',
          display_name: '🏦 mentions-funding',
          prompt:
            'this post mentions a funding opportunity, for example a research grant or prize.',
          prompt_zero_ref:
            'this post mentions a funding opportunity, for example a research grant or prize.',
          prompt_single_ref:
            'this post mentions a funding opportunity, for example a research grant or prize.',
          prompt_multi_ref:
            'this reference contains a funding opportunity, for example a research grant or prize.',
          valid_subject_types: ['post'],
          valid_object_types: ['ref', 'nan'],
        },
        {
          name: 'summarizes',
          uri: 'https://sense-nets.xyz/summarizes',
          versions: ['v0'],
          label: 'summarizes',
          display_name: '🗜️ summarizes',
          prompt:
            'this post contains a summary of the mentioned reference. The summary is likely provided by the authors but may be a third party.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'this post contains a summary of the mentioned reference. The summary is likely provided by the authors but may be a third party.',
          prompt_multi_ref:
            'this reference is summarized by the post. The summary is likely provided by the authors but may be a third party.',
          valid_subject_types: ['post'],
          valid_object_types: ['ref', 'nan'],
        },
        {
          name: 'mentionsWatchingStatus',
          uri: 'https://sense-nets.xyz/mentionsWatchingStatus',
          versions: ['v0'],
          label: 'watching',
          display_name: '📺 watching-status',
          prompt:
            'this post describes the watching status of the author in relation to a reference, such as a video or movie. The author may have watched the content in the past, is watching the content in the present, or is looking forward to watching the content in the future.',
          prompt_zero_ref:
            'this post describes the watching status of the author in relation to a reference, such as a video or movie. The author may have watched the content in the past, is watching the content in the present, or is looking forward to watching the content in the future.',
          prompt_single_ref:
            'this post describes the watching status of the author in relation to a reference, such as a video or movie. The author may have watched the content in the past, is watching the content in the present, or is looking forward to watching the content in the future.',
          prompt_multi_ref:
            'this post describes the watching status of the author in relation to this reference, such as a video or movie. The author may have watched the content in the past, is watching the content in the present, or is looking forward to watching the content in the future.',
          valid_subject_types: ['post'],
          valid_object_types: ['ref', 'nan'],
        },
        {
          name: 'mentionsReadingStatus',
          uri: 'https://sense-nets.xyz/mentionsReadingStatus',
          versions: ['v0'],
          label: 'reading',
          display_name: '📑 reading-status',
          prompt:
            'this post describes the reading status of the author in relation to a reference, such as a book or article. The author may either have read the reference in the past, is reading the reference in the present, or is looking forward to reading the reference in the future.',
          prompt_zero_ref:
            'this post describes the reading status of the author in relation to a reference, such as a book or article. The author may either have read the reference in the past, is reading the reference in the present, or is looking forward to reading the reference in the future.',
          prompt_single_ref:
            'this post describes the reading status of the author in relation to a reference, such as a book or article. The author may either have read the reference in the past, is reading the reference in the present, or is looking forward to reading the reference in the future.',
          prompt_multi_ref:
            'this post describes the reading status of the author in relation to this reference, which could be a book, article or other written media. The author may either have read the reference in the past, is reading the reference in the present, or is looking forward to reading the reference in the future.',
          valid_subject_types: ['post'],
          valid_object_types: ['ref', 'nan'],
        },
        {
          name: 'announcesEvent',
          uri: 'https://sense-nets.xyz/announcesEvent',
          versions: ['v0'],
          label: 'event',
          display_name: '🗓️ announces-event',
          prompt:
            'this post includes an invitation to an event, either a real-world or an online event. Any kind of event is relevant, some examples of such events could be seminars, meetups, or hackathons. This tag should only be used for invitations to events, not for posts describing other kinds of events.',
          prompt_zero_ref:
            'this post includes an invitation to an event, either a real-world or an online event. Any kind of event is relevant, some examples of such events could be seminars, meetups, or hackathons. This tag should only be used for invitations to events, not for posts describing other kinds of events.',
          prompt_single_ref:
            'this post includes an invitation to an event, either a real-world or an online event. Any kind of event is relevant, some examples of such events could be seminars, meetups, or hackathons. This tag should only be used for invitations to events, not for posts describing other kinds of events.',
          prompt_multi_ref:
            'the reference is an invitation to an event, either a real-world or an online event. Any kind of event is relevant, some examples of such events could be seminars, meetups, or hackathons. This tag shold only be used for invitations to events, not for posts describing other kinds of events.',
          valid_subject_types: ['post'],
          valid_object_types: ['ref', 'nan'],
        },
        {
          name: 'announcesJob',
          uri: 'https://sense-nets.xyz/announcesJob',
          versions: ['v0'],
          label: 'job',
          display_name: '📢 announces-job',
          prompt:
            'this post describes a job listing, for example a call for graduate students or faculty applications.',
          prompt_zero_ref:
            'this post describes a job listing, for example a call for graduate students or faculty applications.',
          prompt_single_ref:
            'this post describes a job listing, for example a call for graduate students or faculty applications.',
          prompt_multi_ref:
            'the reference is a job listing, for example a call for graduate students or faculty applications.',
          valid_subject_types: ['post'],
          valid_object_types: ['ref', 'nan'],
        },
        {
          name: 'indicatesInterest',
          uri: 'https://sense-nets.xyz/indicatesInterest',
          versions: ['v1'],
          label: 'indicates-interest',
          display_name: '👀 indicates-interest',
          prompt:
            'this post indicates interest in a reference. This label is meant for cases where the post is not explicitly recommending or endorsing the cited reference.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'this post indicates interest in a reference. This label is meant for cases where the post is not explicitly recommending or endorsing the cited reference.',
          prompt_multi_ref:
            'the post is indicating interest in this reference. This label is meant for cases where the post is not explicitly recommending or endorsing this reference.',
          valid_subject_types: ['post'],
          valid_object_types: ['ref'],
        },
        {
          name: 'linksTo',
          uri: 'http://purl.org/spar/cito/linksTo',
          versions: ['v0'],
          label: 'default',
          display_name: '🔗 links-to',
          prompt:
            'This is a special tag. Use this tag if none of the tags above are suitable. If you tag a post with <default>, no other tag should be assigned to the post.',
          prompt_zero_ref: null,
          prompt_single_ref:
            'This is a special tag. Use this tag if none of the tags above are suitable. If you tag a post with <default>, no other tag should be assigned to the post.',
          prompt_multi_ref:
            'This is a special tag. Use this tag if none of the other tags are suitable to characterize this reference.',
          valid_subject_types: ['post'],
          valid_object_types: ['ref'],
        },
      ],
      keyword_predicate: {
        name: 'hasKeyword',
        uri: 'https://schema.org/keywords',
        versions: ['v0'],
      },
      topics_predicate: {
        name: 'hasTopic',
        uri: 'https://schema.org/about',
        versions: ['v0'],
      },
      allowed_topics: [
        'technology',
        'science',
        'academia',
        'research',
        'design',
        'climate',
        'sustainability',
        'software & hardware',
        'philosophy',
        'health',
        'culture',
        'economics',
        'business',
        'politics',
        'news',
        'finance',
        'sports',
        'entertainment & leisure',
        'art',
        'literature',
        'travel',
        'personal',
        'humour',
        'other',
      ],
      ontology_config: {
        db_id: '50c9352aa26b442994148b3cd7cccfcc',
        versions: ['v0', 'v1'],
      },
    },
    refs_meta: {
      'https://x.com/FDAadcomms/status/1798104612635070611': {
        ref_id: 6,
        order: 1,
        ref_source_url: 'https://x.com/EikoFried/status/1798166869574398271',
        citoid_url: 'https://x.com/FDAadcomms/status/1798104612635070611',
        url: 'https://x.com/FDAadcomms/status/1798104612635070611',
        item_type: 'forumPost',
        title: 'Twitter post',
        summary: '',
        image: '',
        debug: { error: null },
      },
      'https://journals.sagepub.com/doi/10.1177/20451253231198466': {
        ref_id: 4,
        order: 2,
        ref_source_url: 'https://x.com/EikoFried/status/1798166869574398271',
        citoid_url:
          'https://journals.sagepub.com/doi/10.1177/20451253231198466',
        url: 'https://journals.sagepub.com/doi/10.1177/20451253231198466',
        item_type: 'journalArticle',
        title:
          'History repeating: guidelines to address common problems in psychedelic science',
        summary: '',
        image: '',
        debug: { error: null },
      },
      'https://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E':
        {
          ref_id: 1,
          order: 3,
          ref_source_url: 'https://x.com/EikoFried/status/1798166869574398271',
          citoid_url: 'https://www.youtube.com/watch?v=WknlkmJee4E',
          url: 'https://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E',
          item_type: 'videoRecording',
          title:
            'Psychedelic treatments for mental health problems: promises and pitfalls',
          summary:
            'In this lecture, I summarize promises and pitfalls of psychedelic treatments for mental health problems. No scientific background knowledge is required to vi...',
          image: '',
          debug: { error: null },
        },
      'https://x.com/eturnermd1/status/1798046087737180395': {
        ref_id: 2,
        order: 4,
        ref_source_url: 'https://x.com/EikoFried/status/1798166869574398271',
        citoid_url: 'https://x.com/eturnermd1/status/1798046087737180395',
        url: 'https://x.com/eturnermd1/status/1798046087737180395',
        item_type: 'forumPost',
        title: 'Twitter post',
        summary: '',
        image: '',
        debug: { error: null },
      },
      'https://x.com/FDAadcomms/status/1798107142219796794': {
        ref_id: 5,
        order: 5,
        ref_source_url: 'https://x.com/EikoFried/status/1798166869574398271',
        citoid_url: 'https://x.com/FDAadcomms/status/1798107142219796794',
        url: 'https://x.com/FDAadcomms/status/1798107142219796794',
        item_type: 'forumPost',
        title: 'Twitter post',
        summary: '',
        image: '',
        debug: { error: null },
      },
      'https://x.com/FDAadcomms/status/12345': {
        ref_id: 3,
        order: 6,
        ref_source_url: 'https://x.com/FDAadcomms/status/1798107142219796794',
        citoid_url: 'https://x.com/FDAadcomms/status/12345',
        url: 'https://x.com/FDAadcomms/status/12345',
        item_type: 'forumPost',
        title: 'Twitter post',
        summary: '',
        image: '',
        debug: { error: null },
      },
    },
  },
  filter_classification: 'citoid_detected_research',
  metadata: {
    model_debug: {
      multi_reference_tagger: {
        prompt:
          '\nYou are an expert annotator tasked with converting social media posts about scientific research to a structured semantic format. The post contains external references in the form of links (URLs). Your job is to select, for each reference, the tags best characterizing the relation of the post to the reference.\n\n# Instructions\n## Tag types\nThe tags are to be selected from a predefined set of tags. The available tag types are:\n<disagrees>: this reference is being disputed by the post. The post expresses disagreement with statements, ideas or conclusions presented in the mentioned reference.\n<review>: the reference is being reviewed by the post. The reference could be a book, article or movie, or other media content. The review could be positive or negative.\n<announce>: the reference is a new research output being announced by the post. The announcement is likely made by the authors but may be a third party. A research output could be a paper, dataset or other type of research that is being announced publicly.\n<endorses>: the post endorses this reference. This label can also be used for cases of implicit recommendation, where the author is expressing enjoyment of some content but not explicitly recommending it.\n<discussion>: this post discusses how the cited reference relates to other facts or claims. For example, post might discuss how the cited reference informs questions, provides evidence, or supports or opposes claims.\n<listening>: this post describes the listening status of the author in relation to this reference, such as a podcast or radio station. The author may have listened to the content in the past, is listening to the content in the present, or is looking forward to listening the content in the future.\n<recommendation>: The author is recommending the reference, which can be any kind of content: an article, a movie, podcast, book, another post, etc. This tag can also be used for cases of implicit recommendation, where the author is expressing enjoyment of some content but not explicitly recommending it.\n<call-for-papers>: this reference contains a call for research papers, for example to a journal, conference or workshop.\n<quote>: this reference is being quoted in the post. Symbols like ">" or quotation marks are often used to indicate quotations. \n<question>: this post is raising a question or questions about the reference. The content could be a research paper or other media like a podcast, video or blog post.\n<agrees>: this post expresses agreement with statements, ideas or conclusions presented in this reference.\n<funding>: this reference contains a funding opportunity, for example a research grant or prize.\n<summarizes>: this reference is summarized by the post. The summary is likely provided by the authors but may be a third party.\n<watching>: this post describes the watching status of the author in relation to this reference, such as a video or movie. The author may have watched the content in the past, is watching the content in the present, or is looking forward to watching the content in the future.\n<reading>: this post describes the reading status of the author in relation to this reference, which could be a book, article or other written media. The author may either have read the reference in the past, is reading the reference in the present, or is looking forward to reading the reference in the future.\n<event>: the reference is an invitation to an event, either a real-world or an online event. Any kind of event is relevant, some examples of such events could be seminars, meetups, or hackathons. This tag shold only be used for invitations to events, not for posts describing other kinds of events.\n<job>: the reference is a job listing, for example a call for graduate students or faculty applications.\n<indicates-interest>: the post is indicating interest in this reference. This label is meant for cases where the post is not explicitly recommending or endorsing this reference.\n<default>: This is a special tag. Use this tag if none of the other tags are suitable to characterize this reference.\n\nA user will pass in a post, and you should reason step by step, before selecting a set of tags for each reference that best that reference\'s relation with the post.\n\n## Reference metadata\nEach reference will be marked by <ref_n> for convenient identification, where n is a number denoting the order of appearance in the post. The first reference will be <ref_1>, the second <ref_2>, etc. Additional metadata may also be provided for references, such as the author name, content type, and summary.\n\n### Quote posts\nQuote posts are a special kind of reference, where the post quotes another post. In which case, the quoted post content will be enclosed by <quote ref_n> (quote content) </quote>. Note that quote content may itself contain references.\n\n\n## Required output format\nYour final answer should be structured as a JSON Answer object with a list of SubAnswer objects, as described by the following schemas:\n\n\n```\nclass SubAnswer:\n\tref_number: int # ID number of current reference\n\treasoning_steps: str # your reasoning steps\n\tcandidate_tags: str # For potential each tag you choose, explain why you chose it.\n\tfinal_answer: List[str] # a set of final tags, based on the Candidate Tags. The final tags must be included in the Candidate Tags list!\n\nclass Answer:\n  sub_answers: List[SubAnswer]\n```\n\n\nFor example, for a post with 2 references, the output would be structured as follows:\n\n```\n{\n  "sub_answers": [\n  {\n    "ref_number": 1,\n    "reasoning_steps": "<your reasoning steps...>",\n    "candidate_tags": "[<tag1>, <tag2>]",\n    "final_answer": [\n      "<tag1>"\n    ]\n  },\n  {\n    "ref_number": 2,\n    "reasoning_steps": "<your reasoning steps...>",\n    "candidate_tags": "[<tag1>, <tag3>, <tag4>]",\n    "final_answer": [\n      "<tag3>",\n      "<tag4>"\n    ]\n  }\n]\n}\n```\n\n\n# Input post text:\n\n- Author: Eiko Fried\n- Content: After careful consideration, the FDA advisory comission voted today 9:2 that MDMA has *not* been shown to be effective for treating PTSD, given massive concerns around validity threats in this literature. They also voted 10:1 that MDMA has *not* shown to be safe. <quoted ref_1>@eturnermd1 #MDMAadcomm VOTE 1/2: Do the available data show that the drug is effective in patients with posttraumatic\nstress disorder?\n2-Yes\n9-No\n0-Abstain https://x.com/FDAadcomms/status/1798104612635070611/photo/1</quote>\n---\n📄Many mentioned reasons overlap with those we summarized recently in our review paper: \n<ref_2>\n\n📺 I also summarize them for a lay audience in this YouTube video: \n<ref_3>\n---\nSome pretty wild things in the meeting honestly, thanks to @eturnermd1 for live tweeting.\n\nEg folks who were paid by the sponsor (big pharma) to speak on behalf of the product to be marketed did *not* have to declare they were being paid.\n---\n@eturnermd1 Here is the full thread: <quoted ref_4>Next up on the AdComm agenda, when they come back from lunch at the top of hour, is the Open Public Hearing. For reasons mentioned below, don\'t be surprised if the "public" consists more of advocates for approval, and we hear from relatively few with reservations.</quote>\n---\n@eturnermd1 Here the second vote on benefits and risks: <quoted ref_5>@eturnermd1 #MDMAadcomm VOTE 2/2 at <ref_6>: Do the benefits of midomafetamine with FDA’s proposed risk evaluation and mitigation strategy (REMS) outweigh its risks for the treatment of patients with PTSD?\n1-Yes\n10-No\n0-Abstain https://x.com/FDAadcomms/status/1798107142219796794/photo/1</quote>\n- References: \n<ref_1> \nurl: https://x.com/FDAadcomms/status/1798104612635070611\nitem_type: forumPost\ntitle: Twitter post\nsummary: None\n==========\n<ref_2> \nurl: https://journals.sagepub.com/doi/10.1177/20451253231198466\nitem_type: journalArticle\ntitle: History repeating: guidelines to address common problems in psychedelic science\nsummary: None\n==========\n<ref_3> \nurl: https://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E\nitem_type: videoRecording\ntitle: Psychedelic treatments for mental health problems: promises and pitfalls\nsummary: In this lecture, I summarize promises and pitfalls of psychedelic treatments for mental health problems. No scientific background knowledge is required to vi...\n==========\n<ref_4> \nurl: https://x.com/eturnermd1/status/1798046087737180395\nitem_type: forumPost\ntitle: Twitter post\nsummary: None\n==========\n<ref_5> \nurl: https://x.com/FDAadcomms/status/1798107142219796794\nitem_type: forumPost\ntitle: Twitter post\nsummary: None\n==========\n<ref_6> \nurl: https://x.com/FDAadcomms/status/12345\nitem_type: forumPost\ntitle: Twitter post\nsummary: None\n==========\n\n\n# Output:\n\n',
        md_list: [
          {
            ref_id: 6,
            order: 1,
            ref_source_url:
              'https://x.com/EikoFried/status/1798166869574398271',
            citoid_url: 'https://x.com/FDAadcomms/status/1798104612635070611',
            url: 'https://x.com/FDAadcomms/status/1798104612635070611',
            item_type: 'forumPost',
            title: 'Twitter post',
            summary: '',
            image: '',
            debug: { error: null },
          },
          {
            ref_id: 4,
            order: 2,
            ref_source_url:
              'https://x.com/EikoFried/status/1798166869574398271',
            citoid_url:
              'https://journals.sagepub.com/doi/10.1177/20451253231198466',
            url: 'https://journals.sagepub.com/doi/10.1177/20451253231198466',
            item_type: 'journalArticle',
            title:
              'History repeating: guidelines to address common problems in psychedelic science',
            summary: '',
            image: '',
            debug: { error: null },
          },
          {
            ref_id: 1,
            order: 3,
            ref_source_url:
              'https://x.com/EikoFried/status/1798166869574398271',
            citoid_url: 'https://www.youtube.com/watch?v=WknlkmJee4E',
            url: 'https://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E',
            item_type: 'videoRecording',
            title:
              'Psychedelic treatments for mental health problems: promises and pitfalls',
            summary:
              'In this lecture, I summarize promises and pitfalls of psychedelic treatments for mental health problems. No scientific background knowledge is required to vi...',
            image: '',
            debug: { error: null },
          },
          {
            ref_id: 2,
            order: 4,
            ref_source_url:
              'https://x.com/EikoFried/status/1798166869574398271',
            citoid_url: 'https://x.com/eturnermd1/status/1798046087737180395',
            url: 'https://x.com/eturnermd1/status/1798046087737180395',
            item_type: 'forumPost',
            title: 'Twitter post',
            summary: '',
            image: '',
            debug: { error: null },
          },
          {
            ref_id: 5,
            order: 5,
            ref_source_url:
              'https://x.com/EikoFried/status/1798166869574398271',
            citoid_url: 'https://x.com/FDAadcomms/status/1798107142219796794',
            url: 'https://x.com/FDAadcomms/status/1798107142219796794',
            item_type: 'forumPost',
            title: 'Twitter post',
            summary: '',
            image: '',
            debug: { error: null },
          },
          {
            ref_id: 3,
            order: 6,
            ref_source_url:
              'https://x.com/FDAadcomms/status/1798107142219796794',
            citoid_url: 'https://x.com/FDAadcomms/status/12345',
            url: 'https://x.com/FDAadcomms/status/12345',
            item_type: 'forumPost',
            title: 'Twitter post',
            summary: '',
            image: '',
            debug: { error: null },
          },
        ],
        allowed_terms: [
          'disagrees',
          'review',
          'announce',
          'endorses',
          'discussion',
          'listening',
          'recommendation',
          'call-for-papers',
          'quote',
          'question',
          'agrees',
          'funding',
          'summarizes',
          'watching',
          'reading',
          'event',
          'job',
          'indicates-interest',
          'default',
        ],
        debug: {},
        reasoning: {
          '0': {
            steps:
              "The post quotes a Twitter post (ref_1) about the FDA advisory commission's vote on the effectiveness and safety of MDMA for treating PTSD. The post author also expresses their own opinion, which agrees with the vote. Therefore, the post is in agreement with the statements in the reference.",
            candidates: '[<agrees>, <quote>]',
          },
          '1': {
            steps:
              'The post mentions a review paper (ref_2) and states that many reasons in the reference overlap with those mentioned in the post. This implies that the post is discussing the reference and how it relates to the current topic.',
            candidates: '[<discussion>, <summarizes>]',
          },
          '2': {
            steps:
              'The post author mentions a YouTube video (ref_3) where they summarize the same reasons for a lay audience. This implies that the post is announcing the video as a new research output.',
            candidates: '[<announce>, <recommendation>]',
          },
          '3': {
            steps:
              'The post quotes a Twitter post (ref_4) about the open public hearing in the FDA advisory commission meeting. The post does not express any opinion about the reference.',
            candidates: '[<quote>]',
          },
          '4': {
            steps:
              'The post quotes a Twitter post (ref_5) about the second vote on benefits and risks of MDMA for treating PTSD. The post does not express any opinion about the reference.',
            candidates: '[<quote>]',
          },
          '5': {
            steps:
              'The post mentions a Twitter post (ref_6) in relation to the second vote on benefits and risks of MDMA for treating PTSD. However, the post does not provide any information about the content of the reference. Therefore, it is not possible to determine the relation of the post to this reference.',
            candidates: '[<default>]',
          },
        },
      },
      topics: {
        allowed_tags: [
          'technology',
          'science',
          'academia',
          'research',
          'design',
          'climate',
          'sustainability',
          'software & hardware',
          'philosophy',
          'health',
          'culture',
          'economics',
          'business',
          'politics',
          'news',
          'finance',
          'sports',
          'entertainment & leisure',
          'art',
          'literature',
          'travel',
          'personal',
          'humour',
          'other',
        ],
        full_text:
          " Reasoning Steps:\n- Identify the main topic of the post: in this case, it's a discussion about the FDA advisory commission's decision on the effectiveness and safety of MDMA for treating PTSD.\n- Look for related topics that are discussed in the post, such as potential conflicts of interest and the role of big pharma.\n- Analyze the references provided to get a better understanding of the context and to identify any additional topics.\n\nCandidate Topics:\n- health: The post discusses the FDA advisory commission's decision on the effectiveness and safety of MDMA for treating PTSD, which is a health-related topic.\n- politics: The post mentions the FDA advisory commission, which is a political body, and also discusses potential conflicts of interest and the role of big pharma.\n- research: The post references a review paper and a lecture, both of which are related to research in the field of psychedelic science.\n- personal: The post includes the author's personal thoughts and opinions on the matter, as well as a link to a YouTube video they created.\n\nFinal Answer:\n- health\n- politics\n- research\n- personal\n\nNote: The topics of \"conflict of interest\" and \"big pharma\" could also be considered, but they are not included in the list of available topics. Instead, they could be considered as subtopics within the broader category of \"politics\". \n\n ##Allowed terms: ['technology', 'science', 'academia', 'research', 'design', 'climate', 'sustainability', 'software & hardware', 'philosophy', 'health', 'culture', 'economics', 'business', 'politics', 'news', 'finance', 'sports', 'entertainment & leisure', 'art', 'literature', 'travel', 'personal', 'humour', 'other']",
        prompt:
          '\nYou are an expert annotator tasked with assigning topics to social media posts. The assigned topics should represent the most salient topics discussed by the post.  \n\nThe available topic types are:\n- technology\n- science\n- academia\n- research\n- design\n- climate\n- sustainability\n- software & hardware\n- philosophy\n- health\n- culture\n- economics\n- business\n- politics\n- news\n- finance\n- sports\n- entertainment & leisure\n- art\n- literature\n- travel\n- personal\n- humour\n- other\n\nA user will pass in a post, and you should think step by step, before selecting a set of topics that best match the post. You must only use the topics in the list!\n\n\nRules:\n- Your final answer should be structured as follows:\n    - Reasoning Steps: (your reasoning steps)\n    - Candidate Topics: (For potential each topic you choose, explain why you chose it.)\n    - Final Answer: (a set of final topics, based on the Candidate Topics. The rest of the final keywords must be included in the Candidate Topics list!)\n\n\n# Input post text:\n\n- Content: After careful consideration, the FDA advisory comission voted today 9:2 that MDMA has *not* been shown to be effective for treating PTSD, given massive concerns around validity threats in this literature. They also voted 10:1 that MDMA has *not* shown to be safe. https://x.com/FDAadcomms/status/1798104612635070611\n---\n📄Many mentioned reasons overlap with those we summarized recently in our review paper: \nhttps://journals.sagepub.com/doi/10.1177/20451253231198466\n\n📺 I also summarize them for a lay audience in this YouTube video: \nhttps://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E\n---\nSome pretty wild things in the meeting honestly, thanks to @eturnermd1 for live tweeting.\n\nEg folks who were paid by the sponsor (big pharma) to speak on behalf of the product to be marketed did *not* have to declare they were being paid.\n---\n@eturnermd1 Here is the full thread: https://x.com/eturnermd1/status/1798046087737180395\n---\n@eturnermd1 Here the second vote on benefits and risks: https://x.com/FDAadcomms/status/1798107142219796794\n- References:\n1: https://x.com/FDAadcomms/status/1798104612635070611\nItem type: forumPost\nTitle: Twitter post\nSummary: \n------------------\n2: https://journals.sagepub.com/doi/10.1177/20451253231198466\nItem type: journalArticle\nTitle: History repeating: guidelines to address common problems in psychedelic science\nSummary: \n------------------\n3: https://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E\nItem type: videoRecording\nTitle: Psychedelic treatments for mental health problems: promises and pitfalls\nSummary: In this lecture, I summarize promises and pitfalls of psychedelic treatments for mental health problems. No scientific background knowledge is required to vi...\n------------------\n4: https://x.com/eturnermd1/status/1798046087737180395\nItem type: forumPost\nTitle: Twitter post\nSummary: \n------------------\n5: https://x.com/FDAadcomms/status/1798107142219796794\nItem type: forumPost\nTitle: Twitter post\nSummary: \n------------------\n6: https://x.com/FDAadcomms/status/12345\nItem type: forumPost\nTitle: Twitter post\nSummary: \n------------------\n\n\n# Output:',
        reasoning:
          "[Reasoning Steps]\n\n- Identify the main topic of the post: in this case, it's a discussion about the FDA advisory commission's decision on the effectiveness and safety of MDMA for treating PTSD.\n- Look for related topics that are discussed in the post, such as potential conflicts of interest and the role of big pharma.\n- Analyze the references provided to get a better understanding of the context and to identify any additional topics.\n\n[Candidate Tags]\n\n- health: The post discusses the FDA advisory commission's decision on the effectiveness and safety of MDMA for treating PTSD, which is a health-related topic.\n- politics: The post mentions the FDA advisory commission, which is a political body, and also discusses potential conflicts of interest and the role of big pharma.\n- research: The post references a review paper and a lecture, both of which are related to research in the field of psychedelic science.\n- personal: The post includes the author's personal thoughts and opinions on the matter, as well as a link to a YouTube video they created.",
      },
      keywords: {
        raw_text:
          " Reasoning Steps:\n- The post discusses the FDA advisory commission's vote on MDMA for treating PTSD, citing concerns about its effectiveness and safety.\n- The post mentions a review paper and a YouTube video that summarize the reasons for the FDA's decision.\n- The post highlights issues with transparency and conflicts of interest in the meeting.\n- The post includes links to Twitter threads and FDA forum posts.\n\nCandidate Keywords:\n- #PTSD: The post discusses the FDA's decision regarding MDMA as a treatment for PTSD.\n- #FDA: The post mentions the FDA advisory commission's vote on MDMA for treating PTSD.\n- #MDMA: The post discusses the FDA's decision regarding MDMA as a treatment for PTSD.\n- #conflicts-of-interest: The post highlights issues with transparency and conflicts of interest in the meeting.\n- #review-paper: The post mentions a review paper that summarizes the reasons for the FDA's decision.\n- #YouTube: The post mentions a YouTube video that summarizes the reasons for the FDA's decision.\n- #Twitter: The post includes links to Twitter threads.\n- #academic: The post mentions a review paper, which is related to academic research.\n\nFinal Answer:\n- #PTSD\n- #FDA\n- #MDMA\n- #conflicts-of-interest\n- #review-paper\n- #academic",
        prompt:
          '\nYou are an expert annotator tasked with assigning keywords to social media posts. The keywords should represent the most salient topics discussed by the post. The keywords should consist of two types: general and specific. The general keywords should indicate the general topics discussed by the posts and its references, like "#AI" or "#blockchain". The specific keywords should highlight specific that will help people in the field better understand the post\'s contents (like "#monte-carlo-tree-search", or "#consensus-algorithms"). In addition to the above, you should also add a special \'#academic\' keyword if the post is related to academic research. Acaedmic research is to be defined broadly, as anything that the author is likely to see as related to their research, including academic job offers, code repositories, blog posts and so on. If the post is clearly not related in any way to academic research, add \'#not-academic\'. \n\nRules:\n- You should choose up to 6 keywords, plus the additional special academic/non-academic keyword!\n- Keywords should be prefixed with a hashtag, e.g., #AI\n- Your final answer should be structured as follows:\n    - Reasoning Steps: (your reasoning steps)\n    - Candidate Keywords: (For potential each keyword you choose, explain why you chose it.)\n    - Final Answer: (a set of 7 final keywords, based on the Candidate Keywords. One of the keywords should be #academic or #not-academic. The rest of the final keywords must be included in the Candidate Keywords list!)\n\n\n# Input post text:\n\n- Content: After careful consideration, the FDA advisory comission voted today 9:2 that MDMA has *not* been shown to be effective for treating PTSD, given massive concerns around validity threats in this literature. They also voted 10:1 that MDMA has *not* shown to be safe. https://x.com/FDAadcomms/status/1798104612635070611\n---\n📄Many mentioned reasons overlap with those we summarized recently in our review paper: \nhttps://journals.sagepub.com/doi/10.1177/20451253231198466\n\n📺 I also summarize them for a lay audience in this YouTube video: \nhttps://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E\n---\nSome pretty wild things in the meeting honestly, thanks to @eturnermd1 for live tweeting.\n\nEg folks who were paid by the sponsor (big pharma) to speak on behalf of the product to be marketed did *not* have to declare they were being paid.\n---\n@eturnermd1 Here is the full thread: https://x.com/eturnermd1/status/1798046087737180395\n---\n@eturnermd1 Here the second vote on benefits and risks: https://x.com/FDAadcomms/status/1798107142219796794\n- References:\n1: https://x.com/FDAadcomms/status/1798104612635070611\nItem type: forumPost\nTitle: Twitter post\nSummary: \n------------------\n2: https://journals.sagepub.com/doi/10.1177/20451253231198466\nItem type: journalArticle\nTitle: History repeating: guidelines to address common problems in psychedelic science\nSummary: \n------------------\n3: https://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E\nItem type: videoRecording\nTitle: Psychedelic treatments for mental health problems: promises and pitfalls\nSummary: In this lecture, I summarize promises and pitfalls of psychedelic treatments for mental health problems. No scientific background knowledge is required to vi...\n------------------\n4: https://x.com/eturnermd1/status/1798046087737180395\nItem type: forumPost\nTitle: Twitter post\nSummary: \n------------------\n5: https://x.com/FDAadcomms/status/1798107142219796794\nItem type: forumPost\nTitle: Twitter post\nSummary: \n------------------\n6: https://x.com/FDAadcomms/status/12345\nItem type: forumPost\nTitle: Twitter post\nSummary: \n------------------\n\n\n# Output:',
        reasoning:
          "[Reasoning Steps]\n\n- The post discusses the FDA advisory commission's vote on MDMA for treating PTSD, citing concerns about its effectiveness and safety.\n- The post mentions a review paper and a YouTube video that summarize the reasons for the FDA's decision.\n- The post highlights issues with transparency and conflicts of interest in the meeting.\n- The post includes links to Twitter threads and FDA forum posts.\n\n[Candidate Keywords]\n\n- #PTSD: The post discusses the FDA's decision regarding MDMA as a treatment for PTSD.\n- #FDA: The post mentions the FDA advisory commission's vote on MDMA for treating PTSD.\n- #MDMA: The post discusses the FDA's decision regarding MDMA as a treatment for PTSD.\n- #conflicts-of-interest: The post highlights issues with transparency and conflicts of interest in the meeting.\n- #review-paper: The post mentions a review paper that summarizes the reasons for the FDA's decision.\n- #YouTube: The post mentions a YouTube video that summarizes the reasons for the FDA's decision.\n- #Twitter: The post includes links to Twitter threads.\n- #academic: The post mentions a review paper, which is related to academic research.",
      },
      hashtags: {
        prompt:
          'After careful consideration, the FDA advisory comission voted today 9:2 that MDMA has *not* been shown to be effective for treating PTSD, given massive concerns around validity threats in this literature. They also voted 10:1 that MDMA has *not* shown to be safe. https://x.com/FDAadcomms/status/1798104612635070611\n---\n📄Many mentioned reasons overlap with those we summarized recently in our review paper: \nhttps://journals.sagepub.com/doi/10.1177/20451253231198466\n\n📺 I also summarize them for a lay audience in this YouTube video: \nhttps://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E\n---\nSome pretty wild things in the meeting honestly, thanks to @eturnermd1 for live tweeting.\n\nEg folks who were paid by the sponsor (big pharma) to speak on behalf of the product to be marketed did *not* have to declare they were being paid.\n---\n@eturnermd1 Here is the full thread: https://x.com/eturnermd1/status/1798046087737180395\n---\n@eturnermd1 Here the second vote on benefits and risks: https://x.com/FDAadcomms/status/1798107142219796794',
        reasoning: null,
      },
    },
  },
};
