import { anything, instance, spy, when } from 'ts-mockito';
import { TweetV2SingleResult } from 'twitter-api-v2';

import { UserDetailsBase } from '../../../@shared/types/types';
import {
  PlatformPostPosted,
  PlatformPostPublish,
} from '../../../@shared/types/types.platform.posts';
import {
  TwitterDraft,
  TwitterGetContextParams,
  TwitterQueryParameters,
  TwitterThread,
  TwitterUserDetails,
} from '../../../@shared/types/types.twitter';
import { logger } from '../../../instances/logger';
import { TwitterService } from '../twitter.service';
import { dateStrToTimestampMs } from '../twitter.utils';

interface TwitterTestState {
  latestId: number;
  threads: TwitterThread[];
}

let state: TwitterTestState = {
  latestId: 0,
  threads: [],
};

export type TwitterMockConfig = 'real' | 'mock-publish' | 'mock-signup';

export const TWITTER_USER_ID_MOCKS = '1753077743816777728';

const getSampleTweet = (
  id: string,
  authorId: string,
  createdAt: number,
  conversation_id: string
) => {
  const date = new Date(createdAt);

  return {
    id: id,
    conversation_id,
    text: `This is an interesting paper https://arxiv.org/abs/2312.05230 ${id}`,
    author_id: authorId,
    created_at: date.toISOString(),
    edit_history_tweet_ids: [],
  };
};

const now = Date.now();

const threads = [[1, 2], [3], [4, 5, 6], [7]].map(
  (thread, ixThread): TwitterThread => {
    const tweets = thread.map((ix) => {
      const createdAt = now + ixThread * 100 + 10 * ix;
      state.latestId = ix;
      return getSampleTweet(
        `tweet-${ix}`,
        TWITTER_USER_ID_MOCKS,
        createdAt,
        `conversation-${ixThread}`
      );
    });
    return {
      conversation_id: `${ixThread}`,
      tweets,
    };
  }
);

state.threads.push(...threads);

/** make private methods public */
type MockedType = Omit<TwitterService, 'fetchInternal'> & {
  fetchInternal: TwitterService['fetchInternal'];
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
    const Mocked = spy(twitterService) as unknown as MockedType;

    when(Mocked.publish(anything(), anything())).thenCall(
      (postPublish: PlatformPostPublish<TwitterDraft>) => {
        logger.warn(`called twitter publish mock`, postPublish);

        const tweet: TweetV2SingleResult = {
          data: {
            id: (++state.latestId).toString(),
            text: postPublish.draft.text,
            edit_history_tweet_ids: [],
            author_id: postPublish.userDetails.user_id,
            created_at: new Date().toISOString(),
          },
        };

        state.threads.push({
          conversation_id: `conversation-${Date.now()}`,
          tweets: [tweet.data],
        });

        const post: PlatformPostPosted<TweetV2SingleResult> = {
          post_id: tweet.data.id,
          user_id: tweet.data.author_id as string,
          timestampMs: dateStrToTimestampMs(tweet.data.created_at as string),
          post: tweet,
        };
        return post;
      }
    );

    when(Mocked.fetchInternal(anything(), anything(), anything())).thenCall(
      async (
        params: TwitterQueryParameters,
        userDetails?: UserDetailsBase
      ): Promise<TwitterThread[]> => {
        const threads = state.threads.reverse().filter((thread) => {
          const tweet0 = thread.tweets[0];
          const createdAt = new Date(tweet0.created_at as string);
          const startAt = params.start_time
            ? new Date(params.start_time)
            : undefined;
          return startAt ? createdAt.getTime() >= startAt.getTime() : true;
        });
        return threads;
      }
    );

    if (type === 'mock-signup') {
      when(Mocked.getSignupContext(anything(), anything())).thenCall(
        (userId?: string, params?: TwitterGetContextParams) => {
          return {};
        }
      );

      when(Mocked.handleSignupData(anything())).thenCall(
        (data: { user_id: string }): TwitterUserDetails => {
          return {
            user_id: data.user_id,
            lastFetchedMs: 0,
            signupDate: 0,
          };
        }
      );
    }

    return instance(Mocked) as unknown as TwitterService;
  }

  throw new Error('Unexpected');
};
