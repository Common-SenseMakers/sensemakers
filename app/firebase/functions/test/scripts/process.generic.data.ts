import fs from 'fs';
import { UserV2 } from 'twitter-api-v2';

import { AppTweet } from '../../src/@shared/types/types.twitter';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { convertTweetsToThreads } from '../../src/platforms/twitter/twitter.utils';

(() => {
  const appTweets = JSON.parse(fs.readFileSync('appTweets.json', 'utf8')) as {
    [key: string]: AppTweet[];
  };

  const userAccounts = JSON.parse(
    fs.readFileSync('userAccounts.json', 'utf8')
  ) as UserV2[];

  const userTweets = Object.entries(appTweets);

  const allTweets = userTweets
    .map(([userId, tweets]) => {
      const userAccount = userAccounts.find((user) => user.id === userId)!;
      const userThreads = convertTweetsToThreads(tweets, userAccount);
      const genericPosts = userThreads.map((thread) => {
        return TwitterService.convertThreadToGeneric(thread);
      });
      return genericPosts;
    })
    .flat();

  fs.writeFileSync('allGenericPosts.json', JSON.stringify(allTweets), 'utf8');
})();
