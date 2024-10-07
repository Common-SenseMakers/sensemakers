import { SciFilterClassfication } from '../../@shared/types/types.parser';
import { PLATFORM } from '../../@shared/types/types.platforms';
import { AppPostFull } from '../../@shared/types/types.posts';
import { AppUserRead, AutopostOption } from '../../@shared/types/types.user';
import { UsersHelper } from '../../users/users.helper';

export const prepareNanopubDetails = (user: AppUserRead, post: AppPostFull) => {
  const nanopubAccount = UsersHelper.getProfile(
    user,
    PLATFORM.Nanopub,
    undefined,
    true
  );

  const twitterAccount = UsersHelper.getProfile(
    user,
    PLATFORM.Twitter,
    undefined
  );
  const mastodonAccount = UsersHelper.getProfile(
    user,
    PLATFORM.Mastodon,
    undefined
  );

  if (!twitterAccount && !mastodonAccount) {
    throw new Error('Twitter or Mastodon account not found');
  }

  const orcidAccount = UsersHelper.getProfile(user, PLATFORM.Orcid, undefined);

  const introUri = nanopubAccount.profile?.introNanopubUri;

  if (!introUri) {
    throw new Error('Intro nanopub uri not found');
  }

  const platformUsername = post.generic.author.username;
  const platformAccountUrl = (() => {
    if (twitterAccount && post.origin === PLATFORM.Twitter) {
      return platformUsername ? `https://x.com/${platformUsername}` : undefined;
    }
    if (mastodonAccount && post.origin === PLATFORM.Mastodon) {
      const server = mastodonAccount.profile?.mastodonServer;
      return platformUsername && server
        ? `https://${server}/@${platformUsername}`
        : undefined;
    }
    return undefined;
  })();

  /** if name isn't set, use username instead */
  const platformName = post.generic.author.name || platformUsername;

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
    if (
      post.originalParsed?.filter_classification !==
      SciFilterClassfication.CITOID_DETECTED_RESEARCH
    )
      return AutopostOption.MANUAL;

    if (
      user.settings.autopost[PLATFORM.Nanopub].after &&
      post.createdAtMs > user.settings.autopost[PLATFORM.Nanopub].after
    )
      return user.settings.autopost[PLATFORM.Nanopub].value;

    return AutopostOption.MANUAL;
  })();

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
