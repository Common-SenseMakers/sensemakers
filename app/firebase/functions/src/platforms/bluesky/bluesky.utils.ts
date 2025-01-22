import AtpAgent, {
  AppBskyEmbedExternal,
  AppBskyFeedPost,
  AtpSessionData,
} from '@atproto/api';
import { Link } from '@atproto/api/dist/client/types/app/bsky/richtext/facet';
import { Firestore } from 'firebase-admin/firestore';

import {
  BLUESKY_REPOST_URI_QUERY,
  BlueskyPost,
  BlueskyThread,
  QuotedBlueskyPost,
} from '../../@shared/types/types.bluesky';
import { PLATFORM } from '../../@shared/types/types.platforms';
import { getConfig } from '../../services.config';

export const convertBlueskyPostsToThreads = (
  posts: BlueskyPost[],
  authorId: string
): BlueskyThread[] => {
  const postThreadsMap = new Map<string, BlueskyPost[]>();

  posts
    .filter((post) => post.author.did === authorId)
    .forEach((post) => {
      const rootId = findRootId(post);
      if (!postThreadsMap.has(rootId)) {
        postThreadsMap.set(rootId, []);
      }
      postThreadsMap.get(rootId)?.push(cleanBlueskyPost(post));
    });

  const postsArrays = Array.from(postThreadsMap.values());

  // Sort threads by the creation timestamp of the root post
  postsArrays.sort(
    (pA, pB) =>
      new Date(pB[0].record.createdAt).getTime() -
      new Date(pA[0].record.createdAt).getTime()
  );

  // Sort posts inside each thread and compose the BlueskyThread[] array
  const threads = postsArrays.map((thread): BlueskyThread => {
    const sortedPosts = thread.sort(
      (postA, postB) =>
        new Date(postA.record.createdAt).getTime() -
        new Date(postB.record.createdAt).getTime()
    );

    const primaryThread = extractPrimaryThread(sortedPosts[0].uri, sortedPosts);
    const bskAuthor = sortedPosts[0].author;

    return {
      thread_id: findRootId(sortedPosts[0]),
      posts: primaryThread,
      author: {
        id: bskAuthor.did,
        username: bskAuthor.handle,
        avatar: bskAuthor.avatar,
        displayName: bskAuthor.displayName,
      },
    };
  });
  const repostedThreads: BlueskyThread[] = posts
    .filter((post) => post.repostedBy)
    .map((post) => {
      if (!post.repostedBy) {
        throw new Error('reposted by info not present');
      }
      return {
        thread_id: post.uri + BLUESKY_REPOST_URI_QUERY + post.repostedBy.by.did,
        posts: [cleanBlueskyPost(post)],
        author: {
          id: post.repostedBy.by.did,
          username: post.repostedBy.by.handle,
          avatar: post.repostedBy.by.avatar,
          displayName: post.repostedBy.by.displayName,
        },
      };
    });
  return [...threads, ...repostedThreads];
};

const findRootId = (post: BlueskyPost): string => {
  const rootUri = post.record.reply?.root.uri;
  if (rootUri) {
    return rootUri;
  }
  return post.uri;
};

export const extractPrimaryThread = (
  id: string,
  posts: BlueskyPost[]
): BlueskyPost[] => {
  const primaryPost = posts.find((post) => post.uri === id);
  if (!primaryPost) {
    throw new Error(`Could not find primary post with id: ${id}`);
  }

  const earliestResponse = getEarliestResponse(id, posts);
  if (!earliestResponse) {
    return [primaryPost];
  }

  return [primaryPost, ...extractPrimaryThread(earliestResponse.uri, posts)];
};

const getEarliestResponse = (id: string, posts: BlueskyPost[]) => {
  const allPostReplies = posts.filter(
    (post) => post.record.reply?.parent.uri === id
  );

  if (allPostReplies.length === 0) {
    return null;
  }

  return allPostReplies.reduce(
    (earliestPost, post) =>
      new Date(post.record.createdAt).getTime() <
      new Date(earliestPost.record.createdAt).getTime()
        ? post
        : earliestPost,
    allPostReplies[0]
  );
};

