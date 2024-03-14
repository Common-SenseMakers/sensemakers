import { AppUserCreate, PLATFORM } from '../@shared/types';
import { logger } from '../instances/logger';
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

  /** Derive the userId from a user object */
  public getUserId(user: AppUserCreate): string {
    if (user[PLATFORM.Orcid]) {
      return `orcid:${user[PLATFORM.Orcid][0].user_id}`;
    }

    if (user[PLATFORM.Twitter]) {
      if (!user[PLATFORM.Twitter][0].user_id) {
        throw new Error(`Cannot create user without twitter user_id`);
      }
      return `twitter:${user[PLATFORM.Twitter][0].user_id}`;
    }

    if (user[PLATFORM.Nanopubs]) {
      return `nanopub:${user[PLATFORM.Nanopubs][0].user_id}`;
    }

    throw new Error(`Cannot create user without details`);
  }

  /** Create a new user, its only called as part of the handleSignup method */
  protected async create(user: AppUserCreate) {
    logger.debug(`Creating user`, user);

    const userId = this.getUserId(user);
    const userIdRef = await this.repo.createUser(userId, user);

    if (userId !== userIdRef) {
      throw new Error(`userIds wont match ${userId} and ${userIdRef}`);
    }

    logger.debug(`Created user`, { userId, user });

    return userId;
  }

  /** This method request the user signup context and stores it in the user profile */
  public async getSignupContext(platform: PLATFORM, userId?: string) {
    const context =
      await this.getIdentityService(platform).getSignupContext(userId);

    if (userId) {
      await this.repo.addUserDetails(userId, platform, context);
    }

    return context;
  }

  /**
   * This method validates the signup data and stores it in the user profile. If
   * a userId is provided the user must exist and a new platform is added to it,
   * otherewise a new user is created.
   */
  public async handleSignup(
    platform: PLATFORM,
    _signupData: any,
    _userId?: string
  ) {
    /**
     * signup data is obtained from the provided one merged with the current user
     * signupData (in case getSignupContext precomputed some user details)
     */
    let currentDetails = {};
    if (_userId) {
      const user = await this.repo.getUser(_userId, true);
      const allDetails = user[platform];
      currentDetails = allDetails ? allDetails[0] : {};
    }

    /**
     * validate the signup data for this platform and convert it into
     * user details
     */
    const signupData = { ...currentDetails, ..._signupData };
    const userDetails =
      await this.getIdentityService(platform).handleSignupData(signupData);

    let userId = _userId;

    /** create user if it does not exist */
    if (!_userId) {
      userId = await this.create({ [platform]: [userDetails] });
    } else {
      if (!userId) throw new Error('unexpected');
      await this.repo.addUserDetails(userId, platform, userDetails);
    }

    return userId;
  }
}
