import { BlueskyThread } from '../../src/@shared/types/types.bluesky';
import { MastodonThread } from '../../src/@shared/types/types.mastodon';
import { PlatformPostPosted } from '../../src/@shared/types/types.platform.posts';
import { TwitterThread } from '../../src/@shared/types/types.twitter';

export const rootBlueskyThread: PlatformPostPosted<BlueskyThread> = {
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
        replyCount: 2,
        repostCount: 0,
        likeCount: 0,
        quoteCount: 0,
        indexedAt: '2024-09-24T19:11:33.132Z',
        viewer: { threadMuted: false, embeddingDisabled: false },
        labels: [],
      },
    ],
    author: {
      id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
      username: 'weswalla.bsky.social',
      displayName: 'Wesley Finck',
      avatar:
        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
    },
  },
};

export const brokenBlueskyThreadWithRoot: PlatformPostPosted<BlueskyThread> = {
  post_id:
    'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
  user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
  timestampMs: 1727205208000,
  post: {
    thread_id:
      'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
    posts: [
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
      id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
      username: 'weswalla.bsky.social',
      displayName: 'Wesley Finck',
      avatar:
        'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
    },
  },
};

export const brokenBlueskyThreadWithoutRoot: PlatformPostPosted<BlueskyThread> =
  {
    post_id: 'at://did:plc:tg3sdfq345234fdft/app.bsky.feed.post/123fasdf45',
    user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
    timestampMs: 1727205208000,
    post: {
      thread_id: 'at://did:plc:tg3sdfq345234fdft/app.bsky.feed.post/123fasdf45',
      posts: [
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
        id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
        username: 'weswalla.bsky.social',
        displayName: 'Wesley Finck',
        avatar:
          'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
      },
    },
  };

export const brokenBlueskyThreadWithRootNotPartOfMain: PlatformPostPosted<BlueskyThread> =
  {
    post_id:
      'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
    user_id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
    timestampMs: 1727205208000,
    post: {
      thread_id:
        'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
      posts: [
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
                uri: 'at://did:plc:1234asdfer4123ds/app.bsky.feed.post/7348fsaj4fd',
              },
              root: {
                cid: 'bafyreig7foqn2iwo2mql5f5on4sglow6vwzlvfxq4ajtm2mlpnrmpzfrhe',
                uri: 'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
              },
            },
            text: 'one of the creators of the theory is one of the most cited academics I know of www.semanticscholar.org/author/Richa...',
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
        id: 'did:plc:6z5botgrc5vekq7j26xnvawq',
        username: 'weswalla.bsky.social',
        displayName: 'Wesley Finck',
        avatar:
          'https://cdn.bsky.app/img/avatar/plain/did:plc:6z5botgrc5vekq7j26xnvawq/bafkreig3weniwt64x5rmau77bgqmpo26p6qy4tusdzfccreun44nvuaczq@jpeg',
      },
    },
  };

export const rootTwitterThread: PlatformPostPosted<TwitterThread> = {
  post_id: '1234',
  user_id: '12345678',
  timestampMs: 1727204998385,
  post: {
    conversation_id: '1234',
    tweets: [
      {
        text: 'this is a thread about something.',
        id: '1234',
        created_at: '2025-01-09T05:01:52.000Z',
        conversation_id: '1234',
        edit_history_tweet_ids: ['1877219467173761329'],
        author_id: '12345678',
      },
      {
        referenced_tweets: [
          {
            type: 'replied_to',
            id: '1234',
          },
        ],
        text: 'A Luddite is not anti-progress. They just have a different conception of what progress means',
        id: '1235',
        created_at: '2025-01-09T05:02:52.000Z',
        conversation_id: '1234',
        edit_history_tweet_ids: ['1877219467173761329'],
        author_id: '12345678',
      },
    ],
    author: {
      id: '12345678',
      username: 'wesleyfinck',
      name: 'Wesley Finck',
    },
  },
};

