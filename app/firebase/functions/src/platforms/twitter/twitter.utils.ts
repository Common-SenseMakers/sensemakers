import { ApiResponseError, TweetV2 } from 'twitter-api-v2';

export const handleTwitterError = (e: ApiResponseError) => {
  return `
    Error calling Twitter API. 
    path: ${e.request.path}
    code: ${e.code}
    data: ${JSON.stringify(e.data)}
    rateLimit: ${JSON.stringify(e.rateLimit)}
    `;
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
