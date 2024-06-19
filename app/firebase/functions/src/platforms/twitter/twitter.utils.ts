import {
  ApiResponseError,
  ApiV2Includes,
  TweetEntityUrlV2,
  TweetV2,
  UserV2,
} from 'twitter-api-v2';

import {
  AppTweet,
  AppTweetBase,
  OPTIONAL_TWEET_FIELDS,
  REQUIRED_TWEET_FIELDS,
  TwitterThread,
} from '../../@shared/types/types.twitter';

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

export const getTweetTextWithUrls = (tweet: AppTweetBase) => {
  const fullTweet = tweet[OPTIONAL_TWEET_FIELDS.NoteTweet]
    ? tweet[OPTIONAL_TWEET_FIELDS.NoteTweet]
    : tweet;
  const urls = fullTweet.entities?.urls;
  let text = fullTweet.text;
  return replaceTinyUrlsWithExpandedUrls(text, urls);
};

export const replaceTinyUrlsWithExpandedUrls = (
  text: string,
  urls?: TweetEntityUrlV2[]
) => {
  if (!urls) {
    return text;
  }
  urls.forEach((url) => {
    text = text.replace(url.url, url.expanded_url);
  });
  return text;
};

export const convertToAppTweetBase = (tweet: TweetV2): AppTweetBase => {
  Object.values(REQUIRED_TWEET_FIELDS).forEach((field) => {
    if (
      !(field in tweet) ||
      tweet[field] === undefined ||
      tweet[field] === null
    ) {
      throw new Error(`TweetV2 is missing required field: ${field}`);
    }
  });

  const appTweetBase: Partial<AppTweetBase> = {};
  Object.values(REQUIRED_TWEET_FIELDS).forEach((field) => {
    appTweetBase[field] = tweet[field] as any;
  });

  Object.values(OPTIONAL_TWEET_FIELDS).forEach((field) => {
    if (field in tweet) {
      appTweetBase[field] = tweet[field] as any;
    }
  });

  return appTweetBase as AppTweetBase;
};

export const convertToAppTweets = (
  tweets: TweetV2[],
  includes?: ApiV2Includes
): AppTweet[] => {
  const formattedTweets = tweets.map((tweet): AppTweet => {
    const appTweetBase = convertToAppTweetBase(tweet);
    const quotedTweetId = tweet.referenced_tweets?.find(
      (ref) => ref.type === 'quoted'
    )?.id;
    if (quotedTweetId) {
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
        const quotedAppTweetBase = convertToAppTweetBase(quotedTweet);
        return {
          ...appTweetBase,
          quoted_tweet: {
            ...quotedAppTweetBase,
            author: {
              id: quotedTweetAuthor.id,
              name: quotedTweetAuthor.name,
              username: quotedTweetAuthor.username,
            },
          },
        };
      }
    }

    return appTweetBase;
  });

  return formattedTweets;
};

export const convertTweetsToThreads = (tweets: AppTweet[], author: UserV2) => {
  const tweetThreadsMap = new Map<string, AppTweet[]>();
  tweets.forEach((tweet) => {
    if (!tweetThreadsMap.has(tweet.conversation_id)) {
      tweetThreadsMap.set(tweet.conversation_id, []);
    }

    tweetThreadsMap.get(tweet.conversation_id)?.push(tweet);
  });

  const tweetsArrays = Array.from(tweetThreadsMap.values());
  /** sort threads */
  tweetsArrays.sort(
    (tA, tB) => Number(tB[0].conversation_id) - Number(tA[0].conversation_id)
  );

  /** sort tweets inside each thread, and compose the TwitterThread[] array */
  /** extract primary thread for each conversation id */
  const threads = tweetsArrays.map((thread): TwitterThread => {
    const tweets = thread.sort(
      (tweetA, tweetB) => Number(tweetA.id) - Number(tweetB.id)
    );
    const primaryThread = extractPrimaryThread(tweets[0].id, tweets); // TODO: better handling here if the original conversation_id tweet isn't in this list - how to properly pick which primary thread to take?
    return {
      conversation_id: tweets[0].conversation_id,
      tweets: primaryThread,
      author: {
        id: author.id,
        name: author.name,
        username: author.username,
      },
    };
  });
  return threads;
};

const extractPrimaryThread = (id: string, tweets: AppTweet[]): AppTweet[] => {
  const primaryTweet = tweets.find((tweet) => tweet.id === id);
  if (!primaryTweet) {
    throw new Error(`Could not find primary tweet with id: ${id}`);
  }
  const earliestResponse = getEarliestResponse(id, tweets);
  if (!earliestResponse) {
    return [primaryTweet];
  }

  return [primaryTweet, ...extractPrimaryThread(earliestResponse.id, tweets)];
};

const getEarliestResponse = (id: string, tweets: AppTweet[]) => {
  const allTweetReplies = tweets.filter((tweet) =>
    tweet.referenced_tweets?.some(
      (referencedTweet) =>
        referencedTweet.type === 'replied_to' && referencedTweet.id === id
    )
  );
  if (allTweetReplies.length === 0) {
    return null;
  }
  return allTweetReplies.reduce(
    (earliestTweet, tweet) =>
      Number(tweet.id) < Number(earliestTweet.id) ? tweet : earliestTweet,
    allTweetReplies[0]
  );
};

export const getTweetUrl = (username: string, id: string) => {
  return `https://x.com/${username}/status/${id}`;
};
