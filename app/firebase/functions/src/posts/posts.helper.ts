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
  AppPostFull,
  GenericPost,
  PostsQueryDefined,
} from '../@shared/types/types.posts';
import { AccountDetailsBase, DefinedIfTrue } from '../@shared/types/types.user';
import { APP_URL } from '../config/config.runtime';

export interface PlatformDetails {
  platform: PUBLISHABLE_PLATFORM;
  account: AccountDetailsBase;
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

const QUERY_PARAMS_NOT_USING_LINKS_SUBCOLLECTION = [
  'userId',
  'profileId',
  'origins',
];

export const doesQueryUseSubcollection = (queryParams: PostsQueryDefined) => {
  let result = {
    useLinksSubcollection: false,
    useKeywordsSubcollection: false,
  };

  const canUseSubcollection = !QUERY_PARAMS_NOT_USING_LINKS_SUBCOLLECTION.some(
    (param) => param in queryParams
  );

  if (canUseSubcollection) {
    if (queryParams.semantics?.refs?.length === 1) {
      result.useLinksSubcollection = true;
    } else if (queryParams.semantics?.keywords?.length === 1) {
      result.useKeywordsSubcollection = true;
    }
  }

  return result;
};

export const getBaseCollectionQuery = (
  collections: typeof DBInstance.prototype.collections,
  queryParams: PostsQueryDefined
) => {
  const { useLinksSubcollection, useKeywordsSubcollection } = 
    doesQueryUseSubcollection(queryParams);

  // Check if we can query subcollections rather than the entire posts
  if (useLinksSubcollection && queryParams.semantics?.refs) {
    const linkId = hashUrl(queryParams.semantics.refs[0]);
    return collections.links
      .doc(linkId)
      .collection(CollectionNames.LinkPostsSubcollection);
  }

  if (useKeywordsSubcollection && queryParams.semantics?.keywords) {
    const keyword = queryParams.semantics.keywords[0];
    return collections.keywords
      .doc(keyword)
      .collection(CollectionNames.KeywordPostsSubcollection);
  }

  return collections.posts;
};
