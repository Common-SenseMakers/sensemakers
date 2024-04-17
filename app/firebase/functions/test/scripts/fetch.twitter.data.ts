import dotenv from 'dotenv';
import fs from 'fs';
import {
  TweetV2, // TweetV2PaginableTimelineResult,
  TweetV2UserTimelineParams,
  TwitterApi,
} from 'twitter-api-v2';

import { users } from './twitter.users';

dotenv.config({ path: '.env.test' });

const USER_RANGE: [number, number] = [1, 10];

const token = process.env.TWITTER_MY_BEARER_TOKEN as string;
const twitterApi = new TwitterApi(token);

const TIMELINE_PARAMS: Partial<TweetV2UserTimelineParams> = {
  max_results: 50,
  'tweet.fields': [
    'created_at',
    'author_id',
    'text',
    'entities',
    //@ts-ignore
    'note_tweet',
  ],
  'user.fields': ['username', 'name'],
  exclude: ['retweets', 'replies'],
};

const fetchTweets = async (users: { user_id: string; username: string }[]) => {
  if (!token) throw new Error('TWITTER_MY_BEARER_TOKEN not defined');
  console.log(users.length);
  const tweets = await Promise.all(
    users.map(async (user) => {
      const result = await twitterApi.v2.userTimeline(
        user.user_id,
        TIMELINE_PARAMS
      );
      console.log(result);
      const resultCollection: (TweetV2 & { url: string; username: string })[] =
        result.data.data.map((tweet) => ({
          ...tweet,
          url: `https://twitter.com/${user.username}/status/${tweet.id}`,
          username: user.username,
        })) || [];

      fs.writeFileSync(
        `${user.username}.json`,
        JSON.stringify(resultCollection),
        'utf8'
      );
      return resultCollection;
    })
  );
  return tweets.flat();
};
(async () => {
  try {
    const tweets = await fetchTweets(users.slice(USER_RANGE[0], USER_RANGE[1]));
    fs.writeFileSync(
      `${JSON.stringify(USER_RANGE)}.json`,
      JSON.stringify(tweets),
      'utf8'
    );
  } catch (error) {
    console.error(error);
  }
})();
