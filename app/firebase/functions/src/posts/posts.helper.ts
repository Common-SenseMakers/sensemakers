import { BlueskyThread } from '../@shared/types/types.bluesky';
import { MastodonThread } from '../@shared/types/types.mastodon';
import {
  PlatformPost,
  PlatformPostPosted,
} from '../@shared/types/types.platform.posts';
import {
  PLATFORM,
  PUBLISHABLE_PLATFORM,
} from '../@shared/types/types.platforms';
import {
  AppPost,
  AppPostFull,
  StructuredSemantics,
} from '../@shared/types/types.posts';
import { AccountDetailsBase, DefinedIfTrue } from '../@shared/types/types.user';
import { APP_URL } from '../config/config.runtime';

export interface PlatformDetails {
  platform: PUBLISHABLE_PLATFORM;
  account: AccountDetailsBase;
}

export class PostsHelper {
  static getPostUrl(postId: string): string {
    return `${APP_URL}/post/${postId}`;
  }

  static getPostMirror<T extends boolean>(
    post: AppPostFull,
    filters: { platformId: PLATFORM; user_id?: string; post_id?: string },
    shouldThrow?: T
  ): DefinedIfTrue<T, PlatformPost> {
    const mirror =
      post.mirrors &&
      post.mirrors.find((m) => {
        let match = m.platformId === filters.platformId;

        if (filters.user_id) {
          const author_user_id = m.posted
            ? m.posted.user_id
            : m.draft
              ? m.draft.user_id
              : undefined;
          match = match && filters.user_id === author_user_id;
        }

        if (filters.post_id) {
          match = match && filters.post_id === m.post_id;
        }

        return match;
      });

    if (!mirror) {
      if (shouldThrow) {
        throw new Error(
          `Mirror with filter ${JSON.stringify(filters)} not found on post ${post.id}`
        );
      } else {
        return undefined as DefinedIfTrue<T, PlatformPost>;
      }
    }

    return mirror;
  }

  static getNewestPostIdInPlatformPostThread<P>(
    platformId: PLATFORM,
    platformPosted: PlatformPostPosted<P>
  ): string {
    if (platformId === PLATFORM.Mastodon) {
      const mastodonThread = platformPosted.post as MastodonThread;
      const newestPostId = mastodonThread.posts.reduce(
        (acc, post) => (post.id > acc ? post.id : acc),
        mastodonThread.posts[0].id
      );
      return newestPostId;
    }
    if (platformId === PLATFORM.Bluesky) {
      const blueskyThread = platformPosted.post as BlueskyThread;
      const newestPost = blueskyThread.posts.reduce(
        (acc, post) =>
          new Date(post.record.createdAt).getTime() >
          new Date(acc.record.createdAt).getTime()
            ? post
            : acc,
        blueskyThread.posts[0]
      );
      return newestPost.uri;
    }
    return platformPosted.post_id;
  }
}

/** type protection against properties renaming */
export const CREATED_AT_KEY: keyof AppPost = 'createdAtMs';
export const AUTHOR_USER_KEY: keyof AppPost = 'authorUserId';
export const AUTHOR_PROFILE_KEY: keyof AppPost = 'authorProfileId';
export const ORIGIN_KEY: keyof AppPost = 'origin';
export const SCORE_KEY: keyof AppPost = 'scores';

export const STRUCTURED_SEMANTICS_KEY: keyof AppPost = 'structuredSemantics';

export const KEYWORDS_KEY: keyof StructuredSemantics = 'keywords';
export const LABELS_KEY: keyof StructuredSemantics = 'labels';
export const TOPIC_KEY: keyof StructuredSemantics = 'topic';
export const REFS_KEY: keyof StructuredSemantics = 'refs';
export const TABS_KEY: keyof StructuredSemantics = 'tabs';
