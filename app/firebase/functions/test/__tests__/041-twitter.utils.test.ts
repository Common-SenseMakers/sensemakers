import { expect } from 'chai';
import fs from 'fs';
import { TweetV2PaginableTimelineResult } from 'twitter-api-v2';

import { convertToAppTweets } from '../../src/platforms/twitter/twitter.utils';

describe('twitter utility functions', () => {
  it('converts the timeline result to app tweets', async () => {
    const result = JSON.parse(
      fs.readFileSync('./test/__tests__/user.timeline.result.mock.json', 'utf8')
    )['_realData'] as TweetV2PaginableTimelineResult;

    const appTweets = convertToAppTweets(result.data, result.includes);
    expect(appTweets).to.not.be.undefined;
    expect(appTweets.length).to.be.equal(result.data.length);
  });
});
