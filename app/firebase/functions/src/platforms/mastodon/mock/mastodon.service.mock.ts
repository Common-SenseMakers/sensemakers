import { anything, instance, spy, when } from 'ts-mockito';

import { PlatformFetchParams } from '../../../@shared/types/types.fetch';
import {
  MastodonAccessTokenSignupData,
  MastodonAccountDetails,
  MastodonGetContextParams,
  MastodonSignupContext,
} from '../../../@shared/types/types.mastodon';
import { PlatformPostPublish } from '../../../@shared/types/types.platform.posts';
import { PLATFORM } from '../../../@shared/types/types.platforms';
import { AccountProfileCreate } from '../../../@shared/types/types.profiles';
import {
  AccountDetailsBase,
  TestUserCredentials,
} from '../../../@shared/types/types.user';
import { APP_URL } from '../../../config/config.runtime';
import { TransactionManager } from '../../../db/transaction.manager';
import { getTestCredentials } from '../../mock/test.users';
import { MastodonService } from '../mastodon.service';

export interface MastodonMockConfig {
  publish?: boolean;
  signup?: boolean;
  fetch?: boolean;
  get?: boolean;
}

export const getMastodonMock = (
  mastodonService: MastodonService,
  type?: MastodonMockConfig,
  testUser?: TestUserCredentials
) => {
  if (!type || Object.keys(type).length === 0) {
    return mastodonService;
  }

  const mocked = spy(mastodonService);

  if (type.publish) {
    when(mocked.publish(anything())).thenCall(
      (postPublish: PlatformPostPublish<string>) => {
        // Implementation goes here
      }
    );
  }

  if (type.fetch) {
    when(mocked.fetch(anything(), anything(), anything())).thenCall(
      async (
        params: PlatformFetchParams,
        userDetails: AccountDetailsBase,
        manager: TransactionManager
      ) => {
        if (params.since_id) {
          return {
            fetched: {},
            platformPosts: [],
          };
        }
        if (params.until_id) {
          return {
            fetched: {},
            platformPosts: [],
          };
        }
        return {
          fetched: {
            newest_id: '113093358996832469',
            oldest_id: '112276902679185529',
          },
          platformPosts: [
            {
              post_id: '113093259230165857',
              user_id: '111971425782516559',
              timestampMs: Date.now() - 24 * 60 * 60 * 1000 * 1,
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
                      header:
                        'https://cosocial.ca/headers/original/missing.png',
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
                      header:
                        'https://cosocial.ca/headers/original/missing.png',
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
              },
            },
            {
              post_id: '113092008685099862',
              user_id: '111971425782516559',
              timestampMs: Date.now() - 24 * 60 * 60 * 1000 * 2,
              post: {
                thread_id: '113092008685099862',
                posts: [
                  {
                    id: '113092008685099862',
                    createdAt: '2024-09-06T18:25:05.180Z',
                    inReplyToId: null,
                    inReplyToAccountId: null,
                    sensitive: false,
                    spoilerText: '',
                    visibility: 'public',
                    language: 'en',
                    uri: 'https://cosocial.ca/users/weswalla/statuses/113092008685099862',
                    url: 'https://cosocial.ca/@weswalla/113092008685099862',
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
                      '<p><a href="https://phanpy.social/" target="_blank" rel="nofollow noopener noreferrer" translate="no"><span class="invisible">https://</span><span class="">phanpy.social/</span><span class="invisible"></span></a> allows for quote posts whereas the default mastodon client doesn&#39;t it seems.<br /><a href="https://cosocial.ca/@weswalla/113091870835600081" target="_blank" rel="nofollow noopener noreferrer" translate="no"><span class="invisible">https://</span><span class="ellipsis">cosocial.ca/@weswalla/11309187</span><span class="invisible">0835600081</span></a></p>',
                    filtered: [],
                    reblog: null,
                    application: {
                      name: 'Phanpy',
                      website: 'https://phanpy.social',
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
                      header:
                        'https://cosocial.ca/headers/original/missing.png',
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
                      url: 'https://phanpy.social',
                      title: 'Phanpy',
                      description:
                        'Minimalistic opinionated Mastodon web client',
                      language: 'en',
                      type: 'link',
                      authorName: '',
                      authorUrl: '',
                      providerName: '',
                      providerUrl: '',
                      html: '',
                      width: 1000,
                      height: 500,
                      image:
                        'https://media.cosocial.ca/cache/preview_cards/images/000/016/771/original/f739e67557236ac4.jpg',
                      imageDescription: '',
                      embedUrl: '',
                      blurhash: 'UCRyvqXVx^s%o#ozayad~VV=%MRknhRja{t7',
                      publishedAt: null,
                    },
                    poll: null,
                  },
                  {
                    id: '113092012514787811',
                    createdAt: '2024-09-06T18:26:03.614Z',
                    inReplyToId: '113092008685099862',
                    inReplyToAccountId: '111971425782516559',
                    sensitive: false,
                    spoilerText: '',
                    visibility: 'public',
                    language: 'en',
                    uri: 'https://cosocial.ca/users/weswalla/statuses/113092012514787811',
                    url: 'https://cosocial.ca/@weswalla/113092012514787811',
                    repliesCount: 0,
                    reblogsCount: 0,
                    favouritesCount: 0,
                    editedAt: null,
                    favourited: false,
                    reblogged: false,
                    muted: false,
                    bookmarked: false,
                    pinned: false,
                    content: '<p>this is what it looks like on phanpy</p>',
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
                      header:
                        'https://cosocial.ca/headers/original/missing.png',
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
                    mediaAttachments: [
                      {
                        id: '113092011856809706',
                        type: 'image',
                        url: 'https://media.cosocial.ca/media_attachments/files/113/092/011/856/809/706/original/be3eeca142c0e060.png',
                        previewUrl:
                          'https://media.cosocial.ca/media_attachments/files/113/092/011/856/809/706/small/be3eeca142c0e060.png',
                        remoteUrl: null,
                        previewRemoteUrl: null,
                        textUrl: null,
                        meta: {
                          original: {
                            width: 682,
                            height: 281,
                            size: '682x281',
                            aspect: 2.4270462633451957,
                          },
                          small: {
                            width: 682,
                            height: 281,
                            size: '682x281',
                            aspect: 2.4270462633451957,
                          },
                        },
                        description: null,
                        blurhash: 'U6SPU;4TM|?bIXIVMxVsEQo#RPIT-NxUbdS*',
                      },
                    ],
                    mentions: [],
                    tags: [],
                    emojis: [],
                    card: null,
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
              },
            },
            {
              post_id: '113091840795490491',
              user_id: '111971425782516559',
              timestampMs: Date.now() - 24 * 60 * 60 * 1000 * 3,
              post: {
                thread_id: '113091840795490491',
                posts: [
                  {
                    id: '113091840795490491',
                    createdAt: '2024-09-06T17:42:23.392Z',
                    inReplyToId: null,
                    inReplyToAccountId: null,
                    sensitive: false,
                    spoilerText: '',
                    visibility: 'public',
                    language: 'en',
                    uri: 'https://cosocial.ca/users/weswalla/statuses/113091840795490491',
                    url: 'https://cosocial.ca/@weswalla/113091840795490491',
                    repliesCount: 2,
                    reblogsCount: 0,
                    favouritesCount: 1,
                    editedAt: null,
                    favourited: false,
                    reblogged: false,
                    muted: false,
                    bookmarked: false,
                    pinned: false,
                    content:
                      '<p>powerful semantic tools will require striking a balance between structured and unstructured semantics. One paper that seems to explore this: <a href="https://www.tandfonline.com/doi/full/10.1080/03080188.2021.1890484" target="_blank" rel="nofollow noopener noreferrer" translate="no"><span class="invisible">https://www.</span><span class="ellipsis">tandfonline.com/doi/full/10.10</span><span class="invisible">80/03080188.2021.1890484</span></a></p>',
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
                      header:
                        'https://cosocial.ca/headers/original/missing.png',
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
                    id: '113091843958894093',
                    createdAt: '2024-09-06T17:43:11.656Z',
                    inReplyToId: '113091840795490491',
                    inReplyToAccountId: '111971425782516559',
                    sensitive: false,
                    spoilerText: '',
                    visibility: 'public',
                    language: 'en',
                    uri: 'https://cosocial.ca/users/weswalla/statuses/113091843958894093',
                    url: 'https://cosocial.ca/@weswalla/113091843958894093',
                    repliesCount: 1,
                    reblogsCount: 0,
                    favouritesCount: 1,
                    editedAt: null,
                    favourited: false,
                    reblogged: false,
                    muted: false,
                    bookmarked: false,
                    pinned: false,
                    content:
                      '<p>and another interesting paper on how these can be blended together to create useful visual sense-making tools: <a href="https://arxiv.org/html/2403.02752v1" target="_blank" rel="nofollow noopener noreferrer" translate="no"><span class="invisible">https://</span><span class="">arxiv.org/html/2403.02752v1</span><span class="invisible"></span></a></p>',
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
                      header:
                        'https://cosocial.ca/headers/original/missing.png',
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
                      url: 'https://arxiv.org/html/2403.02752v1',
                      title:
                        'HINTs: Sensemaking on large collections of documents with Hypergraph visualization and INTelligent agents',
                      description: '',
                      language: 'en',
                      type: 'link',
                      authorName: '',
                      authorUrl: '',
                      providerName: '',
                      providerUrl: '',
                      html: '',
                      width: 0,
                      height: 0,
                      image: null,
                      imageDescription: '',
                      embedUrl: '',
                      blurhash: null,
                      publishedAt: null,
                    },
                    poll: null,
                  },
                  {
                    id: '113091846148998737',
                    createdAt: '2024-09-06T17:43:45.076Z',
                    inReplyToId: '113091843958894093',
                    inReplyToAccountId: '111971425782516559',
                    sensitive: false,
                    spoilerText: '',
                    visibility: 'public',
                    language: 'en',
                    uri: 'https://cosocial.ca/users/weswalla/statuses/113091846148998737',
                    url: 'https://cosocial.ca/@weswalla/113091846148998737',
                    repliesCount: 0,
                    reblogsCount: 0,
                    favouritesCount: 1,
                    editedAt: null,
                    favourited: false,
                    reblogged: false,
                    muted: false,
                    bookmarked: false,
                    pinned: false,
                    content:
                      '<p>some open source projects integrating knowledge graphs into their RAG pipeline: <a href="https://github.com/zjukg/KG-LLM-Papers" target="_blank" rel="nofollow noopener noreferrer" translate="no"><span class="invisible">https://</span><span class="">github.com/zjukg/KG-LLM-Papers</span><span class="invisible"></span></a></p>',
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
                      header:
                        'https://cosocial.ca/headers/original/missing.png',
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
                      url: 'https://github.com/zjukg/KG-LLM-Papers',
                      title:
                        'GitHub - zjukg/KG-LLM-Papers: [Paper List] Papers integrating knowledge graphs (KGs) and large language models (LLMs)',
                      description:
                        '[Paper List] Papers integrating knowledge graphs (KGs) and large language models (LLMs) - zjukg/KG-LLM-Papers',
                      language: 'en',
                      type: 'link',
                      authorName: '',
                      authorUrl: '',
                      providerName: 'GitHub',
                      providerUrl: '',
                      html: '',
                      width: 1200,
                      height: 600,
                      image:
                        'https://media.cosocial.ca/cache/preview_cards/images/004/248/984/original/c427ae833af004c2.png',
                      imageDescription:
                        '[Paper List] Papers integrating knowledge graphs (KGs) and large language models (LLMs) - zjukg/KG-LLM-Papers',
                      embedUrl: '',
                      blurhash: 'UCSF;L-=D$-;4m-;ITxu-=oItRWB~qIT-;Ri',
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
              },
            },
            {
              post_id: '112961900843400369',
              user_id: '111971425782516559',
              timestampMs: Date.now() - 24 * 60 * 60 * 1000 * 4,
              post: {
                thread_id: '112961900843400369',
                posts: [
                  {
                    id: '112961900843400369',
                    createdAt: '2024-08-14T18:56:57.071Z',
                    inReplyToId: null,
                    inReplyToAccountId: null,
                    sensitive: false,
                    spoilerText: '',
                    visibility: 'public',
                    language: 'en',
                    uri: 'https://cosocial.ca/users/weswalla/statuses/112961900843400369',
                    url: 'https://cosocial.ca/@weswalla/112961900843400369',
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
                      '<p><a href="https://cosocial.ca/tags/DWebCamp2024" class="mention hashtag" rel="tag">#<span>DWebCamp2024</span></a> was full of discussion and exploration which I&#39;d love to see in the space between conference and unconference with something like the triopticon workshop method to see what kind of synthesis emerges. <a href="https://cynefin.io/index.php/Triopticon" target="_blank" rel="nofollow noopener noreferrer" translate="no"><span class="invisible">https://</span><span class="ellipsis">cynefin.io/index.php/Trioptico</span><span class="invisible">n</span></a></p><p>&quot;The Triopticon process was designed to provide a fresh compromise between a formal conference and the more unstructured unconference.&quot;</p>',
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
                      header:
                        'https://cosocial.ca/headers/original/missing.png',
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
                    mediaAttachments: [
                      {
                        id: '112961900717373589',
                        type: 'image',
                        url: 'https://media.cosocial.ca/media_attachments/files/112/961/900/717/373/589/original/e87de14ed106ae7b.png',
                        previewUrl:
                          'https://media.cosocial.ca/media_attachments/files/112/961/900/717/373/589/small/e87de14ed106ae7b.png',
                        remoteUrl: null,
                        previewRemoteUrl: null,
                        textUrl: null,
                        meta: {
                          original: {
                            width: 1648,
                            height: 750,
                            size: '1648x750',
                            aspect: 2.1973333333333334,
                          },
                          small: {
                            width: 712,
                            height: 324,
                            size: '712x324',
                            aspect: 2.197530864197531,
                          },
                        },
                        description: null,
                        blurhash: 'UBQmVE0J^+xuO+E0xbs:-qofNFj[nT%3NFog',
                      },
                    ],
                    mentions: [],
                    tags: [
                      {
                        name: 'dwebcamp2024',
                        url: 'https://cosocial.ca/tags/dwebcamp2024',
                      },
                    ],
                    emojis: [],
                    card: {
                      url: 'https://cynefin.io/wiki/Triopticon',
                      title: 'Triopticon',
                      description: '',
                      language: 'en',
                      type: 'link',
                      authorName: '',
                      authorUrl: '',
                      providerName: 'Cynefin.io',
                      providerUrl: '',
                      html: '',
                      width: 150,
                      height: 150,
                      image: null,
                      imageDescription: '',
                      embedUrl: '',
                      blurhash: 'USECk7D%~qD%WB%2M{NG_3R*WBjFNGs:aeay',
                      publishedAt: '2023-03-07T12:47:16.000Z',
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
              },
            },
            {
              post_id: '112639305281497968',
              user_id: '111971425782516559',
              timestampMs: Date.now() - 24 * 60 * 60 * 1000 * 5,
              post: {
                thread_id: '112639305281497968',
                posts: [
                  {
                    id: '112639305281497968',
                    createdAt: '2024-06-18T19:36:39.445Z',
                    inReplyToId: null,
                    inReplyToAccountId: null,
                    sensitive: false,
                    spoilerText: '',
                    visibility: 'public',
                    language: 'en',
                    uri: 'https://cosocial.ca/users/weswalla/statuses/112639305281497968',
                    url: 'https://cosocial.ca/@weswalla/112639305281497968',
                    repliesCount: 0,
                    reblogsCount: 1,
                    favouritesCount: 0,
                    editedAt: null,
                    favourited: false,
                    reblogged: false,
                    muted: false,
                    bookmarked: false,
                    pinned: false,
                    content:
                      '<p>calling all <a href="https://cosocial.ca/tags/vancouver" class="mention hashtag" rel="tag">#<span>vancouver</span></a> based <a href="https://cosocial.ca/tags/tft" class="mention hashtag" rel="tag">#<span>tft</span></a> enthusiasts, come on out and share your tools and workflows! July 11 5:30pm-7:30pm<br /><a href="https://lu.ma/b1jflw04" target="_blank" rel="nofollow noopener noreferrer" translate="no"><span class="invisible">https://</span><span class="">lu.ma/b1jflw04</span><span class="invisible"></span></a></p>',
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
                      header:
                        'https://cosocial.ca/headers/original/missing.png',
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
                    tags: [
                      {
                        name: 'vancouver',
                        url: 'https://cosocial.ca/tags/vancouver',
                      },
                      {
                        name: 'tft',
                        url: 'https://cosocial.ca/tags/tft',
                      },
                    ],
                    emojis: [],
                    card: {
                      url: 'https://lu.ma/b1jflw04',
                      title: 'Tools-For-Thought Meetup #2 · Luma',
                      description:
                        "All things tools-for-thought. Note-taking, task management, memory augmentation, content consumption/production.\nWhat are some interesting workflows you've…",
                      language: 'en',
                      type: 'link',
                      authorName: '',
                      authorUrl: '',
                      providerName: '',
                      providerUrl: '',
                      html: '',
                      width: 800,
                      height: 419,
                      image: null,
                      imageDescription: '',
                      embedUrl: '',
                      blurhash: 'UZLzms01I^%g^hj=XANHtQV@WnxuxuWBR*t7',
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
              },
            },
            {
              post_id: '112276902679185529',
              user_id: '111971425782516559',
              timestampMs: Date.now() - 24 * 60 * 60 * 1000 * 6,
              post: {
                thread_id: '112276902679185529',
                posts: [
                  {
                    id: '112276902679185529',
                    createdAt: '2024-04-15T19:32:54.613Z',
                    inReplyToId: null,
                    inReplyToAccountId: null,
                    sensitive: false,
                    spoilerText: '',
                    visibility: 'public',
                    language: 'en',
                    uri: 'https://cosocial.ca/users/weswalla/statuses/112276902679185529',
                    url: 'https://cosocial.ca/@weswalla/112276902679185529',
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
                      '<p><a href="https://cosocial.ca/tags/DWebYVR" class="mention hashtag" rel="tag">#<span>DWebYVR</span></a><br /> recently wrapped up its first ever Hack Day. Here&#39;s an overview of the event for those that missed it, including invitations to help us organize the next: <a href="https://writing.dwebyvr.org/april-2024-vancouver-hack-day-recap/" target="_blank" rel="nofollow noopener noreferrer" translate="no"><span class="invisible">https://</span><span class="ellipsis">writing.dwebyvr.org/april-2024</span><span class="invisible">-vancouver-hack-day-recap/</span></a></p>',
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
                      header:
                        'https://cosocial.ca/headers/original/missing.png',
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
                    tags: [
                      {
                        name: 'dwebyvr',
                        url: 'https://cosocial.ca/tags/dwebyvr',
                      },
                    ],
                    emojis: [],
                    card: {
                      url: 'https://writing.dwebyvr.org/april-2024-vancouver-hack-day-recap/',
                      title: 'April 2024 Vancouver Hack Day Recap',
                      description:
                        'A recap of the April 2024 Vancouver Hack Day at Z Space. Learn, Code, Share!',
                      language: 'en',
                      type: 'link',
                      authorName: '',
                      authorUrl: '',
                      providerName: 'DWeb Vancouver Writing',
                      providerUrl: '',
                      html: '',
                      width: 960,
                      height: 540,
                      image: null,
                      imageDescription: '',
                      embedUrl: '',
                      blurhash: 'UDHeXoVXNGt.?^kX%L%1%ho#IpR*t-Rin~tS',
                      publishedAt: '2024-04-15T19:05:23.000Z',
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
              },
            },
          ],
        };
      }
    );
  }

  if (type.get) {
    when(mocked.get(anything(), anything())).thenCall(
      async (
        post_id: string,
        userDetails: AccountDetailsBase,
        manager: TransactionManager
      ) => {
        return {
          post_id: '113093259230165857',
          user_id: '111971425782516559',
          timestampMs: 1725666186984,
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
        };
      }
    );
  }

  if (type.signup) {
    when(mocked.getSignupContext(anything(), anything())).thenCall(
      (
        user_id?: string,
        params?: MastodonGetContextParams
      ): MastodonSignupContext => {
        const callbackUrl = new URL(
          params?.callback_url ? params.callback_url : APP_URL.value()
        );
        callbackUrl.searchParams.set('code', 'testCode');
        return {
          authorizationUrl: callbackUrl.toString(),
          clientId: 'SE2qVBbK1J_-6za-JX-6H-NsGrbdIuARZk4Q6gpUxbk',
          clientSecret: user_id ? user_id : '12341234',
        };
      }
    );
    when(mocked.handleSignupData(anything())).thenCall(
      (data: MastodonAccessTokenSignupData) => {
        const user_id = data.mastodonServer; // for testing purposes we pass the user_id as the mastodon server
        const testCredentials = getTestCredentials(
          process.env.TEST_USER_ACCOUNTS as string
        );
        const currentUserCredentials =
          testCredentials?.find(
            (credentials) => credentials[PLATFORM.Mastodon].id === user_id
          ) || testCredentials?.[0];
        const currentMastodonCredentials =
          currentUserCredentials?.[PLATFORM.Mastodon];

        if (!currentMastodonCredentials) {
          throw new Error('test credentials not found');
        }
        const accountDetails: MastodonAccountDetails = {
          user_id: currentMastodonCredentials.id,
          signupDate: Date.now(),
          credentials: {
            read: {
              server: 'mastodon.social',
              accessToken:
                'ZWJzaEJCU1BSaFZvLUIwRFNCNHNXVlQtTV9mY2VSaDlOSk5ETjJPci0zbmJtOjE3MTk0MzM5ODkyNTM6MTowOmF0OjE',
            },
          },
        };
        const profile: AccountProfileCreate = {
          platformId: PLATFORM.Mastodon,
          user_id: currentMastodonCredentials.id,
          profile: {
            id: currentMastodonCredentials.id,
            displayName: 'placeholder', // currentUserCredentials.mastodon.username,
            username: 'placeholder@placeholder.com', //: currentUserCredentials.mastodon.username,
            avatar:
              'https://pbs.twimg.com/profile_images/1783977034038882304/RGn66lGT_normal.jpg',
            description: 'placeholder',
          },
        };
        return {
          accountDetails,
          profile,
        };
      }
    );
  }

  return instance(mocked);
};
