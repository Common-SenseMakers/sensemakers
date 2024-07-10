import { expect } from 'chai';
import fs from 'fs';
import {
  TweetV2LookupResult,
  TweetV2PaginableTimelineResult,
} from 'twitter-api-v2';

import {
  convertToAppTweets,
  convertTweetsToThreads,
} from '../../src/platforms/twitter/twitter.utils';

describe('twitter utility functions', () => {
  it('converts the timeline result to app tweets', async () => {
    const result = JSON.parse(
      fs.readFileSync('./test/__tests__/user.timeline.result.mock.json', 'utf8')
    )['_realData'] as TweetV2PaginableTimelineResult;

    const appTweets = convertToAppTweets(result.data, result.includes);
    expect(appTweets).to.not.be.undefined;
    expect(appTweets.length).to.be.equal(result.data.length);

    const expandedUrlTweet = appTweets.find(
      (tweet) => tweet.id === '1798792109031559184'
    );
    expect(expandedUrlTweet).to.not.be.undefined;
    expect(
      expandedUrlTweet?.text.includes(
        'https://x.com/rtk254/status/1798549107507974626'
      )
    ).to.be.true;

    const unwoundUrlTweet = appTweets.find(
      (tweet) => tweet.id === '1793202484871037102'
    );
    expect(unwoundUrlTweet).to.not.be.undefined;
    expect(unwoundUrlTweet?.text.includes('https://pepo.is/')).to.be.true;
  });

  it('extracts the primary thread from a thread tree (grouped by conversation_id)', async () => {
    const result = JSON.parse(
      fs.readFileSync('./test/__tests__/thread.mock.json', 'utf8')
    ) as TweetV2LookupResult;

    const author = result.includes?.users?.[0];
    if (!author) {
      throw new Error('Author not found');
    }

    const appTweets = convertToAppTweets(result.data, result.includes);
    const threads = convertTweetsToThreads(appTweets, author);

    expect(threads.length).to.be.equal(1);
    expect(threads[0].tweets.length).to.be.equal(4);

    const expectedPrimaryThreadIds = [
      '1798791421152911644',
      '1798791660668698927',
      '1798792109031559184',
      '1801660405367841019',
    ];

    expect(threads[0].tweets.map((tweet) => tweet.id)).to.deep.equal(
      expectedPrimaryThreadIds
    );
  });
});
