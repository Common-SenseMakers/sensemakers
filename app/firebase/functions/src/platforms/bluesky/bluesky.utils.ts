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
    const parentPost = posts.find((p) => p.uri === currentPost.record.reply?.parent.uri);
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
  const allPostReplies = posts.filter((post) => post.record.reply?.parent.uri === id);

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

export const cleanBlueskyContent = (content: string): string => {
  // Remove any Bluesky-specific formatting if needed
  let cleanedContent = content;

  // Trim leading and trailing whitespace
  cleanedContent = cleanedContent.trim();

  return cleanedContent;
};
