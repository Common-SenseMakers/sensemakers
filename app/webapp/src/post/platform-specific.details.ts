import { t } from 'i18next';

import { PlatformsKeys } from '../i18n/i18n.platforms';
import { BlueskyThread } from '../shared/types/types.bluesky';
import { MastodonThread } from '../shared/types/types.mastodon';
import { PlatformPost } from '../shared/types/types.platform.posts';
import { PLATFORM } from '../shared/types/types.platforms';
import { AppPostFull } from '../shared/types/types.posts';
import { AccountProfile } from '../shared/types/types.profiles';
import { TwitterThread } from '../shared/types/types.twitter';
import {
  getBlueskyProfileDetails,
  parseBlueskyURI,
} from '../shared/utils/bluesky.utils';
import { parseMastodonGlobalUsername } from '../shared/utils/mastodon.utils';

export interface GenericPlatformPostDetails {
  authorName?: string;
  authorAvatarUrl?: string;
  label: string;
  url: string;
  timestampMs?: number;
}

export const getPostDetails = (
  post?: AppPostFull,
  platformId?: PLATFORM
): GenericPlatformPostDetails | undefined => {
  const platformPost = post?.mirrors?.find(
    (m) => m.platformId === (platformId ? platformId : post.origin)
  );
  const platformPostDetails = getPlatformPostDetails(platformPost);
  if (!platformPostDetails) return undefined;

  /** use post values instead of platform post when available */
  platformPostDetails.authorName =
    platformPostDetails.authorName || post?.generic.author.name;
  platformPostDetails.authorAvatarUrl =
    platformPostDetails.authorAvatarUrl || post?.generic.author.avatarUrl;

  return platformPostDetails;
};

/** single function to convert from a platform post to generic details used in the UI */
export const getPlatformPostDetails = (
  platformPost?: PlatformPost
): GenericPlatformPostDetails | undefined => {
  if (!platformPost) return undefined;

  const label = (() => {
    if (platformPost && platformPost.posted) {
      if (platformPost.platformId === PLATFORM.Twitter) {
        return (platformPost.posted.post as TwitterThread).tweets.length > 1
          ? t(PlatformsKeys.ThreadX)
          : t(PlatformsKeys.TweetX);
      }

      if (platformPost.platformId === PLATFORM.Mastodon) {
        return (platformPost.posted.post as MastodonThread).posts.length > 1
          ? t(PlatformsKeys.ThreadMastodon)
          : t(PlatformsKeys.TootMastodon);
      }

      if (platformPost.platformId === PLATFORM.Bluesky) {
        return (platformPost.posted.post as BlueskyThread).posts.length > 1
          ? t(PlatformsKeys.ThreadBluesky)
          : t(PlatformsKeys.PostBluesky);
      }
    }

    return '';
  })();

  const { url, authorName, authorAvatarUrl } = (() => {
    if (platformPost && platformPost.posted) {
      if (platformPost.platformId === PLATFORM.Twitter) {
        const twitterThread = platformPost.posted.post as TwitterThread;
        return {
          url: `https://x.com/${twitterThread.author.username}/status/${platformPost.posted.post_id}`,
          authorName: twitterThread.author.name,
          authorAvatarUrl: twitterThread.author.profile_image_url,
        };
      }

      if (platformPost.platformId === PLATFORM.Mastodon) {
        const mastodonThread = platformPost.posted.post as MastodonThread;
        return {
          url: mastodonThread.posts[0].url || mastodonThread.posts[0].uri,
          authorName: mastodonThread.author.displayName,
          authorAvatarUrl: mastodonThread.author.avatar,
        };
      }

      if (platformPost.platformId === PLATFORM.Bluesky) {
        const blueskyThread = platformPost.posted.post as BlueskyThread;
        return {
          url: `https://bsky.app/profile/${blueskyThread.author.username}/post/${parseBlueskyURI(platformPost.posted.post_id).rkey}`,
          authorName: blueskyThread.author.displayName,
          authorAvatarUrl: blueskyThread.author.avatar,
        };
      }
    }

    return { url: '', authorName: '', authorAvatarUrl: '' };
  })();

  const timestampMs = platformPost.posted?.timestampMs;

  return { label, url, timestampMs, authorName, authorAvatarUrl };
};

export const getAccountDetails = (
  account: AccountProfile
): { url: string; label: string; username?: string } => {
  if (account.platformId === PLATFORM.Twitter) {
    if (!account.profile) throw new Error('Unexpected');
    return {
      label: t(PlatformsKeys.XTwitter),
      url: `https://twitter.com/${account.profile?.username}`,
      username: account.profile?.username,
    };
  }

  if (account.platformId === PLATFORM.Mastodon) {
    const { accountURL } = parseMastodonGlobalUsername(account.user_id);
    return {
      label: t(PlatformsKeys.Mastodon),
      url: accountURL,
      username: account.profile?.username,
    };
  }

  if (account.platformId === PLATFORM.Bluesky) {
    const { accountURL } = getBlueskyProfileDetails(account);
    return {
      label: t(PlatformsKeys.Mastodon),
      url: accountURL,
      username: account.profile?.username,
    };
  }

  throw new Error(`Unexpected account platformId ${account.platformId}`);
};
