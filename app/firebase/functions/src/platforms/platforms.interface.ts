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
  AppUser,
  PLATFORM,
  UserDetailsBase,
} from '../@shared/types/types.user';
import { TransactionManager } from '../db/transaction.manager';

/** use conditional types to dynamically assign credential types for each platform */
export type CredentialsForPlatform<P> = P extends PLATFORM.Twitter
  ? { accessToken: string }
  : any;

export interface IdentityService<
  SignupContext,
  SignupData,
  UserDetails extends UserDetailsBase,
> {
  /** provides info needed by the frontend to start the signup flow */
  getSignupContext: (userId?: string, params?: any) => Promise<SignupContext>;
  /** handles the data obtained by the frontend after the signup flow */
  handleSignupData: (signupData: SignupData) => Promise<UserDetails>;
}

export interface PlatformService<
  SignupContext = any,
  SignupData = any,
  UserDetails extends UserDetailsBase = UserDetailsBase,
  DraftType = any,
> extends IdentityService<SignupContext, SignupData, UserDetails> {
  get(
    post_id: string,
    userDetails: UserDetailsBase,
    manager?: TransactionManager
  ): Promise<PlatformPostPosted>;
  fetch(
    params: PlatformFetchParams,
    userDetails: UserDetailsBase,
    manager: TransactionManager
  ): Promise<FetchedResult>;
  signDraft(
    post: PlatformPostDraft,
    account: UserDetailsBase
  ): Promise<DraftType>;
  publish(
    post: PlatformPostPublish,
    manager: TransactionManager
  ): Promise<PlatformPostPosted>;
  update(
    post: PlatformPostUpdate,
    manager: TransactionManager
  ): Promise<PlatformPostPosted>;
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
