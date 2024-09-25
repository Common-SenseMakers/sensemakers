import { BlueskyPost, BlueskyThread } from '../../@shared/types/types.bluesky';

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
      postThreadsMap.get(rootId)?.push(post);
    });

  const postsArrays = Array.from(postThreadsMap.values());

  // Sort threads by the creation timestamp of the root post
  postsArrays.sort(
    (pA, pB) =>
      new Date(pB[0].indexedAt).getTime() - new Date(pA[0].indexedAt).getTime()
  );

  // Sort posts inside each thread and compose the BlueskyThread[] array
  const threads = postsArrays.map((thread): BlueskyThread => {
    const sortedPosts = thread.sort(
      (postA, postB) =>
        new Date(postA.indexedAt).getTime() -
        new Date(postB.indexedAt).getTime()
    );

    const primaryThread = extractPrimaryThread(sortedPosts[0].uri, sortedPosts);

    return {
      thread_id: sortedPosts[0].uri,
      posts: primaryThread,
      author: sortedPosts[0].author,
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
      new Date(post.indexedAt).getTime() <
      new Date(earliestPost.indexedAt).getTime()
        ? post
        : earliestPost,
    allPostReplies[0]
  );
};

export const cleanBlueskyContent = (post: BlueskyPost): string => {
  let cleanedContent = post.record.text;

  // Replace truncated URLs with full URLs using facets
  if (post.record.facets) {
    post.record.facets.forEach((facet) => {
      const feature = facet.features[0];
      if (feature.$type === 'app.bsky.richtext.facet#link') {
        const fullUrl = feature.uri;
        const truncatedText = cleanedContent.substring(
          facet.index.byteStart,
          facet.index.byteEnd
        );
        cleanedContent = cleanedContent.replace(truncatedText, fullUrl);
      }
    });
  }

  // Remove mentions (e.g., @handle.bsky.social)
  cleanedContent = cleanedContent.replace(/@[\w.-]+/g, '');

  // Trim leading and trailing whitespace
  cleanedContent = cleanedContent.trim();

  // Remove extra whitespace
  cleanedContent = cleanedContent.replace(/\s+/g, ' ');

  return cleanedContent;
};

export function extractRKeyFromURI(uri: string): string | null {
  try {
    // Validate the URI starts with the correct protocol
    if (!uri.startsWith('at://')) {
      throw new Error('Invalid URI: must start with "at://".');
    }

    // Split the URI into its components
    const parts = uri.split('/');

    // Ensure the URI has the expected number of parts
    if (parts.length < 4) {
      throw new Error('Invalid URI: expected at least 4 parts.');
    }

    // The last part is the rkey
    const rkey = parts[parts.length - 1];

    // Return the rkey
    return rkey;
  } catch (error: any) {
    console.error(error.message);
    return null;
  }
}
