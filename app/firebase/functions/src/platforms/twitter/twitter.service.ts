import fs from 'fs';
import {
  TweetV2UserTimelineParams,
  Tweetv2FieldsParams,
  Tweetv2SearchParams,
  UserV2,
  UsersV2Params,
} from 'twitter-api-v2';

import {
  FetchParams,
  PlatformFetchParams,
} from '../../@shared/types/types.fetch';
import {
  FetchedResult,
  PlatformPostCreate,
  PlatformPostDeleteDraft,
  PlatformPostDraft,
  PlatformPostDraftApproval,
  PlatformPostPosted,
  PlatformPostPublish,
  PlatformPostSignerType,
  PlatformPostUpdate,
} from '../../@shared/types/types.platform.posts';
import { PLATFORM } from '../../@shared/types/types.platforms';
import '../../@shared/types/types.posts';
import {
  AppPostFull,
  GenericAuthor,
  GenericPost,
  GenericThread,
  PostAndAuthor,
} from '../../@shared/types/types.posts';
import {
  AccountProfileBase,
  FetchedDetails,
  PlatformProfile,
} from '../../@shared/types/types.profiles';
import {
  AppTweet,
  TwitterAccountCredentials,
  TwitterAccountDetails,
  TwitterCredentials,
  TwitterDraft,
  TwitterSignupContext,
  TwitterSignupData,
  TwitterThread,
  TwitterUser,
} from '../../@shared/types/types.twitter';
import { AppUserRead } from '../../@shared/types/types.user';
import { logger } from '../../instances/logger';
import { TimeService } from '../../time/time.service';
import { UsersHelper } from '../../users/users.helper';
import { UsersRepository } from '../../users/users.repository';
import { PlatformService, WithCredentials } from '../platforms.interface';
import { expansions, tweetFields, userFields } from './twitter.config';
import { TwitterServiceClient } from './twitter.service.client';
import {
  convertToAppTweetBase,
  convertToAppTweets,
  convertTweetsToThreads,
  dateStrToTimestampMs,
  getOriginalAuthor,
  getTweetTextWithUrls,
  getTweetUrl,
  handleTwitterError,
} from './twitter.utils';

export interface TwitterApiCredentials {
  clientId: string;
  clientSecret: string;
  bearerToken: string;
}

const DEBUG = false;

