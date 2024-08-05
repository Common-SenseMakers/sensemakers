import fs from 'fs';
import { UserV2 } from 'twitter-api-v2';

import { AppTweet } from '../../src/@shared/types/types.twitter';
import {
  getTweetTextWithUrls,
  replaceTinyUrlsWithExpandedUrls,
} from '../../src/platforms/twitter/twitter.utils';

(() => {
  const appTweets = JSON.parse(fs.readFileSync('appTweets.json', 'utf8')) as {
    [key: string]: AppTweet[];
  };

  const userAccounts = JSON.parse(
    fs.readFileSync('userAccounts.json', 'utf8')
  ) as UserV2[];

  const allTweetsFlattened = Object.values(appTweets).flat();

  const allTweets = allTweetsFlattened.map((tweet) => {
    const { username, name } = userAccounts.find(
      (user) => user.id === tweet.author_id
    )!;
    const urls = tweet.note_tweet?.entities?.urls
      ? tweet.note_tweet.entities.urls.map((url) => url.expanded_url)
      : tweet.entities?.urls
        ? tweet.entities.urls.map((url) => url.expanded_url)
        : [];

    const quoted_tweet = tweet.quoted_tweet
      ? {
          id: tweet.quoted_tweet?.id,
          created_at: tweet.quoted_tweet?.created_at,
          author_id: tweet.quoted_tweet?.author_id,
          username: tweet.quoted_tweet?.author.username,
          name: tweet.quoted_tweet?.author.name,
          conversation_id: tweet.quoted_tweet?.conversation_id,
          text: replaceTinyUrlsWithExpandedUrls(
            tweet.quoted_tweet!.text,
            tweet.quoted_tweet?.entities?.urls
          ),
          url: `https://x.com/${username}/status/${tweet.quoted_tweet?.id}`,
        }
      : undefined;
    const text = getTweetTextWithUrls(tweet);
    return {
      id: tweet.id,
      created_at: tweet.created_at,
      author_id: tweet.author_id,
      conversation_id: tweet.conversation_id,
      quoted_tweet,
      username,
      name,
      urls,
      text,
      url: `https://x.com/${username}/status/${tweet.id}`,
    } as Omit<AppTweet, 'entities' | 'note_tweet' | 'quoted_tweet'>;
  });

  fs.writeFileSync(
    'allTweetsFlattened.json',
    JSON.stringify(allTweets),
    'utf8'
  );
})();
