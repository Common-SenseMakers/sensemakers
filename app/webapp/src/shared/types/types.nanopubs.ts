/** NANOPUB */
import { HexStr, UserDetailsBase } from './types.user';

/**
 * Nanopubs use private keys for authentication, no need to store credentials for each
 * user
 */
export interface NanopubUserProfile {
  rsaPublickey: string;
  ethAddress: HexStr;
  introNanopub?: string;
  ethToRsaSignature: HexStr;
}

export type NanupubSignupData = NanopubUserProfile & {
  ethToRsaSignature: HexStr;
};

export interface NanopubUserDetails
  extends UserDetailsBase<NanopubUserProfile, undefined, undefined> {}

export interface RSAKeys {
  privateKey: string;
  publicKey: string;
  address?: HexStr;
}
