import { logger } from 'firebase-functions/v1';

import { AppUserCreate } from '../@shared/types';
import { UsersRepository } from './users.repository';

export class UsersService {
  constructor(protected usersRepo: UsersRepository) {}

  /** Derive the userId from a user object */
  public getUserId(user: AppUserCreate): string {
    if (user.orcid) {
      return `orcid:${user.orcid}`;
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

    const userIdRef = await this.usersRepo.setUser(userId, user);

    if (userId !== userIdRef) {
      throw new Error(`userIds wont match ${userId} and ${userIdRef}`);
    }

    logger.debug(`Created user ${JSON.stringify({ userId, user })}`);

    return userId;
  }
}