export const brokenTwitterThreadWithRoot: PlatformPostPosted<TwitterThread> = {
  post_id: '1234',
  user_id: '12345678',
  timestampMs: 1727204998390,
  post: {
    conversation_id: '1234',
    tweets: [
      {
        text: 'this is the 3rd post in a thread',
        id: '1236',
        created_at: '2025-01-09T05:03:52.000Z',
        conversation_id: '1234',
        edit_history_tweet_ids: ['1877219467173761329'],
        author_id: '12345678',
        referenced_tweets: [
          {
            type: 'replied_to',
            id: '1235',
          },
        ],
      },
      {
        text: 'this is the 4rd post in a thread',
        id: '1237',
        created_at: '2025-01-09T05:04:52.000Z',
        conversation_id: '1234',
        edit_history_tweet_ids: ['1877219467173761329'],
        author_id: '12345678',
        referenced_tweets: [
          {
            type: 'replied_to',
            id: '1236',
          },
        ],
      },
    ],
    author: {
      id: '12345678',
      username: 'wesleyfinck',
      name: 'Wesley Finck',
    },
  },
};

export const brokenTwitterThreadWithoutRoot: PlatformPostPosted<TwitterThread> =
  {
    post_id: '5678',
    user_id: '12345678',
    timestampMs: 1727204998390,
    post: {
      conversation_id: '5678',
      tweets: [
        {
          text: 'this is the 3rd post in a thread',
          id: '5679',
          created_at: '2025-01-09T05:03:52.000Z',
          conversation_id: '1234',
          edit_history_tweet_ids: ['1877219467173761329'],
          author_id: '12345678',
          referenced_tweets: [
            {
              type: 'replied_to',
              id: '5677',
            },
          ],
        },
        {
          text: 'this is the 4rd post in a thread',
          id: '5680',
          created_at: '2025-01-09T05:04:52.000Z',
          conversation_id: '1234',
          edit_history_tweet_ids: ['1877219467173761329'],
          author_id: '12345678',
          referenced_tweets: [
            {
              type: 'replied_to',
              id: '5679',
            },
          ],
        },
      ],
      author: {
        id: '12345678',
        username: 'wesleyfinck',
        name: 'Wesley Finck',
      },
    },
  };

export const brokenTwitterThreadWithRootNotPartOfMain: PlatformPostPosted<TwitterThread> =
  {
    post_id: '1234',
    user_id: '12345678',
    timestampMs: 1727204998390,
    post: {
      conversation_id: '1234',
      tweets: [
        {
          text: 'this is the 3rd post in a thread',
          id: '1236',
          created_at: '2025-01-09T05:03:52.000Z',
          conversation_id: '1234',
          edit_history_tweet_ids: ['1877219467173761329'],
          author_id: '12345678',
          referenced_tweets: [
            {
              type: 'replied_to',
              id: '1234',
            },
          ],
        },
        {
          text: 'this is the 4rd post in a thread',
          id: '1237',
          created_at: '2025-01-09T05:04:52.000Z',
          conversation_id: '1234',
          edit_history_tweet_ids: ['1877219467173761329'],
          author_id: '12345678',
          referenced_tweets: [
            {
              type: 'replied_to',
              id: '1236',
            },
          ],
        },
      ],
      author: {
        id: '12345678',
        username: 'wesleyfinck',
        name: 'Wesley Finck',
      },
    },
  };

