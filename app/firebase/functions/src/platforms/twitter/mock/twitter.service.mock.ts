import { anything, instance, spy, when } from 'ts-mockito';
import { TweetV2LookupResult, TweetV2SingleResult } from 'twitter-api-v2';

import { PlatformFetchParams } from '../../../@shared/types/types.fetch';
import {
  PlatformPostPosted,
  PlatformPostPublish,
} from '../../../@shared/types/types.platform.posts';
import {
  PlatformAccountProfile,
  PlatformProfile,
} from '../../../@shared/types/types.profiles';
import {
  TwitterAccountCredentials,
  TwitterAccountDetails,
  TwitterCredentials,
  TwitterDraft,
  TwitterGetContextParams,
  TwitterSignupContext,
  TwitterSignupData,
  TwitterThread,
  TwitterUser,
} from '../../../@shared/types/types.twitter';
import { TestUserCredentials } from '../../../@shared/types/types.user';
import { ENVIRONMENTS } from '../../../config/ENVIRONMENTS';
import { APP_URL, NODE_ENV } from '../../../config/config.runtime';
import { logger } from '../../../instances/logger';
import { getTestCredentials } from '../../mock/test.users';
import { TwitterService } from '../twitter.service';
import { convertToAppTweetBase, dateStrToTimestampMs } from '../twitter.utils';
import { getSampleTweet, getTimelineMock } from './twitter.mock.utils';

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

export interface InitThreadsProfiles {
  id: string;
  username: string;
}

