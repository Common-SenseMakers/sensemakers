import { UserDetailsBase } from './types.user';

/** ORCID */
export interface OrcidSignupContext {
  link: string;
}

export interface OrcidSignupData {
  code: string;
}

/** For ORCID we only need to store the name of the user */
export interface OrcidUserDetails
  extends UserDetailsBase<
    {
      name: string;
    },
    undefined,
    undefined
  > {}