export function cleanBlueskyContent(
  post: AppBskyFeedPost.Record | QuotedBlueskyPost['value']
): string {
  let text = post.text;
  const facets = post.facets;
  // Convert the text to a byte array for accurate offset slicing
  const textBytes = Buffer.from(text, 'utf-8');

  // Map of byte-offset substrings to their full URLs
  const urlMap = new Map<string, string>();

  // Collect each link facet's byte-offset substring and map it to its full URL
  for (const facet of facets || []) {
    const linkFeature = facet.features.find(
      (feature) => feature.$type === 'app.bsky.richtext.facet#link'
    ) as Link | undefined;
    if (linkFeature?.uri) {
      const { byteStart, byteEnd } = facet.index;

      // Extract the substring in bytes, then decode it
      // const urlBytes = textBytes.slice(byteStart, byteEnd);
      const urlBytes = Uint8Array.prototype.slice.call(
        textBytes,
        byteStart,
        byteEnd
      );
      // const urlSubstring = urlBytes.toString('utf-8');
      const urlSubstring = Buffer.from(urlBytes).toString('utf-8');

      // Map the decoded substring to the full URL
      urlMap.set(urlSubstring, linkFeature.uri);
    }
  }

  // Replace each substring with the full URL in the text
  for (const [shortUrl, fullUrl] of urlMap.entries()) {
    text = text.replace(shortUrl, fullUrl);
  }

  // Check for embed URL
  if (post.embed && post.embed.$type === 'app.bsky.embed.external') {
    const embedUrl = (post.embed as AppBskyEmbedExternal.Main).external.uri;
    if (embedUrl && !text.includes(embedUrl)) {
      text += '\n\n' + embedUrl;
    }
  }
  return text;
}

export function cleanBlueskyPost(post: BlueskyPost): BlueskyPost {
  const cleanEmbed = (embed: any): any => {
    if (!embed || typeof embed !== 'object') return embed;

    if (embed.$type === 'blob') {
      return undefined; // Remove blob type
    }

    if (Array.isArray(embed)) {
      return embed
        .map((item) => cleanEmbed(item))
        .filter((item) => item !== undefined);
    }

    const cleanedEmbed = { ...embed };

    for (const key in cleanedEmbed) {
      if (cleanedEmbed.hasOwnProperty(key)) {
        cleanedEmbed[key] = cleanEmbed(cleanedEmbed[key]);
      }
    }

    return cleanedEmbed;
  };

  const cleanedPost: BlueskyPost = {
    ...post,
    record: {
      ...post.record,
      embed: cleanEmbed(post.record.embed),
    },
    embed: cleanEmbed(post.embed),
  };

  return cleanedPost;
}

export function removeUndefinedFields<T extends Record<string, any>>(
  obj: T
): T {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  });
  return obj;
}

export async function useBlueskyAdminCredentials(firestore: Firestore) {
  const platformId = PLATFORM.Bluesky;
  const blueskyDoc = await firestore
    .collection('adminCredentials')
    .doc(platformId)
    .get();
  const { BLUESKY_APP_PASSWORD, BLUESKY_SERVICE_URL, BLUESKY_USERNAME } =
    getConfig().bluesky;
  const agent = new AtpAgent({ service: BLUESKY_SERVICE_URL });
  const blueskySession = await (async () => {
    if (!blueskyDoc.exists || !blueskyDoc.data()?.session) {
      await agent.login({
        identifier: BLUESKY_USERNAME,
        password: BLUESKY_APP_PASSWORD,
      });
      if (!agent.session) {
        throw new Error('Failed to login to Bluesky with admin credentials');
      }
      await firestore
        .collection('adminCredentials')
        .doc(platformId)
        .set({
          session: removeUndefinedFields(agent.session),
        });
      return agent.session;
    }
    return blueskyDoc.data()?.session as AtpSessionData;
  })();

  try {
    await agent.resumeSession(blueskySession);
  } catch (e) {
    await agent.login({
      identifier: BLUESKY_USERNAME,
      password: BLUESKY_APP_PASSWORD,
    });
  }

  if (!agent.session) {
    throw new Error('Failed to resume Bluesky session with admin credentials');
  }

  if (blueskySession.accessJwt !== agent.session.accessJwt) {
    await firestore
      .collection('adminCredentials')
      .doc(platformId)
      .set({
        session: removeUndefinedFields(agent.session),
      });
  }
  const credentials = { read: agent.session, write: agent.session };
  return credentials;
}
