import { getPostStatuses } from '../post/posts.helper';
import { AppPostFull, GenericPost } from '../shared/types/types.posts';

export function zoteroItemTypeDisplay(itemType: string) {
  return itemType
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function splitPostsByStatus(posts: AppPostFull[]) {
  return {
    pendingPosts: posts.filter((post) => getPostStatuses(post).pending),
    manuallyPublishedPosts: posts.filter(
      (post) => getPostStatuses(post).manuallyPublished
    ),
    autoPublishedPosts: posts.filter(
      (post) => getPostStatuses(post).autoPublished
    ),
  };
}

export type PostType = 'regular' | 'repost' | 'quotePost';

export function getPostType(post: AppPostFull | undefined): PostType {
  const firstPost = post?.generic.thread[0];
  if (firstPost && firstPost.content === '' && firstPost.quotedThread)
    return 'repost';
  if (firstPost && firstPost.content !== '' && firstPost.quotedThread)
    return 'quotePost';
  return 'regular';
}

const seeMoreSpan = `<span style="color: #337fbd; cursor: pointer;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">See more</span>`;
const TRUNCATED_LENGTH = 500;

export function truncateGenericThread(genericThread: GenericPost[]) {
  const truncatedThread = [];
  let totalLength = 0;

  for (const post of genericThread) {
    totalLength += post.content.length;
    if (totalLength > TRUNCATED_LENGTH) {
      const truncatedContent =
        post.content.slice(
          0,
          TRUNCATED_LENGTH - (totalLength - post.content.length)
        ) +
        '... ' +
        seeMoreSpan;
      truncatedThread.push({ ...post, content: truncatedContent });
      break;
    }
    truncatedThread.push(post);
  }
  return truncatedThread;
}
