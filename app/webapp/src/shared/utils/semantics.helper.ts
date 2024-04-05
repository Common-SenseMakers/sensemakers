import { NpProfile } from '@nanopub/sign';

import { RSAKeys } from '../types/types.nanopubs';

export const THIS_POST_NAME = 'http://sensentes/ThisText';
export const NANOPUB_PLACEHOLDER = 'http://purl.org/nanopub/temp/mynanopub#';
export const ASSERTION_URI = `${NANOPUB_PLACEHOLDER}assertion`;
export const HAS_COMMENT_URI = 'http://www.w3.org/2000/01/rdf-schema#comment';

export const getProfile = (rsaKeys: RSAKeys, introNanopub: string) => {
  const keyBody = rsaKeys.privateKey
    .replace(/-----BEGIN PRIVATE KEY-----\n?/, '')
    .replace(/\n?-----END PRIVATE KEY-----/, '')
    .replace(/\r/g, '')
    .replace(/\n/g, '');

  return new NpProfile(keyBody, `0009-0004-1787-0341`, `Pepo`, introNanopub);
};
