import {
  TOAuth2Scope,
  TTweetv2TweetField,
  TweetV2,
  TweetV2PaginableTimelineResult,
  TweetV2SingleResult,
  Tweetv2FieldsParams,
  TwitterApi,
  TwitterApiReadOnly,
} from 'twitter-api-v2';

import { PLATFORM, UserDetailsBase } from '../../@shared/types';
import {
  AppPost,
  PlatformPost,
  PostToPublish,
} from '../../@shared/types.posts';
import {
  TwitterGetContextParams,
  TwitterQueryParameters,
  TwitterSignupContext,
  TwitterSignupData,
  TwitterUserCredentials,
  TwitterUserDetails,
} from '../../@shared/types.twitter';
import { TimeService } from '../../time/time.service';
import { UsersRepository } from '../../users/users.repository';
import {
  FetchUserPostsParams,
  GenericPostData,
  PlatformService,
} from '../platforms.interface';
import { handleTwitterError } from './twitter.utils';

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
    protected credentials: TwitterApiCredentials
  ) {}
  /**
   *
   * @param dateStr ISO 8601 date string, e.g. '2021-09-01T00:00:00Z'
   * @returns unix timestamp in milliseconds
   */
  public dateStrToTimestampMs(dateStr: string) {
    const date = new Date(dateStr);
    return date.getTime();
  }

  /**
   * Get generic client user app credentials
   * */
  private getGenericClient() {
    return new TwitterApi({
      clientId: this.credentials.clientId,
      clientSecret: this.credentials.clientSecret,
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
    /** Check for refresh token ten minutes before expected expiration */
    if (this.time.now() >= credentials.expiresAtMs - 1000 * 60 * 10) {
      const genericClient = this.getGenericClient();
      /** */
      const { client, accessToken, refreshToken, expiresIn } =
        await genericClient.refreshOAuth2Token(credentials.refreshToken);

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
    } else {
      const client = new TwitterApi(credentials.accessToken);
      return { client: type === 'read' ? client.readOnly : client };
    }
  }

  /**
   * Get a user-specific client but reads the credentials
   * from the users database
   * */
  private async getUserClient(
    user_id: string,
    type: 'write'
  ): Promise<TwitterApi>;
  private async getUserClient(
    user_id: string,
    type: 'read'
  ): Promise<TwitterApiReadOnly>;
  private async getUserClient(
    user_id: string,
    type: 'read' | 'write'
  ): Promise<TwitterApi | TwitterApiReadOnly> {
    /** read user from the DB */
    const user = await this.usersRepo.getUserWithPlatformAccount(
      PLATFORM.Twitter,
      user_id,
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

    const credentials = details[type];
    if (!credentials) {
      throw new Error(
        `User credentials for ${type} not found for user ${user.userId}`
      );
    }

    const { client, credentials: newCredentials } =
      await this.getClientWithCredentials(credentials, type as any);

    /** update user credentials */
    if (newCredentials) {
      const newDetails = {
        ...details,
        [type]: newCredentials,
      };

      this.usersRepo.setPlatformDetails(
        user.userId,
        PLATFORM.Twitter,
        newDetails
      );
    }

    return client;
  }

  /**
   * A wrapper that adapts to the input user details and calls a diferent get client method
   * accordingly
   */
  private async getClient(
    userDetails?: UserDetailsBase,
    type?: 'write'
  ): Promise<TwitterApi>;
  private async getClient(
    userDetails?: UserDetailsBase,
    type?: 'read'
  ): Promise<TwitterApiReadOnly>;
  private async getClient(
    userDetails?: UserDetailsBase,
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
      return this.getUserClient(userDetails.user_id, type as any); // TODO: review unexpected TS error
    }

    /** otherwise use those credentials directly (fast) */
    const { client } = await this.getClientWithCredentials(
      userDetails[type],
      type as any
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
    const client = this.getGenericClient();

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

    const credentials: TwitterUserCredentials = {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      expiresAtMs: this.time.now() + result.expiresIn * 1000,
    };

    const twitter: TwitterUserDetails = {
      user_id: user.id,
      signupDate: 0,
      profile: user,
    };

    /** the same credentials apply for reading and writing */
    if (data.type === 'write') {
      twitter[data.type] = credentials;
    }

    /** always store the credential as read credentials */
    twitter.read = {
      ...credentials,
      lastFetchedMs: this.time.now(),
    };

    return twitter;
  }

  /** methods non part of Platform interface should be protected (private) */
  protected async fetchInternal(
    params: TwitterQueryParameters,
    userDetails?: UserDetailsBase
  ): Promise<TweetV2PaginableTimelineResult['data']> {
    const readOnlyClient = await this.getClient(userDetails, 'read');

    const tweetFields: TTweetv2TweetField[] = ['created_at', 'author_id'];

    try {
      const result = await readOnlyClient.v2.userTimeline(params.user_id, {
        start_time: params.start_time,
        end_time: params.end_time,
        max_results: params.max_results,
        'tweet.fields': tweetFields,
      });

      const resultCollection: TweetV2[] = result.data.data;
      let nextToken = result.meta.next_token;

      while (nextToken) {
        const nextResult = await readOnlyClient.v2.userTimeline(
          params.user_id,
          {
            start_time: params.start_time,
            end_time: params.end_time,
            max_results: params.max_results,
            'tweet.fields': tweetFields,
            pagination_token: nextToken,
          }
        );
        resultCollection.push(...nextResult.data.data);
        nextToken = nextResult.meta.next_token;
      }

      return resultCollection;
    } catch (e: any) {
      throw new Error(handleTwitterError(e));
    }
  }

  public async fetch(
    params: FetchUserPostsParams[]
  ): Promise<PlatformPost<TweetV2>[]> {
    const allAccountTweetPromises = params.map((fetchUserPostsParams) =>
      this.fetchInternal(
        {
          user_id: fetchUserPostsParams.userDetails.user_id,
          start_time: new Date(fetchUserPostsParams.start_time).toISOString(),
          end_time: fetchUserPostsParams.end_time
            ? new Date(fetchUserPostsParams.end_time).toISOString()
            : undefined,
        },
        fetchUserPostsParams.userDetails
      )
    );

    const allAccountTweets = (
      await Promise.all(allAccountTweetPromises)
    ).flat();

    return allAccountTweets.map((tweet) => {
      if (!tweet.author_id) {
        throw new Error(`Unexpected author_id undefined`);
      }
      if (!tweet.created_at) {
        throw new Error(
          `Unexpected created_at undefined, how would we know the timestamp then? )`
        );
      }
      return {
        platformId: PLATFORM.Twitter,
        post_id: tweet.id,
        user_id: tweet.author_id,
        timestampMs: this.dateStrToTimestampMs(tweet.created_at),
        original: tweet,
      };
    });
  }

  public async convertToGeneric(
    platformPost: PlatformPost<TweetV2>
  ): Promise<GenericPostData> {
    if (
      platformPost.original.author_id &&
      platformPost.original.author_id !== platformPost.user_id
    ) {
      throw new Error(
        `unexpected author_id ${platformPost.original.author_id}, Expected ${platformPost.user_id} `
      );
    }

    return {
      content: platformPost.original.text,
    };
  }

  /** if user_id is provided it must be from the authenticated userId */
  public async getPost(tweetId: string, user_id?: string) {
    const options: Partial<Tweetv2FieldsParams> = {
      'tweet.fields': ['author_id', 'created_at'],
    };

    const client = user_id
      ? await this.getUserClient(user_id, 'read')
      : this.getGenericClient();

    return client.v2.singleTweet(tweetId, options);
  }

  /** user_id must be from the authenticated userId */
  public async publish(
    posts: PostToPublish[]
  ): Promise<PlatformPost<TweetV2SingleResult>[]> {
    // TODO udpate to support many
    const userDetails = posts[0].userDetails;
    const post = posts[0].post;

    const client = await this.getClient(userDetails, 'write');

    try {
      const result = await client.v2.tweet(post.content);
      if (result.errors) {
        throw new Error(`Error posting tweet`);
      }

      const tweet = await this.getPost(result.data.id, userDetails.user_id);

      if (!tweet.data.author_id) {
        throw new Error(`Unexpected author_id undefined`);
      }

      if (!tweet.data.created_at) {
        throw new Error(
          `Unexpected created_at undefined, how would we know the timestamp then? )`
        );
      }

      return [
        {
          platformId: PLATFORM.Twitter,
          post_id: tweet.data.id,
          user_id: tweet.data.author_id,
          timestampMs: this.dateStrToTimestampMs(tweet.data.created_at),
          original: tweet,
        },
      ];
    } catch (e: any) {
      throw new Error(handleTwitterError(e));
    }
  }

  convertFromGeneric(post: AppPost): Promise<PlatformPost<any>> {
    throw new Error('Method not implemented.');
  }
}
