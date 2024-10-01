import { t } from 'i18next';

import { I18Keys } from '../i18n/i18n';
import { MastodonThread } from '../shared/types/types.mastodon';
import { PlatformPost } from '../shared/types/types.platform.posts';
import { AppPostFull } from '../shared/types/types.posts';
import { TwitterThread } from '../shared/types/types.twitter';
import { PLATFORM } from '../shared/types/types.user';

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
  const platformPost = post?.mirrors.find(
    (m) => m.platformId === (platformId ? platformId : post.origin)
  );
  return getPlatformPostDetails(platformPost);
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
          ? t(I18Keys.ThreadX)
          : t(I18Keys.TweetX);
      }

      if (platformPost.platformId === PLATFORM.Mastodon) {
        return (platformPost.posted.post as MastodonThread).posts.length > 1
          ? t(I18Keys.ThreadMastodon)
          : t(I18Keys.TootMastodon);
      }
    }

    return '';
  })();

  const url = (() => {
    if (platformPost && platformPost.posted) {
      if (platformPost.platformId === PLATFORM.Twitter) {
        return `https://twitter.com/x/status/${platformPost.posted.post_id}`;
      }

      if (platformPost.platformId === PLATFORM.Mastodon) {
        return `https://mastodon.social/post/${platformPost.posted.post_id}`;
      }
    }

    return '';
  })();

  const timestampMs = platformPost.posted?.timestampMs;

  return { label, url, timestampMs };
};
