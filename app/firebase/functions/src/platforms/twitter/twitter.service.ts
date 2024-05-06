import {
  TOAuth2Scope,
  TTweetv2TweetField,
  TweetV2,
  TweetV2SingleResult,
  TweetV2UserTimelineParams,
  Tweetv2FieldsParams,
  UsersV2Params,
} from 'twitter-api-v2';

import { UserDetailsBase } from '../../@shared/types/types';
import {
  PlatformPostCreate,
  PlatformPostDraft,
  PlatformPostPosted,
  PlatformPostPublish,
} from '../../@shared/types/types.platform.posts';
import '../../@shared/types/types.posts';
import {
  GenericPostData,
  PostAndAuthor,
} from '../../@shared/types/types.posts';
import {
  TwitterDraft,
  TwitterGetContextParams,
  TwitterQueryParameters,
  TwitterSignupContext,
  TwitterSignupData,
  TwitterThread,
  TwitterUserCredentials,
  TwitterUserDetails,
} from '../../@shared/types/types.twitter';
import { TransactionManager } from '../../db/transaction.manager';
import { logger } from '../../instances/logger';
import { TimeService } from '../../time/time.service';
import { UsersRepository } from '../../users/users.repository';
import { FetchUserPostsParams, PlatformService } from '../platforms.interface';
import { TwitterServiceClient } from './twitter.service.client';
import {
  dateStrToTimestampMs,
  getTweetTextWithUrls,
  handleTwitterError,
} from './twitter.utils';

const DEBUG = true;

export interface TwitterApiCredentials {
  clientId: string;
  clientSecret: string;
}

/** check https://github.com/PLhery/node-twitter-api-v2/blob/master/doc/auth.md#oauth2-user-wide-authentication-flow for OAuth2 flow */

