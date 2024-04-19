import { Nanopub, NpProfile } from '@nanopub/sign';

import { RSAKeys } from '../../@shared/types/types.nanopubs';
import { cleanPrivateKey } from '../../@shared/utils/semantics.helper';

export const signNanopublication = async (
  nanopubStr: string,
  rsaKeys: RSAKeys,
  introNanopub: string
) => {
  const nanopubObj = new Nanopub(nanopubStr);
  const keyBody = cleanPrivateKey(rsaKeys);
  const profile = new NpProfile(keyBody, '', '', introNanopub);

  const signed = nanopubObj.sign(profile);
  return signed;
};
