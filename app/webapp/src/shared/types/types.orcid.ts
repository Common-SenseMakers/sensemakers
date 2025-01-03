import { PlatformProfile } from './types.profiles';
import { AccountDetailsBase } from './types.user';

/** ORCID */
export interface OrcidSignupContext {
  callbackUrl: string;
}

export interface OrcidSignupData {
  code: string;
  callbackUrl: string;
}

export interface AuthenticationResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  name: string;
  orcid: string;
}

export type OrcidCredentials = Pick<
  AuthenticationResult,
  'access_token' | 'expires_in' | 'refresh_token' | 'scope' | 'token_type'
>;
export type OrcidProfile = PlatformProfile &
  Pick<AuthenticationResult, 'orcid'>;

/** For ORCID we only need to store the name of the user */
export type OrcidAccountDetails = AccountDetailsBase<{
  read?: OrcidCredentials;
}>;
