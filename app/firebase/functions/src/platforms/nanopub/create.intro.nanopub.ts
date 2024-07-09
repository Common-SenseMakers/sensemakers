
import { buildIntroNp } from './utils';

import { NanupubSignupData } from '../../@shared/types/types.nanopubs';
import { GenericAuthor } from '../../@shared/types/types.posts';


export const createIntroNanopublication = async (
  details: NanupubSignupData,
  userInfo: Pick<GenericAuthor, 'username' | 'name'>,
  authorizedKey: string
) => {
  return buildIntroNp(
    userInfo.username,
    details.ethAddress,
    userInfo.name,
    details.rsaPublickey,
    details.ethToRsaSignature
  );
};

