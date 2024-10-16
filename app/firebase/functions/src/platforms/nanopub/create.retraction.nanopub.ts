import { AppPostFull } from '../../@shared/types/types.posts';
import { AppUserRead } from '../../@shared/types/types.user';
import { buildRetractionNp } from './nanopub.utils';
import { prepareNanopubDetails } from './prepare.nanopub.details';

export const createRetractionNanopub = async (
  post_id: string,
  post: AppPostFull,
  author: AppUserRead
) => {
  const { introUri, platformAccountUrl, platformName, ethAddress, orcidId } =
    prepareNanopubDetails(author, post);

  return buildRetractionNp(
    post_id,
    introUri,
    platformAccountUrl,
    platformName,
    ethAddress,
    orcidId
  );
};
