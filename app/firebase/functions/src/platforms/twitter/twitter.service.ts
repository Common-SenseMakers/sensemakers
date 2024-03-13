import { TweetV2PostTweetResult, TwitterApi } from 'twitter-api-v2';

import { AppUser, TwitterUser } from '../../@shared/types';
import { TWITTER_CALLBACK_URL } from '../../config/config';
import { PlatformService } from '../identity.service';

export interface TwitterApiCredentials {
  key: string;
  secret: string;
}

export interface TwitterSignupContext {
  link: string;
}

export interface TwitterSignupData {
  oauth_token: string;
  oauth_verifier: string;
}

export interface TwitterUserDetails {
  orcid: string;
  name: string;
}

export class TwitterService
  implements
    PlatformService<
      TwitterSignupContext,
      TwitterSignupData,
      TwitterUserDetails
    >
{
  constructor(protected credentials: ApiCredentials) {}

  private getGenericClient() {
    return new TwitterApi({
      appKey: this.credentials.key,
      appSecret: this.credentials.secret,
    });
  }

  private async getUserClient(twitter: {
    oauth_token: string;
    oauth_token_secret: string;
  }) {
    if (!twitter || !twitter.oauth_token_secret) {
      throw new Error('Twitter credentials not found');
    }

    return new TwitterApi({
      appKey: this.credentials.key,
      appSecret: this.credentials.secret,
      accessToken: twitter.oauth_token,
      accessSecret: twitter.oauth_token_secret,
    });
  }

  public async getSignupData() {
    const client = this.getGenericClient();

    const authLink = await client.generateAuthLink(TWITTER_CALLBACK_URL, {
      linkMode: 'authorize',
    });

    return { links: authLink };
  }

  async handleSignupData(
    oauth: TwitterSignupData
  ): Promise<AppUser['twitter']> {
    const client = await this.getUserClient({});
    const result = await client.login(oauth.oauth_verifier);

    const twitter: AppUser['twitter'] = {
      oauth_verifier: oauth.oauth_verifier,
      accessToken: result.accessToken,
      accessSecret: result.accessSecret,
      user_id: result.userId,
      screen_name: result.screenName,
    };

    return twitter;
  }

  async postMessageTwitter(
    userId: string,
    text: string
  ): Promise<TweetV2PostTweetResult['data']> {
    const client = await this.getUserClient(userId);
    const result = await client.v2.tweet(text);

    return result.data;
  }

  async fetch() {
    return [];
  }
}
