import {
  AppPost,
  AppPostFull,
  GenericThread,
} from '../@shared/types/types.posts';
import {
  AppUser,
  PLATFORM,
  PUBLISHABLE_PLATFORMS,
  UserDetailsBase,
} from '../@shared/types/types.user';
import { APP_URL } from '../config/config.runtime';
import { UsersHelper } from '../users/users.helper';

export interface PlatformDetails {
  platform: PUBLISHABLE_PLATFORMS;
  account: UserDetailsBase;
}

export class PostsHelper {
  static convertToGenericThread(
    post: AppPost | AppPostFull,
    author: AppUser
  ): GenericThread {
    const account = UsersHelper.getAccount(
      author,
      PLATFORM.Twitter,
      undefined,
      true
    );

    return {
      url: PostsHelper.getPostUrl(post.id),
      author: {
        id: account.user_id,
        name: account.profile.name,
        username: account.profile.username,
        platformId: PLATFORM.Twitter,
      },
      thread: post.thread,
    };
  }

  static concatenateThread(post: { thread: AppPost['thread'] }): string {
    return post.thread.reduce((_acc, post) => `${post.content}\n\n`, '');
  }

  static getPostUrl(postId: string): string {
    return `${APP_URL}/post/${postId}`;
  }
}
