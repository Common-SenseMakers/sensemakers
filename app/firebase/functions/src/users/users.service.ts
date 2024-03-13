import { AppUserCreate, PLATFORM } from '../@shared/types';
import { logger } from '../instances/logger';
import { IdentityServices } from '../platforms/identity.service';
import { UsersRepository } from './users.repository';

export class UsersService {
  constructor(
    public repo: UsersRepository,
    protected identityServices: IdentityServices
  ) {}

  private getIdentityService(platform: PLATFORM) {
    const service = this.identityServices.get(platform);
    if (!service) {
      throw new Error(`Identity service ${platform} not found`);
    }
    return service;
  }

  /** Derive the userId from a user object */
  public getUserId(user: AppUserCreate): string {
    if (user.orcid) {
      return `orcid:${user.orcid.orcid}`;
    }

    if (user.twitter) {
      if (!user.twitter.user_id) {
        throw new Error(`Cannot create user without twitter user_id`);
      }
      return `twitter:${user.twitter.user_id}`;
    }

    if (user.eth) {
      return `eth:${user.eth.ethAddress}`;
    }

    throw new Error(`Cannot create user without details`);
  }

  /** Create a new user, its only called as part of the handleSignup method */
  protected async create(user: AppUserCreate) {
    logger.debug(`Creating user`, user);

    const userId = this.getUserId(user);

    const userIdRef = await this.repo.setUser(userId, user);

    if (userId !== userIdRef) {
      throw new Error(`userIds wont match ${userId} and ${userIdRef}`);
    }

    logger.debug(`Created user`, { userId, user });

    return userId;
  }

  /**
   * A user profile is made up of a dictionary of PLATFORM => authenticationDetails
   * These details may be OAuth access tokens, or details about the user identity
   * like its public key/address.
   *
   * This method validates the signup data and stores it in the user profile. If
   * a userId is provided the user must exist.
   */
  public async handleSignup(
    platform: PLATFORM,
    signupData: any,
    _userId?: string
  ) {
    const userDetails =
      this.getIdentityService(platform).handleSignupData(signupData);

    /** this is a new platform of an existing user */
    if (_userId) {
      const user = await this.repo.getUser(_userId, true);
      user[platform] = userDetails;
    } else {
      const userId = await this.create({ [platform]: userDetails });
      if (userId !== _userId) {
        throw new Error(`Unexpected userId ${userId}. Expected ${_userId}`);
      }
    }
  }
}
