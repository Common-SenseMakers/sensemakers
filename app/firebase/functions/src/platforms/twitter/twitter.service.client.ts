import {
  TOAuth2Scope,
  TwitterApi,
  TwitterApiReadOnly,
  UsersV2Params,
} from 'twitter-api-v2';

import {
  TwitterAccountDetails,
  TwitterCredentials,
  TwitterGetContextParams,
  TwitterProfile,
  TwitterSignupData,
} from '../../@shared/types/types.twitter';
import { logger } from '../../instances/logger';
import { TimeService } from '../../time/time.service';
import { UsersRepository } from '../../users/users.repository';
import { TwitterApiCredentials } from './twitter.service';
import { handleTwitterError } from './twitter.utils';

const DEBUG = false;
const DEBUG_PREFIX = 'TwitterServiceClient';

export type GetClientResult<T extends 'read' | 'write' | undefined> =
  T extends 'write'
    ? { client: TwitterApi; credentials: TwitterCredentials }
    : { client: TwitterApiReadOnly; credentials: TwitterCredentials };

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
      logger.debug(
        'getGenericClient',
        {
          clientId: this.apiCredentials.clientId.substring(0, 8),
          clientSecret: this.apiCredentials.clientSecret.substring(0, 8),
        },
        DEBUG_PREFIX
      );
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
    credentials: TwitterCredentials,
    type: 'write'
  ): Promise<{
    client: TwitterApi;
    credentials?: TwitterCredentials;
  }>;
  protected async getClientWithCredentials(
    credentials: TwitterCredentials,
    type: 'read'
  ): Promise<{
    client: TwitterApiReadOnly;
    credentials?: TwitterCredentials;
  }>;
  protected async getClientWithCredentials(
    credentials: TwitterCredentials,
    type: 'read' | 'write'
  ): Promise<{
    client: TwitterApi | TwitterApiReadOnly;
    credentials?: TwitterCredentials;
  }> {
    const client = new TwitterApi(credentials.accessToken);

    if (DEBUG)
      logger.debug('getClientWithCredentials', { credentials }, DEBUG_PREFIX);

    /** Check for refresh token anytime after ten minutes before expected expiration */
    if (this.time.now() >= credentials.expiresAtMs - 1000 * 60 * 10) {
      const _client = this.getGenericClient();
      try {
        if (DEBUG)
          logger.debug(
            'getClientWithCredentials - refreshOAuth2Token() - old token:',
            credentials.refreshToken,
            DEBUG_PREFIX
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
            newCredentials,
            DEBUG_PREFIX
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

  /**
   * A wrapper that adapts to the input credentials and calls a diferent get client method
   * accordingly
   */
  protected async getClient<T extends 'read' | 'write' | undefined = 'read'>(
    credentials?: TwitterCredentials,
    type: T = 'read' as T
  ): Promise<GetClientResult<T>> {
    if (!credentials) {
      /** get a generic client if no credentials are provided */
      if (type === 'write') {
        throw new Error('Cannot provide a write client without user details');
      }
      return { client: this.getGenericClient().readOnly } as GetClientResult<T>;
    }

    /** otherwise use those credentials directly (fast) */
    const { client, credentials: newCredentials } =
      await this.getClientWithCredentials(credentials, type as any);

    return { client, credentials: newCredentials } as GetClientResult<T>;
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

    if (DEBUG) logger.debug('getSignupContext', authDetails, DEBUG_PREFIX);

    return { ...authDetails, ...params };
  }

  async handleSignupData(data: TwitterSignupData) {
    if (DEBUG) logger.debug('handleSignupData', data, DEBUG_PREFIX);

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

    if (!result.refreshToken) {
      throw new Error('Unexpected undefined refresh token');
    }

    if (!result.expiresIn) {
      throw new Error('Unexpected undefined refresh token');
    }

    const credentials: TwitterCredentials = {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      expiresAtMs: this.time.now() + result.expiresIn * 1000,
    };

    if (DEBUG)
      logger.debug('handleSignupData', { user, credentials }, DEBUG_PREFIX);

    const twitter: TwitterAccountDetails = {
      user_id: user.id,
      signupDate: 0,
      credentials: {
        read: credentials,
      },
    };

    /** the same credentials apply for reading and writing */
    if (data.type === 'write') {
      twitter.credentials['write'] = credentials;
    }

    if (DEBUG) logger.debug('handleSignupData', twitter, DEBUG_PREFIX);

    return { accountDetails: twitter, profile: user };
  }

  async getProfileByUsername(
    username: string,
    credentials?: TwitterCredentials
  ): Promise<TwitterProfile | null> {
    try {
      const { client } = await this.getClient(credentials, 'read');
      const userResponse = await client.v2.userByUsername(username, {
        'user.fields': ['id', 'name', 'username', 'profile_image_url'],
      });

      if (userResponse.data) {
        return {
          id: userResponse.data.id,
          name: userResponse.data.name,
          username: userResponse.data.username,
          profile_image_url: userResponse.data.profile_image_url,
        };
      }
      return null;
    } catch (e: any) {
      throw new Error(handleTwitterError(e));
    }
  }
}
