import { PLATFORM, UserDetailsBase } from '../@shared/types/types';
import {
  FetchedResult,
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
 * - start_time !== undefined: must return max_results or all posts after this provided start_time
 * - end_time !== undefined : must return max_results or at least 10 posts before this provided end_time
 */
export interface FetchParams {
  sinceId?: string;
  untilId?: string;
  expectedAmount?: number;
}

export interface FetchUserPostsParams {
  mode: 'forward' | 'backward';
  expectedAmount: number;
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
    params: FetchParams,
    userDetails: UserDetailsBase,
    manager: TransactionManager
  ): Promise<FetchedResult>;
  publish(
    posts: PlatformPostPublish,
    manager: TransactionManager
  ): Promise<PlatformPostPosted>;
  convertToGeneric(platformPost: PlatformPostCreate): Promise<GenericPostData>;
  convertFromGeneric(postAndAuthor: PostAndAuthor): Promise<PlatformPostDraft>;
}
