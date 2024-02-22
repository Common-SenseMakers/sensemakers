import { TweetV2PostTweetResult, TwitterApi } from 'twitter-api-v2';

import { TwitterUser } from '../@shared/types';
import {
  TWITTER_API_KEY,
  TWITTER_API_SECRET_KEY,
  TWITTER_CALLBACK_URL,
} from '../config/config';
import { getUser, setUser } from '../db/user.repo';

interface ApiCredentials {
  key: string;
  secret: string;
}

const apiCredentials: ApiCredentials = {
  key: TWITTER_API_KEY,
  secret: TWITTER_API_SECRET_KEY,
};

export const getTwitterAuthLink = async (userId: string): Promise<string> => {
  const client = new TwitterApi({
    appKey: apiCredentials.key,
    appSecret: apiCredentials.secret,
  });

  const authLink = await client.generateAuthLink(TWITTER_CALLBACK_URL, {
    linkMode: 'authorize',
  });

  /** store user credentials */
  const user = await getUser(userId, true);

  user.twitter = {
    oauth_token: authLink.oauth_token,
    oauth_token_secret: authLink.oauth_token_secret,
  };

  await setUser(user);

  return authLink.url;
};

export interface TokenVerifier {
  oauth_token: string;
  oauth_verifier: string;
}

export const getTwitterAccessToken = async (
  userId: string,
  oauth: TokenVerifier
): Promise<TwitterUser> => {
  const user = await getUser(userId, true);

  if (!user.twitter || !user.twitter.oauth_token_secret) {
    throw new Error('Twitter credentials not found');
  }

  if (user.twitter.oauth_token !== oauth.oauth_token) {
    throw new Error(
      `User ${userId} oauth_token mismatch. "${oauth.oauth_token}" was expected to be "${user.twitter.oauth_token}" `
    );
  }

  const client = new TwitterApi({
    appKey: apiCredentials.key,
    appSecret: apiCredentials.secret,
    accessToken: user.twitter.oauth_token,
    accessSecret: user.twitter.oauth_token_secret,
  });

  const result = await client.login(oauth.oauth_verifier);

  user.twitter.oauth_verifier = oauth.oauth_verifier;
  user.twitter.accessToken = result.accessToken;
  user.twitter.accessSecret = result.accessSecret;
  user.twitter.user_id = result.userId;
  user.twitter.screen_name = result.screenName;

  /** store access credentials */
  await setUser(user);

  return {
    user_id: user.twitter.user_id,
    screen_name: user.twitter.screen_name,
  };
};

export const postMessageTwitter = async (
  userId: string,
  text: string
): Promise<TweetV2PostTweetResult['data']> => {
  const user = await getUser(userId, true);

  if (!user.twitter || !user.twitter.accessToken || !user.twitter.accessToken) {
    throw new Error(`Twitter access credentials not found for user ${userId}`);
  }

  const client = new TwitterApi({
    appKey: apiCredentials.key,
    appSecret: apiCredentials.secret,
    accessToken: user.twitter.accessToken,
    accessSecret: user.twitter.accessSecret,
  });

  const result = await client.v2.tweet(text);

  return result.data;
};
