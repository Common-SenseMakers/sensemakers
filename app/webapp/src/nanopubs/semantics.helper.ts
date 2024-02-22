import { NpProfile } from '@nanopub/sign';

import { AppUserRead } from '../shared/types';
import { RSAKeys } from '../utils/rsa.keys';

export const NANOPUB_PLACEHOLDER = 'http://purl.org/nanopub/temp/mynanopub#';
export const ASSERTION_URI = `${NANOPUB_PLACEHOLDER}assertion`;
export const HAS_COMMENT_URI = 'https://www.w3.org/2000/01/rdf-schema#comment';

export const getProfile = (rsaKeys: RSAKeys, connectedUser: AppUserRead) => {
  if (connectedUser.orcid) {
    const keyBody = rsaKeys.privateKey
      .replace(/-----BEGIN PRIVATE KEY-----\n?/, '')
      .replace(/\n?-----END PRIVATE KEY-----/, '')
      .replace(/\r/g, '')
      .replace(/\n/g, '');

    return new NpProfile(
      keyBody,
      `https://orcid.org/${connectedUser.orcid.orcid}`,
      `${connectedUser.orcid.name}`,
      ''
    );
  }
};
