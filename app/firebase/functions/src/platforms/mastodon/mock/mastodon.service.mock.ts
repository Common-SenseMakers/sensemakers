import { mastodon } from 'masto';
import { anything, instance, spy, when } from 'ts-mockito';

import { PlatformFetchParams } from '../../../@shared/types/types.fetch';
import {
  MastodonGetContextParams,
  MastodonSignupContext,
  MastodonSignupData,
  MastodonUserDetails,
} from '../../../@shared/types/types.mastodon';
import {
  PlatformPostPosted,
  PlatformPostPublish,
} from '../../../@shared/types/types.platform.posts';
import {
  TestUserCredentials,
  UserDetailsBase,
} from '../../../@shared/types/types.user';
import { ENVIRONMENTS } from '../../../config/ENVIRONMENTS';
import { APP_URL, NODE_ENV } from '../../../config/config.runtime';
import { TransactionManager } from '../../../db/transaction.manager';
import { logger } from '../../../instances/logger';
import { MastodonService } from '../mastodon.service';

const DEBUG = false;

interface MastodonTestState {
  latestStatusId: number;
  statuses: mastodon.v1.Status[];
}

let state: MastodonTestState = {
  latestStatusId: 0,
  statuses: [],
};

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
    when(mocked.publish(anything(), anything())).thenCall(
      (postPublish: PlatformPostPublish<string>) => {
        // Implementation goes here
      }
    );
  }

  if (type.fetch) {
    when(mocked.fetch(anything(), anything(), anything())).thenCall(
      async (
        params: PlatformFetchParams,
        userDetails: UserDetailsBase,
        manager: TransactionManager
      ) => {
        return {
          fetched: {
            newest_id: '112961900843400369',
            oldest_id: '112639301082517136',
          },
          platformPosts: [
            {
              post_id: '112961900843400369',
              user_id: '111971425782516559',
              timestampMs: 1723661817071,
              post: {
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
                  header: 'https://cosocial.ca/headers/original/missing.png',
                  headerStatic:
                    'https://cosocial.ca/headers/original/missing.png',
                  followersCount: 11,
                  followingCount: 17,
                  statusesCount: 10,
                  lastStatusAt: '2024-08-31',
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
            },
            {
              post_id: '112950245581785703',
              user_id: '111971425782516559',
              timestampMs: 1723483971887,
              post: {
                id: '112950245581785703',
                createdAt: '2024-08-12T17:32:51.887Z',
                inReplyToId: null,
                inReplyToAccountId: null,
                sensitive: false,
                spoilerText: '',
                visibility: 'public',
                language: null,
                uri: 'https://cosocial.ca/users/weswalla/statuses/112950245581785703/activity',
                url: 'https://cosocial.ca/users/weswalla/statuses/112950245581785703/activity',
                repliesCount: 0,
                reblogsCount: 0,
                favouritesCount: 0,
                editedAt: null,
                favourited: false,
                reblogged: false,
                muted: false,
                bookmarked: false,
                content: '',
                filtered: [],
                reblog: {
                  id: '112916096880826190',
                  createdAt: '2024-08-06T16:48:23.000Z',
                  inReplyToId: null,
                  inReplyToAccountId: null,
                  sensitive: false,
                  spoilerText: '',
                  visibility: 'public',
                  language: 'en',
                  uri: 'https://social.coop/users/lukethorburn/statuses/112916096830332987',
                  url: 'https://social.coop/@lukethorburn/112916096830332987',
                  repliesCount: 0,
                  reblogsCount: 1,
                  favouritesCount: 1,
                  editedAt: null,
                  favourited: true,
                  reblogged: true,
                  muted: false,
                  bookmarked: false,
                  content:
                    '<p>"we need people in our lives, not the simulation of people"</p><p><a href="https://theconvivialsociety.substack.com/p/embracing-sub-optimal-relationships" rel="nofollow noopener noreferrer" translate="no" target="_blank"><span class="invisible">https://</span><span class="ellipsis">theconvivialsociety.substack.c</span><span class="invisible">om/p/embracing-sub-optimal-relationships</span></a></p>',
                  filtered: [],
                  reblog: null,
                  account: {
                    id: '110153832243161044',
                    username: 'lukethorburn',
                    acct: 'lukethorburn@social.coop',
                    displayName: 'Luke Thorburn',
                    locked: false,
                    bot: false,
                    discoverable: true,
                    group: false,
                    createdAt: '2022-12-01T00:00:00.000Z',
                    note: "<p>Algorithms ∩ Conflict • King's College London</p>",
                    url: 'https://social.coop/@lukethorburn',
                    uri: 'https://social.coop/users/lukethorburn',
                    avatar:
                      'https://media.cosocial.ca/cache/accounts/avatars/110/153/832/243/161/044/original/27e4a89707f4510c.jpg',
                    avatarStatic:
                      'https://media.cosocial.ca/cache/accounts/avatars/110/153/832/243/161/044/original/27e4a89707f4510c.jpg',
                    header:
                      'https://media.cosocial.ca/cache/accounts/headers/110/153/832/243/161/044/original/728cf7bba6bb79e6.png',
                    headerStatic:
                      'https://media.cosocial.ca/cache/accounts/headers/110/153/832/243/161/044/original/728cf7bba6bb79e6.png',
                    followersCount: 62,
                    followingCount: 79,
                    statusesCount: 63,
                    lastStatusAt: '2024-08-06',
                    emojis: [],
                    fields: [
                      {
                        name: 'Website',
                        value:
                          '<a href="https://lukethorburn.com" rel="nofollow noopener noreferrer" translate="no" target="_blank"><span class="invisible">https://</span><span class="">lukethorburn.com</span><span class="invisible"></span></a>',
                        verifiedAt: null,
                      },
                    ],
                  },
                  mediaAttachments: [],
                  mentions: [],
                  tags: [],
                  emojis: [],
                  card: {
                    url: 'https://theconvivialsociety.substack.com/p/embracing-sub-optimal-relationships',
                    title: 'Embracing Sub-Optimal Relationships',
                    description: 'The Convivial Society: Vol. 5, No. 10',
                    language: 'en',
                    type: 'link',
                    authorName: 'L. M. Sacasas',
                    authorUrl: 'https://substack.com/@theconvivialsociety',
                    providerName: 'The Convivial Society',
                    providerUrl: '',
                    html: '',
                    width: 728,
                    height: 410,
                    image: null,
                    imageDescription: '',
                    embedUrl: '',
                    blurhash: 'UCE{tF_24o02x{%O%K9F4mx]%NIV_2%KIUtM',
                    publishedAt: '2024-08-05T19:44:48.000Z',
                  },
                  poll: null,
                },
                application: null,
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
                  followingCount: 17,
                  statusesCount: 10,
                  lastStatusAt: '2024-08-31',
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
            },
            {
              post_id: '112672401162464717',
              user_id: '111971425782516559',
              timestampMs: 1719244402508,
              post: {
                id: '112672401162464717',
                createdAt: '2024-06-24T15:53:22.508Z',
                inReplyToId: null,
                inReplyToAccountId: null,
                sensitive: false,
                spoilerText: '',
                visibility: 'public',
                language: null,
                uri: 'https://cosocial.ca/users/weswalla/statuses/112672401162464717/activity',
                url: 'https://cosocial.ca/users/weswalla/statuses/112672401162464717/activity',
                repliesCount: 0,
                reblogsCount: 0,
                favouritesCount: 0,
                editedAt: null,
                favourited: false,
                reblogged: false,
                muted: false,
                bookmarked: false,
                content: '',
                filtered: [],
                reblog: {
                  id: '112644821932638412',
                  createdAt: '2024-06-19T18:59:35.000Z',
                  inReplyToId: null,
                  inReplyToAccountId: null,
                  sensitive: false,
                  spoilerText: '',
                  visibility: 'public',
                  language: 'en',
                  uri: 'https://mastodon.social/users/ronent/statuses/112644821815505229',
                  url: 'https://mastodon.social/@ronent/112644821815505229',
                  repliesCount: 0,
                  reblogsCount: 10,
                  favouritesCount: 0,
                  editedAt: '2024-06-19T19:00:12.000Z',
                  favourited: false,
                  reblogged: true,
                  muted: false,
                  bookmarked: false,
                  content:
                    '<p>🧪 Hey <a href="https://mastodon.social/tags/ScienceMastodon" class="mention hashtag" rel="nofollow noopener noreferrer" target="_blank">#<span>ScienceMastodon</span></a> !  Would you join an open science social media mirroring service? It would ensure that all your research-related posts were citeable, FAIR &amp; open access (using <span class="h-card" translate="no"><a href="https://mas.to/@nanopub" class="u-url mention" rel="nofollow noopener noreferrer" target="_blank">@<span>nanopub</span></a></span> !) regardless of source platform (X, Masto, Bsky,)! <br>🔄 RT if you’re interested!<br>📊 Also - vote below for features you\'d like over the mirrored data!</p><p>📒 For more context on the project, Sensemaking Networks: <a href="https://osf.io/preprints/metaarxiv/wcsfa" rel="nofollow noopener noreferrer" translate="no" target="_blank"><span class="invisible">https://</span><span class="ellipsis">osf.io/preprints/metaarxiv/wcs</span><span class="invisible">fa</span></a></p><p>📮 Sign up here to join + stay updated: <a href="https://tally.so/r/nGd4Ap" rel="nofollow noopener noreferrer" translate="no" target="_blank"><span class="invisible">https://</span><span class="">tally.so/r/nGd4Ap</span><span class="invisible"></span></a></p>',
                  filtered: [],
                  reblog: null,
                  account: {
                    id: '110120634614237093',
                    username: 'ronent',
                    acct: 'ronent@mastodon.social',
                    displayName: 'Ronen Tamari',
                    locked: false,
                    bot: false,
                    discoverable: true,
                    group: false,
                    createdAt: '2022-01-31T00:00:00.000Z',
                    note: '<p>Researcher and entrepreneur @ Astera Institute | building collective sensemaking systems for science | Interested in prosocial tech, artificial/natural/collective intelligence and all their combinations.<br>Co-founder of  Common SenseMakers (<a href="https://www.csensemakers.com/" rel="nofollow noopener noreferrer" translate="no" target="_blank"><span class="invisible">https://www.</span><span class="">csensemakers.com/</span><span class="invisible"></span></a>)</p>',
                    url: 'https://mastodon.social/@ronent',
                    uri: 'https://mastodon.social/users/ronent',
                    avatar:
                      'https://media.cosocial.ca/cache/accounts/avatars/110/120/634/614/237/093/original/222eae3aefb95a7f.jpg',
                    avatarStatic:
                      'https://media.cosocial.ca/cache/accounts/avatars/110/120/634/614/237/093/original/222eae3aefb95a7f.jpg',
                    header: 'https://cosocial.ca/headers/original/missing.png',
                    headerStatic:
                      'https://cosocial.ca/headers/original/missing.png',
                    followersCount: 189,
                    followingCount: 404,
                    statusesCount: 113,
                    lastStatusAt: '2024-09-04',
                    emojis: [],
                    fields: [
                      {
                        name: 'Webpage',
                        value:
                          '<a href="https://ronentk.github.io/" rel="nofollow noopener noreferrer" translate="no" target="_blank"><span class="invisible">https://</span><span class="">ronentk.github.io/</span><span class="invisible"></span></a>',
                        verifiedAt: null,
                      },
                      {
                        name: 'Twitter',
                        value:
                          '<a href="https://twitter.com/rtk254" rel="nofollow noopener noreferrer" translate="no" target="_blank"><span class="invisible">https://</span><span class="">twitter.com/rtk254</span><span class="invisible"></span></a>',
                        verifiedAt: null,
                      },
                    ],
                  },
                  mediaAttachments: [],
                  mentions: [
                    {
                      id: '110363007870133193',
                      username: 'nanopub',
                      url: 'https://mas.to/@nanopub',
                      acct: 'nanopub@mas.to',
                    },
                  ],
                  tags: [
                    {
                      name: 'sciencemastodon',
                      url: 'https://cosocial.ca/tags/sciencemastodon',
                    },
                  ],
                  emojis: [],
                  card: {
                    url: 'https://osf.io/preprints/metaarxiv/wcsfa',
                    title: 'OSF',
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
                  poll: {
                    id: '81118',
                    expiresAt: '2024-06-22T19:00:12.000Z',
                    expired: true,
                    multiple: true,
                    votesCount: 8,
                    votersCount: 7,
                    voted: false,
                    ownVotes: [],
                    options: [
                      {
                        title: 'Natural language queries',
                        votesCount: 1,
                      },
                      {
                        title: 'Personalized recommendations',
                        votesCount: 1,
                      },
                      {
                        title: 'Cross platform feeds',
                        votesCount: 5,
                      },
                      {
                        title: 'Something else (comment?)',
                        votesCount: 1,
                      },
                    ],
                    emojis: [],
                  },
                },
                application: null,
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
                  followingCount: 17,
                  statusesCount: 10,
                  lastStatusAt: '2024-08-31',
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
            },
            {
              post_id: '112639305281497968',
              user_id: '111971425782516559',
              timestampMs: 1718739399445,
              post: {
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
                  header: 'https://cosocial.ca/headers/original/missing.png',
                  headerStatic:
                    'https://cosocial.ca/headers/original/missing.png',
                  followersCount: 11,
                  followingCount: 17,
                  statusesCount: 10,
                  lastStatusAt: '2024-08-31',
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
            },
            {
              post_id: '112639301082517136',
              user_id: '111971425782516559',
              timestampMs: 1718739335370,
              post: {
                id: '112639301082517136',
                createdAt: '2024-06-18T19:35:35.370Z',
                inReplyToId: '112609909115921358',
                inReplyToAccountId: '110122874503024265',
                sensitive: false,
                spoilerText: '',
                visibility: 'unlisted',
                language: 'en',
                uri: 'https://cosocial.ca/users/weswalla/statuses/112639301082517136',
                url: 'https://cosocial.ca/@weswalla/112639301082517136',
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
                  '<p><span class="h-card" translate="no"><a href="https://merveilles.town/@aynish" class="u-url mention">@<span>aynish</span></a></span> </p><p>here it is!<br /><a href="https://lu.ma/b1jflw04" target="_blank" rel="nofollow noopener noreferrer" translate="no"><span class="invisible">https://</span><span class="">lu.ma/b1jflw04</span><span class="invisible"></span></a></p>',
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
                  followingCount: 17,
                  statusesCount: 10,
                  lastStatusAt: '2024-08-31',
                  noindex: false,
                  emojis: [],
                  roles: [],
                  fields: [],
                },
                mediaAttachments: [],
                mentions: [
                  {
                    id: '110122874503024265',
                    username: 'aynish',
                    url: 'https://merveilles.town/@aynish',
                    acct: 'aynish@merveilles.town',
                  },
                ],
                tags: [],
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
            },
          ],
        };
      }
    );
  }

  if (type.get) {
    when(mocked.get(anything(), anything(), anything())).thenCall(
      async (
        post_id: string,
        userDetails: UserDetailsBase,
        manager: TransactionManager
      ) => {
        // Implementation goes here
      }
    );
  }

  if (type.signup) {
    when(mocked.getSignupContext(anything(), anything())).thenCall(
      (
        user_id?: string,
        params?: MastodonGetContextParams
      ): MastodonSignupContext => {
        return {
          authorizationUrl:
            'https://cosocial.ca/oauth/authorize?client_id=SE2qVBbK1J_-6za-JX-6H-NsGrbdIuARZk4Q6gpUxbk&scope=read+write+follow+push&redirect_uri=https%3A%2F%2Fphanpy.social%2F&response_type=code',
          clientId: 'SE2qVBbK1J_-6za-JX-6H-NsGrbdIuARZk4Q6gpUxbk',
          clientSecret: 'Y2XQ6wv2',
        };
      }
    );
    when(mocked.handleSignupData(anything())).thenCall(
      (data: MastodonSignupData): MastodonUserDetails => {
        return {
          user_id: '111971425782516559',
          signupDate: 1725473415250,
          profile: {
            id: '111971425782516559',
            username: 'weswalla',
            displayName: 'Wesley Finck',
            avatar:
              'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
            mastodonServer: 'cosocial.ca',
          },
          read: {
            accessToken: '12341234',
          },
        };
      }
    );
  }

  return instance(mocked);
};