export const rootMastodonThread: PlatformPostPosted<MastodonThread> = {
  post_id: 'https://cosocial.ca/users/weswalla/statuses/1234',
  user_id: '12345678',
  timestampMs: 1727204998385,
  post: {
    thread_id: 'https://cosocial.ca/users/weswalla/statuses/1234',
    posts: [
      {
        id: '1234',
        createdAt: '2024-09-06T17:50:01.761Z',
        sensitive: false,
        spoilerText: '',
        visibility: 'public',
        language: 'en',
        uri: 'https://cosocial.ca/users/weswalla/statuses/1234',
        url: 'https://cosocial.ca/@weswalla/113091870835600081',
        repliesCount: 0,
        reblogsCount: 0,
        favouritesCount: 0,
        editedAt: null,
        favourited: false,
        reblogged: false,
        muted: false,
        bookmarked: false,
        pinned: false,
        content: 'this is the root post',
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
          avatar:
            'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
          avatarStatic:
            'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
          header: 'https://cosocial.ca/headers/original/missing.png',
          headerStatic: 'https://cosocial.ca/headers/original/missing.png',
          followersCount: 11,
          followingCount: 18,
          statusesCount: 16,
          lastStatusAt: '2024-09-06',
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
          url: 'https://intlekt.io/ieml/',
          title: 'IEML: The Information Economy MetaLanguage',
          description:
            'IEML is an acronym for Information Economy MetaLanguage. IEML is intended to become a standard for expressing semantic metadata and for modelling complex human systems. Here is the definitive scien…',
          language: 'fr',
          type: 'link',
          authorName: '',
          authorUrl: '',
          providerName: '',
          providerUrl: '',
          html: '',
          width: 660,
          height: 470,
          image:
            'https://media.cosocial.ca/cache/preview_cards/images/004/249/068/original/38fc386635c33386.jpg',
          embedUrl: '',
          blurhash: 'U73K1[fkROayq?fQbFf6affQaxfkf5f6fQfk',
        },
        poll: null,
      },
      {
        id: '1235',
        inReplyToId: '1234',
        inReplyToAccountId: '111971425782516559',
        createdAt: '2024-09-06T17:50:01.761Z',
        sensitive: false,
        spoilerText: '',
        visibility: 'public',
        language: 'en',
        uri: 'https://cosocial.ca/users/weswalla/statuses/1235',
        url: 'https://cosocial.ca/@weswalla/113091870835600081',
        repliesCount: 0,
        reblogsCount: 0,
        favouritesCount: 0,
        editedAt: null,
        favourited: false,
        reblogged: false,
        muted: false,
        bookmarked: false,
        pinned: false,
        content: '2nd post in thread',
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
          avatar:
            'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
          avatarStatic:
            'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
          header: 'https://cosocial.ca/headers/original/missing.png',
          headerStatic: 'https://cosocial.ca/headers/original/missing.png',
          followersCount: 11,
          followingCount: 18,
          statusesCount: 16,
          lastStatusAt: '2024-09-06',
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
          url: 'https://intlekt.io/ieml/',
          title: 'IEML: The Information Economy MetaLanguage',
          description:
            'IEML is an acronym for Information Economy MetaLanguage. IEML is intended to become a standard for expressing semantic metadata and for modelling complex human systems. Here is the definitive scien…',
          language: 'fr',
          type: 'link',
          authorName: '',
          authorUrl: '',
          providerName: '',
          providerUrl: '',
          html: '',
          width: 660,
          height: 470,
          image:
            'https://media.cosocial.ca/cache/preview_cards/images/004/249/068/original/38fc386635c33386.jpg',
          embedUrl: '',
          blurhash: 'U73K1[fkROayq?fQbFf6affQaxfkf5f6fQfk',
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
      avatar:
        'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
      avatarStatic:
        'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
      header: 'https://cosocial.ca/headers/original/missing.png',
      headerStatic: 'https://cosocial.ca/headers/original/missing.png',
      followersCount: 11,
      followingCount: 18,
      statusesCount: 16,
      lastStatusAt: '2024-09-06',
      noindex: false,
      emojis: [],
      roles: [],
      fields: [],
    },
  },
};