/** Twitter service handles all interactions with Twitter API */
export class TwitterService
  extends TwitterServiceClient
  implements
    PlatformService<
      TwitterSignupContext,
      TwitterSignupData,
      TwitterAccountDetails
    >
{
  protected cache: any;

  constructor(
    protected time: TimeService,
    protected usersRepo: UsersRepository,
    protected apiCredentials: TwitterApiCredentials
  ) {
    super(time, usersRepo, apiCredentials);
    if (fs.existsSync('twitterApiCache.json')) {
      this.cache = JSON.parse(fs.readFileSync('twitterApiCache.json', 'utf8'));
    } else {
      this.cache = {};
    }
  }

  async get(
    post_id: string,
    credentials?: TwitterAccountCredentials
  ): Promise<{
    platformPost: PlatformPostPosted<TwitterThread, TwitterUser>;
    credentials?: TwitterAccountCredentials;
  }> {
    const MAX_TWEETS = 30;

    const { client: readOnlyClient, credentials: newCredentials } =
      await this.getClient(credentials?.read, 'read');

    try {
      const options: Partial<Tweetv2FieldsParams> = {
        'tweet.fields': tweetFields,
        expansions,
      };

      const original = await readOnlyClient.v2.singleTweet(post_id, options);
      const authorId = original.data.author_id;

      if (!authorId) {
        throw new Error('author_id not found');
      }

      const { data: originalAuthor } = await readOnlyClient.v2.user(authorId);

      const _searchParams: Tweetv2SearchParams = {
        query: `conversation_id:${post_id} from:${authorId}`,
        max_results: MAX_TWEETS > 100 ? 100 : MAX_TWEETS,
        expansions,
        'tweet.fields': tweetFields,
        'user.fields': userFields,
      };

      let nextToken: string | undefined = undefined;
      let allTweets: AppTweet[] = [];

      do {
        const searchParams = _searchParams;
        if (nextToken) {
          searchParams.next_token = nextToken;
        }

        try {
          if (DEBUG)
            logger.debug('Twitter Service - search - start', { searchParams });

          const result = await readOnlyClient.v2.search(searchParams);
          const tweetResults = result.data.data;

          if (DEBUG)
            logger.debug('Twitter Service - search - result', { tweetResults });

          if (result.meta.result_count > 0) {
            if (result.data === undefined) {
              throw new Error('Unexpected undefined data');
            }

            if (result.includes === undefined) {
              throw new Error('Unexpected undefined data');
            }

            /* if original tweet is not yet included, make sure to inlude it */
            if (
              !tweetResults.some((tweet) => tweet.id === post_id) &&
              !allTweets.some((tweet) => tweet.id === post_id)
            ) {
              const originalTweet = result.includes?.tweets?.find(
                (refTweet) => refTweet.id === post_id
              );
              if (originalTweet) {
                tweetResults.push(originalTweet);
              }
            }

            const appTweets = convertToAppTweets(tweetResults, result.includes);

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

      const threads = (() => {
        if (allTweets.length > 0) {
          return convertTweetsToThreads(allTweets, originalAuthor);
        }
        return [];
      })();

      if (threads.length !== 1) {
        throw new Error(`Unexpected search for thread did not return 1 thread`);
      }

      const thread = threads[0];

      const platformPost: PlatformPostPosted<TwitterThread, TwitterUser> = {
        post_id: thread.conversation_id,
        user_id: thread.author.id,
        timestampMs: dateStrToTimestampMs(thread.tweets[0].created_at),
        post: thread,
        author: originalAuthor,
      };

      const newAccountCredentials: TwitterAccountCredentials | undefined =
        newCredentials ? { read: newCredentials } : undefined;

      if (credentials?.write && newAccountCredentials) {
        newAccountCredentials.write = newCredentials;
      }

      return { platformPost, credentials: newAccountCredentials };
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
    user_id: string,
    params: PlatformFetchParams,
    credentials?: TwitterCredentials
  ): Promise<{ threads: TwitterThread[]; credentials: TwitterCredentials }> {
    try {
      if (DEBUG) logger.debug('Twitter Service - fetchInternal - start');

      const expectedAmount = params.expectedAmount;
      const { client: readOnlyClient, credentials: newCredentials } =
        await this.getClient(credentials, 'read');

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
        'user.fields': userFields,
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
          logger.debug(`Twitter Service - userTimeline - ${user_id}`);
          const result = await readOnlyClient.v2.userTimeline(
            user_id,
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

            originalAuthor = getOriginalAuthor(user_id, result.data.includes);

            /** keep track of the number of threads */
            appTweets.forEach((tweet) => {
              if (tweet.conversation_id) {
                conversationIds.add(tweet.conversation_id);
              } else {
                throw new Error('tweet does not have a conversation_id');
              }
            });

            if (!originalAuthor) {
              const profileParams: Partial<UsersV2Params> = {
                'user.fields': userFields,
              };

              const originalAuthorData = await readOnlyClient.v2.user(
                user_id,
                profileParams
              );

              originalAuthor = originalAuthorData.data;
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

      const threads =
        allTweets.length > 0 && originalAuthor
          ? convertTweetsToThreads(allTweets, originalAuthor)
          : [];

      return { threads, credentials: newCredentials };
    } catch (e: any) {
      throw new Error(handleTwitterError(e));
    }
  }

  public async fetch(
    user_id: string,
    params: FetchParams,
    accountCredentials?: TwitterAccountCredentials
  ): Promise<FetchedResult<TwitterThread>> {
    if (DEBUG) logger.debug('Twitter Service - fetch - start');

    const { threads, credentials: newCredentials } = await this.fetchInternal(
      user_id,
      params,
      accountCredentials?.read
    );

    const platformPosts = threads.map((thread): PlatformPostPosted => {
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
        author: thread.author,
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

    const newAccountCredentials: TwitterAccountCredentials | undefined =
      newCredentials ? { read: newCredentials } : undefined;

    if (newAccountCredentials && accountCredentials?.write) {
      newAccountCredentials.write = newCredentials;
    }

    return {
      fetched,
      platformPosts,
      credentials: newAccountCredentials,
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
      id: twitterThread.author.id,
      name: twitterThread.author.name || twitterThread.author.username,
      username: twitterThread.author.username,
      avatarUrl: twitterThread.author.profile_image_url,
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
  public async getPost(tweetId: string, credentials?: TwitterCredentials) {
    const options: Partial<Tweetv2FieldsParams> = {
      'tweet.fields': tweetFields,
      expansions,
    };

    const { client } = await this.getClient(credentials, 'read');

    return client.v2.singleTweet(tweetId, options);
  }

  /** if user_id is provided it must be from the authenticated userId */
  public async getPosts(tweetIds: string, credentials?: TwitterCredentials) {
    const options: Partial<Tweetv2FieldsParams> = {
      'tweet.fields': tweetFields,
      expansions,
    };

    const { client } = await this.getClient(credentials, 'read');
    tweetIds;
    return tweetIds.length === 1
      ? client.v2.singleTweet(tweetIds[0], options)
      : client.v2.tweets(tweetIds, options);
  }

  public async getProfile(
    user_id: string,
    credentials: TwitterCredentials
  ): Promise<AccountProfileBase<PlatformProfile>> {
    const { client } = await this.getClient(credentials, 'read');

    const profileParams: Partial<UsersV2Params> = {
      'user.fields': userFields,
    };

    const twitterProfile = await client.v2.user(user_id, profileParams);
    const profile: PlatformProfile = {
      id: twitterProfile.data.id,
      displayName: twitterProfile.data.name,
      username: twitterProfile.data.username,
      avatar: twitterProfile.data.profile_image_url,
      description: twitterProfile.data.description,
    };

    return { user_id, profile };
  }

  /** user_id must be from the authenticated userId */
  public async publish(
    postPublish: PlatformPostPublish<TwitterDraft, TwitterCredentials>
  ): Promise<{ post: PlatformPostPosted<TwitterThread> } & WithCredentials> {
    // TODO udpate to support many
    const post = postPublish.draft;

    const { client, credentials: newCredentials } =
      await this.getClient<'write'>(postPublish.credentials.write, 'write');

    try {
      // Post the tweet and also read the tweet
      const result = await client.v2.tweet(post.text);
      if (result.errors) {
        throw new Error(`Error posting tweet`);
      }

      const tweet = await this.getPost(
        result.data.id,
        postPublish.credentials.read
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

      const posted = {
        post_id: tweet.data.id,
        user_id: tweet.data.author_id,
        timestampMs: dateStrToTimestampMs(tweet.data.created_at),
        post: thread,
      };

      const newAccountCredentials: TwitterAccountCredentials | undefined =
        newCredentials ? { read: newCredentials } : undefined;

      if (postPublish.credentials?.write && newAccountCredentials) {
        newAccountCredentials.write = newCredentials;
      }

      return { post: posted, credentials: newAccountCredentials };
    } catch (e: any) {
      throw new Error(handleTwitterError(e));
    }
  }

  update(post: PlatformPostUpdate<any>): Promise<PlatformPostPosted<any>> {
    throw new Error('Method not implemented.');
  }

  async convertFromGeneric(
    postAndAuthor: PostAndAuthor
  ): Promise<PlatformPostDraft<any>> {
    const account = UsersHelper.getProfile(
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

  async buildDeleteDraft(
    post_id: string,
    post: AppPostFull,
    author: AppUserRead
  ): Promise<PlatformPostDeleteDraft | undefined> {
    return undefined;
  }
  async getProfileByUsername(
    username: string,
    credentials?: TwitterCredentials
  ): Promise<AccountProfileBase<PlatformProfile> | undefined> {
    try {
      const { client } = await this.getClient(credentials, 'read');
      const userResponse = await client.v2.userByUsername(username, {
        'user.fields': userFields,
      });

      if (userResponse.data) {
        return {
          user_id: userResponse.data.id,
          profile: {
            id: userResponse.data.id,
            displayName: userResponse.data.name,
            username: userResponse.data.username,
            avatar: userResponse.data.profile_image_url,
            description: userResponse.data.description,
          },
        };
      }
      throw new Error(`User not found`);
    } catch (e: any) {
      throw new Error(handleTwitterError(e));
    }
  }
}
