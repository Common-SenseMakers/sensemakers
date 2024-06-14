import { TTweetv2Expansion, TTweetv2TweetField } from 'twitter-api-v2';

export const expansions: TTweetv2Expansion[] = [
  'referenced_tweets.id',
  'referenced_tweets.id.author_id',
];

export const tweetFields: TTweetv2TweetField[] = [
  'created_at',
  'author_id',
  'text',
  'entities',
  'note_tweet',
  'conversation_id',
];