export const brokenMastodonThreadWithRoot: PlatformPostPosted<MastodonThread> =
  {
    post_id: 'https://cosocial.ca/users/weswalla/statuses/1234',
    user_id: '12345678',
    timestampMs: 1727204998385,
    post: {
      thread_id: 'https://cosocial.ca/users/weswalla/statuses/1234',
      posts: [
        {
          id: '1236',
          inReplyToId: '1235',
          inReplyToAccountId: '111971425782516559',
          createdAt: '2024-09-06T17:50:01.761Z',
          sensitive: false,
          spoilerText: '',
          visibility: 'public',
          language: 'en',
          uri: 'https://cosocial.ca/users/weswalla/statuses/1236',
          url: 'https://cosocial.ca/@weswalla/113091870835600081',
          repliesCount: 0,
          reblogsCount: 0,
          favouritesCount: 0,
          editedAt: null,
          favourited: false,
          reblogged: false,
          muted: false,
          bookmarked: false,
          pinned: false,
          content: 'this is the root post',
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
            avatar:
              'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
            avatarStatic:
              'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
            header: 'https://cosocial.ca/headers/original/missing.png',
            headerStatic: 'https://cosocial.ca/headers/original/missing.png',
            followersCount: 11,
            followingCount: 18,
            statusesCount: 16,
            lastStatusAt: '2024-09-06',
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
            url: 'https://intlekt.io/ieml/',
            title: 'IEML: The Information Economy MetaLanguage',
            description:
              'IEML is an acronym for Information Economy MetaLanguage. IEML is intended to become a standard for expressing semantic metadata and for modelling complex human systems. Here is the definitive scien…',
            language: 'fr',
            type: 'link',
            authorName: '',
            authorUrl: '',
            providerName: '',
            providerUrl: '',
            html: '',
            width: 660,
            height: 470,
            image:
              'https://media.cosocial.ca/cache/preview_cards/images/004/249/068/original/38fc386635c33386.jpg',
            embedUrl: '',
            blurhash: 'U73K1[fkROayq?fQbFf6affQaxfkf5f6fQfk',
          },
          poll: null,
        },
        {
          id: '1237',
          inReplyToId: '1236',
          inReplyToAccountId: '111971425782516559',
          createdAt: '2024-09-06T17:50:01.761Z',
          sensitive: false,
          spoilerText: '',
          visibility: 'public',
          language: 'en',
          uri: 'https://cosocial.ca/users/weswalla/statuses/1237',
          url: 'https://cosocial.ca/@weswalla/113091870835600081',
          repliesCount: 0,
          reblogsCount: 0,
          favouritesCount: 0,
          editedAt: null,
          favourited: false,
          reblogged: false,
          muted: false,
          bookmarked: false,
          pinned: false,
          content: '2nd post in thread',
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
            avatar:
              'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
            avatarStatic:
              'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
            header: 'https://cosocial.ca/headers/original/missing.png',
            headerStatic: 'https://cosocial.ca/headers/original/missing.png',
            followersCount: 11,
            followingCount: 18,
            statusesCount: 16,
            lastStatusAt: '2024-09-06',
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
            url: 'https://intlekt.io/ieml/',
            title: 'IEML: The Information Economy MetaLanguage',
            description:
              'IEML is an acronym for Information Economy MetaLanguage. IEML is intended to become a standard for expressing semantic metadata and for modelling complex human systems. Here is the definitive scien…',
            language: 'fr',
            type: 'link',
            authorName: '',
            authorUrl: '',
            providerName: '',
            providerUrl: '',
            html: '',
            width: 660,
            height: 470,
            image:
              'https://media.cosocial.ca/cache/preview_cards/images/004/249/068/original/38fc386635c33386.jpg',
            embedUrl: '',
            blurhash: 'U73K1[fkROayq?fQbFf6affQaxfkf5f6fQfk',
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
        avatar:
          'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
        avatarStatic:
          'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
        header: 'https://cosocial.ca/headers/original/missing.png',
        headerStatic: 'https://cosocial.ca/headers/original/missing.png',
        followersCount: 11,
        followingCount: 18,
        statusesCount: 16,
        lastStatusAt: '2024-09-06',
        noindex: false,
        emojis: [],
        roles: [],
        fields: [],
      },
    },
  };

