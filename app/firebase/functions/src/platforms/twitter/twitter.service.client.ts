import { TwitterApi, TwitterApiReadOnly } from 'twitter-api-v2';

import { PLATFORM, UserDetailsBase } from '../../@shared/types/types';
import {
  TwitterUserCredentials,
  TwitterUserDetails,
} from '../../@shared/types/types.twitter';
import { TransactionManager } from '../../db/transaction.manager';
import { logger } from '../../instances/logger';
import { TimeService } from '../../time/time.service';
import { UsersRepository } from '../../users/users.repository';
import { TwitterApiCredentials } from './twitter.service';
import { handleTwitterError } from './twitter.utils';

const DEBUG = false;

export class TwitterServiceClient {
  constructor(
    protected time: TimeService,
    protected usersRepo: UsersRepository,
    protected apiCredentials: TwitterApiCredentials
  ) {}
  /**
   * Get generic client user app credentials
   * */
  protected getGenericClient() {
    if (DEBUG) {
      logger.debug('getGenericClient', {
        clientId: this.apiCredentials.clientId.substring(0, 8),
        clientSecret: this.apiCredentials.clientSecret.substring(0, 8),
      });
    }

    return new TwitterApi({
      clientId: this.apiCredentials.clientId,
      clientSecret: this.apiCredentials.clientSecret,
    });
  }

  /**
   * Get user-specific client using user credentials, it may
   * return a new set of credentials if the previous ones
   * expired
   * */
  protected async getClientWithCredentials(
    credentials: TwitterUserCredentials,
    type: 'write'
  ): Promise<{
    client: TwitterApi;
    credentials?: TwitterUserCredentials;
  }>;
  protected async getClientWithCredentials(
    credentials: TwitterUserCredentials,
    type: 'read'
  ): Promise<{
    client: TwitterApiReadOnly;
    credentials?: TwitterUserCredentials;
  }>;
  protected async getClientWithCredentials(
    credentials: TwitterUserCredentials,
    type: 'read' | 'write'
  ): Promise<{
    client: TwitterApi | TwitterApiReadOnly;
    credentials?: TwitterUserCredentials;
  }> {
    let client = new TwitterApi(credentials.accessToken);

    /** Check for refresh token ten minutes before expected expiration */
    if (this.time.now() >= credentials.expiresAtMs - 1000 * 60 * 10) {
      const _client = this.getGenericClient();
      try {
        const {
          client: newClient,
          accessToken,
          refreshToken,
          expiresIn,
        } = await _client.refreshOAuth2Token(credentials.refreshToken);

        client = newClient;

        if (!refreshToken) {
          throw new Error(`Refresh token cannot be undefined`);
        }

        const newCredentials = {
          accessToken,
          refreshToken,
          expiresIn,
          expiresAtMs: this.time.now() + expiresIn * 1000,
        };

        return {
          client: type === 'read' ? client.readOnly : client,
          credentials: newCredentials,
        };
      } catch (e: any) {
        throw new Error(handleTwitterError(e));
      }
    } else {
      return { client: type === 'read' ? client.readOnly : client };
    }
  }

  /**  */
  protected async getUserClientAndUpdateDetails(
    userId: string,
    details: TwitterUserDetails,
    type: 'read' | 'write',
    manager: TransactionManager
  ) {
    const credentials = details[type];

    if (!credentials) {
      throw new Error(
        `User credentials for ${type} not found for user ${userId}`
      );
    }

    const { client, credentials: newCredentials } =
      await this.getClientWithCredentials(credentials, type as any);

    /** update user credentials */
    if (newCredentials) {
      let newDetails: TwitterUserDetails;

      newDetails = {
        ...details,
        read: {
          ...newCredentials,
        },
      };

      if (details.write !== undefined) {
        /** if the user has both read and write credentials, update both together since write credentials overwrite read credentials */
        newDetails['write'] = newCredentials;
      }

      this.usersRepo.setPlatformDetails(
        userId,
        PLATFORM.Twitter,
        newDetails,
        manager
      );
    }

    return client;
  }

  /**
   * Get a user-specific client by reading the credentials
   * from the users database
   * */
  protected async getUserClient(
    user_id: string,
    type: 'write',
    manager: TransactionManager
  ): Promise<TwitterApi>;
  protected async getUserClient(
    user_id: string,
    type: 'read',
    manager: TransactionManager
  ): Promise<TwitterApiReadOnly>;
  protected async getUserClient(
    user_id: string,
    type: 'read' | 'write',
    manager: TransactionManager
  ): Promise<TwitterApi | TwitterApiReadOnly> {
    /** read user from the DB */
    const user = await this.usersRepo.getUserWithPlatformAccount(
      PLATFORM.Twitter,
      user_id,
      manager,
      true
    );

    const twitter = user[PLATFORM.Twitter];

    if (!twitter) {
      throw new Error('User dont have twitter credentials');
    }

    const details = twitter.find((c) => c.user_id === user_id);
    if (!details) {
      throw new Error('Unexpected');
    }

    const client = await this.getUserClientAndUpdateDetails(
      user.userId,
      details,
      type,
      manager
    );

    return client;
  }

  /**
   * A wrapper that adapts to the input user details and calls a diferent get client method
   * accordingly
   */
  protected async getClient(
    manager: TransactionManager,
    userDetails?: UserDetailsBase,
    userId?: string,
    type?: 'write'
  ): Promise<TwitterApi>;
  protected async getClient(
    manager: TransactionManager,
    userDetails?: UserDetailsBase,
    userId?: string,
    type?: 'read'
  ): Promise<TwitterApiReadOnly>;
  protected async getClient(
    manager: TransactionManager,
    userDetails?: UserDetailsBase,
    userId?: string,
    type: 'read' | 'write' = 'read'
  ): Promise<TwitterApi | TwitterApiReadOnly> {
    if (!userDetails) {
      if (type === 'write') {
        throw new Error('Cannot provide a write client without user details');
      }
      return this.getGenericClient().readOnly;
    }

    /** if the read or write credentials are undefined, read them from the user_id (slow) */
    if (userDetails[type] === undefined) {
      return this.getUserClient(userDetails.user_id, type as any, manager); // TODO: review unexpected TS error
    }

    if (!userId) {
      throw new Error('userId must be defined');
    }

    /** otherwise use those credentials directly (fast) */
    const client = await this.getUserClientAndUpdateDetails(
      userId,
      userDetails,
      type as any,
      manager
    );

    return client;
  }
}
