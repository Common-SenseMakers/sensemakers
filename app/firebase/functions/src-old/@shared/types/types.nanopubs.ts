/** NANOPUB */
import { AccountDetailsBase, HexStr } from './types.user';

/**
 * Nanopubs use private keys for authentication, no need to store credentials for each
 * user
 */
export interface NanopubProfile {
  rsaPublickey: string;
  ethAddress: HexStr;
  introNanopubDraft?: string;
  introNanopubSigned?: string;
  introNanopubUri?: string;
  ethToRsaSignature: HexStr;
}

export type NanupubSignupContext = NanopubProfile;

export type NanupubSignupData = NanopubProfile & {
  ethToRsaSignature: HexStr;
};

export interface NanopubAccountDetails extends AccountDetailsBase {}

export interface RSAKeys {
  privateKey: string;
  publicKey: string;
  address?: HexStr;
}

export interface NanopubSigninCredentials {
  ethPrivateKey: HexStr;
}
