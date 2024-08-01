import { logger } from 'firebase-functions/v1';

import { PlatformPostDraft } from '../@shared/types/types.platform.posts';
import { AppUser, PLATFORM } from '../@shared/types/types.user';
import { Services } from '../instances/services';
import { NanopubService } from '../platforms/nanopub/nanopub.service';
import { BuildIntroNpOptions, buildIntroNp } from '../platforms/nanopub/utils';

const PREFIX = 'USER-UPDATED-HOOK';

export const userUpdatedHook = async (
  user: AppUser,
  services: Services,
  userBefore?: AppUser
) => {
  if (!userBefore) {
    return;
  }

  const addedPlatformIds = user.platformIds.filter(
    (platformId) => !userBefore.platformIds.includes(platformId)
  );

  const now = services.time.now();

  logger.debug(`userUpdatedHook user-${user.userId}-${now}`, undefined, PREFIX);
  /** if a new platform hasn't been added (excluding nanopub), don't do anything */
  if (
    addedPlatformIds.length === 0 ||
    addedPlatformIds.includes(PLATFORM.Nanopub)
  ) {
    return;
  }
  const twitterAccountDetails = user[PLATFORM.Twitter]?.[0].profile;
  const orcidAccountDetails = user[PLATFORM.Orcid]?.[0].profile;
  const nanopubAccountDetails = user[PLATFORM.Nanopub]?.[0];
  const nanopubProfile = nanopubAccountDetails?.profile;
  if (!nanopubProfile) {
    throw new Error(
      'Nanopub account details are missing cannot signup other platforms before nanopub account is set'
    );
  }
  /* no need to update nanopub if no twitter or orcid account */
  if (!twitterAccountDetails && !orcidAccountDetails) {
    return;
  }

  let introNanopubOptions: BuildIntroNpOptions = {
    signDelegation: true,
    supersedesOptions: nanopubProfile.introNanopubUri
      ? {
          root: nanopubProfile.introNanopubUri,
          latest: nanopubProfile.introNanopubUri,
        }
      : undefined,
    author: twitterAccountDetails
      ? {
          platformId: PLATFORM.Twitter,
          id: twitterAccountDetails.id,
          username: twitterAccountDetails.username,
          name: twitterAccountDetails.name,
        }
      : undefined,
    orcidId: orcidAccountDetails ? orcidAccountDetails.name : undefined,
  };

  const updatedIntroNanopub = await buildIntroNp(
    nanopubProfile.ethAddress,
    nanopubProfile.rsaPublickey,
    nanopubProfile.ethToRsaSignature,
    introNanopubOptions
  );

  logger.debug(
    `unsigned updated intro nanopub built`,
    updatedIntroNanopub.rdf(),
    PREFIX
  );

  const nanopubService = services.platforms.get(
    PLATFORM.Nanopub
  ) as NanopubService;
  const signedUpdatedIntroNanopub = await nanopubService.signDraft(
    { unsignedPost: updatedIntroNanopub } as PlatformPostDraft<any>,
    nanopubAccountDetails
  );
  const published = await nanopubService.publishInternal(
    signedUpdatedIntroNanopub
  );
};