export const brokenMastodonThreadWithoutRoot: PlatformPostPosted<MastodonThread> =
  {
    post_id: 'https://cosocial.ca/users/weswalla/statuses/1230',
    user_id: '12345678',
    timestampMs: 1727204998385,
    post: {
      thread_id: 'https://cosocial.ca/users/weswalla/statuses/1230',
      posts: [
        {
          id: '1236',
          inReplyToId: '1235',
          inReplyToAccountId: '111971425782516559',
          createdAt: '2024-09-06T17:50:01.761Z',
          sensitive: false,
          spoilerText: '',
          visibility: 'public',
          language: 'en',
          uri: 'https://cosocial.ca/users/weswalla/statuses/1236',
          url: 'https://cosocial.ca/@weswalla/113091870835600081',
          repliesCount: 0,
          reblogsCount: 0,
          favouritesCount: 0,
          editedAt: null,
          favourited: false,
          reblogged: false,
          muted: false,
          bookmarked: false,
          pinned: false,
          content: 'this is the root post',
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
            avatar:
              'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
            avatarStatic:
              'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
            header: 'https://cosocial.ca/headers/original/missing.png',
            headerStatic: 'https://cosocial.ca/headers/original/missing.png',
            followersCount: 11,
            followingCount: 18,
            statusesCount: 16,
            lastStatusAt: '2024-09-06',
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
            url: 'https://intlekt.io/ieml/',
            title: 'IEML: The Information Economy MetaLanguage',
            description:
              'IEML is an acronym for Information Economy MetaLanguage. IEML is intended to become a standard for expressing semantic metadata and for modelling complex human systems. Here is the definitive scien…',
            language: 'fr',
            type: 'link',
            authorName: '',
            authorUrl: '',
            providerName: '',
            providerUrl: '',
            html: '',
            width: 660,
            height: 470,
            image:
              'https://media.cosocial.ca/cache/preview_cards/images/004/249/068/original/38fc386635c33386.jpg',
            embedUrl: '',
            blurhash: 'U73K1[fkROayq?fQbFf6affQaxfkf5f6fQfk',
          },
          poll: null,
        },
        {
          id: '1237',
          inReplyToId: '1236',
          inReplyToAccountId: '111971425782516559',
          createdAt: '2024-09-06T17:50:01.761Z',
          sensitive: false,
          spoilerText: '',
          visibility: 'public',
          language: 'en',
          uri: 'https://cosocial.ca/users/weswalla/statuses/1237',
          url: 'https://cosocial.ca/@weswalla/113091870835600081',
          repliesCount: 0,
          reblogsCount: 0,
          favouritesCount: 0,
          editedAt: null,
          favourited: false,
          reblogged: false,
          muted: false,
          bookmarked: false,
          pinned: false,
          content: '2nd post in thread',
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
            avatar:
              'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
            avatarStatic:
              'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
            header: 'https://cosocial.ca/headers/original/missing.png',
            headerStatic: 'https://cosocial.ca/headers/original/missing.png',
            followersCount: 11,
            followingCount: 18,
            statusesCount: 16,
            lastStatusAt: '2024-09-06',
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
            url: 'https://intlekt.io/ieml/',
            title: 'IEML: The Information Economy MetaLanguage',
            description:
              'IEML is an acronym for Information Economy MetaLanguage. IEML is intended to become a standard for expressing semantic metadata and for modelling complex human systems. Here is the definitive scien…',
            language: 'fr',
            type: 'link',
            authorName: '',
            authorUrl: '',
            providerName: '',
            providerUrl: '',
            html: '',
            width: 660,
            height: 470,
            image:
              'https://media.cosocial.ca/cache/preview_cards/images/004/249/068/original/38fc386635c33386.jpg',
            embedUrl: '',
            blurhash: 'U73K1[fkROayq?fQbFf6affQaxfkf5f6fQfk',
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
        avatar:
          'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
        avatarStatic:
          'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
        header: 'https://cosocial.ca/headers/original/missing.png',
        headerStatic: 'https://cosocial.ca/headers/original/missing.png',
        followersCount: 11,
        followingCount: 18,
        statusesCount: 16,
        lastStatusAt: '2024-09-06',
        noindex: false,
        emojis: [],
        roles: [],
        fields: [],
      },
    },
  };

