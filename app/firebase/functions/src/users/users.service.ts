import { AppUserCreate } from '../@shared/types';
import { logger } from '../instances/logger';
import { UsersRepository } from './users.repository';

export class UsersService {
  constructor(public repo: UsersRepository) {}

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

  /** Create a new user */
  public async create(user: AppUserCreate) {
    logger.debug(`Creating user ${JSON.stringify(user)}`);

    const userId = this.getUserId(user);

    const userIdRef = await this.repo.setUser(userId, user);

    if (userId !== userIdRef) {
      throw new Error(`userIds wont match ${userId} and ${userIdRef}`);
    }

    logger.debug(`Created user ${JSON.stringify({ userId, user })}`);

    return userId;
  }
}
