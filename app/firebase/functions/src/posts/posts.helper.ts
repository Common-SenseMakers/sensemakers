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
import { getTweetUrl } from '../platforms/twitter/twitter.utils';
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
      url: getTweetUrl(),
      author: {
        id: account.user_id,
        name: account.profile.name,
        username: account.profile.username,
        platformId: PLATFORM.Twitter,
      },
      thread: post.thread,
    };
  }

  static concatenateThread(post: AppPost | AppPostFull): string {
    return post.thread.reduce((_acc, post) => `${post.content}\n\n`, '');
  }
}
