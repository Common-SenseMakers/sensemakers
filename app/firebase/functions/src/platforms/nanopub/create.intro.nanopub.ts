import { NanupubSignupData } from '../../@shared/types/types.nanopubs';
import { buildIntroNp } from './utils';

export const createIntroNanopublication = async (
  details: NanupubSignupData,
  signDelegation: boolean,
  oldNpUri?: string
) => {
  return buildIntroNp(
    details.ethAddress,
    details.rsaPublickey,
    details.ethToRsaSignature,
    { signDelegation, oldNpUri }
  );
};