export const brokenMastodonThreadWithRootNotPartOfMain: PlatformPostPosted<MastodonThread> =
  {
    post_id: 'https://cosocial.ca/users/weswalla/statuses/1234',
    user_id: '12345678',
    timestampMs: 1727204998385,
    post: {
      thread_id: 'https://cosocial.ca/users/weswalla/statuses/1234',
      posts: [
        {
          id: '1236',
          inReplyToId: '1234',
          inReplyToAccountId: '111971425782516559',
          createdAt: '2024-09-06T17:50:01.761Z',
          sensitive: false,
          spoilerText: '',
          visibility: 'public',
          language: 'en',
          uri: 'https://cosocial.ca/users/weswalla/statuses/1236',
          url: 'https://cosocial.ca/@weswalla/113091870835600081',
          repliesCount: 0,
          reblogsCount: 0,
          favouritesCount: 0,
          editedAt: null,
          favourited: false,
          reblogged: false,
          muted: false,
          bookmarked: false,
          pinned: false,
          content: 'this is the root post',
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
            avatar:
              'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
            avatarStatic:
              'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
            header: 'https://cosocial.ca/headers/original/missing.png',
            headerStatic: 'https://cosocial.ca/headers/original/missing.png',
            followersCount: 11,
            followingCount: 18,
            statusesCount: 16,
            lastStatusAt: '2024-09-06',
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
            url: 'https://intlekt.io/ieml/',
            title: 'IEML: The Information Economy MetaLanguage',
            description:
              'IEML is an acronym for Information Economy MetaLanguage. IEML is intended to become a standard for expressing semantic metadata and for modelling complex human systems. Here is the definitive scien…',
            language: 'fr',
            type: 'link',
            authorName: '',
            authorUrl: '',
            providerName: '',
            providerUrl: '',
            html: '',
            width: 660,
            height: 470,
            image:
              'https://media.cosocial.ca/cache/preview_cards/images/004/249/068/original/38fc386635c33386.jpg',
            embedUrl: '',
            blurhash: 'U73K1[fkROayq?fQbFf6affQaxfkf5f6fQfk',
          },
          poll: null,
        },
        {
          id: '1237',
          inReplyToId: '1236',
          inReplyToAccountId: '111971425782516559',
          createdAt: '2024-09-06T17:50:01.761Z',
          sensitive: false,
          spoilerText: '',
          visibility: 'public',
          language: 'en',
          uri: 'https://cosocial.ca/users/weswalla/statuses/1237',
          url: 'https://cosocial.ca/@weswalla/113091870835600081',
          repliesCount: 0,
          reblogsCount: 0,
          favouritesCount: 0,
          editedAt: null,
          favourited: false,
          reblogged: false,
          muted: false,
          bookmarked: false,
          pinned: false,
          content: '2nd post in thread',
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
            avatar:
              'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
            avatarStatic:
              'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
            header: 'https://cosocial.ca/headers/original/missing.png',
            headerStatic: 'https://cosocial.ca/headers/original/missing.png',
            followersCount: 11,
            followingCount: 18,
            statusesCount: 16,
            lastStatusAt: '2024-09-06',
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
            url: 'https://intlekt.io/ieml/',
            title: 'IEML: The Information Economy MetaLanguage',
            description:
              'IEML is an acronym for Information Economy MetaLanguage. IEML is intended to become a standard for expressing semantic metadata and for modelling complex human systems. Here is the definitive scien…',
            language: 'fr',
            type: 'link',
            authorName: '',
            authorUrl: '',
            providerName: '',
            providerUrl: '',
            html: '',
            width: 660,
            height: 470,
            image:
              'https://media.cosocial.ca/cache/preview_cards/images/004/249/068/original/38fc386635c33386.jpg',
            embedUrl: '',
            blurhash: 'U73K1[fkROayq?fQbFf6affQaxfkf5f6fQfk',
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
        avatar:
          'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
        avatarStatic:
          'https://media.cosocial.ca/accounts/avatars/111/971/425/782/516/559/original/963c30efd081957e.jpeg',
        header: 'https://cosocial.ca/headers/original/missing.png',
        headerStatic: 'https://cosocial.ca/headers/original/missing.png',
        followersCount: 11,
        followingCount: 18,
        statusesCount: 16,
        lastStatusAt: '2024-09-06',
        noindex: false,
        emojis: [],
        roles: [],
        fields: [],
      },
    },
  };
