import {
  IOAuth2RequestTokenResult,
  TweetV2,
  TweetV2PostTweetResult,
  UserV2,
} from 'twitter-api-v2';

import { UserDetailsBase } from './types';

export type TwitterGetContextParams = {
  callback_url: string;
  type: 'read' | 'write';
};

export type TwitterSignupContext = IOAuth2RequestTokenResult &
  TwitterGetContextParams;

export type TwitterSignupData = TwitterSignupContext & {
  code: string;
};

export interface TwitterUserCredentials {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAtMs: number;
}

export type TwitterUserProfile = Pick<
  UserV2,
  'profile_image_url' | 'name' | 'username' | 'id'
>;

/** For Twitter we need to store the oAuth token and secret as part of the signup process
 * and the access Token and Secret as the credentials need to post in the name of the user
 */
export interface TwitterUserDetails
  extends UserDetailsBase<
    TwitterUserProfile,
    TwitterUserCredentials,
    TwitterUserCredentials
  > {}

export type TweetRead = TweetV2PostTweetResult['data'];

export interface TwitterUser {
  user_id: string;
  screen_name: string;
}

export interface TwitterDraft {
  text: string;
}

export interface TwitterThread {
  conversation_id: string;
  tweets: QuoteTweetV2[];
  author: UserV2;
}

export interface TweetV2WithAuthor extends TweetV2 {
  author: UserV2;
}
export interface QuoteTweetV2 extends TweetV2 {
  quote_tweet?: TweetV2WithAuthor;
}
