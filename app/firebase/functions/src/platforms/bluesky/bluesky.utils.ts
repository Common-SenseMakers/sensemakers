import { AppBskyEmbedExternal, AppBskyFeedPost } from '@atproto/api';

import {
  BlueskyPost,
  BlueskyThread,
  QuotedBlueskyPost,
} from '../../@shared/types/types.bluesky';

export const convertBlueskyPostsToThreads = (
  posts: BlueskyPost[],
  authorId: string
): BlueskyThread[] => {
  const postThreadsMap = new Map<string, BlueskyPost[]>();

  posts
    .filter((post) => post.author.did === authorId)
    .forEach((post) => {
      const rootId = findRootId(post, posts);
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
      thread_id: sortedPosts[0].uri,
      posts: primaryThread,
      author: {
        id: bskAuthor.did,
        username: bskAuthor.handle,
        avatar: bskAuthor.avatar,
        displayName: bskAuthor.displayName,
      },
    };
  });
  return threads;
};

const findRootId = (post: BlueskyPost, posts: BlueskyPost[]): string => {
  let currentPost = post;

  while (currentPost.record.reply) {
    const parentPost = posts.find(
      (p) => p.uri === currentPost.record.reply?.parent.uri
    );
    if (!parentPost) {
      // If we don't have the parent in the list, treat the current post as root
      return currentPost.uri;
    }
    currentPost = parentPost;
  }

  return currentPost.uri; // Return the true root (post without reply)
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

export const cleanBlueskyContent = (
  post: AppBskyFeedPost.Record | QuotedBlueskyPost['value']
): string => {
  let cleanedContent = post.text;
  const facets = post.facets;
  const appendedUrls: string[] = [];

  // Replace truncated URLs with full URLs using facets
  if (facets) {
    const replacements: { start: number; end: number; url: string }[] = [];

    facets.forEach((facet) => {
      const feature = facet.features[0];
      if (feature.$type === 'app.bsky.richtext.facet#link') {
        const url = feature.uri as string;
        const start = facet.index.byteStart;
        const end = facet.index.byteEnd;

        if (cleanedContent.slice(start, end) !== url) {
          replacements.push({ start, end, url });
        } else if (!cleanedContent.includes(url)) {
          appendedUrls.push(url);
        }
      }
    });

    // Sort replacements in reverse order to avoid affecting positions
    replacements.sort((a, b) => b.start - a.start);

    for (const { start, end, url } of replacements) {
      cleanedContent =
        cleanedContent.slice(0, start) + url + cleanedContent.slice(end);
    }
  }

  // Check for embed URL
  if (post.embed && post.embed.$type === 'app.bsky.embed.external') {
    const embedUrl = (post.embed as AppBskyEmbedExternal.Main).external.uri;
    if (
      embedUrl &&
      !cleanedContent.includes(embedUrl) &&
      !appendedUrls.includes(embedUrl)
    ) {
      appendedUrls.push(embedUrl);
    }
  }

  // Append URLs that weren't in the original text
  if (appendedUrls.length > 0) {
    cleanedContent += '\n\n' + appendedUrls.join('\n');
  }

  return cleanedContent;
};

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
