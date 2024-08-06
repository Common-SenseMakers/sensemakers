import dotenv from 'dotenv';
import fs from 'fs';
import { TwitterApi } from 'twitter-api-v2';

import { twitterUsernames } from './twitter.usernames';

dotenv.config({ path: '.env.test' });

(async () => {
  const token = process.env.TWITTER_BEARER_TOKEN as string;
  if (!token) throw new Error('TWITTER_BEARER_TOKEN not defined');
  const twitterApi = new TwitterApi(token);

  const result = await twitterApi.v2.usersByUsernames(twitterUsernames, {
    'user.fields': ['description', 'name', 'username', 'id', 'entities'],
  });

  fs.writeFileSync('userAccounts.json', JSON.stringify(result.data), 'utf8');
})();
