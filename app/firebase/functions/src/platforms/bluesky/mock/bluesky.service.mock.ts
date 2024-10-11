import { anything, instance, spy, when } from 'ts-mockito';

import {
  BlueskyAccountDetails,
  BlueskyGetContextParams,
  BlueskySignupContext,
  BlueskySignupData,
} from '../../../@shared/types/types.bluesky';
import { PlatformFetchParams } from '../../../@shared/types/types.fetch';
import { PlatformPostPublish } from '../../../@shared/types/types.platform.posts';
import { PLATFORM } from '../../../@shared/types/types.platforms';
import { AccountProfileCreate } from '../../../@shared/types/types.profiles';
import {
  AccountDetailsBase,
  TestUserCredentials,
} from '../../../@shared/types/types.user';
import { TransactionManager } from '../../../db/transaction.manager';
import { BlueskyService } from '../bluesky.service';

export interface BlueskyMockConfig {
  publish?: boolean;
  signup?: boolean;
  fetch?: boolean;
  get?: boolean;
}

export const getBlueskyMock = (
  blueskyService: BlueskyService,
  type?: BlueskyMockConfig,
  testUser?: TestUserCredentials
) => {
  if (!type || Object.keys(type).length === 0) {
    return blueskyService;
  }

  const mocked = spy(blueskyService);

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
        userDetails: BlueskyAccountDetails,
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
            newest_id:
              'at://did:plc:44ybard66vv44zksje25o7dz/app.bsky.feed.post/3l4z5c5ziuk2b',
            oldest_id:
              'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kq6yh5tvmp24',
          },
          platformPosts: [
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1727204998385,
              post: {
                thread_id:
                  'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
                posts: [
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
                    cid: 'bafyreig7foqn2iwo2mql5f5on4sglow6vwzlvfxq4ajtm2mlpnrmpzfrhe',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-09-24T19:09:58.385Z',
                      embed: {
                        $type: 'app.bsky.embed.external',
                        external: {
                          description: '',
                          title: 'The Theory',
                          uri: 'https://selfdeterminationtheory.org/the-theory/',
                        },
                      },
                      facets: [
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#link',
                              uri: 'https://selfdeterminationtheory.org/the-theory/',
                            },
                          ],
                          index: { byteEnd: 165, byteStart: 126 },
                        },
                      ],
                      langs: ['en'],
                      text: "self determination theory is one of the most compelling theories about human behaviour and development that I've come across. selfdeterminationtheory.org/the-theory/",
                    },
                    embed: {
                      $type: 'app.bsky.embed.external#view',
                      external: {
                        uri: 'https://selfdeterminationtheory.org/the-theory/',
                        title: 'The Theory',
                        description: '',
                      },
                    },
                    replyCount: 2,
                    repostCount: 0,
                    likeCount: 0,
                    quoteCount: 0,
                    indexedAt: '2024-09-24T19:09:58.385Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd52krts24',
                    cid: 'bafyreiesiupjfvjgezjj2mnyh7bbdzztqkn7gu2bgpgpipz7d5h7j7s7ym',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-09-24T19:11:33.132Z',
                      embed: {
                        $type: 'app.bsky.embed.external',
                        external: {
                          description: '',
                          title: 'ResearchA677CD6C-FAD9-4CF3-9640-8768D4149A42',
                          uri: 'https://selfdeterminationtheory.org/research/',
                        },
                      },
                      facets: [
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#link',
                              uri: 'https://selfdeterminationtheory.org/research/',
                            },
                          ],
                          index: { byteEnd: 160, byteStart: 123 },
                        },
                      ],
                      langs: ['en'],
                      reply: {
                        parent: {
                          cid: 'bafyreig7foqn2iwo2mql5f5on4sglow6vwzlvfxq4ajtm2mlpnrmpzfrhe',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
                        },
                        root: {
                          cid: 'bafyreig7foqn2iwo2mql5f5on4sglow6vwzlvfxq4ajtm2mlpnrmpzfrhe',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
                        },
                      },
                      text: 'SDT scholars are quite prolific and the body of research is ever growing (surprising amount of Canadian scholars actually) selfdeterminationtheory.org/research/',
                    },
                    embed: {
                      $type: 'app.bsky.embed.external#view',
                      external: {
                        uri: 'https://selfdeterminationtheory.org/research/',
                        title: 'ResearchA677CD6C-FAD9-4CF3-9640-8768D4149A42',
                        description: '',
                      },
                    },
                    replyCount: 2,
                    repostCount: 0,
                    likeCount: 0,
                    quoteCount: 0,
                    indexedAt: '2024-09-24T19:11:33.132Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdaif3va2h',
                    cid: 'bafyreifxy4hvz6id34zajalsc23s33s73gw3eyxbc7kwjgbi6yvcpmthoy',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-09-24T19:13:28.290Z',
                      embed: {
                        $type: 'app.bsky.embed.external',
                        external: {
                          description:
                            'Semantic Scholar profile for Richard M. Ryan, with 27513 highly influential citations and 499 scientific research papers.',
                          thumb: {
                            $type: 'blob',
                            ref: {
                              $link:
                                'bafkreifluh6qlba467xstgk5lc5uykjszcnzpidkikctaedsiwkqqwgsym',
                            },
                            mimeType: 'image/jpeg',
                            size: 335354,
                          },
                          title: 'Richard M. Ryan | Semantic Scholar',
                          uri: 'https://www.semanticscholar.org/author/Richard-M.-Ryan/2242812951',
                        },
                      },
                      facets: [
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#link',
                              uri: 'https://www.semanticscholar.org/author/Richard-M.-Ryan/2242812951',
                            },
                          ],
                          index: { byteEnd: 118, byteStart: 79 },
                        },
                      ],
                      langs: ['en'],
                      reply: {
                        parent: {
                          cid: 'bafyreiesiupjfvjgezjj2mnyh7bbdzztqkn7gu2bgpgpipz7d5h7j7s7ym',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd52krts24',
                        },
                        root: {
                          cid: 'bafyreig7foqn2iwo2mql5f5on4sglow6vwzlvfxq4ajtm2mlpnrmpzfrhe',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
                        },
                      },
                      text: 'one of the creators of the theory is one of the most cited academics I know of www.semanticscholar.org/author/Richa...',
                    },
                    embed: {
                      $type: 'app.bsky.embed.external#view',
                      external: {
                        uri: 'https://www.semanticscholar.org/author/Richard-M.-Ryan/2242812951',
                        title: 'Richard M. Ryan | Semantic Scholar',
                        description:
                          'Semantic Scholar profile for Richard M. Ryan, with 27513 highly influential citations and 499 scientific research papers.',
                        thumb:
                          'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreifluh6qlba467xstgk5lc5uykjszcnzpidkikctaedsiwkqqwgsym@jpeg',
                      },
                    },
                    replyCount: 1,
                    repostCount: 0,
                    likeCount: 0,
                    quoteCount: 0,
                    indexedAt: '2024-09-24T19:13:28.290Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdcb3w322z',
                    cid: 'bafyreicw53trheykcocuhdwvhbdkejsb6pmaiwcrzimruv32n2jericleu',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-09-24T19:14:27.758Z',
                      embed: {
                        $type: 'app.bsky.embed.external',
                        external: {
                          description:
                            'YouTube video by Happiness & Its Causes',
                          thumb: {
                            $type: 'blob',
                            ref: {
                              $link:
                                'bafkreicicwvgjhubi7qhtjkfpc552bd5prs5e7oabud4ppx5ls243fhkdq',
                            },
                            mimeType: 'image/jpeg',
                            size: 209528,
                          },
                          title:
                            'MOTIVATION & LIFESTYLE with Richard Ryan at Happiness & Its Causes 2017',
                          uri: 'https://www.youtube.com/watch?v=wzN10--mNw8&t=175s',
                        },
                      },
                      facets: [
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#link',
                              uri: 'https://www.youtube.com/watch?v=wzN10--mNw8&t=175s',
                            },
                          ],
                          index: { byteEnd: 69, byteStart: 38 },
                        },
                      ],
                      langs: ['en'],
                      reply: {
                        parent: {
                          cid: 'bafyreifxy4hvz6id34zajalsc23s33s73gw3eyxbc7kwjgbi6yvcpmthoy',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdaif3va2h',
                        },
                        root: {
                          cid: 'bafyreig7foqn2iwo2mql5f5on4sglow6vwzlvfxq4ajtm2mlpnrmpzfrhe',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
                        },
                      },
                      text: "Here's a short overview of the theory www.youtube.com/watch?v=wzN1...",
                    },
                    embed: {
                      $type: 'app.bsky.embed.external#view',
                      external: {
                        uri: 'https://www.youtube.com/watch?v=wzN10--mNw8&t=175s',
                        title:
                          'MOTIVATION & LIFESTYLE with Richard Ryan at Happiness & Its Causes 2017',
                        description: 'YouTube video by Happiness & Its Causes',
                        thumb:
                          'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreicicwvgjhubi7qhtjkfpc552bd5prs5e7oabud4ppx5ls243fhkdq@jpeg',
                      },
                    },
                    replyCount: 0,
                    repostCount: 0,
                    likeCount: 0,
                    quoteCount: 0,
                    indexedAt: '2024-09-24T19:14:27.758Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                ],
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: { chat: { allowIncoming: 'following' } },
                  viewer: { muted: false, blockedBy: false },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
              },
            },
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4yggobuey25',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1727277356440,
              post: {
                thread_id:
                  'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4yggobuey25',
                posts: [
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4yggobuey25',
                    cid: 'bafyreia437zfr2lzety5y7udhijqkpeeat7dsjgugb5enw7bovvvsumine',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-09-25T15:15:56.440Z',
                      langs: ['en'],
                      text: 'Part of the Hanzi Movie Method for rapidly memorizing Chinese characters is picking people to go in a visual scene that represents all aspects of the character. It\'s funny picking people from my life, knowing that they will be "with" me for many months as I imagine them when recalling characters.',
                    },
                    replyCount: 2,
                    repostCount: 0,
                    likeCount: 0,
                    quoteCount: 0,
                    indexedAt: '2024-09-25T15:15:56.440Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4ygiaoqke2w',
                    cid: 'bafyreicyt6ih2xbyv6pbn62jp6btoikbm5afhx5e5inlwfxfsjtw3elo6y',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-09-25T15:16:49.332Z',
                      embed: {
                        $type: 'app.bsky.embed.external',
                        external: {
                          description:
                            'What is The Hanzi Movie Method? Part 4 - "Actors" Represent Pinyin Initials to take advantage of facial mnemonics for learning Chinese.',
                          thumb: {
                            $type: 'blob',
                            ref: {
                              $link:
                                'bafkreibjavoywmq7gayns2b4watp6hen7efa3x4pvyttrfqj37yvgpyyfe',
                            },
                            mimeType: 'image/jpeg',
                            size: 481885,
                          },
                          title:
                            'The Hanzi Movie Method (Part 4): Using "Actors" and Facial Mnemonics to Learn Pinyin Initials - Mandarin Blueprint',
                          uri: 'https://www.mandarinblueprint.com/blog/facial-mnemonics-to-learn-chinese-pinyin-initials/',
                        },
                      },
                      facets: [
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#link',
                              uri: 'https://www.mandarinblueprint.com/blog/facial-mnemonics-to-learn-chinese-pinyin-initials/',
                            },
                          ],
                          index: { byteEnd: 95, byteStart: 54 },
                        },
                      ],
                      langs: ['en'],
                      reply: {
                        parent: {
                          cid: 'bafyreia437zfr2lzety5y7udhijqkpeeat7dsjgugb5enw7bovvvsumine',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4yggobuey25',
                        },
                        root: {
                          cid: 'bafyreia437zfr2lzety5y7udhijqkpeeat7dsjgugb5enw7bovvvsumine',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4yggobuey25',
                        },
                      },
                      text: "Here's an article outlining this part of the process: www.mandarinblueprint.com/blog/facial-...",
                    },
                    embed: {
                      $type: 'app.bsky.embed.external#view',
                      external: {
                        uri: 'https://www.mandarinblueprint.com/blog/facial-mnemonics-to-learn-chinese-pinyin-initials/',
                        title:
                          'The Hanzi Movie Method (Part 4): Using "Actors" and Facial Mnemonics to Learn Pinyin Initials - Mandarin Blueprint',
                        description:
                          'What is The Hanzi Movie Method? Part 4 - "Actors" Represent Pinyin Initials to take advantage of facial mnemonics for learning Chinese.',
                        thumb:
                          'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreibjavoywmq7gayns2b4watp6hen7efa3x4pvyttrfqj37yvgpyyfe@jpeg',
                      },
                    },
                    replyCount: 1,
                    repostCount: 0,
                    likeCount: 0,
                    quoteCount: 0,
                    indexedAt: '2024-09-25T15:16:49.332Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4yglqwg6t2o',
                    cid: 'bafyreiex3nq3lfcuebdyrfvxfsuwrqrno2bbjbhk7zoa4rn6bwle4dmbdu',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-09-25T15:18:47.025Z',
                      langs: ['en'],
                      reply: {
                        parent: {
                          cid: 'bafyreicyt6ih2xbyv6pbn62jp6btoikbm5afhx5e5inlwfxfsjtw3elo6y',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4ygiaoqke2w',
                        },
                        root: {
                          cid: 'bafyreia437zfr2lzety5y7udhijqkpeeat7dsjgugb5enw7bovvvsumine',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4yggobuey25',
                        },
                      },
                      text: 'I thought of someone memorable from my life, their name starting with "G". I haven\'t spoken with them in almost 10 years, now I\'m wondering if I should reach out to them.',
                    },
                    replyCount: 1,
                    repostCount: 0,
                    likeCount: 0,
                    quoteCount: 0,
                    indexedAt: '2024-09-25T15:18:47.025Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4ygnusmvm2m',
                    cid: 'bafyreibjsvbkrby2egf3bnqaqkwezio7bcki5gwgltgcqj7ffpledql7je',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-09-25T15:19:58.203Z',
                      langs: ['en'],
                      reply: {
                        parent: {
                          cid: 'bafyreiex3nq3lfcuebdyrfvxfsuwrqrno2bbjbhk7zoa4rn6bwle4dmbdu',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4yglqwg6t2o',
                        },
                        root: {
                          cid: 'bafyreia437zfr2lzety5y7udhijqkpeeat7dsjgugb5enw7bovvvsumine',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4yggobuey25',
                        },
                      },
                      text: 'Anyway, I can tell that tapping in to our natural abilities will build a solid foundation for remembering Chinese characters. I guess thats why its called a memory palace.',
                    },
                    replyCount: 0,
                    repostCount: 0,
                    likeCount: 0,
                    quoteCount: 0,
                    indexedAt: '2024-09-25T15:19:58.203Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                ],
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: { chat: { allowIncoming: 'following' } },
                  viewer: { muted: false, blockedBy: false },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
              },
            },
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4tpp5hujn2v',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1727115505568,
              post: {
                thread_id:
                  'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4tpp5hujn2v',
                posts: [
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4tpp5hujn2v',
                    cid: 'bafyreigrwbhgrissbjg4nz5ga46x7qkvwghyrpbhlzrgxmbpouzi6rjjje',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-09-23T18:18:25.568Z',
                      facets: [
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#link',
                              uri: 'https://getwhisky.app/',
                            },
                          ],
                          index: { byteEnd: 83, byteStart: 61 },
                        },
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#link',
                              uri: 'https://getwhisky.app/',
                            },
                          ],
                          index: { byteEnd: 83, byteStart: 61 },
                        },
                      ],
                      langs: ['en'],
                      text: "I've been able to play a few steam games on my macbook using https://getwhisky.app/ and it works pretty well! So far it handles Chained Together and Pilgrim without issue, but Lunch Lady kept glitching out everytime she killed me",
                    },
                    replyCount: 0,
                    repostCount: 0,
                    likeCount: 1,
                    quoteCount: 0,
                    indexedAt: '2024-09-23T18:18:25.568Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                ],
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: { chat: { allowIncoming: 'following' } },
                  viewer: { muted: false, blockedBy: false },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
              },
            },
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4ebss5mmt2f',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1726585199300,
              post: {
                thread_id:
                  'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4ebss5mmt2f',
                posts: [
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4ebss5mmt2f',
                    cid: 'bafyreidpcnk6nrdr7dbtzm35xfwv4b4xcqxjkcgimqjclwxrzutcabosqi',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-09-17T14:59:59.300Z',
                      embed: {
                        $type: 'app.bsky.embed.record',
                        record: {
                          cid: 'bafyreifcxkilyav5acswehpn5b247ru6zhlhckfewu6brxst4bexcucyry',
                          uri: 'at://did:plc:ormie3tjweyhnqckjlzowoxg/app.bsky.feed.post/3l4eak57v5y2h',
                        },
                      },
                      facets: [
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#tag',
                              tag: 'epistemiccommons',
                            },
                          ],
                          index: { byteEnd: 149, byteStart: 132 },
                        },
                      ],
                      langs: ['en'],
                      text: 'Let’s keep journalism independent and free from perverse incentives. Best way is to support directly with a monthly subscription. #epistemiccommons',
                    },
                    embed: {
                      $type: 'app.bsky.embed.record#view',
                      record: {
                        $type: 'app.bsky.embed.record#viewRecord',
                        uri: 'at://did:plc:ormie3tjweyhnqckjlzowoxg/app.bsky.feed.post/3l4eak57v5y2h',
                        cid: 'bafyreifcxkilyav5acswehpn5b247ru6zhlhckfewu6brxst4bexcucyry',
                        author: {
                          did: 'did:plc:ormie3tjweyhnqckjlzowoxg',
                          handle: 'thetyee.ca',
                          displayName: 'The Tyee',
                          avatar:
                            'https://cdn.bsky.app/img/avatar/plain/did:plc:ormie3tjweyhnqckjlzowoxg/bafkreigstewya7254mpk4fmvodpmfrqtbxmupztdeman6kuatl4v5walze@jpeg',
                          associated: { chat: { allowIncoming: 'following' } },
                          viewer: {
                            muted: false,
                            blockedBy: false,
                            following:
                              'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.graph.follow/3kqtnbuevx62y',
                          },
                          labels: [],
                          createdAt: '2024-02-06T17:28:31.293Z',
                        },
                        value: {
                          $type: 'app.bsky.feed.post',
                          createdAt: '2024-09-17T14:37:15.542Z',
                          embed: {
                            $type: 'app.bsky.embed.external',
                            external: {
                              description:
                                'Our annual report back to our readers is hot off the presses.',
                              thumb: {
                                $type: 'blob',
                                ref: {
                                  $link:
                                    'bafkreibopkhpq5gqi6fefvhped4w4uwfngi5a4mbwbwdu2wksd35yaxynm',
                                },
                                mimeType: 'image/jpeg',
                                size: 339662,
                              },
                              title:
                                'Behold! The Tyee’s 2023 Impact Report | The Tyee',
                              uri: 'https://thetyee.ca/Tyeenews/2024/09/17/Tyee-2023-Impact-Report/?utm_source=bluesky&utm_medium=social&utm_campaign=editorial',
                            },
                          },
                          facets: [
                            {
                              features: [
                                {
                                  $type: 'app.bsky.richtext.facet#tag',
                                  tag: 'CdnMedia',
                                },
                              ],
                              index: { byteEnd: 259, byteStart: 250 },
                            },
                          ],
                          langs: ['en'],
                          text: 'Supporting The Tyee is not like taking out a subscription to a newspaper — it’s a contribution toward the kind of journalism you want to see more of in our community.\n\nIt only feels fair that we share what we’re able to do with your help. ✨\n\n#CdnMedia',
                        },
                        labels: [],
                        likeCount: 5,
                        replyCount: 0,
                        repostCount: 4,
                        quoteCount: 1,
                        indexedAt: '2024-09-17T14:37:15.542Z',
                        embeds: [
                          {
                            $type: 'app.bsky.embed.external#view',
                            external: {
                              uri: 'https://thetyee.ca/Tyeenews/2024/09/17/Tyee-2023-Impact-Report/?utm_source=bluesky&utm_medium=social&utm_campaign=editorial',
                              title:
                                'Behold! The Tyee’s 2023 Impact Report | The Tyee',
                              description:
                                'Our annual report back to our readers is hot off the presses.',
                              thumb:
                                'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:ormie3tjweyhnqckjlzowoxg/bafkreibopkhpq5gqi6fefvhped4w4uwfngi5a4mbwbwdu2wksd35yaxynm@jpeg',
                            },
                          },
                        ],
                      },
                    },
                    replyCount: 0,
                    repostCount: 0,
                    likeCount: 0,
                    quoteCount: 0,
                    indexedAt: '2024-09-17T14:59:59.300Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                ],
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: { chat: { allowIncoming: 'following' } },
                  viewer: { muted: false, blockedBy: false },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
              },
            },
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kzp6wooqmi2z',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1723661531324,
              post: {
                thread_id:
                  'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kzp6wooqmi2z',
                posts: [
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kzp6wooqmi2z',
                    cid: 'bafyreigfjh6bdreetzsufa5ygx2nycgbpuo6q7jpaii6lk4dn6kipzix7u',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-08-14T18:52:11.324Z',
                      embed: {
                        $type: 'app.bsky.embed.external',
                        external: {
                          description: '',
                          thumb: {
                            $type: 'blob',
                            ref: {
                              $link:
                                'bafkreifwz3xwzjqfoybqorz5uuorhmztsgpduy4n4am466xsvyjalid2zm',
                            },
                            mimeType: 'image/jpeg',
                            size: 255792,
                          },
                          title: 'Triopticon',
                          uri: 'https://cynefin.io/index.php/Triopticon',
                        },
                      },
                      facets: [
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#tag',
                              tag: 'DWebCamp2024',
                            },
                          ],
                          index: { byteEnd: 13, byteStart: 0 },
                        },
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#link',
                              uri: 'https://cynefin.io/index.php/Triopticon',
                            },
                          ],
                          index: { byteEnd: 240, byteStart: 214 },
                        },
                      ],
                      langs: ['en'],
                      text: "#DWebCamp2024 was full of discussion and exploration which I'd love to see in the space between conference and unconference with something like the triopticon workshop method to see what kind of synthesis emerges. cynefin.io/index.php/Tr...",
                    },
                    embed: {
                      $type: 'app.bsky.embed.external#view',
                      external: {
                        uri: 'https://cynefin.io/index.php/Triopticon',
                        title: 'Triopticon',
                        description: '',
                        thumb:
                          'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreifwz3xwzjqfoybqorz5uuorhmztsgpduy4n4am466xsvyjalid2zm@jpeg',
                      },
                    },
                    replyCount: 1,
                    repostCount: 0,
                    likeCount: 0,
                    quoteCount: 0,
                    indexedAt: '2024-08-14T18:52:11.324Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kzp6xiyp3a2t',
                    cid: 'bafyreic7izyboe3pyba4c53h6cliv5zhfzkpkneevxhbmsm6zqclm4z5om',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-08-14T18:52:38.935Z',
                      embed: {
                        $type: 'app.bsky.embed.images',
                        images: [
                          {
                            alt: 'The Triopticon was developed for the following purposes:\n\nTo bring together, observe and explore how different bodies of knowledge apply and interact in a particular field\nTo create a safe space to communicate conflicting perspectives, linked to the aporetic turn.\nTo deliver a richer alternative to a traditional conference setting experience.\nTo work through conflicting beliefs.\nTo provide novel opportunities for analysis and synthesis of areas of disagreement and/or conflict.\nTo encourage a rich context which encourages new thinking and the exchange and combination of ideas\nTo produce artefacts which can be used to inform further pieces of work.',
                            aspectRatio: { height: 750, width: 1648 },
                            image: {
                              $type: 'blob',
                              ref: {
                                $link:
                                  'bafkreibwosugxaorli2tusrr46ddqkw3kov5hdpnazksfdotnunm5j62eu',
                              },
                              mimeType: 'image/jpeg',
                              size: 718894,
                            },
                          },
                        ],
                      },
                      langs: ['en'],
                      reply: {
                        parent: {
                          cid: 'bafyreigfjh6bdreetzsufa5ygx2nycgbpuo6q7jpaii6lk4dn6kipzix7u',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kzp6wooqmi2z',
                        },
                        root: {
                          cid: 'bafyreigfjh6bdreetzsufa5ygx2nycgbpuo6q7jpaii6lk4dn6kipzix7u',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kzp6wooqmi2z',
                        },
                      },
                      text: '"The Triopticon process was designed to provide a fresh compromise between a formal conference and the more unstructured unconference."',
                    },
                    embed: {
                      $type: 'app.bsky.embed.images#view',
                      images: [
                        {
                          thumb:
                            'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreibwosugxaorli2tusrr46ddqkw3kov5hdpnazksfdotnunm5j62eu@jpeg',
                          fullsize:
                            'https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreibwosugxaorli2tusrr46ddqkw3kov5hdpnazksfdotnunm5j62eu@jpeg',
                          alt: 'The Triopticon was developed for the following purposes:\n\nTo bring together, observe and explore how different bodies of knowledge apply and interact in a particular field\nTo create a safe space to communicate conflicting perspectives, linked to the aporetic turn.\nTo deliver a richer alternative to a traditional conference setting experience.\nTo work through conflicting beliefs.\nTo provide novel opportunities for analysis and synthesis of areas of disagreement and/or conflict.\nTo encourage a rich context which encourages new thinking and the exchange and combination of ideas\nTo produce artefacts which can be used to inform further pieces of work.',
                          aspectRatio: { height: 750, width: 1648 },
                        },
                      ],
                    },
                    replyCount: 0,
                    repostCount: 0,
                    likeCount: 1,
                    quoteCount: 0,
                    indexedAt: '2024-08-14T18:52:38.935Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                ],
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: { chat: { allowIncoming: 'following' } },
                  viewer: { muted: false, blockedBy: false },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
              },
            },
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kytklglpnc2n',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1722711965000,
              post: {
                thread_id:
                  'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kytklglpnc2n',
                posts: [
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kytklglpnc2n',
                    cid: 'bafyreide5g5mgyaehggztd5gynjg65pxsjqvdelo3zu3m5b7yv42u2mbdy',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-08-03T19:06:05Z',
                      embed: {
                        $type: 'app.bsky.embed.external',
                        external: {
                          description:
                            'View more about this event at DWeb Camp 2024',
                          thumb: {
                            $type: 'blob',
                            ref: {
                              $link:
                                'bafkreiavnnpwyvm2ousf3xycngvp6keo6q5aesm3jukz6bs5akneytxgya',
                            },
                            mimeType: 'image/png',
                            size: 39212,
                          },
                          title: 'DWeb Camp 2024: Intro to Improv',
                          uri: 'http://dlvr.it/TBSGXS',
                        },
                      },
                      facets: [
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#link',
                              uri: 'http://dlvr.it/TBSGXS',
                            },
                          ],
                          index: { byteEnd: 122, byteStart: 101 },
                        },
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#link',
                              uri: 'http://dlvr.it/TBSGXf',
                            },
                          ],
                          index: { byteEnd: 173, byteStart: 152 },
                        },
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#link',
                              uri: 'http://dlvr.it/TBSGXj',
                            },
                          ],
                          index: { byteEnd: 230, byteStart: 209 },
                        },
                      ],
                      text: 'Will be hosting/co-hosting some fun activities/talks at #DWebCamp2024 this year!\n1. Intro to Improv: http://dlvr.it/TBSGXS\n2. Deep dive into SenseNets: http://dlvr.it/TBSGXf\n3. Lightning Talk about SenseNets: http://dlvr.it/TBSGXj\n\nCome on by if you can :)',
                    },
                    embed: {
                      $type: 'app.bsky.embed.external#view',
                      external: {
                        uri: 'http://dlvr.it/TBSGXS',
                        title: 'DWeb Camp 2024: Intro to Improv',
                        description:
                          'View more about this event at DWeb Camp 2024',
                        thumb:
                          'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreiavnnpwyvm2ousf3xycngvp6keo6q5aesm3jukz6bs5akneytxgya@jpeg',
                      },
                    },
                    replyCount: 1,
                    repostCount: 0,
                    likeCount: 1,
                    quoteCount: 0,
                    indexedAt: '2024-08-03T19:06:05.000Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kytynxpfnh23',
                    cid: 'bafyreifkdyjd3qt7odkldvsocv6tv6jpyjqktnm25exgaexnz2ahnw2rha',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-08-03T23:18:03.334Z',
                      facets: [
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#tag',
                              tag: 'DWebCamp2024',
                            },
                          ],
                          index: { byteEnd: 13, byteStart: 0 },
                        },
                      ],
                      langs: ['en'],
                      reply: {
                        parent: {
                          cid: 'bafyreide5g5mgyaehggztd5gynjg65pxsjqvdelo3zu3m5b7yv42u2mbdy',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kytklglpnc2n',
                        },
                        root: {
                          cid: 'bafyreide5g5mgyaehggztd5gynjg65pxsjqvdelo3zu3m5b7yv42u2mbdy',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kytklglpnc2n',
                        },
                      },
                      text: '#DWebCamp2024',
                    },
                    replyCount: 0,
                    repostCount: 0,
                    likeCount: 1,
                    quoteCount: 0,
                    indexedAt: '2024-08-03T23:18:03.334Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                ],
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: { chat: { allowIncoming: 'following' } },
                  viewer: { muted: false, blockedBy: false },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
              },
            },
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kv7smmckts24',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1718734865778,
              post: {
                thread_id:
                  'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kv7smmckts24',
                posts: [
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kv7smmckts24',
                    cid: 'bafyreicn724blghbhnsxpcjmdonuwxrfkahe57h6ab2c74q75rwchh4kja',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-06-18T18:21:05.778Z',
                      embed: {
                        $type: 'app.bsky.embed.record',
                        record: {
                          cid: 'bafyreihkf7336jzjp6o3qqfmah34jltrcytonakhnq6giwh4k7m4hxsmli',
                          uri: 'at://did:plc:jfhpnnst6flqway4eaeqzj2a/app.bsky.feed.generator/for-science',
                        },
                      },
                      facets: [
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#link',
                              uri: 'https://bsky.app/profile/did:plc:jfhpnnst6flqway4eaeqzj2a/feed/for-science',
                            },
                          ],
                          index: { byteEnd: 87, byteStart: 63 },
                        },
                      ],
                      langs: ['en'],
                      text: 'This might be interesting to contributors to the science feed: bsky.app/profile/did:...',
                    },
                    embed: {
                      $type: 'app.bsky.embed.record#view',
                      record: {
                        uri: 'at://did:plc:jfhpnnst6flqway4eaeqzj2a/app.bsky.feed.generator/for-science',
                        cid: 'bafyreihkf7336jzjp6o3qqfmah34jltrcytonakhnq6giwh4k7m4hxsmli',
                        did: 'did:web:bs.bossett.io',
                        creator: {
                          did: 'did:plc:jfhpnnst6flqway4eaeqzj2a',
                          handle: 'bossett.social',
                          displayName: 'Bossett',
                          avatar:
                            'https://cdn.bsky.app/img/avatar/plain/did:plc:jfhpnnst6flqway4eaeqzj2a/bafkreid42e2su4sju7hl2nm4ouacw3icvvytf7r6gab3pvc2qxhqhc5ji4@jpeg',
                          associated: { chat: { allowIncoming: 'all' } },
                          viewer: { muted: false, blockedBy: false },
                          labels: [],
                          createdAt: '2023-05-27T07:05:12.214Z',
                          description:
                            'Profile labeller: @profile-labels.bossett.social\nDiscord for feeds, lists, mod tools: https://discord.gg/tYuDvuzbVA\nFeeds I host (incl. Science 🧪): http://l.bossett.io/w9iM2\n\nhe/him\n📍 🇦🇺\n\n👾 bossett\n📧 bossett@bossett.io',
                          indexedAt: '2024-09-21T08:34:04.505Z',
                        },
                        displayName: 'Science',
                        description:
                          'The Science Feed. A curated feed from Bluesky professional scientists,  science communicators, and science/nature photographer/artists. See https://l.bossett.io/vkeNf for more information! 🧪',
                        avatar:
                          'https://cdn.bsky.app/img/avatar/plain/did:plc:jfhpnnst6flqway4eaeqzj2a/bafkreiexbusja2q52nwi44ov5rpyyz7d5n74kxr4ucunfigmv2e26dxrim@jpeg',
                        likeCount: 6992,
                        labels: [],
                        viewer: {},
                        indexedAt: '2023-11-26T19:34:54.335Z',
                        $type: 'app.bsky.feed.defs#generatorView',
                      },
                    },
                    replyCount: 1,
                    repostCount: 0,
                    likeCount: 1,
                    quoteCount: 0,
                    indexedAt: '2024-06-18T18:21:05.778Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kv7wyi3e7c2p',
                    cid: 'bafyreih3ruovissbx5mkhwkkdij3rlckpwnphr4aenvklivktmw265ajem',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-06-18T19:39:18.964Z',
                      embed: {
                        $type: 'app.bsky.embed.record',
                        record: {
                          cid: 'bafyreie3g5vkbq5ye23a3rn3dh2h6togxawgn2glevjr33j6pukhisbnce',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kv7shce4l227',
                        },
                      },
                      facets: [
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#link',
                              uri: 'https://bsky.app/profile/weswalla.bsky.social/post/3kv7shce4l227',
                            },
                          ],
                          index: { byteEnd: 24, byteStart: 0 },
                        },
                      ],
                      langs: ['en'],
                      reply: {
                        parent: {
                          cid: 'bafyreicn724blghbhnsxpcjmdonuwxrfkahe57h6ab2c74q75rwchh4kja',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kv7smmckts24',
                        },
                        root: {
                          cid: 'bafyreicn724blghbhnsxpcjmdonuwxrfkahe57h6ab2c74q75rwchh4kja',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kv7smmckts24',
                        },
                      },
                      text: 'bsky.app/profile/wesw...',
                    },
                    embed: {
                      $type: 'app.bsky.embed.record#view',
                      record: {
                        $type: 'app.bsky.embed.record#viewRecord',
                        uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kv7shce4l227',
                        cid: 'bafyreie3g5vkbq5ye23a3rn3dh2h6togxawgn2glevjr33j6pukhisbnce',
                        author: {
                          did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                          handle: 'weswalla.bsky.social',
                          displayName: 'Wesley Finck',
                          avatar:
                            'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                          associated: { chat: { allowIncoming: 'following' } },
                          viewer: { muted: false, blockedBy: false },
                          labels: [],
                          createdAt: '2024-02-08T00:14:23.947Z',
                        },
                        value: {
                          $type: 'app.bsky.feed.post',
                          createdAt: '2024-06-18T18:18:07.586Z',
                          embed: {
                            $type: 'app.bsky.embed.images',
                            images: [
                              {
                                alt: '',
                                aspectRatio: { height: 946, width: 1204 },
                                image: {
                                  $type: 'blob',
                                  ref: {
                                    $link:
                                      'bafkreibzpxfoooprhcr6seim7u65q4i2zz4kbr2hgz6nuulqlxxpqqbyji',
                                  },
                                  mimeType: 'image/jpeg',
                                  size: 366006,
                                },
                              },
                            ],
                          },
                          facets: [
                            {
                              features: [
                                {
                                  $type: 'app.bsky.richtext.facet#link',
                                  uri: 'https://x.com/rtk254/status/1803100275990794566',
                                },
                              ],
                              index: { byteEnd: 211, byteStart: 190 },
                            },
                          ],
                          langs: ['en'],
                          text: "We are trying to revitalize science social media and its role in the overall scientific process and discourse. And we'll have bsky support some point soon. Let us know if you're interested! x.com/rtk254/statu...",
                        },
                        labels: [],
                        likeCount: 1,
                        replyCount: 2,
                        repostCount: 0,
                        quoteCount: 1,
                        indexedAt: '2024-06-18T18:18:07.586Z',
                        embeds: [
                          {
                            $type: 'app.bsky.embed.images#view',
                            images: [
                              {
                                thumb:
                                  'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreibzpxfoooprhcr6seim7u65q4i2zz4kbr2hgz6nuulqlxxpqqbyji@jpeg',
                                fullsize:
                                  'https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreibzpxfoooprhcr6seim7u65q4i2zz4kbr2hgz6nuulqlxxpqqbyji@jpeg',
                                alt: '',
                                aspectRatio: { height: 946, width: 1204 },
                              },
                            ],
                          },
                        ],
                      },
                    },
                    replyCount: 0,
                    repostCount: 0,
                    likeCount: 1,
                    quoteCount: 0,
                    indexedAt: '2024-06-18T19:39:18.964Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                ],
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: { chat: { allowIncoming: 'following' } },
                  viewer: { muted: false, blockedBy: false },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
              },
            },
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kv7wmoj3fc2o',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1718739163048,
              post: {
                thread_id:
                  'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kv7wmoj3fc2o',
                posts: [
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kv7wmoj3fc2o',
                    cid: 'bafyreib4mcvx34ju6t6catoa764ldngvehj43gi6aabrblq3c62gbydtgy',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-06-18T19:32:43.048Z',
                      embed: {
                        $type: 'app.bsky.embed.external',
                        external: {
                          description:
                            "All things tools-for-thought. Note-taking, task management, memory augmentation, content consumption/production.\nWhat are some interesting workflows you've…",
                          thumb: {
                            $type: 'blob',
                            ref: {
                              $link:
                                'bafkreieta6omg3ydlieewfssxf4ncleahknyp7rsu5h4oxk4p4tdj73a5i',
                            },
                            mimeType: 'image/jpeg',
                            size: 169404,
                          },
                          title: 'Tools-For-Thought Meetup #2 · Luma',
                          uri: 'https://lu.ma/b1jflw04',
                        },
                      },
                      facets: [
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#link',
                              uri: 'https://lu.ma/b1jflw04',
                            },
                          ],
                          index: { byteEnd: 113, byteStart: 99 },
                        },
                      ],
                      langs: ['en'],
                      text: 'calling all tft enthusiasts, come on out and share your tools and workflows!\nJuly 11 5:30pm-7:30pm\nlu.ma/b1jflw04',
                    },
                    embed: {
                      $type: 'app.bsky.embed.external#view',
                      external: {
                        uri: 'https://lu.ma/b1jflw04',
                        title: 'Tools-For-Thought Meetup #2 · Luma',
                        description:
                          "All things tools-for-thought. Note-taking, task management, memory augmentation, content consumption/production.\nWhat are some interesting workflows you've…",
                        thumb:
                          'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreieta6omg3ydlieewfssxf4ncleahknyp7rsu5h4oxk4p4tdj73a5i@jpeg',
                      },
                    },
                    replyCount: 0,
                    repostCount: 0,
                    likeCount: 2,
                    quoteCount: 0,
                    indexedAt: '2024-06-18T19:32:43.048Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                ],
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: { chat: { allowIncoming: 'following' } },
                  viewer: { muted: false, blockedBy: false },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
              },
            },
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kv7shce4l227',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1718734687586,
              post: {
                thread_id:
                  'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kv7shce4l227',
                posts: [
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kv7shce4l227',
                    cid: 'bafyreie3g5vkbq5ye23a3rn3dh2h6togxawgn2glevjr33j6pukhisbnce',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-06-18T18:18:07.586Z',
                      embed: {
                        $type: 'app.bsky.embed.images',
                        images: [
                          {
                            alt: '',
                            aspectRatio: { height: 946, width: 1204 },
                            image: {
                              $type: 'blob',
                              ref: {
                                $link:
                                  'bafkreibzpxfoooprhcr6seim7u65q4i2zz4kbr2hgz6nuulqlxxpqqbyji',
                              },
                              mimeType: 'image/jpeg',
                              size: 366006,
                            },
                          },
                        ],
                      },
                      facets: [
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#link',
                              uri: 'https://x.com/rtk254/status/1803100275990794566',
                            },
                          ],
                          index: { byteEnd: 211, byteStart: 190 },
                        },
                      ],
                      langs: ['en'],
                      text: "We are trying to revitalize science social media and its role in the overall scientific process and discourse. And we'll have bsky support some point soon. Let us know if you're interested! x.com/rtk254/statu...",
                    },
                    embed: {
                      $type: 'app.bsky.embed.images#view',
                      images: [
                        {
                          thumb:
                            'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreibzpxfoooprhcr6seim7u65q4i2zz4kbr2hgz6nuulqlxxpqqbyji@jpeg',
                          fullsize:
                            'https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreibzpxfoooprhcr6seim7u65q4i2zz4kbr2hgz6nuulqlxxpqqbyji@jpeg',
                          alt: '',
                          aspectRatio: { height: 946, width: 1204 },
                        },
                      ],
                    },
                    replyCount: 2,
                    repostCount: 0,
                    likeCount: 1,
                    quoteCount: 1,
                    indexedAt: '2024-06-18T18:18:07.586Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kv7sog3fwk24',
                    cid: 'bafyreidlbv4okf665tq6enxnovo5beu6ix7b3t4jksc3o2753ktf4yrrse',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-06-18T18:22:06.390Z',
                      facets: [
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#tag',
                              tag: 'science',
                            },
                          ],
                          index: { byteEnd: 8, byteStart: 0 },
                        },
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#tag',
                              tag: 'open-access',
                            },
                          ],
                          index: { byteEnd: 21, byteStart: 9 },
                        },
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#tag',
                              tag: 'semantics',
                            },
                          ],
                          index: { byteEnd: 32, byteStart: 22 },
                        },
                      ],
                      langs: ['en'],
                      reply: {
                        parent: {
                          cid: 'bafyreie3g5vkbq5ye23a3rn3dh2h6togxawgn2glevjr33j6pukhisbnce',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kv7shce4l227',
                        },
                        root: {
                          cid: 'bafyreie3g5vkbq5ye23a3rn3dh2h6togxawgn2glevjr33j6pukhisbnce',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kv7shce4l227',
                        },
                      },
                      text: '#science #open-access #semantics',
                    },
                    replyCount: 0,
                    repostCount: 0,
                    likeCount: 0,
                    quoteCount: 0,
                    indexedAt: '2024-06-18T18:22:06.390Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                ],
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: { chat: { allowIncoming: 'following' } },
                  viewer: { muted: false, blockedBy: false },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
              },
            },
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3ksckj2s3jc2z',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1715530700891,
              post: {
                thread_id:
                  'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3ksckj2s3jc2z',
                posts: [
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3ksckj2s3jc2z',
                    cid: 'bafyreialjgni2cwkmvizprtopi6v6lbm6x62xwhvppktmykxkuignvytta',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-05-12T16:18:20.891Z',
                      langs: ['en'],
                      text: 'I find it strange how “being online” mostly means being up-to-date with trendy tech topics on Twitter. I guess it’s a way for people to feel special and justify time spent scrolling?',
                    },
                    replyCount: 1,
                    repostCount: 0,
                    likeCount: 1,
                    quoteCount: 0,
                    indexedAt: '2024-05-12T16:18:20.891Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kscktqqjnq25',
                    cid: 'bafyreihxper4lwdq3wsyvqjchp5dl6gmphdeg6lw7pw3wlmxdadex45tqe',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-05-12T16:24:19.735Z',
                      langs: ['en'],
                      reply: {
                        parent: {
                          cid: 'bafyreialjgni2cwkmvizprtopi6v6lbm6x62xwhvppktmykxkuignvytta',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3ksckj2s3jc2z',
                        },
                        root: {
                          cid: 'bafyreialjgni2cwkmvizprtopi6v6lbm6x62xwhvppktmykxkuignvytta',
                          uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3ksckj2s3jc2z',
                        },
                      },
                      text: 'I like to think of someone as “online” if they are amplifying quality signal and reducing noise. A seriously under-appreciated signal comes from those speaking candidly about our energy and material constraints in the decades ahead.',
                    },
                    replyCount: 0,
                    repostCount: 0,
                    likeCount: 1,
                    quoteCount: 0,
                    indexedAt: '2024-05-12T16:24:19.735Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                ],
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: { chat: { allowIncoming: 'following' } },
                  viewer: { muted: false, blockedBy: false },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
              },
            },
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3ksckmqk4mt2g',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1715530824293,
              post: {
                thread_id:
                  'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3ksckmqk4mt2g',
                posts: [
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3ksckmqk4mt2g',
                    cid: 'bafyreicrntgorxxln34xpre5nezbgsb3zdnqc3e5dy5x4dxy2howokyt6u',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-05-12T16:20:24.293Z',
                      langs: ['en'],
                      text: 'Note for fellow bike commuters: Apple Maps is significantly better at suggesting bike routes than Google maps. No idea why.',
                    },
                    replyCount: 1,
                    repostCount: 2,
                    likeCount: 5,
                    quoteCount: 0,
                    indexedAt: '2024-05-12T16:20:24.293Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                ],
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: { chat: { allowIncoming: 'following' } },
                  viewer: { muted: false, blockedBy: false },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
              },
            },
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3krqugfehgy2y',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1714922873737,
              post: {
                thread_id:
                  'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3krqugfehgy2y',
                posts: [
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3krqugfehgy2y',
                    cid: 'bafyreifmpi72rrc2w736irwtwesxrgjhvu2hhzw2cph6unqlro6cgztqca',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-05-05T15:27:53.737Z',
                      langs: ['en'],
                      text: 'Gravity wants us to matter.',
                    },
                    replyCount: 0,
                    repostCount: 0,
                    likeCount: 1,
                    quoteCount: 0,
                    indexedAt: '2024-05-05T15:27:53.737Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                ],
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: { chat: { allowIncoming: 'following' } },
                  viewer: { muted: false, blockedBy: false },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
              },
            },
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kqu4rw7lmh2y',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1713935418027,
              post: {
                thread_id:
                  'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kqu4rw7lmh2y',
                posts: [
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kqu4rw7lmh2y',
                    cid: 'bafyreicpcn65q4ja6bbkphzn2vzncdjtcv6urkj45ddukj6hysv74yxivi',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-04-24T05:10:18.027Z',
                      embed: {
                        $type: 'app.bsky.embed.record',
                        record: {
                          cid: 'bafyreiels3elcwfqfuqt4uqzaib5ib5a7jsez6rxqaz4fwlgebqspvw5zq',
                          uri: 'at://did:plc:ormie3tjweyhnqckjlzowoxg/app.bsky.feed.post/3kp5scqnya32x',
                        },
                      },
                      facets: [
                        {
                          $type: 'app.bsky.richtext.facet',
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#mention',
                              did: 'did:plc:ormie3tjweyhnqckjlzowoxg',
                            },
                          ],
                          index: { byteEnd: 176, byteStart: 165 },
                        },
                      ],
                      langs: ['en'],
                      text: 'I’m always on the lookout for communicators with an energy-based lens. Andrew is definitely one of those and I’m excited to keep up to date with his writings on @thetyee.ca',
                    },
                    embed: {
                      $type: 'app.bsky.embed.record#view',
                      record: {
                        $type: 'app.bsky.embed.record#viewRecord',
                        uri: 'at://did:plc:ormie3tjweyhnqckjlzowoxg/app.bsky.feed.post/3kp5scqnya32x',
                        cid: 'bafyreiels3elcwfqfuqt4uqzaib5ib5a7jsez6rxqaz4fwlgebqspvw5zq',
                        author: {
                          did: 'did:plc:ormie3tjweyhnqckjlzowoxg',
                          handle: 'thetyee.ca',
                          displayName: 'The Tyee',
                          avatar:
                            'https://cdn.bsky.app/img/avatar/plain/did:plc:ormie3tjweyhnqckjlzowoxg/bafkreigstewya7254mpk4fmvodpmfrqtbxmupztdeman6kuatl4v5walze@jpeg',
                          associated: { chat: { allowIncoming: 'following' } },
                          viewer: {
                            muted: false,
                            blockedBy: false,
                            following:
                              'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.graph.follow/3kqtnbuevx62y',
                          },
                          labels: [],
                          createdAt: '2024-02-06T17:28:31.293Z',
                        },
                        value: {
                          $type: 'app.bsky.feed.post',
                          createdAt: '2024-04-02T14:39:05.466Z',
                          embed: {
                            $type: 'app.bsky.embed.external',
                            external: {
                              description:
                                'Quite the opposite. Artificial intelligence devours vast energy while clouding the human wisdom that might save us.',
                              thumb: {
                                $type: 'blob',
                                ref: {
                                  $link:
                                    'bafkreigatm2o7kxlkjsjvku4mbt65j7lvhcgbqouutz5nnbo4kx6fc2jvu',
                                },
                                mimeType: 'image/jpeg',
                                size: 360879,
                              },
                              title:
                                'No, AI Won’t Outsmart Our Climate Calamity | The Tyee',
                              uri: 'https://thetyee.ca/Analysis/2024/04/01/No-AI-Outsmart-Climate-Calamity/?utm_source=bluesky&utm_medium=social&utm_campaign=editorial',
                            },
                          },
                          langs: ['en'],
                          text: 'AI holds the “transformational potential” to fix our climate emergency, said the World Economic Forum.\n\nBy now we should know not to be taken in by the latest manifestation of what Jacques Ellul called “the technological bluff.”\n\nAndrew Nikiforuk writes.',
                        },
                        labels: [],
                        likeCount: 4,
                        replyCount: 1,
                        repostCount: 2,
                        quoteCount: 1,
                        indexedAt: '2024-04-02T14:39:05.466Z',
                        embeds: [
                          {
                            $type: 'app.bsky.embed.external#view',
                            external: {
                              uri: 'https://thetyee.ca/Analysis/2024/04/01/No-AI-Outsmart-Climate-Calamity/?utm_source=bluesky&utm_medium=social&utm_campaign=editorial',
                              title:
                                'No, AI Won’t Outsmart Our Climate Calamity | The Tyee',
                              description:
                                'Quite the opposite. Artificial intelligence devours vast energy while clouding the human wisdom that might save us.',
                              thumb:
                                'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:ormie3tjweyhnqckjlzowoxg/bafkreigatm2o7kxlkjsjvku4mbt65j7lvhcgbqouutz5nnbo4kx6fc2jvu@jpeg',
                            },
                          },
                        ],
                      },
                    },
                    replyCount: 0,
                    repostCount: 0,
                    likeCount: 0,
                    quoteCount: 0,
                    indexedAt: '2024-04-24T05:10:18.027Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                ],
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: { chat: { allowIncoming: 'following' } },
                  viewer: { muted: false, blockedBy: false },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
              },
            },
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kq6zqihlke2h',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1713210594231,
              post: {
                thread_id:
                  'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kq6zqihlke2h',
                posts: [
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kq6zqihlke2h',
                    cid: 'bafyreicvc36y5i4w42vfbbu3xxo7ipec42hxwoondov3seowp5ovp4kfvi',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-04-15T19:49:54.231Z',
                      embed: {
                        $type: 'app.bsky.embed.images',
                        images: [
                          {
                            alt: 'Fresh cut cabbage in a jar and black tea and scoby in another',
                            aspectRatio: { height: 1500, width: 2000 },
                            image: {
                              $type: 'blob',
                              ref: {
                                $link:
                                  'bafkreibju6sfm3alpetuusbenewdevoze6rdpvhpa2e6eifulcldbbr2dm',
                              },
                              mimeType: 'image/jpeg',
                              size: 959441,
                            },
                          },
                        ],
                      },
                      facets: [
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#tag',
                              tag: 'sillynames',
                            },
                          ],
                          index: { byteEnd: 44, byteStart: 33 },
                        },
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#tag',
                              tag: 'fermentation',
                            },
                          ],
                          index: { byteEnd: 227, byteStart: 214 },
                        },
                      ],
                      langs: ['en'],
                      text: 'I’d love to hear ppls silliest #sillynames for things. \nSauerkraut = stinky toilet crunch (it’s quite odorous, especially when it’s fermenting)\nKombucha = mushroom brain fizz (the SCOBY kinda freaks ppl out)\n#fermentation',
                    },
                    embed: {
                      $type: 'app.bsky.embed.images#view',
                      images: [
                        {
                          thumb:
                            'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreibju6sfm3alpetuusbenewdevoze6rdpvhpa2e6eifulcldbbr2dm@jpeg',
                          fullsize:
                            'https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreibju6sfm3alpetuusbenewdevoze6rdpvhpa2e6eifulcldbbr2dm@jpeg',
                          alt: 'Fresh cut cabbage in a jar and black tea and scoby in another',
                          aspectRatio: { height: 1500, width: 2000 },
                        },
                      ],
                    },
                    replyCount: 0,
                    repostCount: 0,
                    likeCount: 1,
                    quoteCount: 0,
                    indexedAt: '2024-04-15T19:49:54.231Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                ],
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: { chat: { allowIncoming: 'following' } },
                  viewer: { muted: false, blockedBy: false },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
              },
            },
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kq6yh5tvmp24',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1713209207370,
              post: {
                thread_id:
                  'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kq6yh5tvmp24',
                posts: [
                  {
                    uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3kq6yh5tvmp24',
                    cid: 'bafyreiak4gwompk4mqw5rudfghhekbgea7dfud6akhup44bbcrbtkfkqja',
                    author: {
                      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                      handle: 'weswalla.bsky.social',
                      displayName: 'Wesley Finck',
                      avatar:
                        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                      associated: { chat: { allowIncoming: 'following' } },
                      viewer: { muted: false, blockedBy: false },
                      labels: [],
                      createdAt: '2024-02-08T00:14:23.947Z',
                    },
                    record: {
                      $type: 'app.bsky.feed.post',
                      createdAt: '2024-04-15T19:26:47.370Z',
                      embed: {
                        $type: 'app.bsky.embed.external',
                        external: {
                          description:
                            'A recap of the April 2024 Vancouver Hack Day at Z Space. Learn, Code, Share!',
                          thumb: {
                            $type: 'blob',
                            ref: {
                              $link:
                                'bafkreidv5js5lewobotp7lusjogebneyfswjj34hxng25culn6xx5khqtq',
                            },
                            mimeType: 'image/jpeg',
                            size: 276022,
                          },
                          title: 'April 2024 Vancouver Hack Day Recap',
                          uri: 'https://writing.dwebyvr.org/april-2024-vancouver-hack-day-recap/',
                        },
                      },
                      facets: [
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#tag',
                              tag: 'DWebYVR',
                            },
                          ],
                          index: { byteEnd: 8, byteStart: 0 },
                        },
                        {
                          features: [
                            {
                              $type: 'app.bsky.richtext.facet#link',
                              uri: 'https://writing.dwebyvr.org/april-2024-vancouver-hack-day-recap/',
                            },
                          ],
                          index: { byteEnd: 199, byteStart: 164 },
                        },
                      ],
                      langs: ['en'],
                      text: "#DWebYVR recently wrapped up its first ever Hack Day. Here's an overview of the event for those that missed it, including invitations to help us organize the next: writing.dwebyvr.org/april-2024-v...",
                    },
                    embed: {
                      $type: 'app.bsky.embed.external#view',
                      external: {
                        uri: 'https://writing.dwebyvr.org/april-2024-vancouver-hack-day-recap/',
                        title: 'April 2024 Vancouver Hack Day Recap',
                        description:
                          'A recap of the April 2024 Vancouver Hack Day at Z Space. Learn, Code, Share!',
                        thumb:
                          'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreidv5js5lewobotp7lusjogebneyfswjj34hxng25culn6xx5khqtq@jpeg',
                      },
                    },
                    replyCount: 0,
                    repostCount: 0,
                    likeCount: 0,
                    quoteCount: 0,
                    indexedAt: '2024-04-15T19:26:47.370Z',
                    viewer: { threadMuted: false, embeddingDisabled: false },
                    labels: [],
                  },
                ],
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: { chat: { allowIncoming: 'following' } },
                  viewer: { muted: false, blockedBy: false },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
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
          post_id:
            'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
          user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
          timestampMs: 1727204998385,
          post: {
            thread_id:
              'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
            posts: [
              {
                uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
                cid: 'bafyreig7foqn2iwo2mql5f5on4sglow6vwzlvfxq4ajtm2mlpnrmpzfrhe',
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: { chat: { allowIncoming: 'following' } },
                  viewer: { muted: false, blockedBy: false },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
                record: {
                  $type: 'app.bsky.feed.post',
                  createdAt: '2024-09-24T19:09:58.385Z',
                  embed: {
                    $type: 'app.bsky.embed.external',
                    external: {
                      description: '',
                      title: 'The Theory',
                      uri: 'https://selfdeterminationtheory.org/the-theory/',
                    },
                  },
                  facets: [
                    {
                      features: [
                        {
                          $type: 'app.bsky.richtext.facet#link',
                          uri: 'https://selfdeterminationtheory.org/the-theory/',
                        },
                      ],
                      index: { byteEnd: 165, byteStart: 126 },
                    },
                  ],
                  langs: ['en'],
                  text: "self determination theory is one of the most compelling theories about human behaviour and development that I've come across. selfdeterminationtheory.org/the-theory/",
                },
                embed: {
                  $type: 'app.bsky.embed.external#view',
                  external: {
                    uri: 'https://selfdeterminationtheory.org/the-theory/',
                    title: 'The Theory',
                    description: '',
                  },
                },
                replyCount: 2,
                repostCount: 0,
                likeCount: 0,
                quoteCount: 0,
                indexedAt: '2024-09-24T19:09:58.385Z',
                viewer: { threadMuted: false, embeddingDisabled: false },
                labels: [],
              },
              {
                uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd52krts24',
                cid: 'bafyreiesiupjfvjgezjj2mnyh7bbdzztqkn7gu2bgpgpipz7d5h7j7s7ym',
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: { chat: { allowIncoming: 'following' } },
                  viewer: { muted: false, blockedBy: false },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
                record: {
                  $type: 'app.bsky.feed.post',
                  createdAt: '2024-09-24T19:11:33.132Z',
                  embed: {
                    $type: 'app.bsky.embed.external',
                    external: {
                      description: '',
                      title: 'ResearchA677CD6C-FAD9-4CF3-9640-8768D4149A42',
                      uri: 'https://selfdeterminationtheory.org/research/',
                    },
                  },
                  facets: [
                    {
                      features: [
                        {
                          $type: 'app.bsky.richtext.facet#link',
                          uri: 'https://selfdeterminationtheory.org/research/',
                        },
                      ],
                      index: { byteEnd: 160, byteStart: 123 },
                    },
                  ],
                  langs: ['en'],
                  reply: {
                    parent: {
                      cid: 'bafyreig7foqn2iwo2mql5f5on4sglow6vwzlvfxq4ajtm2mlpnrmpzfrhe',
                      uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
                    },
                    root: {
                      cid: 'bafyreig7foqn2iwo2mql5f5on4sglow6vwzlvfxq4ajtm2mlpnrmpzfrhe',
                      uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
                    },
                  },
                  text: 'SDT scholars are quite prolific and the body of research is ever growing (surprising amount of Canadian scholars actually) selfdeterminationtheory.org/research/',
                },
                embed: {
                  $type: 'app.bsky.embed.external#view',
                  external: {
                    uri: 'https://selfdeterminationtheory.org/research/',
                    title: 'ResearchA677CD6C-FAD9-4CF3-9640-8768D4149A42',
                    description: '',
                  },
                },
                replyCount: 2,
                repostCount: 0,
                likeCount: 0,
                quoteCount: 0,
                indexedAt: '2024-09-24T19:11:33.132Z',
                viewer: { threadMuted: false, embeddingDisabled: false },
                labels: [],
              },
              {
                uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdaif3va2h',
                cid: 'bafyreifxy4hvz6id34zajalsc23s33s73gw3eyxbc7kwjgbi6yvcpmthoy',
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: { chat: { allowIncoming: 'following' } },
                  viewer: { muted: false, blockedBy: false },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
                record: {
                  $type: 'app.bsky.feed.post',
                  createdAt: '2024-09-24T19:13:28.290Z',
                  embed: {
                    $type: 'app.bsky.embed.external',
                    external: {
                      description:
                        'Semantic Scholar profile for Richard M. Ryan, with 27513 highly influential citations and 499 scientific research papers.',
                      thumb: {
                        $type: 'blob',
                        ref: {
                          $link:
                            'bafkreifluh6qlba467xstgk5lc5uykjszcnzpidkikctaedsiwkqqwgsym',
                        },
                        mimeType: 'image/jpeg',
                        size: 335354,
                      },
                      title: 'Richard M. Ryan | Semantic Scholar',
                      uri: 'https://www.semanticscholar.org/author/Richard-M.-Ryan/2242812951',
                    },
                  },
                  facets: [
                    {
                      features: [
                        {
                          $type: 'app.bsky.richtext.facet#link',
                          uri: 'https://www.semanticscholar.org/author/Richard-M.-Ryan/2242812951',
                        },
                      ],
                      index: { byteEnd: 118, byteStart: 79 },
                    },
                  ],
                  langs: ['en'],
                  reply: {
                    parent: {
                      cid: 'bafyreiesiupjfvjgezjj2mnyh7bbdzztqkn7gu2bgpgpipz7d5h7j7s7ym',
                      uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd52krts24',
                    },
                    root: {
                      cid: 'bafyreig7foqn2iwo2mql5f5on4sglow6vwzlvfxq4ajtm2mlpnrmpzfrhe',
                      uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
                    },
                  },
                  text: 'one of the creators of the theory is one of the most cited academics I know of www.semanticscholar.org/author/Richa...',
                },
                embed: {
                  $type: 'app.bsky.embed.external#view',
                  external: {
                    uri: 'https://www.semanticscholar.org/author/Richard-M.-Ryan/2242812951',
                    title: 'Richard M. Ryan | Semantic Scholar',
                    description:
                      'Semantic Scholar profile for Richard M. Ryan, with 27513 highly influential citations and 499 scientific research papers.',
                    thumb:
                      'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreifluh6qlba467xstgk5lc5uykjszcnzpidkikctaedsiwkqqwgsym@jpeg',
                  },
                },
                replyCount: 1,
                repostCount: 0,
                likeCount: 0,
                quoteCount: 0,
                indexedAt: '2024-09-24T19:13:28.290Z',
                viewer: { threadMuted: false, embeddingDisabled: false },
                labels: [],
              },
              {
                uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdcb3w322z',
                cid: 'bafyreicw53trheykcocuhdwvhbdkejsb6pmaiwcrzimruv32n2jericleu',
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: { chat: { allowIncoming: 'following' } },
                  viewer: { muted: false, blockedBy: false },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
                record: {
                  $type: 'app.bsky.feed.post',
                  createdAt: '2024-09-24T19:14:27.758Z',
                  embed: {
                    $type: 'app.bsky.embed.external',
                    external: {
                      description: 'YouTube video by Happiness & Its Causes',
                      thumb: {
                        $type: 'blob',
                        ref: {
                          $link:
                            'bafkreicicwvgjhubi7qhtjkfpc552bd5prs5e7oabud4ppx5ls243fhkdq',
                        },
                        mimeType: 'image/jpeg',
                        size: 209528,
                      },
                      title:
                        'MOTIVATION & LIFESTYLE with Richard Ryan at Happiness & Its Causes 2017',
                      uri: 'https://www.youtube.com/watch?v=wzN10--mNw8&t=175s',
                    },
                  },
                  facets: [
                    {
                      features: [
                        {
                          $type: 'app.bsky.richtext.facet#link',
                          uri: 'https://www.youtube.com/watch?v=wzN10--mNw8&t=175s',
                        },
                      ],
                      index: { byteEnd: 69, byteStart: 38 },
                    },
                  ],
                  langs: ['en'],
                  reply: {
                    parent: {
                      cid: 'bafyreifxy4hvz6id34zajalsc23s33s73gw3eyxbc7kwjgbi6yvcpmthoy',
                      uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdaif3va2h',
                    },
                    root: {
                      cid: 'bafyreig7foqn2iwo2mql5f5on4sglow6vwzlvfxq4ajtm2mlpnrmpzfrhe',
                      uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
                    },
                  },
                  text: "Here's a short overview of the theory www.youtube.com/watch?v=wzN1...",
                },
                embed: {
                  $type: 'app.bsky.embed.external#view',
                  external: {
                    uri: 'https://www.youtube.com/watch?v=wzN10--mNw8&t=175s',
                    title:
                      'MOTIVATION & LIFESTYLE with Richard Ryan at Happiness & Its Causes 2017',
                    description: 'YouTube video by Happiness & Its Causes',
                    thumb:
                      'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreicicwvgjhubi7qhtjkfpc552bd5prs5e7oabud4ppx5ls243fhkdq@jpeg',
                  },
                },
                replyCount: 0,
                repostCount: 0,
                likeCount: 0,
                quoteCount: 0,
                indexedAt: '2024-09-24T19:14:27.758Z',
                viewer: { threadMuted: false, embeddingDisabled: false },
                labels: [],
              },
            ],
            author: {
              did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              handle: 'weswalla.bsky.social',
              displayName: 'Wesley Finck',
              avatar:
                'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
              associated: { chat: { allowIncoming: 'following' } },
              viewer: { muted: false, blockedBy: false },
              labels: [],
              createdAt: '2024-02-08T00:14:23.947Z',
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
        params?: BlueskyGetContextParams
      ): BlueskySignupContext => {
        return {};
      }
    );
    when(mocked.handleSignupData(anything())).thenCall(
      (data: BlueskySignupData) => {
        const accountDetails = {
          user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
          signupDate: 1725473415250,
          credentials: {
            read: {
              username: 'sensenetsbot.bsky.social',
              appPassword: '2134-1234-1234-1234',
            },
          },
        };
        const profile: AccountProfileCreate = {
          platformId: PLATFORM.Bluesky,
          user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
          profile: {
            id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
            username: 'weswalla.bsky.social',
            displayName: 'Wesley Finck',
            avatar:
              'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
            description: 'I am a bot',
          },
        };

        return { accountDetails, profile };
      }
    );
  }

  return instance(mocked);
};
