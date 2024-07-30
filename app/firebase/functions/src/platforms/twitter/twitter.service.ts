import {
  TweetV2UserTimelineParams,
  Tweetv2FieldsParams,
  Tweetv2SearchParams,
  UserV2,
} from 'twitter-api-v2';

import {
  FetchParams,
  PlatformFetchParams,
} from '../../@shared/types/types.fetch';
import {
  FetchedResult,
  PlatformPostCreate,
  PlatformPostDraft,
  PlatformPostDraftApproval,
  PlatformPostPosted,
  PlatformPostPublish,
  PlatformPostSignerType,
  PlatformPostUpdate,
} from '../../@shared/types/types.platform.posts';
import '../../@shared/types/types.posts';
import {
  GenericAuthor,
  GenericPost,
  GenericThread,
  PostAndAuthor,
} from '../../@shared/types/types.posts';
import {
  AppTweet,
  TwitterDraft,
  TwitterSignupContext,
  TwitterSignupData,
  TwitterThread,
  TwitterUserDetails,
} from '../../@shared/types/types.twitter';
import {
  FetchedDetails,
  PLATFORM,
  UserDetailsBase,
} from '../../@shared/types/types.user';
import { TransactionManager } from '../../db/transaction.manager';
import { logger } from '../../instances/logger';
import { TimeService } from '../../time/time.service';
import { UsersHelper } from '../../users/users.helper';
import { UsersRepository } from '../../users/users.repository';
import { PlatformService } from '../platforms.interface';
import { expansions, tweetFields } from './twitter.config';
import { TwitterServiceClient } from './twitter.service.client';
import {
  convertToAppTweetBase,
  convertToAppTweets,
  convertTweetsToThreads,
  dateStrToTimestampMs,
  getTweetTextWithUrls,
  getTweetUrl,
  handleTwitterError,
} from './twitter.utils';

export interface TwitterApiCredentials {
  clientId: string;
  clientSecret: string;
}

