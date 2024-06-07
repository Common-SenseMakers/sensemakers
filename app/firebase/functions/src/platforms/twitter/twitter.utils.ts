import { QuoteTweetV2, TwitterThread } from 'src/@shared/types/types.twitter';
import {
  ApiResponseError,
  ApiV2Includes,
  TweetV2,
  UserV2,
} from 'twitter-api-v2';

export const handleTwitterError = (e: ApiResponseError) => {
  if (e.request) {
    return `
      Error calling Twitter API. 
      path: ${e.request.path}
      code: ${e.code}
      data: ${JSON.stringify(e.data)}
      rateLimit: ${JSON.stringify(e.rateLimit)}
      `;
  } else {
    return e.message;
  }
};

/**
 *
 * @param dateStr ISO 8601 date string, e.g. '2021-09-01T00:00:00Z'
 * @returns unix timestamp in milliseconds
 */
export const dateStrToTimestampMs = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.getTime();
};

export const getTweetTextWithUrls = (tweet: TweetV2) => {
  const fullTweet = tweet['note_tweet'] ? tweet['note_tweet'] : tweet;
  const urls = fullTweet.entities?.urls;
  let text = fullTweet.text;

  if (urls) {
    urls.forEach((url) => {
      text = text.replace(url.url, url.expanded_url);
    });
  }

  return text;
};

export const convertToQuoteTweets = (
  tweets: TweetV2[],
  includes?: ApiV2Includes
): QuoteTweetV2[] => {
  const formattedTweets = tweets.map((tweet): QuoteTweetV2 => {
    if (
      tweet.referenced_tweets &&
      tweet.referenced_tweets[0].type === 'quoted'
    ) {
      const quotedTweet = includes?.tweets?.find(
        (refTweet) => refTweet.id === tweet.referenced_tweets?.[0].id
      );
      const quotedTweetAuthor = includes?.users?.find(
        (user) => user.id === quotedTweet?.author_id
      );

      if (quotedTweet) {
        if (!quotedTweetAuthor) {
          throw new Error(
            `Could not find author for quoted tweet: ${JSON.stringify(
              quotedTweet
            )}`
          );
        }
        return {
          ...tweet,
          quote_tweet: {
            ...quotedTweet,
            author: {
              id: quotedTweetAuthor.id,
              name: quotedTweetAuthor.name,
              username: quotedTweetAuthor.username,
            },
          },
        };
      }
    }
    return tweet;
  });

  return formattedTweets;
};

export const convertTweetsToThreads = (
  tweets: QuoteTweetV2[],
  author: UserV2
) => {
  const tweetThreadsMap = new Map<string, QuoteTweetV2[]>();
  tweets.forEach((tweet) => {
    if (tweet.conversation_id) {
      if (!tweetThreadsMap.has(tweet.conversation_id)) {
        tweetThreadsMap.set(tweet.conversation_id, []);
      }

      tweetThreadsMap.get(tweet.conversation_id)?.push(tweet);
    } else {
      throw new Error('tweet does not have a conversation_id');
    }
  });

  const tweetsArrays = Array.from(tweetThreadsMap.values());
  /** sort threads */
  tweetsArrays.sort(
    (tA, tB) => Number(tB[0].conversation_id) - Number(tA[0].conversation_id)
  );

  /** sort tweets inside each thread, and compose the TwitterThread[] array */
  const threads = tweetsArrays.map((thread): TwitterThread => {
    const tweets = thread.sort(
      (tweetA, tweetB) => Number(tweetA.id) - Number(tweetB.id)
    );
    return {
      conversation_id: tweets[0].conversation_id as string,
      tweets,
      author,
    };
  });
  return threads;
};
