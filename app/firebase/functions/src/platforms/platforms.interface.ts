import { UserDetailsBase, WithPlatformUserId } from '../@shared/types';
import { AppPostPublish, PlatformPost } from '../@shared/types.posts';

export interface FetchUserPostsParams {
  user_id: string;
  start_time: number; // timestamp in ms
  credentials: any;
}

export interface IdentityService<
  SignupContext,
  SignupData,
  UserDetails extends WithPlatformUserId,
> {
  /** provides info needed by the frontend to start the signup flow */
  getSignupContext: (userId?: string, params?: any) => Promise<SignupContext>;
  /** handles the data obtained by the frontend after the signup flow */
  handleSignupData: (signupData: SignupData) => Promise<UserDetails>;
}

export interface GenericPostData {
  content: string;
}

export interface PlatformService<
  SignupContext = any,
  SignupData = any,
  UserDetails extends UserDetailsBase = WithPlatformUserId,
> extends IdentityService<SignupContext, SignupData, UserDetails> {
  fetch(params: FetchUserPostsParams[]): Promise<any[]>;
  convertToGeneric(platformPost: PlatformPost): GenericPostData;
  publish(
    post: AppPostPublish,
    write: NonNullable<UserDetails['write']>
  ): Promise<PlatformPost>;
}
