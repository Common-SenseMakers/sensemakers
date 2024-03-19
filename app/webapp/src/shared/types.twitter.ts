import { TweetV2PostTweetResult } from 'twitter-api-v2';

import { UserDetailsBase } from './types';

/** TWITTER */
export interface TwitterSignupContext {
  oauth_token: string;
  oauth_token_secret: string;
  oauth_callback_confirmed: 'true';
  url: string;
}

type TwitterSignupContextStored = Pick<
  TwitterSignupContext,
  'oauth_token' | 'oauth_token_secret'
>;

export type TwitterSignupData = TwitterSignupContextStored & {
  oauth_verifier: string;
};

/** For Twitter we need to store the oAuth token and secret as part of the signup process
 * and the access Token and Secret as the credentials need to post in the name of the user
 */
export interface TwitterUserDetails
  extends UserDetailsBase<
    TwitterSignupContextStored,
    {
      screen_name: string;
    },
    undefined,
    {
      accessToken: string;
      accessSecret: string;
    }
  > {}

export enum TwitterSignupType {
  login = 'login',
  approvePost = 'approvePost',
}

export type TweetRead = TweetV2PostTweetResult['data'];

export interface TwitterUser {
  user_id: string;
  screen_name: string;
}
