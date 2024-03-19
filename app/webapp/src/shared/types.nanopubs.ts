/** NANOPUB */
import { HexStr, UserDetailsBase } from './types';

/**
 * Nanopubs use private keys for authentication, no need to store credentials for each
 * user
 */
export interface NanopubUserDetails
  extends UserDetailsBase<
    undefined,
    {
      rsaPublickey: string;
      ethAddress: HexStr;
      ethSignature: HexStr;
      introNanopub?: string;
    },
    undefined,
    undefined
  > {}

export interface AppPostConstructNanopub {
  content: string;
}
