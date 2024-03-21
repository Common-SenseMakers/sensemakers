import { TweetV2PostTweetResult, TwitterApi } from 'twitter-api-v2';

import {
  TwitterGetContextParams,
  TwitterSignupContext,
  TwitterSignupData,
  TwitterUserDetails,
} from '../../@shared/types.twitter';
import { PlatformService } from '../platforms.interface';

export interface TwitterApiCredentials {
  clientId: string;
  clientSecret: string;
}

/** check https://github.com/PLhery/node-twitter-api-v2/blob/master/doc/auth.md#oauth2-user-wide-authentication-flow for OAuth2 flow */

/** Twitter service handles all interactions with Twitter API */
export class TwitterService
  implements
    PlatformService<
      TwitterSignupContext,
      TwitterSignupData,
      TwitterUserDetails
    >
{
  constructor(protected credentials: TwitterApiCredentials) {}

  private getGenericClient() {
    return new TwitterApi({
      clientId: this.credentials.clientId,
      clientSecret: this.credentials.clientSecret,
    });
  }

  private async getUserClient(accessToken: string) {
    return new TwitterApi(accessToken);
  }

  public async getSignupContext(
    userId?: string,
    params?: TwitterGetContextParams
  ) {
    const client = this.getGenericClient();

    if (!params) {
      throw new Error('params must be defined');
    }

    const authDetails = await client.generateOAuth2AuthLink(
      params.callback_url,
      {
        scope: ['tweet.read', 'offline.access'],
      }
    );

    return { ...authDetails, callback_url: params.callback_url };
  }

  async handleSignupData(data: TwitterSignupData): Promise<TwitterUserDetails> {
    const client = await this.getGenericClient();

    const result = await client.loginWithOAuth2({
      code: data.code,
      codeVerifier: data.codeVerifier,
      redirectUri: data.callback_url,
    });

    const { data: user } = await result.client.v2.me();

    if (!result.refreshToken) {
      throw new Error('Unexpected undefined refresh token');
    }

    if (!result.expiresIn) {
      throw new Error('Unexpected undefined refresh token');
    }

    const twitter: TwitterUserDetails = {
      user_id: user.id,
      write: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
      },
      profile: user,
    };

    return twitter;
  }

  async postMessageTwitter(
    accessToken: string,
    text: string
  ): Promise<TweetV2PostTweetResult['data']> {
    const client = await this.getUserClient(accessToken);
    const result = await client.v2.tweet(text);

    return result.data;
  }

  async fetch() {
    return [];
  }
}
