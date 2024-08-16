import { PlatformPost } from '../@shared/types/types.platform.posts';
import { AppPostFull, GenericPost } from '../@shared/types/types.posts';
import {
  DefinedIfTrue,
  PLATFORM,
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
    return generic.thread.reduce(
      (_acc, post) => `${_acc} ${post.content}\n\n`,
      ''
    );
  }

  static getPostUrl(postId: string): string {
    return `${APP_URL}/post/${postId}`;
  }

  static getPostMirror<T extends boolean>(
    post: AppPostFull,
    platformId: PLATFORM,
    user_id?: string,
    shouldThrow?: T
  ): DefinedIfTrue<T, PlatformPost> {
    const mirror = post.mirrors.find((m) => {
      if (!user_id) {
        return m.platformId === platformId;
      } else {
        return (
          m.platformId === platformId &&
          ((m.draft && m.draft.user_id === user_id) ||
            (m.posted && m.posted.user_id))
        );
      }
    });

    if (!mirror && shouldThrow) {
      throw new Error(
        `Mirror of platform ${platformId} not found on post ${post.id}`
      );
    }

    return undefined as DefinedIfTrue<T, PlatformPost>;
  }
}
