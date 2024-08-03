import { anything, instance, spy, when } from 'ts-mockito';
import { TweetV2SingleResult } from 'twitter-api-v2';

import { PlatformFetchParams } from '../../../@shared/types/types.fetch';
import {
  PlatformPostPosted,
  PlatformPostPublish,
} from '../../../@shared/types/types.platform.posts';
import {
  AppTweet,
  TwitterDraft,
  TwitterGetContextParams,
  TwitterSignupContext,
  TwitterThread,
  TwitterUserDetails,
} from '../../../@shared/types/types.twitter';
import {
  TestUserCredentials,
  UserDetailsBase,
} from '../../../@shared/types/types.user';
import { APP_URL } from '../../../config/config.runtime';
import { TransactionManager } from '../../../db/transaction.manager';
import { logger } from '../../../instances/logger';
import { TwitterService } from '../twitter.service';
import { convertToAppTweetBase, dateStrToTimestampMs } from '../twitter.utils';

const DEBUG = false;

interface TwitterTestState {
  latestTweetId: number;
  latestConvId: number;
  threads: TwitterThread[];
}

let state: TwitterTestState = {
  latestTweetId: 0,
  latestConvId: 0,
  threads: [],
};

export interface TwitterMockConfig {
  publish?: boolean;
  signup?: boolean;
  fetch?: boolean;
  get?: boolean;
}

const getSampleTweet = (
  id: string,
  authorId: string,
  createdAt: number,
  conversation_id: string,
  content: string
): AppTweet => {
  const date = new Date(createdAt);

  return {
    id: id,
    conversation_id,
    text: `This is an interesting paper https://arxiv.org/abs/2312.05230 ${id} | ${content}`,
    author_id: authorId,
    created_at: date.toISOString(),
    entities: {
      urls: [
        {
          start: 50,
          end: 73,
          url: 'https://t.co/gguJOKvN37',
          expanded_url: 'https://arxiv.org/abs/2312.05230',
          display_url: 'x.com/sense_nets_bot…',
          unwound_url: 'https://arxiv.org/abs/2312.05230',
        },
      ],
      annotations: [],
      hashtags: [],
      mentions: [],
      cashtags: [],
    },
  };
};

export const initThreads = (
  testThreads: string[][],
  testUser: TestUserCredentials
) => {
  const now = 1720805241;

  const threads = testThreads.map((thread, ixThread): TwitterThread => {
    const tweets = thread.map((content, ixTweet) => {
      const idTweet = ixThread * 100 + ixTweet;
      const createdAt = now + ixThread * 100 + 10 * ixTweet;
      state.latestTweetId = idTweet;
      return getSampleTweet(
        idTweet.toString().padStart(5, '0'),
        testUser.twitter.id,
        createdAt,
        ixThread.toString().padStart(5, '0'),
        content
      );
    });
    state.latestConvId = ixThread;
    return {
      conversation_id: `${ixThread}`,
      tweets,
      author: {
        id: testUser.twitter.id,
        name: testUser.twitter.username,
        username: testUser.twitter.username,
      },
    };
  });

  state.threads = threads;
  state.threads.reverse();
  if (DEBUG)
    console.log('twitter mock state initialized', {
      state: JSON.stringify(state),
    });
};

/** make private methods public */
type MockedType = Omit<TwitterService, 'fetchInternal' | 'getUserClient'> & {
  fetchInternal: TwitterService['fetchInternal'];
  getUserClient: TwitterService['getUserClient'];
};

/**
 * TwitterService mock that publish and fetches posts without really
 * hitting the API
 */
export const getTwitterMock = (
  twitterService: TwitterService,
  type?: TwitterMockConfig,
  testUser?: TestUserCredentials
) => {
  if (!type || Object.keys(type).length === 0) {
    return twitterService;
  }

  const mocked = spy(twitterService) as unknown as MockedType;

  if (type.publish) {
    when(mocked.publish(anything(), anything())).thenCall(
      (postPublish: PlatformPostPublish<TwitterDraft>) => {
        logger.warn(`called twitter publish mock`, postPublish);

        if (!testUser) {
          throw new Error('test user not provided');
        }

        const tweet: TweetV2SingleResult = {
          data: {
            id: (++state.latestTweetId).toString(),
            conversation_id: (++state.latestConvId).toString(),
            text: postPublish.draft.text,
            edit_history_tweet_ids: [],
            author_id: postPublish.userDetails.user_id,
            created_at: new Date().toISOString(),
          },
        };

        const thread = {
          conversation_id: (++state.latestConvId).toString(),
          tweets: [convertToAppTweetBase(tweet.data)],
          author: {
            id: testUser.twitter.id,
            name: testUser.twitter.username,
            username: testUser.twitter.username,
          },
        };

        state.threads.push(thread);

        const post: PlatformPostPosted<TwitterThread> = {
          post_id: thread.conversation_id,
          user_id: tweet.data.author_id as string,
          timestampMs: dateStrToTimestampMs(tweet.data.created_at as string),
          post: thread,
        };
        return post;
      }
    );
  }

  if (type.fetch) {
    when(mocked.fetchInternal(anything(), anything(), anything())).thenCall(
      async (
        params: PlatformFetchParams,
        userDetails: UserDetailsBase,
        manager: TransactionManager
      ): Promise<TwitterThread[]> => {
        const threads = state.threads.filter((thread) => {
          if (params.since_id) {
            /** exclusive */
            return Number(thread.conversation_id) > Number(params.since_id);
          }

          if (params.until_id) {
            /** exclusive */
            return Number(thread.conversation_id) < Number(params.until_id);
          }

          return true;
        });
        return params.expectedAmount && threads.length > params.expectedAmount
          ? threads.slice(0, params.expectedAmount)
          : threads;
      }
    );
  }

  if (type.signup) {
    when(mocked.getSignupContext(anything(), anything())).thenCall(
      (
        userId?: string,
        params?: TwitterGetContextParams
      ): TwitterSignupContext => {
        return {
          url: `${APP_URL.value()}?code=testCode&state=testState`,
          state: 'testState',
          codeVerifier: 'testCodeVerifier',
          codeChallenge: '',
          callback_url: APP_URL.value(),
          type: 'read',
        };
      }
    );

    when(mocked.handleSignupData(anything())).thenCall(
      (data: TwitterUserDetails): TwitterUserDetails => {
        return data;
      }
    );
  }

  return instance(mocked) as unknown as TwitterService;
};
