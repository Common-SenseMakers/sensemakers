import { NanopubUserDetails } from '../../@shared/types/types.nanopubs';
import { AppPostFull } from '../../@shared/types/types.posts';
import { TwitterUserDetails } from '../../@shared/types/types.twitter';
import {
  AppUser,
  AutopostOption,
  PLATFORM,
} from '../../@shared/types/types.user';
import { UsersHelper } from '../../users/users.helper';

export const PrepareNanopubDetails = (user: AppUser, post: AppPostFull) => {
  // platform accounts
  const nanopubAccount = UsersHelper.getAccount(
    user,
    PLATFORM.Nanopub,
    undefined,
    true
  ) as NanopubUserDetails;

  const twitterAccount = UsersHelper.getAccount(
    user,
    PLATFORM.Twitter,
    undefined,
    true
  ) as TwitterUserDetails;

  const orcidAccount = UsersHelper.getAccount(
    user,
    PLATFORM.Orcid,
    undefined,
    true
  ) as TwitterUserDetails;

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

  const orcidId = orcidAccount.user_id;

  const autopostOption: AutopostOption =
    user.settings.autopost[PLATFORM.Nanopub].value;

  return {
    introUri,
    twitterUsername,
    twitterName,
    autopostOption,
    ethAddress,
    orcidId,
  };
};
