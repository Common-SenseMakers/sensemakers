/**
 * A AccountProfile is the data associated to one user_id on one platformId.
 * Signed-up users must have/will one AccountProfile for each account they have registered.
 * Other AccountProfile can be created for non singed-up users whose timelines/posts we fetch.
 * All fetch-status-related data is associated to an AccountProfile, not to a User.
 */
import { IDENTITY_PLATFORM } from './types.platforms';

export interface WithPlatformUserId {
  /** We are using user_id to refer the id of the user on a given platform and leave
   * userId for our own internal id for users. */
  user_id: string;
}

export interface FetchedDetails {
  newest_id?: string;
  oldest_id?: string;
}

/** Keep tracks of all Accounts known to the app. */
export interface AccountProfile<P = any> {
  id: string;
  platformId: IDENTITY_PLATFORM;
  user_id: string;
  userId?: string;
  profile?: P;
  fetched?: FetchedDetails;
}

export interface PlatformProfile {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  description?: string;
}

export type AccountProfileCreate<P = any> = Omit<AccountProfile<P>, 'id'>;
export type AccountProfileBase<P = any> = Omit<
  AccountProfile<P>,
  'id' | 'platformId'
>;
