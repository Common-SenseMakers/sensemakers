import { NpProfile } from '@nanopub/sign';

import { AppUserRead } from '../../../shared/types/types';
import { RSAKeys } from '../../../shared/types/types.nanopubs';
import { cleanPrivateKey } from '../../../shared/utils/semantics.helper';

export const getProfile = (rsaKeys: RSAKeys, user: AppUserRead) => {
  const profile = new NpProfile(cleanPrivateKey(rsaKeys), '', '', '');
  return profile;
};
