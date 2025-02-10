/**
 * A AccountProfile is the data associated to one user_id on one platformId.
 * Signed-up users must have/will one AccountProfile for each account they have registered.
 * Other AccountProfile can be created for non singed-up users whose timelines/posts we fetch.
 * All fetch-status-related data is associated to an AccountProfile, not to a User.
 */
import { IDENTITY_PLATFORM, PLATFORM } from './types.platforms';

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
export interface AccountProfile<P extends PlatformProfile = PlatformProfile> {
  id: string;
  platformId: IDENTITY_PLATFORM;
  user_id: string;
  userId: string | null;
  profile?: P;
  fetched?: FetchedDetails;
  autofetch?: boolean;
  clusters?: string[];
}

export type ProfileUpdate = Partial<
  Pick<AccountProfile, 'autofetch' | 'userId'>
>;

export const profileDefaults: Partial<AccountProfile> = {
  autofetch: true,
};

export type AccountProfileRead = Omit<
  AccountProfile,
  'fetched' | 'id' | 'clusters'
>;

export interface PlatformProfile {
  id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  description?: string;
}

export type AccountProfileCreate<P extends PlatformProfile = PlatformProfile> =
  Omit<AccountProfile<P>, 'id' | 'clusters'>;

export type AccountProfileBase<P extends PlatformProfile = PlatformProfile> =
  Omit<AccountProfile<P>, 'id' | 'platformId'>;

/** the profile data that platform services should return when asked for a profile */
export type PlatformAccountProfile<
  P extends PlatformProfile = PlatformProfile,
> = Pick<AccountProfile<P>, 'user_id' | 'profile'>;

export type ProfilesQueryParams = Partial<
  Pick<AccountProfile, 'platformId' | 'userId' | 'autofetch'>
> & { userIdDefined?: boolean } & { limit?: number } & { clusterId?: string };

export interface AddProfilesPayload {
  profilesUrls: string[];
  cluster: string;
}

/**
 * wrapper to contatin the profileId or
 * the platform/username of a profiel
 */
export interface ProfileIdentifier {
  profileId?: string;
  platform?: IDENTITY_PLATFORM;
  username?: string;
}

export interface FetchPlatfomAccountTaskData {
  profileId: string;
  amount: number;
  latest: boolean;
}

export interface GetProfilePayload {
  platformId: PLATFORM;
  user_id?: string;
  username?: string;
}

export interface GetClusterProfiles {
  clusterId?: string;
}
