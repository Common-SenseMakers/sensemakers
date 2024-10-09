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

  const orcidAccount = UsersHelper.getProfile(user, PLATFORM.Orcid, undefined);

  const introUri = nanopubAccount.profile?.introNanopubUri;

  if (!introUri) {
    throw new Error('Intro nanopub uri not found');
  }

  const { platformAccountUrl, platformName, platformPostUrl } =
    UsersHelper.getOriginAccountDetails(user, post);

  if (!platformAccountUrl || !platformName || !platformPostUrl) {
    throw new Error('Platform account details not found');
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

  const nanopub = post.mirrors.find(
    (platformPost) => platformPost.platformId === PLATFORM.Nanopub
  );
  const latestNanopubUri = nanopub?.posted?.post_id;
  const rootNanopubUri = nanopub?.post_id;

  return {
    introUri,
    platformAccountUrl,
    platformName,
    platformPostUrl,
    autopostOption,
    ethAddress,
    orcidId,
    latestNanopubUri,
    rootNanopubUri,
  };
};
