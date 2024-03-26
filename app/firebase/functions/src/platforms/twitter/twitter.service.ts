import {
  TOAuth2Scope,
  TTweetv2TweetField,
  TweetV2,
  TweetV2PaginableTimelineResult,
  TweetV2SingleResult,
  Tweetv2FieldsParams,
  TwitterApi,
} from 'twitter-api-v2';

import { PLATFORM } from '../../@shared/types';
import { AppPostPublish, PlatformPost } from '../../@shared/types.posts';
import {
  TwitterGetContextParams,
  TwitterQueryParameters,
  TwitterSignupContext,
  TwitterSignupData,
  TwitterUserDetails,
} from '../../@shared/types.twitter';
import {
  FetchUserPostsParams,
  GenericPostData,
  PlatformService,
} from '../platforms.interface';

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
  constructor(protected credentials: TwitterApiCredentials) {}

  /**
   *
   * @param dateStr ISO 8601 date string, e.g. '2021-09-01T00:00:00Z'
   * @returns unix timestamp in milliseconds
   */
  public dateStrToTimestampMs(dateStr: string) {
    const date = new Date(dateStr);
    return date.getTime();
  }

  private getGenericClient() {
    return new TwitterApi({
      clientId: this.credentials.clientId,
      clientSecret: this.credentials.clientSecret,
    });
  }

  private getUserClient(accessToken: string) {
    return new TwitterApi(accessToken);
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

    const twitter: TwitterUserDetails = {
      user_id: user.id,
      write: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
      },
      profile: user,
    };

    return twitter;
  }

  /** methods non part of Platform interface should be protected (private) */
  protected async fetchInternal(
    params: TwitterQueryParameters,
    accessToken: string
  ): Promise<TweetV2PaginableTimelineResult['data']> {
    const client = this.getUserClient(accessToken);
    const readOnlyClient = client.readOnly;

    const tweetFields: TTweetv2TweetField[] = ['created_at', 'author_id'];

    const result = await readOnlyClient.v2.userTimeline(params.user_id, {
      start_time: params.start_time,
      end_time: params.end_time,
      max_results: params.max_results,
      'tweet.fields': tweetFields,
    });

    const resultCollection: TweetV2[] = result.data.data;
    let nextToken = result.meta.next_token;

    while (nextToken) {
      const nextResult = await readOnlyClient.v2.userTimeline(params.user_id, {
        start_time: params.start_time,
        end_time: params.end_time,
        max_results: params.max_results,
        'tweet.fields': tweetFields,
        pagination_token: nextToken,
      });
      resultCollection.push(...nextResult.data.data);
      nextToken = nextResult.meta.next_token;
    }

    return resultCollection;
  }

  public async fetch(
    params: FetchUserPostsParams<PLATFORM.Twitter>[]
  ): Promise<PlatformPost<TweetV2>[]> {
    const allAccountTweetPromises = params.map((fetchUserPostsParams) =>
      this.fetchInternal(
        {
          user_id: fetchUserPostsParams.user_id,
          start_time: new Date(fetchUserPostsParams.start_time).toISOString(),
          end_time: fetchUserPostsParams.end_time
            ? new Date(fetchUserPostsParams.end_time).toISOString()
            : undefined,
        },
        fetchUserPostsParams.credentials.accessToken
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
        timestamp: this.dateStrToTimestampMs(tweet.created_at),
        original: tweet,
      };
    });
  }

  public convertToGeneric(
    platformPost: PlatformPost<TweetV2>
  ): GenericPostData {
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

  public async getPost(tweetId: string, read?: TwitterUserDetails['read']) {
    const options: Partial<Tweetv2FieldsParams> = {
      'tweet.fields': ['author_id', 'created_at'],
    };

    const client = read
      ? this.getUserClient(read.accessToken)
      : this.getGenericClient();

    return client.v2.singleTweet(tweetId, options);
  }

  public async publish(
    post: AppPostPublish,
    write: NonNullable<TwitterUserDetails['write']>
  ): Promise<PlatformPost<TweetV2SingleResult>> {
    const client = this.getUserClient(write.accessToken);

    const result = await client.v2.tweet(post.content);

    if (result.errors) {
      throw new Error(`Error posting tweet`);
    }

    const tweet = await this.getPost(result.data.id, {
      ...write,
      lastFetched: 0,
    });

    if (!tweet.data.author_id) {
      throw new Error(`Unexpected author_id undefined`);
    }

    if (!tweet.data.created_at) {
      throw new Error(
        `Unexpected created_at undefined, how would we know the timestamp then? )`
      );
    }

    return {
      platformId: PLATFORM.Twitter,
      post_id: tweet.data.id,
      user_id: tweet.data.author_id,
      timestamp: this.dateStrToTimestampMs(tweet.data.created_at),
      original: tweet,
    };
  }
}
