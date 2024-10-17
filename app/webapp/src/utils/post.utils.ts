import { getPostStatuses } from '../post/posts.helper';
import { AppPostFull } from '../shared/types/types.posts';

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
