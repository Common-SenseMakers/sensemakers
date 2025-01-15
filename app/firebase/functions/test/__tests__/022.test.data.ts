import { BlueskyThread } from '../../src/@shared/types/types.bluesky';
import { PlatformPostPosted } from '../../src/@shared/types/types.platform.posts';

export const initialPlatformPost: PlatformPostPosted<BlueskyThread> = {
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

export const brokenThreadPlatformPost: PlatformPostPosted<BlueskyThread> = {
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
