import {
  MastodonAccount,
  MastodonPost,
  MastodonThread,
} from '../../@shared/types/types.mastodon';

export const convertMastodonPostsToThreads = (
  posts: MastodonPost[],
  author: MastodonAccount
): MastodonThread[] => {
  const postThreadsMap = new Map<string, MastodonPost[]>();

  posts
    .filter((post) => post.account.id === author.id)
    .filter((post) => !post.reblog)
    .forEach((post) => {
      const rootId = findRootId(post, posts); // Find the true root by following the chain
      if (!postThreadsMap.has(rootId)) {
        postThreadsMap.set(rootId, []);
      }

      postThreadsMap.get(rootId)?.push(post);
    });

  const postsArrays = Array.from(postThreadsMap.values());

  // Sort threads by the creation timestamp of the root post
  postsArrays.sort(
    (pA, pB) =>
      new Date(pB[0].createdAt).getTime() - new Date(pA[0].createdAt).getTime()
  );

  // Sort posts inside each thread and compose the MastodonThread[] array
  const threads = postsArrays.map((thread): MastodonThread => {
    const sortedPosts = thread.sort(
      (postA, postB) =>
        new Date(postA.createdAt).getTime() -
        new Date(postB.createdAt).getTime()
    );

    const primaryThread = extractPrimaryThread(sortedPosts[0].id, sortedPosts);

    return {
      thread_id: sortedPosts[0].uri, // The root post URI
      posts: primaryThread,
      author,
    };
  });

  const rebloggedThreads = posts
    .filter((post) => post.account.id === author.id)
    .filter((post) => post.reblog)
    .map((post) => {
      return {
        thread_id: post.uri,
        posts: [post],
        author,
      };
    });
  return [...threads, ...rebloggedThreads];
};

const findRootId = (post: MastodonPost, posts: MastodonPost[]): string => {
  if (!post.inReplyToId) {
    return post.id;
  }
  let currentPost = post;

  while (currentPost.inReplyToId) {
    const parentPost = posts.find((p) => p.id === currentPost.inReplyToId);
    if (!parentPost) {
      // If we don't have the parent in the list, treat the current post as root
      return currentPost.id;
    }
    currentPost = parentPost;
  }

  return currentPost.id; // Return the true root (post without inReplyToId)
};

export const extractPrimaryThread = (
  id: string,
  posts: MastodonPost[]
): MastodonPost[] => {
  const primaryPost = posts.find((post) => post.id === id);
  if (!primaryPost) {
    throw new Error(`Could not find primary post with id: ${id}`);
  }

  const earliestResponse = getEarliestResponse(id, posts);
  if (!earliestResponse) {
    return [primaryPost];
  }

  return [primaryPost, ...extractPrimaryThread(earliestResponse.id, posts)];
};

const getEarliestResponse = (id: string, posts: MastodonPost[]) => {
  const allPostReplies = posts.filter((post) => post.inReplyToId === id);

  if (allPostReplies.length === 0) {
    return null;
  }

  return allPostReplies.reduce(
    (earliestPost, post) =>
      new Date(post.createdAt).getTime() <
      new Date(earliestPost.createdAt).getTime()
        ? post
        : earliestPost,
    allPostReplies[0]
  );
};

export const getPostUrl = (username: string, id: string) => {
  return `https://mastodon.social/@${username}/${id}`;
};

export const cleanMastodonContent = (content: string): string => {
  // Remove HTML tags, keeping paragraph structure
  let cleanedContent = content
    .replace(/<\/p><p>/g, '\n\n\n')
    .replace(/<br\s*\/?>/g, '\n') // Replace <br /> with newline character
    .replace(/<[^>]*>/g, '');

  // Decode HTML entities
  cleanedContent = cleanedContent
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Replace multiple newlines with two newlines
  cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n');

  // Trim leading and trailing whitespace
  cleanedContent = cleanedContent.trim();

  return cleanedContent;
};
