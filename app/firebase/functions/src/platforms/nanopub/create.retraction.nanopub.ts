import { NanopubUserDetails } from '../../@shared/types/types.nanopubs';
import { AppPostFull } from '../../@shared/types/types.posts';
import { TwitterUserDetails } from '../../@shared/types/types.twitter';
import { AppUser, PLATFORM } from '../../@shared/types/types.user';
import { UsersHelper } from '../../users/users.helper';
import { buildRetractionNp } from './nanopub.utils';

export const createRetractionNanopub = async (
  post_id: string,
  post: AppPostFull,
  author: AppUser
) => {
  return buildRetractionNp(post_id);
};
