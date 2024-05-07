import { PLATFORM, UserDetailsBase } from '../@shared/types/types';
import {
  PlatformPostCreate,
  PlatformPostDraft,
  PlatformPostPosted,
  PlatformPostPublish,
} from '../@shared/types/types.platform.posts';
import { GenericPostData, PostAndAuthor } from '../@shared/types/types.posts';
import { TransactionManager } from '../db/transaction.manager';

/** use conditional types to dynamically assign credential types for each platform */
export type CredentialsForPlatform<P> = P extends PLATFORM.Twitter
  ? { accessToken: string }
  : any;

/** there are two fetch modes:
 * - start_time !== undefined: must return all posts after this provided start_time
 * - end_time !== undefined && max_results !== undefined: must return max_results posts before this provided end_time
 */
export interface FetchUserPostsParams {
  start_time?: number; // timestamp in ms
  end_time?: number; // timestamp in ms
  max_results?: number;
  userDetails: UserDetailsBase;
}

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
> extends IdentityService<SignupContext, SignupData, UserDetails> {
  fetch(
    params: FetchUserPostsParams,
    manager: TransactionManager
  ): Promise<PlatformPostPosted[]>;
  publish(
    posts: PlatformPostPublish,
    manager: TransactionManager
  ): Promise<PlatformPostPosted>;
  convertToGeneric(platformPost: PlatformPostCreate): Promise<GenericPostData>;
  convertFromGeneric(postAndAuthor: PostAndAuthor): Promise<PlatformPostDraft>;
}
