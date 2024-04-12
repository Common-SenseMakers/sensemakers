import { RSAKeys } from '../types/types.nanopubs';

export const THIS_POST_NAME = 'http://sensentes/ThisText';
export const NANOPUB_PLACEHOLDER = 'http://purl.org/nanopub/temp/mynanopub#';
export const ASSERTION_URI = `${NANOPUB_PLACEHOLDER}assertion`;
export const HAS_COMMENT_URI = 'http://www.w3.org/2000/01/rdf-schema#comment';

export const cleanPrivateKey = (rsaKeys: RSAKeys) => {
  const keyBody = rsaKeys.privateKey
    .replace(/-----BEGIN PRIVATE KEY-----\n?/, '')
    .replace(/\n?-----END PRIVATE KEY-----/, '')
    .replace(/\r/g, '')
    .replace(/\n/g, '');

  return keyBody;
};
