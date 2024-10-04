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
import {
  AccountCredentials,
  AccountDetailsBase,
  AppUser,
} from '../@shared/types/types.user';

export interface IdentityService<
  SignupContext,
  SignupData,
  UserDetails extends AccountDetailsBase,
> {
  /** provides info needed by the frontend to start the signup flow */
  getSignupContext: (userId?: string, params?: any) => Promise<SignupContext>;
  /** handles the data obtained by the frontend after the signup flow */
  handleSignupData: (signupData: SignupData) => Promise<UserDetails>;
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
  ): Promise<{
    platformPost: PlatformPostPosted;
    credentials?: AccountCredentials;
  }>;
  fetch(
    params: PlatformFetchParams,
    credentials?: AccountCredentials
  ): Promise<FetchedResult>;
  signDraft(
    post: PlatformPostDraft,
    account: AccountDetailsBase
  ): Promise<DraftType>;
  publish(post: PlatformPostPublish): Promise<PlatformPostPosted>;
  update(post: PlatformPostUpdate): Promise<PlatformPostPosted>;
  convertToGeneric(platformPost: PlatformPostCreate): Promise<GenericThread>;
  convertFromGeneric(postAndAuthor: PostAndAuthor): Promise<PlatformPostDraft>;

  /** for signature based platforms, this creates the draft that represents
   * a delete of a post. The draft is then signed by the user */
  buildDeleteDraft(
    post_id: string,
    post: AppPostFull,
    author: AppUser
  ): Promise<PlatformPostDeleteDraft | undefined>;
}
