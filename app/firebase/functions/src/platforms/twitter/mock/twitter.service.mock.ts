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
  TwitterThread,
  TwitterUserDetails,
} from '../../../@shared/types/types.twitter';
import { UserDetailsBase } from '../../../@shared/types/types.user';
import { ENVIRONMENTS } from '../../../config/ENVIRONMENTS';
import { NODE_ENV } from '../../../config/config.runtime';
import { TransactionManager } from '../../../db/transaction.manager';
import { logger } from '../../../instances/logger';
import { TwitterService } from '../twitter.service';
import { convertToAppTweetBase, dateStrToTimestampMs } from '../twitter.utils';

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

export type TwitterMockConfig = 'real' | 'mock-publish' | 'mock-signup';

export const TEST_THREADS: string[][] = process.env.TEST_THREADS
  ? JSON.parse(process.env.TEST_THREADS as string)
  : [];

export const TWITTER_USER_ID_MOCKS = '1773032135814717440';
export const TWITTER_USERNAME_MOCKS = 'sense_nets_bot';
export const TWITTER_NAME_MOCKS = 'SenseNet Bot';

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

export const initThreads = () => {
  const now = Date.now();

  const threads = TEST_THREADS.map((thread, ixThread): TwitterThread => {
    const tweets = thread.map((content, ixTweet) => {
      const idTweet = ixThread * 100 + ixTweet;
      const createdAt = now + ixThread * 100 + 10 * ixTweet;
      state.latestTweetId = idTweet;
      return getSampleTweet(
        idTweet.toString(),
        TWITTER_USER_ID_MOCKS,
        createdAt,
        ixThread.toString(),
        content
      );
    });
    state.latestConvId = ixThread;
    return {
      conversation_id: `${ixThread}`,
      tweets,
      author: {
        id: TWITTER_USER_ID_MOCKS,
        name: TWITTER_NAME_MOCKS,
        username: TWITTER_USERNAME_MOCKS,
      },
    };
  });

  state.threads = threads;
  state.threads.reverse();
};

initThreads();

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
  type: TwitterMockConfig
) => {
  if (type === 'real') {
    return twitterService;
  }

  if (type === 'mock-publish' || type === 'mock-signup') {
    const mocked = spy(twitterService) as unknown as MockedType;

    when(mocked.publish(anything(), anything())).thenCall(
      (postPublish: PlatformPostPublish<TwitterDraft>) => {
        logger.warn(`called twitter publish mock`, postPublish);

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
            id: TWITTER_USER_ID_MOCKS,
            name: TWITTER_NAME_MOCKS,
            username: TWITTER_USERNAME_MOCKS,
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

    when(mocked.fetchInternal(anything(), anything(), anything())).thenCall(
      async (
        params: PlatformFetchParams,
        userDetails: UserDetailsBase,
        manager: TransactionManager
      ): Promise<TwitterThread[]> => {
        /** if fetching for newer posts add 1 to emulate a new post added */
        if (params.since_id && NODE_ENV === ENVIRONMENTS.LOCAL) {
          const newTweetId = `${(state.threads.length + 1) * 100 + 1}`;
          state.threads.push({
            conversation_id: newTweetId,
            tweets: [
              getSampleTweet(
                newTweetId,
                TWITTER_USER_ID_MOCKS,
                Date.now(),
                newTweetId,
                `new post added ${newTweetId}`
              ),
            ],
            author: {
              id: TWITTER_USER_ID_MOCKS,
              name: TWITTER_NAME_MOCKS,
              username: TWITTER_USERNAME_MOCKS,
            },
          });
          console.log('added new tweet');
        }
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

    if (type === 'mock-signup') {
      when(mocked.getSignupContext(anything(), anything())).thenCall(
        (userId?: string, params?: TwitterGetContextParams) => {
          return {};
        }
      );

      when(mocked.handleSignupData(anything())).thenCall(
        (data: TwitterUserDetails): TwitterUserDetails => {
          return {
            ...data,
          };
        }
      );
    }

    return instance(mocked) as unknown as TwitterService;
  }

  throw new Error('Unexpected');
};
