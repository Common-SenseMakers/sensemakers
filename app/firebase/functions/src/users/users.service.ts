import { PLATFORM } from '../@shared/types';
import { IdentityPlatforms } from '../platforms/platforms.interface';
import { UsersRepository } from './users.repository';

/**
 * A user profile is made up of a dictionary of PLATFORM => Arrray<AuthenticationDetails>
 * One user can have multiple profiles on each platform.
 *
 * Authentication details may be OAuth access tokens, or validated details about the user
 * identity like its public key/address.
 */
export class UsersService {
  constructor(
    public repo: UsersRepository,
    public platforms: IdentityPlatforms
  ) {}

  private getIdentityService(platform: PLATFORM) {
    const service = this.platforms.get(platform);
    if (!service) {
      throw new Error(`Identity service ${platform} not found`);
    }
    return service;
  }

  /**
   * This method request the user signup context and stores it in the user profile.
   * If the user is not defined (first time), the details are stored on a temporary
   * collection and associated to a random signup_token
   */
  public async getSignupContext(
    platform: PLATFORM,
    userId?: string,
    params?: any
  ) {
    const context = await this.getIdentityService(platform).getSignupContext(
      userId,
      params
    );

    return context;
  }

  /**
   * This method validates the signup data and stores it in the user profile. If
   * a userId is provided the user must exist and a new platform is added to it,
   * otherewise a new user is created.
   */
  public async handleSignup(
    platform: PLATFORM,
    signupData: any,
    _userId?: string // MUST be the authenticated userId
  ) {
    /**
     * validate the signup data for this platform and convert it into
     * user details
     */
    const userDetails =
      await this.getIdentityService(platform).handleSignupData(signupData);

    let userId = _userId;

    /** create user if it does not exist */
    if (!_userId) {
      userId = `${platform}:${userDetails.user_id}`;
      await this.repo.createUser(userId, { [platform]: [userDetails] });
    } else {
      if (!userId) throw new Error('unexpected');
      await this.repo.addUserDetails(userId, platform, userDetails);
    }

    return userId;
  }
}
