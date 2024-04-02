import {
  PLATFORM,
  UserDetailsBase,
  WithPlatformUserId,
} from '../@shared/types';
import { AppPostPublish, PlatformPost } from '../@shared/types.posts';

/** use conditional types to dynamically assign credential types for each platform */
export type CredentialsForPlatform<P> = P extends PLATFORM.Twitter
  ? { accessToken: string }
  : any;

export interface FetchUserPostsParams<P extends PLATFORM> {
  user_id: string;
  start_time: number; // timestamp in ms
  /** end_time is useful for testing and some platforms may need to explicitely define the end time of the fetch */
  end_time?: number; // timestamp in ms
  credentials: CredentialsForPlatform<P>;
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
  fetch(params: FetchUserPostsParams<PLATFORM>[]): Promise<PlatformPost[]>;
  convertToGeneric(platformPost: PlatformPost): GenericPostData;
  publish(
    post: AppPostPublish,
    write: NonNullable<UserDetails['write']>
  ): Promise<PlatformPost>;
}
