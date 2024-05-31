import {
  TTweetv2TweetField,
  TweetV2,
  TweetV2UserTimelineParams,
  Tweetv2FieldsParams,
} from 'twitter-api-v2';

import {
  FetchParams,
  FetchedDetails,
  PlatformFetchParams,
  UserDetailsBase,
} from '../../@shared/types/types';
import {
  FetchedResult,
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
  TwitterSignupContext,
  TwitterSignupData,
  TwitterThread,
  TwitterUserDetails,
} from '../../@shared/types/types.twitter';
import { TransactionManager } from '../../db/transaction.manager';
import { TimeService } from '../../time/time.service';
import { UsersRepository } from '../../users/users.repository';
import { PlatformService } from '../platforms.interface';
import { TwitterServiceClient } from './twitter.service.client';
import {
  dateStrToTimestampMs,
  getTweetTextWithUrls,
  handleTwitterError,
} from './twitter.utils';

export interface TwitterApiCredentials {
  clientId: string;
  clientSecret: string;
}

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
      const expectedAmount = params.expectedAmount;
      const readOnlyClient = await this.getUserClient(
        userDetails.user_id,
        'read',
        manager
      );

      const tweetFields: TTweetv2TweetField[] = [
        'created_at',
        'author_id',
        'text',
        'entities',
        'note_tweet',
        'conversation_id',
      ];

      /**
       * TODO: because we are fetching 30 tweets per page, we
       * can easily end up with more threads than the requested expectedResults
       * The rate limit of 5 request in 15 minutes gives us 150 tweets max per result
       * */

      const _timelineParams: Partial<TweetV2UserTimelineParams> = {
        since_id: params.since_id,
        until_id: params.until_id,
        max_results: 30,
        'tweet.fields': tweetFields,
        exclude: ['retweets', 'replies'],
      };

      let nextToken: string | undefined = undefined;
      const tweetThreadsMap = new Map<string, TweetV2[]>();

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

          if (result.data.data) {
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
          }

          nextToken = result.meta.next_token;
        } catch (e: any) {
          if (e.rateLimit) {
            /** if we hit the rate limit after haven gotten some tweets, return what we got so far  */
            if (tweetThreadsMap.size > 0) {
              break;
            } else {
              /** otherwise throw */
              throw new Error(e);
            }
          }
        }

        if (tweetThreadsMap.size >= expectedAmount + 1) {
          break;
        }
      } while (nextToken !== undefined);

      /** the last conversation may be truncated. Discard it */
      const tweetsArrays = Array.from(tweetThreadsMap.values());
      /** sort threads */
      tweetsArrays.sort(
        (tA, tB) =>
          Number(tB[0].conversation_id) - Number(tA[0].conversation_id)
      );
      /** discard last thread if read many threads. It could had been truncated */
      // TODO: what if we only read one thread? is this an error?

      /** sort tweets inside each thread, and compose the TwitterThread[] array */
      const threads = tweetsArrays.map((thread): TwitterThread => {
        const tweets = thread.sort(
          (tweetA, tweetB) => Number(tweetA.id) - Number(tweetB.id)
        );
        return {
          conversation_id: tweets[0].conversation_id as string,
          tweets,
        };
      });

      return threads;
    } catch (e: any) {
      throw new Error(handleTwitterError(e));
    }
  }

  public async fetch(
    params: FetchParams,
    userDetails: UserDetailsBase,
    manager: TransactionManager
  ): Promise<FetchedResult<TwitterThread>> {
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
      'tweet.fields': ['author_id', 'created_at', 'conversation_id'],
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
  ): Promise<PlatformPostPosted<TwitterThread>> {
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

      if (!tweet.data.conversation_id) {
        throw new Error(`Unexpected conversation_id undefined`);
      }

      if (!tweet.data.created_at) {
        throw new Error(
          `Unexpected created_at undefined, how would we know the timestamp then? )`
        );
      }

      const thread: TwitterThread = {
        conversation_id: tweet.data.conversation_id,
        tweets: [tweet.data],
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

  convertFromGeneric(
    postAndAuthor: PostAndAuthor
  ): Promise<PlatformPostDraft<any>> {
    throw new Error('Method not implemented.');
  }
}
