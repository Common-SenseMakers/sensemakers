import { Nanopub, NpProfile } from '@nanopub/sign';

import { RSAKeys } from '../types/types.nanopubs';
import { cleanPrivateKey } from './semantics.helper';

export const DETERMINISTIC_MESSAGE = 'Prepare my Nanopub identity';

export const getEthToRSAMessage = (publicKey: string) => {
  return `This account controls the RSA public key: ${publicKey}`;
};

export const signNanopublication = async (
  nanopubStr: string,
  rsaKeys: RSAKeys,
  introNanopub?: string
) => {
  const nanopubObj = new Nanopub(nanopubStr);
  const keyBody = cleanPrivateKey(rsaKeys);
  const profile = new NpProfile(keyBody, '', '', introNanopub || '');

  const signed = nanopubObj.sign(profile);
  return signed;
};
