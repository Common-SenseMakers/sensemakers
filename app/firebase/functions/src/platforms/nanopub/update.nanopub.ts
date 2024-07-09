import { AppPostFull } from '../../@shared/types/types.posts';
import { AppUser } from '../../@shared/types/types.user';
import { createNanopublicationInner } from './create.nanopub';

export const updateNanopublication = async (
  post: AppPostFull,
  user: AppUser,
  oldNpUri: string
) => {
  return createNanopublicationInner(post, user, oldNpUri);
};
