import fs from 'fs';
import { TweetEntitiesV2, TweetV2 } from 'twitter-api-v2';

(() => {
  const first1 = fs.readFileSync('[0,1].json', 'utf8');
  const next1to10 = fs.readFileSync('[1,10].json', 'utf8');
  const next10to15 = fs.readFileSync('[10,15].json', 'utf8');

  const tweets: (TweetV2 & {
    username: string;
    url: string;
    note_tweet?: { text: string; entities?: TweetEntitiesV2 };
  })[] = JSON.parse(first1);
  const tweets1: (TweetV2 & {
    username: string;
    url: string;
    note_tweet?: { text: string; entities?: TweetEntitiesV2 };
  })[] = JSON.parse(next1to10);
  const tweets2: (TweetV2 & {
    username: string;
    url: string;
    note_tweet?: { text: string; entities?: TweetEntitiesV2 };
  })[] = JSON.parse(next10to15);
  const allTweets = tweets.concat(tweets1).concat(tweets2);

  const mappedTweets = allTweets.map((tweet) => {
    return {
      id: tweet.id,
      created_at: tweet.created_at,
      account_id: tweet.author_id,
      username: tweet.username,
      urls: tweet.note_tweet?.entities?.urls
        ? tweet.note_tweet.entities.urls.map((url) => url.expanded_url)
        : tweet.entities?.urls
          ? tweet.entities.urls.map((url) => url.expanded_url)
          : [],
      text: tweet['note_tweet']?.text ? tweet['note_tweet'].text : tweet.text,
      server: 'twitter.com',
      tootURL: tweet.url,
    };
  });

  fs.writeFileSync('mappedTweets.json', JSON.stringify(mappedTweets), 'utf8');
})();