export const initThreads = (
  testThreads: string[][],
  testProfiles: InitThreadsProfiles[]
) => {
  const now = 1720805241;

  const threads = testThreads.map((thread, ixThread): TwitterThread => {
    const testProfile = testProfiles[ixThread % testProfiles.length];

    const tweets = thread.map((content, ixTweet) => {
      const idTweet = ixThread * 100 + ixTweet;
      const createdAt = now + ixThread * 100 + 10 * ixTweet;
      state.latestTweetId = idTweet;
      return getSampleTweet(
        idTweet.toString().padStart(5, '0'),
        testProfile.id,
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
        id: testProfile.id,
        name: testProfile.username,
        username: testProfile.username,
        profile_image_url:
          'https://pbs.twimg.com/profile_images/1783977034038882304/RGn66lGT_normal.jpg',
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
  getClient: TwitterService['getClient'];
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
    when(mocked.publish(anything())).thenCall(
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
            author_id: 'dummy-user-id',
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
    when(mocked.isRootThread(anything())).thenReturn(true);

    when(mocked.fetchInternal(anything(), anything(), anything())).thenCall(
      async (
        user_id: string,
        params: PlatformFetchParams,
        credentials?: TwitterCredentials
      ): Promise<{
        threads: TwitterThread[];
        credentials?: TwitterCredentials;
      }> => {
        if (NODE_ENV === ENVIRONMENTS.LOCAL) {
          if (params.since_id) {
            return {
              threads: [
                {
                  conversation_id: (Number(params.since_id) + 100).toString(),
                  tweets: [
                    getSampleTweet(
                      (Number(params.since_id) + 100).toString(),
                      user_id,
                      Date.now(),
                      (Number(params.since_id) + 100).toString(),
                      ''
                    ),
                  ],
                  author: {
                    id: 'dummy-author-id',
                    name: 'dummy-author-name',
                    username: 'dummy-author-username',
                    profile_image_url:
                      'https://pbs.twimg.com/profile_images/1783977034038882304/RGn66lGT_normal.jpg',
                  },
                },
              ],
            };
          } else if (params.until_id) {
            return { threads: [] };
          } else {
            return {
              threads: getTimelineMock(
                'dummy-user-id',
                'dummy-user-name',
                'dummy-user-username'
              ),
            };
          }
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
          ? { threads: threads.slice(0, params.expectedAmount) }
          : { threads };
      }
    );

    when(mocked.getProfile(anything(), anything())).thenCall(
      async (user_id: string, credentials: TwitterCredentials) => {
        const platformProfile: PlatformProfile = {
          id: user_id,
          displayName: `Name of ${user_id}`,
          username: `username-${user_id}`,
          avatar: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTePqvjrMR2bJt1B2e6bNQ6RS2n0q9ZN4e1UA&s`,
          description: `a description`,
        };

        return {
          user_id,
          profile: platformProfile,
        };
      }
    );

    when(mocked.getProfileByUsername(anything(), anything())).thenCall(
      async (username: string, credentials: TwitterCredentials) => {
        const platformProfile: PlatformProfile = {
          id: `${username}-id`,
          displayName: `Name of ${username}`,
          username: `${username}`,
          avatar: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTePqvjrMR2bJt1B2e6bNQ6RS2n0q9ZN4e1UA&s`,
          description: `a description`,
        };

        return {
          user_id: `${username}-id`,
          profile: platformProfile,
        };
      }
    );
  }

  if (type.get) {
    when(mocked.getThread(anything(), anything())).thenCall(
      async (
        post_id: string,
        credentials?: TwitterAccountCredentials
      ): Promise<{
        platformPost: PlatformPostPosted<TwitterThread, TwitterUser>;
        credentials?: TwitterAccountCredentials;
      }> => {
        const thread = state.threads.find(
          (thread) => thread.conversation_id === post_id
        );

        if (!thread) {
          throw new Error(`thread ${post_id} not found in mock`);
        }

        return {
          platformPost: {
            post_id: thread.conversation_id,
            user_id: thread.author.id,
            timestampMs: dateStrToTimestampMs(thread.tweets[0].created_at),
            post: thread,
          },
        };
      }
    );
  }

  if (type.signup) {
    when(mocked.getSignupContext(anything())).thenCall(
      (
        user_id?: string,
        params?: TwitterGetContextParams
      ): TwitterSignupContext => {
        const callbackUrl = new URL(
          params?.callback_url ? params.callback_url : APP_URL.value()
        );
        callbackUrl.searchParams.set('code', 'testCode');
        callbackUrl.searchParams.set('state', 'testState');
        console.log('callbackUrl', callbackUrl.toString());
        return {
          url: callbackUrl.toString(),
          state: 'testState',
          codeVerifier: 'testCodeVerifier',
          codeChallenge: user_id ? user_id : '', // include the user_id in the code challenge so the mock handle signup data knows which user to select from
          callback_url: callbackUrl.toString(),
          type: 'read',
        };
      }
    );
    when(mocked.handleSignupData(anything())).thenCall(
      (data: TwitterSignupData) => {
        const user_id = data.codeChallenge;
        const testCredentials = getTestCredentials(
          process.env.TEST_USER_ACCOUNTS as string
        );
        const currentUserCredentials =
          testCredentials?.find(
            (credentials) => credentials.twitter.id === user_id
          ) || testCredentials?.[0];

        if (!currentUserCredentials) {
          throw new Error('test credentials not found');
        }
        const twitterAccountDetails: TwitterAccountDetails = {
          user_id: currentUserCredentials.twitter.id,
          signupDate: Date.now(),
          credentials: {
            read: {
              accessToken:
                process.env.TWITTER_BEARER_TOKEN ||
                'ZWJzaEJCU1BSaFZvLUIwRFNCNHNXVlQtTV9mY2VSaDlOSk5ETjJPci0zbmJtOjE3MTk0MzM5ODkyNTM6MTowOmF0OjE',
              refreshToken:
                process.env.TWITTER_BEARER_TOKEN ||
                'U2xBMGpRSkFucE9yQzAxSnJlM0pRci1tQzJlR2dfWEY2MEpNc2daYkF6VjZSOjE3MTk0MzM5ODkyNTM6MTowOnJ0OjE',
              expiresIn: 7200,
              expiresAtMs: 2054341070000,
            },
          },
        };
        const twitterProfile: PlatformAccountProfile = {
          user_id: currentUserCredentials.twitter.id,
          profile: {
            id: currentUserCredentials.twitter.id,
            displayName: currentUserCredentials.twitter.username,
            username: currentUserCredentials.twitter.username,
            avatar:
              'https://pbs.twimg.com/profile_images/1783977034038882304/RGn66lGT_normal.jpg',
            description: 'test description',
          },
        };
        return {
          accountDetails: twitterAccountDetails,
          profile: twitterProfile,
        };
      }
    );
  }
  when(mocked.getPosts(anything(), anything())).thenCall(
    async (): Promise<TweetV2LookupResult> => {
      return {
        data: [
          {
            conversation_id: '1798791421152911644',
            author_id: '1773032135814717440',
            created_at: '2024-06-06T18:57:49.000Z',
            referenced_tweets: [
              {
                type: 'quoted',
                id: '1795069204418175459',
              },
            ],
            entities: {
              urls: [
                // @ts-ignore
                {
                  start: 50,
                  end: 73,
                  url: 'https://t.co/gguJOKvN37',
                  expanded_url:
                    'https://x.com/sense_nets_bot/status/1798782358201508331',
                  display_url: 'x.com/sense_nets_bot…',
                },
                // @ts-ignore
                {
                  start: 75,
                  end: 98,
                  url: 'https://t.co/Xvg4gOdJ8H',
                  expanded_url:
                    'https://x.com/sense_nets_bot/status/1795069204418175459',
                  display_url: 'x.com/sense_nets_bot…',
                },
              ],
            },
            text: 'this is a tweet that references two other tweets!\nhttps://t.co/gguJOKvN37\n\nhttps://t.co/Xvg4gOdJ8H',
            edit_history_tweet_ids: ['1798791421152911644'],
            id: '1798791421152911644',
          },
          {
            conversation_id: '1798791421152911644',
            author_id: '1773032135814717440',
            created_at: '2024-06-06T18:58:46.000Z',
            referenced_tweets: [
              {
                type: 'quoted',
                id: '1798782358201508331',
              },
              {
                type: 'replied_to',
                id: '1798791421152911644',
              },
            ],
            entities: {
              urls: [
                // @ts-ignore
                {
                  start: 104,
                  end: 127,
                  url: 'https://t.co/gguJOKvN37',
                  expanded_url:
                    'https://x.com/sense_nets_bot/status/1798782358201508331',
                  display_url: 'x.com/sense_nets_bot…',
                },
              ],
            },
            text: "I see that it only caught the second link as the quote tweet, but didn't include this as a quote tweet:\nhttps://t.co/gguJOKvN37",
            edit_history_tweet_ids: ['1798791660668698927'],
            id: '1798791660668698927',
          },
          {
            conversation_id: '1798791421152911644',
            author_id: '1773032135814717440',
            created_at: '2024-06-06T19:00:33.000Z',
            referenced_tweets: [
              {
                type: 'quoted',
                id: '1798549107507974626',
              },
              {
                type: 'replied_to',
                id: '1798791660668698927',
              },
            ],
            entities: {
              urls: [
                // @ts-ignore
                {
                  start: 33,
                  end: 56,
                  url: 'https://t.co/9ZB0UaqOcc',
                  expanded_url:
                    'https://x.com/rtk254/status/1798549107507974626',
                  display_url: 'x.com/rtk254/status/…',
                },
              ],
            },
            text: 'more quote tweets in this thread\nhttps://t.co/9ZB0UaqOcc',
            edit_history_tweet_ids: ['1798792109031559184'],
            id: '1798792109031559184',
          },
        ],
        includes: {
          users: [
            {
              id: '1773032135814717440',
              name: 'SenseNet Bot',
              username: 'sense_nets_bot',
            },
            {
              id: '1065316525417160705',
              name: 'Ronen Tamari',
              username: 'rtk254',
            },
            {
              id: '295218901',
              name: 'vitalik.eth',
              username: 'VitalikButerin',
            },
          ],
          tweets: [
            {
              conversation_id: '1795069204418175459',
              author_id: '1773032135814717440',
              created_at: '2024-05-27T12:27:03.000Z',
              referenced_tweets: [
                {
                  type: 'quoted',
                  id: '1793505119792677089',
                },
              ],
              entities: {
                urls: [
                  // @ts-ignore
                  {
                    start: 38,
                    end: 61,
                    url: 'https://t.co/MynZ87Ln9R',
                    expanded_url:
                      'https://twitter.com/VitalikButerin/status/1793505119792677089',
                    display_url: 'x.com/VitalikButerin…',
                  },
                ],
              },
              text: 'A new quote tweet of something I love https://t.co/MynZ87Ln9R',
              edit_history_tweet_ids: ['1795069204418175459'],
              id: '1795069204418175459',
            },
            {
              conversation_id: '1798782358201508331',
              author_id: '1773032135814717440',
              created_at: '2024-06-06T18:21:48.000Z',
              referenced_tweets: [
                {
                  type: 'quoted',
                  id: '1795069204418175459',
                },
              ],
              entities: {
                urls: [
                  // @ts-ignore
                  {
                    start: 38,
                    end: 61,
                    url: 'https://t.co/mUp1B8Ipkc',
                    expanded_url:
                      'https://twitter.com/sense_nets_bot/status/1795069204418175459',
                    display_url: 'x.com/sense_nets_bot…',
                  },
                ],
              },
              text: 'a quote tweet that goes 2 layers deep https://t.co/mUp1B8Ipkc',
              edit_history_tweet_ids: ['1798782358201508331'],
              id: '1798782358201508331',
            },
            {
              conversation_id: '1798549107507974626',
              author_id: '1065316525417160705',
              created_at: '2024-06-06T02:54:57.000Z',
              referenced_tweets: [
                {
                  type: 'quoted',
                  id: '1798312150345347127',
                },
              ],
              entities: {
                urls: [
                  {
                    start: 107,
                    end: 130,
                    url: 'https://t.co/YL93kDHmdo',
                    expanded_url:
                      'https://aeon.co/essays/on-the-dangers-of-seeing-human-minds-as-predictive-machines',
                    display_url: 'aeon.co/essays/on-the-…',
                    // @ts-ignore
                    status: 200,
                    title:
                      'On the dangers of seeing human minds as predictive machines | Aeon Essays',
                    description:
                      'Cognitive scientists and corporations alike see human minds as predictive machines. Right or wrong, they will change how we think',
                    unwound_url:
                      'https://aeon.co/essays/on-the-dangers-of-seeing-human-minds-as-predictive-machines',
                  },
                  {
                    start: 131,
                    end: 154,
                    url: 'https://t.co/cVBzU3kDij',
                    expanded_url:
                      'https://twitter.com/rtk254/status/1798549107507974626/photo/1',
                    display_url: 'pic.twitter.com/cVBzU3kDij',
                    // @ts-ignore
                    media_key: '3_1798549051249762304',
                  },
                  // @ts-ignore
                  {
                    start: 155,
                    end: 178,
                    url: 'https://t.co/LogqUQRYIi',
                    expanded_url:
                      'https://twitter.com/behrenstimb/status/1798312150345347127',
                    display_url: 'x.com/behrenstimb/st…',
                  },
                ],
              },
              text: 'This can be generalized beyond writing - predictable is exactly how corporations want us. Be unpredictable https://t.co/YL93kDHmdo https://t.co/cVBzU3kDij https://t.co/LogqUQRYIi',
              edit_history_tweet_ids: ['1798549107507974626'],
              id: '1798549107507974626',
            },
          ],
        },
      };
    }
  );

  return instance(mocked) as unknown as TwitterService;
};
