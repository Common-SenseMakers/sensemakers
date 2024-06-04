import {
  TOAuth2Scope,
  TwitterApi,
  TwitterApiReadOnly,
  UsersV2Params,
} from 'twitter-api-v2';

import { PLATFORM, UserDetailsBase } from '../../@shared/types/types';
import {
  TwitterGetContextParams,
  TwitterSignupData,
  TwitterUserCredentials,
  TwitterUserDetails,
  TwitterUserProfile,
} from '../../@shared/types/types.twitter';
import { TransactionManager } from '../../db/transaction.manager';
import { logger } from '../../instances/logger';
import { TimeService } from '../../time/time.service';
import { UsersRepository } from '../../users/users.repository';
import { TwitterApiCredentials } from './twitter.service';
import { handleTwitterError } from './twitter.utils';

const DEBUG = true;

export type GetClientResultInternal<T extends 'read' | 'write' = 'read'> =
  T extends 'read'
    ? {
        client: TwitterApiReadOnly;
        oldDetails: TwitterUserDetails;
        newDetails?: TwitterUserDetails;
      }
    : {
        client: TwitterApi;
        oldDetails: TwitterUserDetails;
        newDetails?: TwitterUserDetails;
      };

export type GetClientResult<T extends 'read' | 'write' | undefined> =
  T extends 'write' ? TwitterApi : TwitterApiReadOnly;

/** check https://github.com/PLhery/node-twitter-api-v2/blob/master/doc/auth.md#oauth2-user-wide-authentication-flow for OAuth2 flow */

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
    const client = new TwitterApi(credentials.accessToken);

    if (DEBUG) logger.debug('getClientWithCredentials', { credentials });

    /** Check for refresh token anytime after ten minutes before expected expiration */
    if (this.time.now() >= credentials.expiresAtMs - 1000 * 60 * 10) {
      const _client = this.getGenericClient();
      try {
        if (DEBUG)
          logger.debug(
            'getClientWithCredentials - refreshOAuth2Token() - old token:',
            credentials.refreshToken
          );

        const {
          client: newClient,
          accessToken,
          refreshToken,
          expiresIn,
        } = await _client.refreshOAuth2Token(credentials.refreshToken);

        if (!refreshToken) {
          throw new Error(`Refresh token cannot be undefined`);
        }

        const newCredentials = {
          accessToken,
          refreshToken,
          expiresIn,
          expiresAtMs: this.time.now() + expiresIn * 1000,
        };

        if (DEBUG)
          logger.debug(
            'getClientWithCredentials - newCredentials',
            newCredentials
          );

        return {
          client: type === 'read' ? newClient.readOnly : newClient,
          credentials: newCredentials,
        };
      } catch (e: any) {
        logger.error('getClientWithCredentials - refreshOAuth2Token()', e);
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

    let newDetails: TwitterUserDetails | undefined = undefined;

    /** update user credentials */
    if (newCredentials) {
      if (DEBUG)
        logger.debug(
          'getUserClientAndUpdateDetails - newCredentials',
          newCredentials
        );

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

      if (DEBUG)
        logger.debug('getUserClientAndUpdateDetails - newDetails', newDetails);

      await this.usersRepo.setPlatformDetails(
        userId,
        PLATFORM.Twitter,
        newDetails,
        manager
      );
    }

    return { client, newDetails };
  }

  /**
   * Get a user-specific client by reading the credentials
   * from the users database
   * */
  private async getUserClientInternal<T extends 'read' | 'write'>(
    user_id: string,
    type: T,
    manager: TransactionManager
  ): Promise<GetClientResultInternal<T>> {
    /** read user from the DB */
    const userId = await this.usersRepo.getUserWithPlatformAccount(
      PLATFORM.Twitter,
      user_id,
      manager,
      true
    );

    const user = await this.usersRepo.getUser(userId, manager, true);

    const twitter = user[PLATFORM.Twitter];

    if (!twitter) {
      throw new Error('User dont have twitter credentials');
    }

    const details = twitter.find((c) => c.user_id === user_id);
    if (!details) {
      throw new Error('Unexpected');
    }

    const { client, newDetails } = await this.getUserClientAndUpdateDetails(
      user.userId,
      details,
      type,
      manager
    );

    return { client, oldDetails: details, newDetails };
  }

  /**
   * Get a user-specific client by reading the credentials
   * from the users database
   * */
  protected async getUserClient<T extends 'read' | 'write'>(
    user_id: string,
    type: T,
    manager: TransactionManager
  ): Promise<T extends 'read' ? TwitterApiReadOnly : TwitterApi> {
    /** read user from the DB */
    const { client } = await this.getUserClientInternal(user_id, type, manager);
    return client as T extends 'read' ? TwitterApiReadOnly : TwitterApi;
  }

  /**
   * A wrapper that adapts to the input user details and calls a diferent get client method
   * accordingly
   */
  protected async getClient<T extends 'read' | 'write' | undefined = 'read'>(
    manager: TransactionManager,
    userDetails: UserDetailsBase,
    userId: string,
    type: T = 'read' as T
  ): Promise<GetClientResult<T>> {
    if (!userDetails) {
      if (type === 'write') {
        throw new Error('Cannot provide a write client without user details');
      }
      return this.getGenericClient().readOnly as GetClientResult<T>;
    }

    /** otherwise use those credentials directly (fast) */
    const client = await this.getUserClientAndUpdateDetails(
      userId,
      userDetails,
      type as any,
      manager
    );

    return client.client as GetClientResult<T>;
  }

  public async getSignupContext(
    userId?: string,
    params?: TwitterGetContextParams
  ) {
    const client = this.getGenericClient();

    if (!params) {
      throw new Error('params must be defined');
    }

    const scope: TOAuth2Scope[] = [
      'tweet.read',
      'users.read',
      'offline.access',
    ];

    if (params.type === 'write') {
      scope.push('tweet.write');
    }

    const authDetails = client.generateOAuth2AuthLink(params.callback_url, {
      scope,
    });

    return { ...authDetails, ...params };
  }

  async handleSignupData(data: TwitterSignupData): Promise<TwitterUserDetails> {
    if (DEBUG) logger.debug('handleSignupData', data);
    const client = this.getGenericClient();

    const result = await client.loginWithOAuth2({
      code: data.code,
      codeVerifier: data.codeVerifier,
      redirectUri: data.callback_url,
    });

    const profileParams: Partial<UsersV2Params> = {
      'user.fields': ['profile_image_url', 'name', 'username'],
    };
    const { data: user } = await result.client.v2.me(profileParams);
    if (DEBUG) logger.debug('handleSignupData', user);

    if (!result.refreshToken) {
      throw new Error('Unexpected undefined refresh token');
    }

    if (!result.expiresIn) {
      throw new Error('Unexpected undefined refresh token');
    }

    const credentials: TwitterUserCredentials = {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      expiresAtMs: this.time.now() + result.expiresIn * 1000,
    };

    const twitter: TwitterUserDetails = {
      user_id: user.id,
      signupDate: 0,
      profile: user as TwitterUserProfile,
    };

    /** always store the credential as read credentials */
    twitter.read = credentials;
    /** the same credentials apply for reading and writing */
    if (data.type === 'write') {
      twitter['write'] = credentials;
    }

    if (DEBUG) logger.debug('handleSignupData', twitter);

    return twitter;
  }
}
