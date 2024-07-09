import { NanupubSignupData } from '../../@shared/types/types.nanopubs';
import { GenericAuthor } from '../../@shared/types/types.posts';
import { buildIntroNp } from './utils';

export const createIntroNanopublication = async (
  details: NanupubSignupData,
  userInfo: Pick<GenericAuthor, 'username' | 'name'>,
  authorizedKey: string,
  signDelegation: boolean
) => {
  return buildIntroNp(
    userInfo.username,
    details.ethAddress,
    userInfo.name,
    details.rsaPublickey,
    details.ethToRsaSignature,
    { signDelegation }
  );
};