const DEBUG = false;

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

  async get(
    post_id: string,
    userDetails: UserDetailsBase<any, any, any>,
    manager: TransactionManager
  ): Promise<PlatformPostPosted<any>> {
    const MAX_TWEETS = 30;
    const readOnlyClient = await this.getUserClient(
      userDetails.user_id,
      'read',
      manager
    );
    try {
      const _searchParams: Tweetv2SearchParams = {
        query: `conversation_id:${post_id} from:${userDetails.user_id}`,
        max_results: MAX_TWEETS > 100 ? 100 : MAX_TWEETS,
        expansions,
        'tweet.fields': tweetFields,
      };

      let nextToken: string | undefined = undefined;
      let originalAuthor: UserV2 | undefined = undefined;
      let allTweets: AppTweet[] = [];

      do {
        const searchParams = _searchParams;
        if (nextToken) {
          searchParams.next_token = nextToken;
        }

        try {
          const result = await readOnlyClient.v2.search(searchParams);
          const tweetResults = result.data.data;
          if (result.meta.result_count > 0) {
            if (result.data.data === undefined) {
              throw new Error('Unexpected undefined data');
            }

            if (result.data.includes === undefined) {
              throw new Error('Unexpected undefined data');
            }
            /* if original tweet is not yet included, make sure to inlude it */
            if (
              !tweetResults.some((tweet) => tweet.id === post_id) &&
              !allTweets.some((tweet) => tweet.id === post_id)
            ) {
              const originalTweet = result.data.includes?.tweets?.find(
                (refTweet) => refTweet.id === post_id
              );
              if (originalTweet) {
                tweetResults.push(originalTweet);
              }
            }

            const appTweets = convertToAppTweets(
              tweetResults,
              result.data.includes
            );

            if (!originalAuthor) {
              originalAuthor = result.data.includes?.users?.find(
                (user) => user.id === userDetails.user_id
              );
            }
            allTweets.push(...appTweets);

            nextToken = result.meta.next_token;
          }
        } catch (e: any) {
          if (e.rateLimit) {
            /** if we hit the rate limit after haven gotten some tweets, return what we got so far  */
            if (allTweets.length > 0) {
              break;
            } else {
              /** otherwise throw */
              throw new Error(handleTwitterError(e));
            }
          } else {
            throw new Error(handleTwitterError(e));
          }
        }

        if (allTweets.length >= MAX_TWEETS) {
          break;
        }
      } while (nextToken !== undefined);

      const threads =
        allTweets.length > 0 && originalAuthor
          ? convertTweetsToThreads(allTweets, originalAuthor)
          : [];

      if (threads.length !== 1) {
        throw new Error(`Unexpected search for thread did not return 1 thread`);
      }
      const thread = threads[0];

      return {
        post_id: thread.conversation_id,
        user_id: thread.author.id,
        timestampMs: dateStrToTimestampMs(thread.tweets[0].created_at),
        post: thread,
      };
    } catch (e: any) {
      throw new Error(handleTwitterError(e));
    }
  }

  /**
   * Fetch for "around" _params.params.expectedResults threads.
   * beacuse we fetch is pages of 30, we may fetch more threads
   * than expected. We will return them all anyways. Because
   * threads might be truncated and there are rate limits, we
   * might also return less threads than expected.
   * */
  protected async fetchInternal(
    params: PlatformFetchParams,
    userDetails: UserDetailsBase,
    manager: TransactionManager
  ): Promise<TwitterThread[]> {
    try {
      if (DEBUG) logger.debug('Twitter Service - fetchInternal - start');

      const expectedAmount = params.expectedAmount;
      const readOnlyClient = await this.getUserClient(
        userDetails.user_id,
        'read',
        manager
      );

      /**
       * TODO: because we are fetching 30 tweets per page, we
       * can easily end up with more threads than the requested expectedResults
       * The rate limit of 5 request in 15 minutes gives us 150 tweets max per result
       * */

      const _timelineParams: Partial<TweetV2UserTimelineParams> = {
        since_id: params.since_id,
        until_id: params.until_id,
        max_results: 30,
        expansions,
        'tweet.fields': tweetFields,
        exclude: ['retweets', 'replies'],
      };

      let nextToken: string | undefined = undefined;
      let originalAuthor: UserV2 | undefined = undefined;
      let allTweets: AppTweet[] = [];
      let conversationIds: Set<string> = new Set();

      do {
        const timelineParams = _timelineParams;
        if (nextToken) {
          timelineParams.pagination_token = nextToken;
        }

        try {
          const result = await readOnlyClient.v2.userTimeline(
            userDetails.user_id,
            timelineParams
          );

          if (result.meta.result_count > 0) {
            if (result.data.data === undefined) {
              throw new Error('Unexpected undefined data');
            }

            if (result.data.includes === undefined) {
              throw new Error('Unexpected undefined data');
            }

            const appTweets = convertToAppTweets(
              result.data.data,
              result.data.includes
            );
            /** keep track of the number of threads */
            appTweets.forEach((tweet) => {
              if (tweet.conversation_id) {
                conversationIds.add(tweet.conversation_id);
              } else {
                throw new Error('tweet does not have a conversation_id');
              }
            });

            if (!originalAuthor) {
              originalAuthor = result.data.includes?.users?.find(
                (user) => user.id === userDetails.user_id
              );
            }
            allTweets.push(...appTweets);

            nextToken = result.meta.next_token;
          }
        } catch (e: any) {
          if (e.rateLimit) {
            /** if we hit the rate limit after haven gotten some tweets, return what we got so far  */
            if (conversationIds.size > 0) {
              break;
            } else {
              /** otherwise throw */
              throw new Error(handleTwitterError(e));
            }
          } else {
            throw new Error(handleTwitterError(e));
          }
        }

        if (conversationIds.size >= expectedAmount + 1) {
          break;
        }
      } while (nextToken !== undefined);

      return allTweets.length > 0 && originalAuthor
        ? convertTweetsToThreads(allTweets, originalAuthor)
        : [];
    } catch (e: any) {
      throw new Error(handleTwitterError(e));
    }
  }

  public async fetch(
    params: FetchParams,
    userDetails: UserDetailsBase,
    manager: TransactionManager
  ): Promise<FetchedResult<TwitterThread>> {
    if (DEBUG) logger.debug('Twitter Service - fetch - start');

    const threads = await this.fetchInternal(params, userDetails, manager);

    const platformPosts = threads.map((thread) => {
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

    const fetched: FetchedDetails = {
      newest_id:
        platformPosts.length > 0 ? platformPosts[0].post_id : undefined,
      oldest_id:
        platformPosts.length > 0
          ? platformPosts[platformPosts.length - 1].post_id
          : undefined,
    };

    return {
      fetched,
      platformPosts,
    };
  }

  public async convertToGeneric(
    platformPost: PlatformPostCreate<TwitterThread>
  ): Promise<GenericThread> {
    if (!platformPost.posted) {
      throw new Error('Unexpected undefined posted');
    }

    const twitterThread = platformPost.posted.post;
    const genericAuthor: GenericAuthor = {
      ...twitterThread.author,
      platformId: PLATFORM.Twitter,
    };

    const genericThread: GenericPost[] = twitterThread.tweets.map((tweet) => {
      const genericPost: GenericPost = {
        url: getTweetUrl(twitterThread.author.username, tweet.id),
        content: tweet.text,
      };

      if (tweet.quoted_tweet) {
        // TODO: read the whole quoted thread
        genericPost.quotedThread = {
          author: {
            ...tweet.quoted_tweet.author,
            platformId: PLATFORM.Twitter,
          },
          thread: [
            {
              content: getTweetTextWithUrls(tweet.quoted_tweet),
              url: getTweetUrl(
                tweet.quoted_tweet.author.username,
                tweet.quoted_tweet.id
              ),
            },
          ],
        };
      }

      return genericPost;
    });

    return {
      author: genericAuthor,
      thread: genericThread,
    };
  }

  /** if user_id is provided it must be from the authenticated userId */
  public async getPost(
    tweetId: string,
    manager: TransactionManager,
    user_id?: string
  ) {
    const options: Partial<Tweetv2FieldsParams> = {
      'tweet.fields': tweetFields,
      expansions,
    };

    const client = user_id
      ? await this.getUserClient(user_id, 'read', manager)
      : this.getGenericClient();

    return client.v2.singleTweet(tweetId, options);
  }

  /** if user_id is provided it must be from the authenticated userId */
  public async getPosts(
    tweetIds: string[],
    manager: TransactionManager,
    user_id?: string
  ) {
    const options: Partial<Tweetv2FieldsParams> = {
      'tweet.fields': tweetFields,
      expansions,
    };

    const client = user_id
      ? await this.getUserClient(user_id, 'read', manager)
      : this.getGenericClient();

    return client.v2.tweets(tweetIds, options);
  }

  /** user_id must be from the authenticated userId */
  public async publish(
    postPublish: PlatformPostPublish<TwitterDraft>,
    manager: TransactionManager
  ): Promise<PlatformPostPosted<TwitterThread>> {
    // TODO udpate to support many
    const userDetails = postPublish.userDetails;
    const post = postPublish.draft;

    const client = await this.getClient<'write'>(manager, userDetails, 'write');

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

      if (!tweet.data.conversation_id) {
        throw new Error(`Unexpected conversation_id undefined`);
      }

      if (!tweet.data.created_at) {
        throw new Error(
          `Unexpected created_at undefined, how would we know the timestamp then? )`
        );
      }
      const author = tweet.includes?.users?.find(
        (user) => user.id === tweet.data.author_id
      );
      if (!author) {
        throw new Error(`Unexpected tweet does not match author`);
      }
      const thread: TwitterThread = {
        conversation_id: tweet.data.conversation_id,
        tweets: [convertToAppTweetBase(tweet.data)],
        author,
      };

      return {
        post_id: tweet.data.id,
        user_id: tweet.data.author_id,
        timestampMs: dateStrToTimestampMs(tweet.data.created_at),
        post: thread,
      };
    } catch (e: any) {
      throw new Error(handleTwitterError(e));
    }
  }

  update(
    post: PlatformPostUpdate<any>,
    manager: TransactionManager
  ): Promise<PlatformPostPosted<any>> {
    throw new Error('Method not implemented.');
  }

  async convertFromGeneric(
    postAndAuthor: PostAndAuthor
  ): Promise<PlatformPostDraft<any>> {
    const account = UsersHelper.getAccount(
      postAndAuthor.author,
      PLATFORM.Twitter,
      undefined,
      true
    );
    return {
      user_id: account.user_id,
      signerType: PlatformPostSignerType.DELEGATED,
      postApproval: PlatformPostDraftApproval.PENDING,
    };
  }

  async signDraft(
    post: PlatformPostDraft<any>,
    account: UserDetailsBase<any, any, any>
  ): Promise<any> {
    return post;
  }
}