/** Twitter service handles all interactions with Twitter API */
export class TwitterService
  extends TwitterServiceClient
  implements
    PlatformService<
      TwitterSignupContext,
      TwitterSignupData,
      TwitterUserDetails
    >
{
  constructor(
    protected time: TimeService,
    protected usersRepo: UsersRepository,
    protected apiCredentials: TwitterApiCredentials
  ) {
    super(time, usersRepo, apiCredentials);
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
      'offline.access',
      'users.read',
    ];

    if (params.type === 'write') {
      scope.push('tweet.write');
    }

    const authDetails = await client.generateOAuth2AuthLink(
      params.callback_url,
      {
        scope,
      }
    );

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
      'user.fields': ['profile_image_url'],
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
      lastFetchedMs: 0,
      signupDate: 0,
      profile: user,
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

  /** methods non part of Platform interface should be protected (private) */
  protected async fetchInternal(
    params: TwitterQueryParameters,
    manager: TransactionManager,
    userDetails?: UserDetailsBase
  ): Promise<TwitterThread[]> {
    const readOnlyClient = await this.getClient(manager, userDetails, 'read');

    const tweetFields: TTweetv2TweetField[] = [
      'created_at',
      'author_id',
      'text',
      'entities',
      'note_tweet',
      'conversation_id',
    ];

    /** twitter min page size is 5, max could be larger */
    const pageSize = (() => {
      if (!params.max_results) return 10;
      if (params.max_results < 5) return 5;
      if (params.max_results > 10) return 10;
      return params.max_results;
    })();

    const pageSize0 = params.max_results
      ? Math.min(params.max_results, pageSize)
      : pageSize;

    const timelineParams: Partial<TweetV2UserTimelineParams> = {
      start_time: params.start_time,
      end_time: params.end_time,
      max_results: 100,
      'tweet.fields': tweetFields,
      exclude: ['retweets', 'replies'],
    };

    try {
      const result = await readOnlyClient.v2.userTimeline(
        params.user_id,
        timelineParams
      );

      const tweetThreadsMap = new Map<string, TweetV2[]>();
      /** organize tweets by conversation id to group them into threads */
      result.data.data.forEach((tweet) => {
        if (tweet.conversation_id) {
          if (!tweetThreadsMap.has(tweet.conversation_id)) {
            tweetThreadsMap.set(tweet.conversation_id, []);
          }
          tweetThreadsMap.get(tweet.conversation_id)?.push(tweet);
        } else {
          throw new Error('tweet does not have a conversation_id');
        }
      });

      const resultCollection: TweetV2[] =
        result.data.data?.slice(0, pageSize0) || [];

      let nextToken = result.meta.next_token;

      while (nextToken) {
        /**
         * limit the total number of results to max_result.
         * Warning. different interpreation than the twitter API,
         * where max_results is the page size
         */
        if (DEBUG) logger.debug('fetchInternal', { params, resultCollection });
        const nextResult = await readOnlyClient.v2.userTimeline(
          params.user_id,
          {
            ...timelineParams,
            pagination_token: nextToken,
          }
        );
        /** organize tweets by conversation id to group them into threads */
        nextResult.data.data.forEach((tweet) => {
          if (tweet.conversation_id) {
            if (!tweetThreadsMap.has(tweet.conversation_id)) {
              tweetThreadsMap.set(tweet.conversation_id, []);
            }
            tweetThreadsMap.get(tweet.conversation_id)?.push(tweet);
          } else {
            throw new Error('tweet does not have a conversation_id');
          }
        });

        nextToken = nextResult.meta.next_token;
        if (tweetThreadsMap.keys.length >= pageSize) {
          break;
        }
      }
      const twitterThreads: TwitterThread[] = [];

      tweetThreadsMap.forEach((tweets, conversation_id) => {
        /** sort tweets in thread by id so that they are in order */
        tweets.sort((tweetA, tweetB) => Number(tweetA.id) - Number(tweetB.id));
        twitterThreads.push({ conversation_id, tweets });
      });

      if (params.max_results) {
        return twitterThreads.slice(0, params.max_results);
      }
      return twitterThreads;
    } catch (e: any) {
      throw new Error(handleTwitterError(e));
    }
  }

  public async fetch(
    params: FetchUserPostsParams,
    manager: TransactionManager
  ): Promise<PlatformPostPosted<TwitterThread>[]> {
    const threads = await this.fetchInternal(
      {
        user_id: params.userDetails.user_id,
        start_time:
          params.start_time && params.start_time !== 0
            ? new Date(params.start_time).toISOString()
            : undefined,
        end_time: params.end_time
          ? new Date(params.end_time).toISOString()
          : undefined,
        max_results: params.max_results,
      },
      manager,
      params.userDetails
    );

    return threads.map((thread) => {
      if (!thread.tweets[0].author_id) {
        throw new Error(`Unexpected author_id undefined`);
      }
      if (!thread.tweets[0].created_at) {
        throw new Error(
          `Unexpected created_at undefined, how would we know the timestamp then? )`
        );
      }
      return {
        post_id: thread.conversation_id,
        user_id: thread.tweets[0].author_id,
        timestampMs: dateStrToTimestampMs(thread.tweets[0].created_at),
        post: thread,
      };
    });
  }

  public async convertToGeneric(
    platformPost: PlatformPostCreate<TwitterThread>
  ): Promise<GenericPostData> {
    if (!platformPost.posted) {
      throw new Error('Unexpected undefined posted');
    }
    const thread = platformPost.posted.post;
    /** concatenate all tweets in thread into one app post */
    const threadText = thread.tweets.map(getTweetTextWithUrls).join('\n---\n');
    return {
      content: threadText,
    };
  }

  /** if user_id is provided it must be from the authenticated userId */
  public async getPost(
    tweetId: string,
    manager: TransactionManager,
    user_id?: string
  ) {
    const options: Partial<Tweetv2FieldsParams> = {
      'tweet.fields': ['author_id', 'created_at'],
    };

    const client = user_id
      ? await this.getUserClient(user_id, 'read', manager)
      : this.getGenericClient();

    return client.v2.singleTweet(tweetId, options);
  }

  /** user_id must be from the authenticated userId */
  public async publish(
    postPublish: PlatformPostPublish<TwitterDraft>,
    manager: TransactionManager
  ): Promise<PlatformPostPosted<TweetV2SingleResult>> {
    // TODO udpate to support many
    const userDetails = postPublish.userDetails;
    const post = postPublish.draft;

    const client = await this.getClient(manager, userDetails, 'write');

    try {
      // Post the tweet and also read the tweet
      const result = await client.v2.tweet(post.text);
      if (result.errors) {
        throw new Error(`Error posting tweet`);
      }

      const tweet = await this.getPost(
        result.data.id,
        manager,
        userDetails.user_id
      );

      if (!tweet.data.author_id) {
        throw new Error(`Unexpected author_id undefined`);
      }

      if (!tweet.data.created_at) {
        throw new Error(
          `Unexpected created_at undefined, how would we know the timestamp then? )`
        );
      }

      return {
        post_id: tweet.data.id,
        user_id: tweet.data.author_id,
        timestampMs: dateStrToTimestampMs(tweet.data.created_at),
        post: tweet,
      };
    } catch (e: any) {
      throw new Error(handleTwitterError(e));
    }
  }

  convertFromGeneric(
    postAndAuthor: PostAndAuthor
  ): Promise<PlatformPostDraft<any>> {
    throw new Error('Method not implemented.');
  }
}
