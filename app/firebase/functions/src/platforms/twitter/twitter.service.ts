import {
  TOAuth2Scope,
  TTweetv2TweetField,
  TweetV2,
  TweetV2SingleResult,
  TweetV2UserTimelineParams,
  Tweetv2FieldsParams,
  TwitterApi,
  TwitterApiReadOnly,
  UsersV2Params,
} from 'twitter-api-v2';

import { PLATFORM, UserDetailsBase } from '../../@shared/types/types';
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
  ) {}

  /**
   * Get generic client user app credentials
   * */
  private getGenericClient() {
    if (DEBUG) {
      logger.debug('getGenericClient', {
        clientId: this.apiCredentials.clientId.substring(0, 8),
        clientSecret: this.apiCredentials.clientSecret.substring(0, 8),
      });
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
  private async getClientWithCredentials(
    credentials: TwitterUserCredentials,
    type: 'write'
  ): Promise<{
    client: TwitterApi;
    credentials?: TwitterUserCredentials;
  }>;
  private async getClientWithCredentials(
    credentials: TwitterUserCredentials,
    type: 'read'
  ): Promise<{
    client: TwitterApiReadOnly;
    credentials?: TwitterUserCredentials;
  }>;
  private async getClientWithCredentials(
    credentials: TwitterUserCredentials,
    type: 'read' | 'write'
  ): Promise<{
    client: TwitterApi | TwitterApiReadOnly;
    credentials?: TwitterUserCredentials;
  }> {
    let client = new TwitterApi(credentials.accessToken);

    /** Check for refresh token ten minutes before expected expiration */
    if (this.time.now() >= credentials.expiresAtMs - 1000 * 60 * 10) {
      const _client = this.getGenericClient();
      try {
        const {
          client: newClient,
          accessToken,
          refreshToken,
          expiresIn,
        } = await _client.refreshOAuth2Token(credentials.refreshToken);

        client = newClient;

        if (!refreshToken) {
          throw new Error(`Refresh token cannot be undefined`);
        }

        const newCredentials = {
          accessToken,
          refreshToken,
          expiresIn,
          expiresAtMs: this.time.now() + expiresIn * 1000,
        };

        return {
          client: type === 'read' ? client.readOnly : client,
          credentials: newCredentials,
        };
      } catch (e: any) {
        throw new Error(handleTwitterError(e));
      }
    } else {
      return { client: type === 'read' ? client.readOnly : client };
    }
  }

  /**  */
  private async getUserClientAndUpdateDetails(
    userId: string,
    details: TwitterUserDetails,
    type: 'read' | 'write',
    manager: TransactionManager
  ) {
    const credentials = details[type];

    if (!credentials) {
      throw new Error(
        `User credentials for ${type} not found for user ${userId}`
      );
    }

    const { client, credentials: newCredentials } =
      await this.getClientWithCredentials(credentials, type as any);

    /** update user credentials */
    if (newCredentials) {
      let newDetails: TwitterUserDetails;

      newDetails = {
        ...details,
        read: {
          ...newCredentials,
        },
      };

      if (details.write !== undefined) {
        /** if the user has both read and write credentials, update both together since write credentials overwrite read credentials */
        newDetails['write'] = newCredentials;
      }

      this.usersRepo.setPlatformDetails(
        userId,
        PLATFORM.Twitter,
        newDetails,
        manager
      );
    }

    return client;
  }

  /**
   * Get a user-specific client by reading the credentials
   * from the users database
   * */
  private async getUserClient(
    user_id: string,
    type: 'write',
    manager: TransactionManager
  ): Promise<TwitterApi>;
  private async getUserClient(
    user_id: string,
    type: 'read',
    manager: TransactionManager
  ): Promise<TwitterApiReadOnly>;
  private async getUserClient(
    user_id: string,
    type: 'read' | 'write',
    manager: TransactionManager
  ): Promise<TwitterApi | TwitterApiReadOnly> {
    /** read user from the DB */
    const user = await this.usersRepo.getUserWithPlatformAccount(
      PLATFORM.Twitter,
      user_id,
      manager,
      true
    );

    const twitter = user[PLATFORM.Twitter];

    if (!twitter) {
      throw new Error('User dont have twitter credentials');
    }

    const details = twitter.find((c) => c.user_id === user_id);
    if (!details) {
      throw new Error('Unexpected');
    }

    const client = await this.getUserClientAndUpdateDetails(
      user.userId,
      details,
      type,
      manager
    );

    return client;
  }

  /**
   * A wrapper that adapts to the input user details and calls a diferent get client method
   * accordingly
   */
  private async getClient(
    manager: TransactionManager,
    userDetails?: UserDetailsBase,
    userId?: string,
    type?: 'write'
  ): Promise<TwitterApi>;
  private async getClient(
    manager: TransactionManager,
    userDetails?: UserDetailsBase,
    userId?: string,
    type?: 'read'
  ): Promise<TwitterApiReadOnly>;
  private async getClient(
    manager: TransactionManager,
    userDetails?: UserDetailsBase,
    userId?: string,
    type: 'read' | 'write' = 'read'
  ): Promise<TwitterApi | TwitterApiReadOnly> {
    if (!userDetails) {
      if (type === 'write') {
        throw new Error('Cannot provide a write client without user details');
      }
      return this.getGenericClient().readOnly;
    }

    /** if the read or write credentials are undefined, read them from the user_id (slow) */
    if (userDetails[type] === undefined) {
      return this.getUserClient(userDetails.user_id, type as any, manager); // TODO: review unexpected TS error
    }

    if (!userId) {
      throw new Error('userId must be defined');
    }

    /** otherwise use those credentials directly (fast) */
    const client = await this.getUserClientAndUpdateDetails(
      userId,
      userDetails,
      type as any,
      manager
    );

    return client;
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
    /** concatinate all tweets in thread into one app post */
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
