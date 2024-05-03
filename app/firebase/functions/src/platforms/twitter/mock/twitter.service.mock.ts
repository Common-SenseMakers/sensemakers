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
  TwitterUserDetails,
} from '../../../@shared/types/types.twitter';
import { logger } from '../../../instances/logger';
import { TwitterService } from '../twitter.service';
import { dateStrToTimestampMs } from '../twitter.utils';

interface TwitterTestState {
  latestId: number;
  tweets: Array<{ id: string; tweet: TweetV2SingleResult }>;
}

let state: TwitterTestState = {
  latestId: 0,
  tweets: [],
};

export type TwitterMockConfig = 'real' | 'mock-publish' | 'mock-signup';

const getSampleTweet = (id: string, authorId: string) => {
  return {
    data: {
      id: id,
      text: `This is an interesting paper https://arxiv.org/abs/2312.05230 ${id}`,
      author_id: authorId,
      created_at: new Date().toISOString(),
      edit_history_tweet_ids: [],
    },
  };
};
[1, 2, 3].map((ix) => {
  state.tweets.push({
    id: `${ix}`,
    tweet: getSampleTweet(`T${ix}`, '1773032135814717440'),
  });
});

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
            id: (state.latestId++).toString(),
            text: postPublish.draft.text,
            edit_history_tweet_ids: [],
            author_id: postPublish.userDetails.user_id,
            created_at: new Date().toISOString(),
          },
        };

        state.tweets.push({ id: tweet.data.id, tweet });

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
      (params: TwitterQueryParameters, userDetails?: UserDetailsBase) => {
        return state.tweets.reverse().map((entry) => entry.tweet.data);
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
