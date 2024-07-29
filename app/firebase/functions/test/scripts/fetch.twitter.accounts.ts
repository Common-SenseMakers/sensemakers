import dotenv from 'dotenv';
import fs from 'fs';
import { TwitterApi, UserV2 } from 'twitter-api-v2';

import { users } from './twitter.users';

dotenv.config({ path: '.env.test' });

const USER_RANGE: [number, number] = [10, 15];

const token = process.env.TWITTER_MY_BEARER_TOKEN as string;
const twitterApi = new TwitterApi(token);

const fetchAccounts = async (
  users: { user_id: string; username: string }[]
) => {
  if (!token) throw new Error('TWITTER_MY_BEARER_TOKEN not defined');
  console.log(users.length);
  const accounts = await Promise.all(
    users.map(async (user) => {
      const results = await twitterApi.v2.user(user.user_id, {
        'user.fields': ['description', 'entities'],
      });
      console.log(results);
      const resultCollection: UserV2[] = [results.data] || [];

      //   fs.writeFileSync(
      //     `${user.username}.json`,
      //     JSON.stringify(resultCollection),
      //     'utf8'
      //   );
      return resultCollection;
    })
  );
  return accounts.flat();
};
(async () => {
  try {
    const tweets = await fetchAccounts(
      users.slice(USER_RANGE[0], USER_RANGE[1])
    );
    fs.writeFileSync(
      `${JSON.stringify(USER_RANGE)}-accounts.json`,
      JSON.stringify(tweets),
      'utf8'
    );
  } catch (error) {
    console.error(error);
  }
})();
