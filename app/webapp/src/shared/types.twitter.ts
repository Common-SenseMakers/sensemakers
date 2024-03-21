import {
  IOAuth2RequestTokenResult,
  TweetV2PostTweetResult,
  UserV2,
} from 'twitter-api-v2';

import { UserDetailsBase } from './types';

export type TwitterGetContextParams = {
  callback_url: string;
};

export type TwitterSignupContext = IOAuth2RequestTokenResult &
  TwitterGetContextParams;

export type TwitterSignupData = TwitterSignupContext & {
  code: string;
};

/** For Twitter we need to store the oAuth token and secret as part of the signup process
 * and the access Token and Secret as the credentials need to post in the name of the user
 */
export interface TwitterUserDetails
  extends UserDetailsBase<
    UserV2,
    undefined,
    {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }
  > {}

export type TweetRead = TweetV2PostTweetResult['data'];

export interface TwitterUser {
  user_id: string;
  screen_name: string;
}
