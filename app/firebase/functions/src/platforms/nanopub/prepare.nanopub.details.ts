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
    undefined,
    true
  );

  const orcidAccount = UsersHelper.getAccount(user, PLATFORM.Orcid, undefined);

  // parameters
  const introUri = nanopubAccount.profile?.introNanopubUri;

  if (!introUri) {
    throw new Error('Intro nanopub uri not found');
  }

  const twitterUsername = twitterAccount.profile?.username;
  const twitterName = twitterAccount.profile?.name;

  if (!twitterUsername) {
    throw new Error('Twitter username not found');
  }

  if (!twitterName) {
    throw new Error('Twitter name not found');
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

  const tweet = post.mirrors.find(
    (platformPost) => platformPost.platformId === PLATFORM.Twitter
  )?.posted;
  const nanopub = post.mirrors.find(
    (platformPost) => platformPost.platformId === PLATFORM.Nanopub
  );
  const latestNanopubUri = nanopub?.posted?.post_id;
  const rootNanopubUri = nanopub?.post_id;

  const tweetId = tweet?.post_id;

  if (!tweetId) {
    throw new Error('Original platform post id not found');
  }

  const tweetUrl = `https://x.com/${twitterUsername}/status/${tweetId}`;

  return {
    introUri,
    twitterUsername,
    twitterName,
    autopostOption,
    ethAddress,
    orcidId,
    tweetUrl,
    latestNanopubUri,
    rootNanopubUri,
  };
};
