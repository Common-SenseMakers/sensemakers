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

export type TwitterUser = Required<Pick<UserV2, 'id' | 'username' | 'name'>>;

export interface TwitterDraft {
  text: string;
}

export interface TwitterThread {
  conversation_id: string;
  tweets: AppTweet[];
  author: TwitterUser;
}

export const requiredTweetFields = [
  'id',
  'created_at',
  'author_id',
  'text',
  'entities',
  'conversation_id',
] as const;

export const optionalTweetFields = ['note_tweet'] as const;

type RequiredTweetFields = (typeof requiredTweetFields)[number];
type OptionalTweetFields = (typeof optionalTweetFields)[number];

export type AppTweetBase = Required<Pick<TweetV2, RequiredTweetFields>> &
  Pick<TweetV2, OptionalTweetFields>;

export type AppQuotedTweet = AppTweetBase & {
  author: TwitterUser;
};

/** our internal representation of a tweet */
export interface AppTweet extends AppTweetBase {
  quoted_tweet?: AppQuotedTweet;
}
