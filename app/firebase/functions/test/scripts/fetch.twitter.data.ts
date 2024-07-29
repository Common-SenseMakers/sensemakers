import dotenv from 'dotenv';
import fs from 'fs';
import { TweetV2UserTimelineParams, TwitterApi, UserV2 } from 'twitter-api-v2';

import { AppTweet } from '../../src/@shared/types/types.twitter';
import {
  expansions,
  tweetFields,
} from '../../src/platforms/twitter/twitter.config';
import { convertToAppTweets } from '../../src/platforms/twitter/twitter.utils';

dotenv.config({ path: '.env.test' });

const token = process.env.TWITTER_BEARER_TOKEN as string;
const twitterApi = new TwitterApi(token);

const TIMELINE_PARAMS: Partial<TweetV2UserTimelineParams> = {
  max_results: 100,
  'tweet.fields': tweetFields,
  expansions: expansions,
  exclude: ['retweets', 'replies'],
};

const fetchTweets = async (users: UserV2[]) => {
  if (!token) throw new Error('TWITTER_MY_BEARER_TOKEN not defined');
  let appTweets: {
    [key: string]: AppTweet[];
  } = {};
  if (fs.existsSync('appTweets.json')) {
    appTweets = JSON.parse(fs.readFileSync('appTweets.json', 'utf8'));
    console.log(Object.keys(appTweets));
  }
  for (const user of users) {
    if (!appTweets[user.id]) {
      const result = await twitterApi.v2.userTimeline(user.id, TIMELINE_PARAMS);
      if (!result.data.data) {
        continue;
      }
      if (result.data.errors) {
        console.error(result.data.errors);
      }
      const resultAppTweets = convertToAppTweets(
        result.data.data,
        result.data.includes
      );
      appTweets[user.id] = resultAppTweets;
      fs.writeFileSync('appTweets.json', JSON.stringify(appTweets), 'utf8');
    }
  }
};
(async () => {
  try {
    const users = JSON.parse(
      fs.readFileSync('userAccounts.json', 'utf8')
    ) as UserV2[];
    await fetchTweets(users);
  } catch (error) {
    console.error(error);
  }
})();
