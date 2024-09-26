import { anything, instance, spy, when } from 'ts-mockito';

import {
  BlueskyGetContextParams,
  BlueskySignupContext,
  BlueskySignupData,
  BlueskyUserDetails,
} from '../../../@shared/types/types.bluesky';
import { PlatformFetchParams } from '../../../@shared/types/types.fetch';
import { PlatformPostPublish } from '../../../@shared/types/types.platform.posts';
import {
  TestUserCredentials,
  UserDetailsBase,
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
              'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdgnynfq2h',
            oldest_id:
              'at://did:plc:2cxgdrgtsmrbqnjkwyplmp43/app.bsky.feed.post/3l2goevecsb2i',
          },
          platformPosts: [
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdgnynfq2h',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1727205415488,
              post: {
                uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdgnynfq2h',
                cid: 'bafyreibgoiyfpnwyaxg6m4tcl5igns6z3w46ecwivefrv2v2nidlhlwjmi',
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: {
                    chat: {
                      allowIncoming: 'following',
                    },
                  },
                  viewer: {
                    muted: false,
                    blockedBy: false,
                  },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
                record: {
                  $type: 'app.bsky.feed.post',
                  createdAt: '2024-09-24T19:16:55.488Z',
                  embed: {
                    $type: 'app.bsky.embed.external',
                    external: {
                      description: '',
                      title: 'Our Purpose',
                      uri: 'https://selfdeterminationtheory.org/our-purpose/',
                    },
                  },
                  facets: [
                    {
                      features: [
                        {
                          $type: 'app.bsky.richtext.facet#link',
                          uri: 'https://selfdeterminationtheory.org/our-purpose/',
                        },
                      ],
                      index: {
                        byteEnd: 167,
                        byteStart: 127,
                      },
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
                  text: 'the Center for Self Determination Theory is quite active in spreading awareness of the theory and its implications for society selfdeterminationtheory.org/our-purpose/',
                },
                embed: {
                  $type: 'app.bsky.embed.external#view',
                  external: {
                    uri: 'https://selfdeterminationtheory.org/our-purpose/',
                    title: 'Our Purpose',
                    description: '',
                  },
                },
                replyCount: 0,
                repostCount: 0,
                likeCount: 0,
                quoteCount: 0,
                indexedAt: '2024-09-24T19:16:55.488Z',
                viewer: {
                  threadMuted: false,
                  embeddingDisabled: false,
                },
                labels: [],
              },
            },
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wddsabis2h',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1727205319285,
              post: {
                uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wddsabis2h',
                cid: 'bafyreidriq7eovlymtcktggp7v57duuu3bbyyvb3kh7smtc3vgogm4gszu',
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: {
                    chat: {
                      allowIncoming: 'following',
                    },
                  },
                  viewer: {
                    muted: false,
                    blockedBy: false,
                  },
                  labels: [],
                  createdAt: '2024-02-08T00:14:23.947Z',
                },
                record: {
                  $type: 'app.bsky.feed.post',
                  createdAt: '2024-09-24T19:15:19.285Z',
                  embed: {
                    $type: 'app.bsky.embed.external',
                    external: {
                      description: '',
                      title: '',
                      uri: 'https://papyrus.bib.umontreal.ca/xmlui/bitstream/handle/1866/22373/AS%20parenting%202008%20post_public.pdf;jsessionid=E6DD2C1AC199E68F57976AAEFB233B74?sequence=1',
                    },
                  },
                  facets: [
                    {
                      features: [
                        {
                          $type: 'app.bsky.richtext.facet#link',
                          uri: 'https://papyrus.bib.umontreal.ca/xmlui/bitstream/handle/1866/22373/AS%20parenting%202008%20post_public.pdf;jsessionid=E6DD2C1AC199E68F57976AAEFB233B74?sequence=1',
                        },
                      ],
                      index: {
                        byteEnd: 115,
                        byteStart: 75,
                      },
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
                  text: "One area it touches on a lot is parenting, here's a neat paper about that: papyrus.bib.umontreal.ca/xmlui/bitstr...",
                },
                embed: {
                  $type: 'app.bsky.embed.external#view',
                  external: {
                    uri: 'https://papyrus.bib.umontreal.ca/xmlui/bitstream/handle/1866/22373/AS%20parenting%202008%20post_public.pdf;jsessionid=E6DD2C1AC199E68F57976AAEFB233B74?sequence=1',
                    title: '',
                    description: '',
                  },
                },
                replyCount: 0,
                repostCount: 0,
                likeCount: 0,
                quoteCount: 0,
                indexedAt: '2024-09-24T19:15:19.285Z',
                viewer: {
                  threadMuted: false,
                  embeddingDisabled: false,
                },
                labels: [],
              },
            },
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdcb3w322z',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1727205267758,
              post: {
                uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdcb3w322z',
                cid: 'bafyreicw53trheykcocuhdwvhbdkejsb6pmaiwcrzimruv32n2jericleu',
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: {
                    chat: {
                      allowIncoming: 'following',
                    },
                  },
                  viewer: {
                    muted: false,
                    blockedBy: false,
                  },
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
                      index: {
                        byteEnd: 69,
                        byteStart: 38,
                      },
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
                viewer: {
                  threadMuted: false,
                  embeddingDisabled: false,
                },
                labels: [],
              },
            },
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdaif3va2h',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1727205208290,
              post: {
                uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdaif3va2h',
                cid: 'bafyreifxy4hvz6id34zajalsc23s33s73gw3eyxbc7kwjgbi6yvcpmthoy',
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: {
                    chat: {
                      allowIncoming: 'following',
                    },
                  },
                  viewer: {
                    muted: false,
                    blockedBy: false,
                  },
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
                      index: {
                        byteEnd: 118,
                        byteStart: 79,
                      },
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
                viewer: {
                  threadMuted: false,
                  embeddingDisabled: false,
                },
                labels: [],
              },
            },
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd52krts24',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1727205093132,
              post: {
                uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd52krts24',
                cid: 'bafyreiesiupjfvjgezjj2mnyh7bbdzztqkn7gu2bgpgpipz7d5h7j7s7ym',
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: {
                    chat: {
                      allowIncoming: 'following',
                    },
                  },
                  viewer: {
                    muted: false,
                    blockedBy: false,
                  },
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
                      index: {
                        byteEnd: 160,
                        byteStart: 123,
                      },
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
                viewer: {
                  threadMuted: false,
                  embeddingDisabled: false,
                },
                labels: [],
              },
            },
            {
              post_id:
                'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
              user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              timestampMs: 1727204998385,
              post: {
                uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
                cid: 'bafyreig7foqn2iwo2mql5f5on4sglow6vwzlvfxq4ajtm2mlpnrmpzfrhe',
                author: {
                  did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
                  handle: 'weswalla.bsky.social',
                  displayName: 'Wesley Finck',
                  avatar:
                    'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
                  associated: {
                    chat: {
                      allowIncoming: 'following',
                    },
                  },
                  viewer: {
                    muted: false,
                    blockedBy: false,
                  },
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
                      index: {
                        byteEnd: 165,
                        byteStart: 126,
                      },
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
                viewer: {
                  threadMuted: false,
                  embeddingDisabled: false,
                },
                labels: [],
              },
            },
            ,
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
        return {
          post_id:
            'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdgnynfq2h',
          user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
          timestampMs: 1727205415488,
          post: {
            uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdgnynfq2h',
            cid: 'bafyreibgoiyfpnwyaxg6m4tcl5igns6z3w46ecwivefrv2v2nidlhlwjmi',
            author: {
              did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
              handle: 'weswalla.bsky.social',
              displayName: 'Wesley Finck',
              avatar:
                'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
              associated: {
                chat: {
                  allowIncoming: 'following',
                },
              },
              viewer: {
                muted: false,
                blockedBy: false,
              },
              labels: [],
              createdAt: '2024-02-08T00:14:23.947Z',
            },
            record: {
              $type: 'app.bsky.feed.post',
              createdAt: '2024-09-24T19:16:55.488Z',
              embed: {
                $type: 'app.bsky.embed.external',
                external: {
                  description: '',
                  title: 'Our Purpose',
                  uri: 'https://selfdeterminationtheory.org/our-purpose/',
                },
              },
              facets: [
                {
                  features: [
                    {
                      $type: 'app.bsky.richtext.facet#link',
                      uri: 'https://selfdeterminationtheory.org/our-purpose/',
                    },
                  ],
                  index: {
                    byteEnd: 167,
                    byteStart: 127,
                  },
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
              text: 'the Center for Self Determination Theory is quite active in spreading awareness of the theory and its implications for society selfdeterminationtheory.org/our-purpose/',
            },
            embed: {
              $type: 'app.bsky.embed.external#view',
              external: {
                uri: 'https://selfdeterminationtheory.org/our-purpose/',
                title: 'Our Purpose',
                description: '',
              },
            },
            replyCount: 0,
            repostCount: 0,
            likeCount: 0,
            quoteCount: 0,
            indexedAt: '2024-09-24T19:16:55.488Z',
            viewer: {
              threadMuted: false,
              embeddingDisabled: false,
            },
            labels: [],
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
      (data: BlueskySignupData): BlueskyUserDetails => {
        return {
          user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
          signupDate: 1725473415250,
          profile: {
            id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
            username: 'weswalla.bsky.social',
            name: 'Wesley Finck',
            avatar:
              'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
          },
          read: {
            appPassword: '',
          },
        };
      }
    );
  }

  return instance(mocked);
};
