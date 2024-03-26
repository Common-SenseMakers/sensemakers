import {
  TOAuth2Scope,
  TweetV2,
  TweetV2PaginableTimelineResult,
  TweetV2PostTweetResult,
  TweetV2SingleResult,
  Tweetv2FieldsParams,
  TwitterApi,
} from 'twitter-api-v2';

import { PLATFORM } from '../../@shared/types';
import {
  AppPost,
  AppPostPublish,
  PlatformPost,
} from '../../@shared/types.posts';
import {
  TwitterGetContextParams,
  TwitterQueryParameters,
  TwitterSignupContext,
  TwitterSignupData,
  TwitterUserDetails,
} from '../../@shared/types.twitter';
import { FetchUserPostsParams, PlatformService } from '../platforms.interface';

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

  public dateStrToTimestampMs(dateStr: string) {
    // TODO: implement the conversion
    return 10000;
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

  // placeholder, not tested
  async postMessageTwitter(
    text: string,
    accessToken: string
  ): Promise<TweetV2PostTweetResult['data']> {
    const client = await this.getUserClient(accessToken);
    const result = await client.v2.tweet(text);

    return result.data;
  }

  /** methods non part of Platform interface should be protected (private) */
  protected async fetchInternal(
    params: TwitterQueryParameters,
    accessToken: string
  ): Promise<TweetV2PaginableTimelineResult['data']> {
    const client = await this.getUserClient(accessToken);
    const readOnlyClient = client.readOnly;

    const result = await readOnlyClient.v2.userTimeline(params.user_id, {
      start_time: params.start_time,
      end_time: params.end_time,
      max_results: params.max_results,
      'tweet.fields': ['created_at', 'author_id'],
    });

    const resultCollection: TweetV2[] = result.data.data;
    let nextToken = result.meta.next_token;

    while (nextToken) {
      const nextResult = await readOnlyClient.v2.userTimeline(params.user_id, {
        start_time: params.start_time,
        end_time: params.end_time,
        max_results: params.max_results,
        'tweet.fields': ['created_at', 'author_id'],
        pagination_token: nextToken,
      });
      resultCollection.push(...nextResult.data.data);
      nextToken = nextResult.meta.next_token;
    }

    return resultCollection;
  }

  /** @Wes, this is an implementation of the Platform interface.
   * It will have the same shape on all platfforms */
  public async fetch(params: FetchUserPostsParams[]): Promise<TweetV2[]> {
    // get all posts from all users in the input params
    // params.user_ids.foreach ... this.fetch()
    console.log({ params });
    return [];
  }

  public convertToGeneric(
    platformPost: PlatformPost<TweetV2>
  ): Omit<AppPost, 'id' | 'authorId'> {
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
      originals: {
        [PLATFORM.Twitter]: platformPost.original,
      },
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
