import { TweetV2PostTweetResult, TwitterApi } from 'twitter-api-v2';

import { AppUser, TwitterUser } from '../../@shared/types';
import { TWITTER_CALLBACK_URL } from '../../config/config';
import { UsersService } from '../../users/users.service';
import { PlatformService } from '../platform.service';

export interface ApiCredentials {
  key: string;
  secret: string;
}

export interface TokenVerifier {
  oauth_token: string;
  oauth_verifier: string;
}

export class TwitterService implements PlatformService {
  constructor(
    protected users: UsersService,
    protected credentials: ApiCredentials
  ) {}

  private getGenericClient() {
    return new TwitterApi({
      appKey: this.credentials.key,
      appSecret: this.credentials.secret,
    });
  }

  private async getUserClientInternal(user: AppUser) {
    if (!user.twitter || !user.twitter.oauth_token_secret) {
      throw new Error('Twitter credentials not found');
    }

    return new TwitterApi({
      appKey: this.credentials.key,
      appSecret: this.credentials.secret,
      accessToken: user.twitter.oauth_token,
      accessSecret: user.twitter.oauth_token_secret,
    });
  }

  private async getUserClient(_user: AppUser | string) {
    let user = _user;
    if (typeof _user === 'string') {
      user = await this.users.repo.getUser(_user as string, true);
    }

    return this.getUserClientInternal(user as AppUser);
  }

  public async getAuthLink(userId: string): Promise<string> {
    const client = this.getGenericClient();

    const authLink = await client.generateAuthLink(TWITTER_CALLBACK_URL, {
      linkMode: 'authorize',
    });

    /** store user credentials */
    await this.users.repo.setUserTwitterCredentials(userId, {
      oauth_token: authLink.oauth_token,
      oauth_token_secret: authLink.oauth_token_secret,
    });

    return authLink.url;
  }

  async getAccessToken(
    userId: string,
    oauth: TokenVerifier
  ): Promise<TwitterUser> {
    const user = await this.users.repo.getUser(userId, true);

    if (!user.twitter || !user.twitter.oauth_token_secret) {
      throw new Error('Twitter credentials not found');
    }

    if (user.twitter.oauth_token !== oauth.oauth_token) {
      throw new Error(
        `User ${userId} oauth_token mismatch. "${oauth.oauth_token}" was expected to be "${user.twitter.oauth_token}" `
      );
    }

    const client = await this.getUserClient(user);
    const result = await client.login(oauth.oauth_verifier);

    const twitter: AppUser['twitter'] = {
      oauth_verifier: oauth.oauth_verifier,
      accessToken: result.accessToken,
      accessSecret: result.accessSecret,
      user_id: result.userId,
      screen_name: result.screenName,
    };

    await this.users.repo.setUserTwitterCredentials(userId, twitter);

    if (!twitter.user_id) {
      throw new Error(`userId not returned`);
    }

    if (!twitter.screen_name) {
      throw new Error(`screen_name not returned`);
    }

    return {
      user_id: twitter.user_id,
      screen_name: twitter.screen_name,
    };
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
