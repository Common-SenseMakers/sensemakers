export interface IdentityService<SignupContext, SignupData, UserDetails> {
  getSignupContext: () => Promise<SignupContext>;
  handleSignupData: (signupData: SignupData) => Promise<UserDetails>;
}

export interface PlatformService<SignupContext, SignupData, UserDetails>
  extends IdentityService<SignupContext, SignupData, UserDetails> {}
