import { PLATFORM } from '../@shared/types';

export interface IdentityService<SignupContext, SignupData, UserDetails> {
  getSignupContext: () => Promise<SignupContext>;
  handleSignupData: (signupData: SignupData) => Promise<UserDetails>;
}

export interface PlatformService<SignupContext, SignupData, UserDetails>
  extends IdentityService<SignupContext, SignupData, UserDetails> {}

export type IdentityPlatforms = Map<PLATFORM, IdentityService<any, any, any>>;
