import { PlatformFetchParams } from '../@shared/types/types.fetch';
import {
  FetchedResult,
  PlatformPostCreate,
  PlatformPostDeleteDraft,
  PlatformPostDraft,
  PlatformPostPosted,
  PlatformPostPublish,
  PlatformPostUpdate,
} from '../@shared/types/types.platform.posts';
import {
  AppPostFull,
  GenericThread,
  PostAndAuthor,
} from '../@shared/types/types.posts';
import { PlatformAccountProfile } from '../@shared/types/types.profiles';
import {
  AccountCredentials,
  AccountDetailsBase,
  AppUserRead,
} from '../@shared/types/types.user';

export interface WithCredentials {
  credentials?: AccountCredentials;
}

export interface IdentityService<
  SignupContext = any,
  SignupData = any,
  AccountDetails extends AccountDetailsBase = AccountDetailsBase,
  ActualPlatformAccountProfile extends
    PlatformAccountProfile = PlatformAccountProfile,
> {
  /** provides info needed by the frontend to start the signup flow */
  getSignupContext: (userId?: string, params?: any) => Promise<SignupContext>;
  /** handles the data obtained by the frontend after the signup flow */
  handleSignupData: (signupData: SignupData) => Promise<{
    accountDetails: AccountDetails;
    profile: ActualPlatformAccountProfile;
  }>;

  getProfile(
    user_id: string,
    credentials?: any
  ): Promise<PlatformAccountProfile | undefined>;

  getProfileByUsername(
    username: string,
    credentials?: any
  ): Promise<PlatformAccountProfile | undefined>;
}

export interface PlatformService<
  SignupContext = any,
  SignupData = any,
  UserDetails extends AccountDetailsBase = AccountDetailsBase,
  DraftType = any,
> extends IdentityService<SignupContext, SignupData, UserDetails> {
  get(
    post_id: string,
    credentials?: AccountCredentials
  ): Promise<
    {
      platformPost: PlatformPostPosted;
    } & WithCredentials
  >;
  fetch(
    user_id: string,
    params: PlatformFetchParams,
    credentials?: AccountCredentials
  ): Promise<FetchedResult>;
  publish(
    platformPost: PlatformPostPublish
  ): Promise<{ platformPost: PlatformPostPosted } & WithCredentials>;
  update?(
    platformPost: PlatformPostUpdate
  ): Promise<{ platformPost: PlatformPostPosted } & WithCredentials>;

  convertToGeneric(platformPost: PlatformPostCreate): Promise<GenericThread>;
  convertFromGeneric(postAndAuthor: PostAndAuthor): Promise<PlatformPostDraft>;

  signDraft?(post: PlatformPostDraft): Promise<DraftType>;
  /** for signature based platforms, this creates the draft that represents
   * a delete of a post. The draft is then signed by the user */
  buildDeleteDraft?(
    post_id: string,
    post: AppPostFull,
    author: AppUserRead
  ): Promise<PlatformPostDeleteDraft | undefined>;
}
