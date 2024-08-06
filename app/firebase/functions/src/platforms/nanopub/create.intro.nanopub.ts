import { NanupubSignupData } from '../../@shared/types/types.nanopubs';
import { buildIntroNp } from './utils';

export const createIntroNanopublication = async (
  details: NanupubSignupData,
  signDelegation: boolean
) => {
  return buildIntroNp(
    details.ethAddress,
    details.rsaPublickey,
    details.ethToRsaSignature,
    { signDelegation: signDelegation }
    //Need to get all options in later versions
  );
};
