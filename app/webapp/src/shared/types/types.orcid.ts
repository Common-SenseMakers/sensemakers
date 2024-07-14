import { UserDetailsBase } from './types.user';

/** ORCID */
export interface OrcidSignupContext {
  link: string;
}

export interface OrcidSignupData {
  code: string;
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

export type OrcidUserCredentials = Pick<
  AuthenticationResult,
  'access_token' | 'expires_in' | 'refresh_token' | 'scope' | 'token_type'
>;
export type OrcidUserProfile = Pick<AuthenticationResult, 'name'>;

/** For ORCID we only need to store the name of the user */
export interface OrcidUserDetails
  extends UserDetailsBase<OrcidUserProfile, OrcidUserCredentials, undefined> {}
