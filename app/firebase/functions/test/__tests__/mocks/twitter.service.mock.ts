import { anything, instance, spy, when } from 'ts-mockito';
import { TweetV2SingleResult } from 'twitter-api-v2';

import { UserDetailsBase } from '../../../src/@shared/types/types';
import {
  PlatformPostPosted,
  PlatformPostPublish,
} from '../../../src/@shared/types/types.platform.posts';
import {
  TwitterDraft,
  TwitterQueryParameters,
} from '../../../src/@shared/types/types.twitter';
import { TwitterService } from '../../../src/platforms/twitter/twitter.service';
import { dateStrToTimestampMs } from '../../../src/platforms/twitter/twitter.utils';

interface TwitterTestState {
  latestId: number;
  tweets: Map<string, TweetV2SingleResult>;
}

let state: TwitterTestState = {
  latestId: 0,
  tweets: new Map(),
};

/** make private methods public */
type MockedType = Omit<TwitterService, 'fetchInternal'> & {
  fetchInternal: TwitterService['fetchInternal'];
};

export const getTwitterMock = (twitterService: TwitterService) => {
  const Mocked = spy(twitterService) as unknown as MockedType;

  when(Mocked.publish(anything(), anything())).thenCall(
    (postPublish: PlatformPostPublish<TwitterDraft>) => {
      const tweet: TweetV2SingleResult = {
        data: {
          id: (state.latestId++).toString(),
          text: postPublish.draft.text,
          edit_history_tweet_ids: [],
          author_id: postPublish.userDetails.user_id,
          created_at: new Date().toISOString(),
        },
      };

      state.tweets.set(tweet.data.id, tweet);

      const post: PlatformPostPosted<TweetV2SingleResult> = {
        post_id: tweet.data.id,
        user_id: tweet.data.author_id as string,
        timestampMs: dateStrToTimestampMs(tweet.data.created_at as string),
        post: tweet,
      };
      return post;
    }
  );

  when(Mocked.fetchInternal(anything(), anything())).thenCall(
    (params: TwitterQueryParameters, userDetails?: UserDetailsBase) => {
      return Array.from(state.tweets.values()).map((tweet) => tweet.data);
    }
  );

  return instance(Mocked);
};
