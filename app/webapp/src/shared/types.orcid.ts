import { UserDetailsBase } from './types';

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
    undefined,
    {
      name: string;
    },
    undefined,
    undefined
  > {}
