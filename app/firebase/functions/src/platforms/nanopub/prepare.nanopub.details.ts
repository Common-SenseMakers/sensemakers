import { SciFilterClassfication } from '../../@shared/types/types.parser';
import { AppPostFull } from '../../@shared/types/types.posts';
import {
  AppUser,
  AutopostOption,
  PLATFORM,
} from '../../@shared/types/types.user';
import { UsersHelper } from '../../users/users.helper';

export const prepareNanopubDetails = (user: AppUser, post: AppPostFull) => {
  // platform accounts
  const nanopubAccount = UsersHelper.getAccount(
    user,
    PLATFORM.Nanopub,
    undefined,
    true
  );

  const twitterAccount = UsersHelper.getAccount(
    user,
    PLATFORM.Twitter,
    undefined
  );
  const mastodonAccount = UsersHelper.getAccount(
    user,
    PLATFORM.Mastodon,
    undefined
  );

  if (!twitterAccount && !mastodonAccount) {
    throw new Error('Twitter or Mastodon account not found');
  }

  const orcidAccount = UsersHelper.getAccount(user, PLATFORM.Orcid, undefined);

  // parameters
  const introUri = nanopubAccount.profile?.introNanopubUri;

  if (!introUri) {
    throw new Error('Intro nanopub uri not found');
  }

  const {
    platformUsername,
    platformAccountUrl,
  }: {
    platformUsername: string | undefined;
    platformAccountUrl: string | undefined;
  } = (() => {
    if (twitterAccount && post.origin === PLATFORM.Twitter) {
      const username = twitterAccount.profile?.username;
      return {
        platformUsername: username,
        platformAccountUrl: username ? `https://x.com/${username}` : undefined,
      };
    }
    if (mastodonAccount && post.origin === PLATFORM.Mastodon) {
      const username = mastodonAccount.profile?.username;
      const server = mastodonAccount.profile?.mastodonServer;
      return {
        platformUsername: username,
        platformAccountUrl:
          username && server ? `https://${server}/@${username}` : undefined,
      };
    }
    return { platformUsername: undefined, platformAccountUrl: undefined };
  })();
  const platformName = (() => {
    if (twitterAccount && post.origin === PLATFORM.Twitter)
      return twitterAccount.profile?.name;
    if (mastodonAccount && post.origin === PLATFORM.Mastodon)
      return mastodonAccount.profile?.displayName;
  })();

  if (!platformAccountUrl || !platformUsername) {
    throw new Error('platform account URL and/or username not found');
  }

  if (!platformName) {
    throw new Error('platform name not found');
  }

  const ethAddress = nanopubAccount && nanopubAccount.profile?.ethAddress;
  if (!ethAddress) {
    throw new Error('Eth address not found');
  }

  const orcidId = orcidAccount ? orcidAccount.user_id : undefined;

  const autopostOption: AutopostOption = (() => {
    /** anything that isn't citoid detected doesn't get autopublished */
    if (
      post.originalParsed?.filter_classification !==
      SciFilterClassfication.CITOID_DETECTED_RESEARCH
    )
      return AutopostOption.MANUAL;

    /** only indicate it was autopublished if it was created after the autoposting settings were set */
    if (
      user.settings.autopost[PLATFORM.Nanopub].after &&
      post.createdAtMs > user.settings.autopost[PLATFORM.Nanopub].after
    )
      return user.settings.autopost[PLATFORM.Nanopub].value;

    return AutopostOption.MANUAL;
  })();
  post.originalParsed?.filter_classification ===
  SciFilterClassfication.CITOID_DETECTED_RESEARCH
    ? user.settings.autopost[PLATFORM.Nanopub].value
    : AutopostOption.MANUAL;

  const platformPost = post.mirrors.find(
    (platformPost) => platformPost.platformId === post.origin
  )?.posted;

  const nanopub = post.mirrors.find(
    (platformPost) => platformPost.platformId === PLATFORM.Nanopub
  );
  const latestNanopubUri = nanopub?.posted?.post_id;
  const rootNanopubUri = nanopub?.post_id;

  const platformPostId = platformPost?.post_id;

  if (!platformPostId) {
    throw new Error('Original platform post id not found');
  }

  const platformPostUrl = (() => {
    if (twitterAccount && post.origin === PLATFORM.Twitter) {
      return `https://x.com/${platformUsername}/status/${platformPostId}`;
    }
    if (mastodonAccount && post.origin === PLATFORM.Mastodon) {
      const mastodonServer = mastodonAccount.profile?.mastodonServer;
      return `https://${mastodonServer}/@${platformUsername}/${platformPostId}`;
    }
    throw new Error('Unable to construct platform post URL');
  })();

  return {
    introUri,
    platformAccountUrl,
    platformName,
    autopostOption,
    ethAddress,
    orcidId,
    platformPostUrl,
    latestNanopubUri,
    rootNanopubUri,
  };
};
