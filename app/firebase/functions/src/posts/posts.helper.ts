import { GenericPost } from '../@shared/types/types.posts';
import {
  PUBLISHABLE_PLATFORMS,
  UserDetailsBase,
} from '../@shared/types/types.user';
import { APP_URL } from '../config/config.runtime';

export interface PlatformDetails {
  platform: PUBLISHABLE_PLATFORMS;
  account: UserDetailsBase;
}

export class PostsHelper {
  static concatenateThread(generic: { thread: GenericPost[] }): string {
    return generic.thread.reduce((_acc, post) => `${post.content}\n\n`, '');
  }

  static getPostUrl(postId: string): string {
    return `${APP_URL}/post/${postId}`;
  }
}
