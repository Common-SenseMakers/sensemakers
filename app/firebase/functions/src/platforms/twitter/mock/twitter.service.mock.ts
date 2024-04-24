import { anything, instance, spy, when } from 'ts-mockito';
import { TweetV2SingleResult } from 'twitter-api-v2';

import { UserDetailsBase } from '../../../@shared/types/types';
import {
  PlatformPostPosted,
  PlatformPostPublish,
} from '../../../@shared/types/types.platform.posts';
import {
  TwitterDraft,
  TwitterQueryParameters,
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

const getSampleTweet = (id: string, authorId: string) => {
  return {
    data: {
      id: id,
      text: `Hello World ${id}`,
      author_id: authorId,
      created_at: new Date().toISOString(),
      edit_history_tweet_ids: [],
    },
  };
};
[1, 2].map((ix) => {
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
export const getTwitterMock = (twitterService: TwitterService) => {
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

  return instance(Mocked);
};
