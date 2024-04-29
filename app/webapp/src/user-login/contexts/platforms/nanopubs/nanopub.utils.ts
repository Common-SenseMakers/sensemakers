import { NpProfile } from '@nanopub/sign';

import { RSAKeys } from '../../../../shared/types/types.nanopubs';
import { cleanPrivateKey } from '../../../../shared/utils/semantics.helper';

export const getProfile = (rsaKeys: RSAKeys) => {
  const profile = new NpProfile(cleanPrivateKey(rsaKeys), '', '', '');
  return profile;
};
