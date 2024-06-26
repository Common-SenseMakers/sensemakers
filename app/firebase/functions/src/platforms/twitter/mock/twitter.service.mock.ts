import { anything, instance, spy, when } from 'ts-mockito';
import { TweetV2SingleResult } from 'twitter-api-v2';

import { PlatformFetchParams } from '../../../@shared/types/types.fetch';
import {
  PlatformPostPosted,
  PlatformPostPublish,
} from '../../../@shared/types/types.platform.posts';
import {
  TwitterDraft,
  TwitterThread,
  TwitterUserDetails,
} from '../../../@shared/types/types.twitter';
import { UserDetailsBase } from '../../../@shared/types/types.user';
import { TransactionManager } from '../../../db/transaction.manager';
import { logger } from '../../../instances/logger';
import { TwitterService } from '../twitter.service';
import { dateStrToTimestampMs } from '../twitter.utils';

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

export const THREADS: string[][] = process.env.TEST_THREADS
  ? JSON.parse(process.env.TEST_THREADS as string)
  : [];

export const TWITTER_USER_ID_MOCKS = '1773032135814717440';

const getSampleTweet = (
  id: string,
  authorId: string,
  createdAt: number,
  conversation_id: string,
  content: string
) => {
  const date = new Date(createdAt);

  return {
    id: id,
    conversation_id,
    text: `This is an interesting paper https://arxiv.org/abs/2312.05230 ${id} | ${content}`,
    author_id: authorId,
    created_at: date.toISOString(),
    edit_history_tweet_ids: [],
  };
};

export const initThreads = () => {
  const now = Date.now();

  const threads = THREADS.map((thread, ixThread): TwitterThread => {
    const tweets = thread.map((content, ixTweet) => {
      const idTweet = ixThread * 100 + ixTweet;
      const createdAt = now + ixThread * 100 + 10 * ixTweet;
      state.latestTweetId = idTweet;
      return getSampleTweet(
        idTweet.toString().padStart(5, '0'),
        TWITTER_USER_ID_MOCKS,
        createdAt,
        ixThread.toString().padStart(5, '0'),
        content
      );
    });
    state.latestConvId = ixThread;
    return {
      conversation_id: `${ixThread}`,
      tweets,
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
            text: postPublish.draft.text,
            edit_history_tweet_ids: [],
            author_id: postPublish.userDetails.user_id,
            created_at: new Date().toISOString(),
          },
        };

        const thread = {
          conversation_id: (++state.latestConvId).toString(),
          tweets: [tweet.data],
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

    when(mocked.getSignupContext(anything(), anything())).thenCall(() => {
      return {
        url: 'http://127.0.0.1:3000/?state=65~FHQ.G60vdlxFVLD~3pCJNmxHscqOo&code=azdVb0hMVUFGV2lhc2NlSEU2Q2RCOV9uckYtMGppYlc4R25lMWVkVDN6cGhXOjE3MTk0MzE4MTkyNTU6MTowOmFjOjE',
        state: '65~FHQ.G60vdlxFVLD~3pCJNmxHscqOo',
        codeVerifier:
          'UlC.YM2NljtlaC3fd.Ni4RpqHU9XBO~2EZbEwoL8tF_aGA2._7Sq7~bNMiEAkdaQt9TZf3lPoXPGhf2dHlH.UoJVFvXEaW4HF7ZkFnLs~uHDjZVMgzq6UgW3-ZsTqVkG',
        codeChallenge: 'qJIf591edcrFYpEf3z8lXZX-5Cfqw5JOg_EL2-oJ330',
        callback_url: 'http://127.0.0.1:3000/',
        type: 'read',
      };
    });

    when(mocked.handleSignupData(anything())).thenCall(
      (data: TwitterUserDetails): TwitterUserDetails => {
        return {
          user_id: '1773032135814717440',
          signupDate: 0,
          profile: {
            name: 'SenseNet Bot',
            profile_image_url:
              'https://pbs.twimg.com/profile_images/1783977034038882304/RGn66lGT_normal.jpg',
            id: '1773032135814717440',
            username: 'sense_nets_bot',
          },
          read: {
            accessToken:
              'ZWJzaEJCU1BSaFZvLUIwRFNCNHNXVlQtTV9mY2VSaDlOSk5ETjJPci0zbmJtOjE3MTk0MzM5ODkyNTM6MTowOmF0OjE',
            refreshToken:
              'U2xBMGpRSkFucE9yQzAxSnJlM0pRci1tQzJlR2dfWEY2MEpNc2daYkF6VjZSOjE3MTk0MzM5ODkyNTM6MTowOnJ0OjE',
            expiresIn: 7200,
            expiresAtMs: 1719441189590,
          },
        };
      }
    );

    return instance(mocked) as unknown as TwitterService;
  }

  throw new Error('Unexpected');
};
