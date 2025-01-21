import fs from 'fs';
import TwitterApi, { BatchComplianceJobV2 } from 'twitter-api-v2';

import { TWITTER_BEARER_TOKEN } from './setup';

describe.only('twitter job manager', () => {
  if (!TWITTER_BEARER_TOKEN) {
    throw new Error('TWITTER_BEARER_TOKEN is not defined');
  }

  const client = new TwitterApi(TWITTER_BEARER_TOKEN);
  it.skip('reads a post', async () => {
    const tweet = await client.v2.singleTweet('1881641431275897319');
    console.log(tweet);
  });

  it.skip('should create a job', async () => {
    const job = await client.v2.sendComplianceJob({
      type: 'tweets',
      name: 'test-job',
      ids: ['1881641431275897319'],
    });
    console.log(job);
  });
  it.skip('should get a job', async () => {
    const job = await client.v2.complianceJob('1881641747987726336');
    console.log(job);
  });
  it('downloads results', async () => {
    const job: BatchComplianceJobV2 = {
      download_expires_at: '2025-01-28T09:55:26.000Z',
      id: '1881641747987726336',
      status: 'complete',
      type: 'tweets',
      resumable: false,
      download_url: 'https://storage.googleapis.com/',
      upload_expires_at: '2025-01-21T10:10:26.000Z',
      created_at: '2025-01-21T09:55:26.000Z',
      upload_url: 'https://storage.googleapis.com/',
    };
    const results = await client.v2.complianceJobResult(job);
    console.log(results);
    fs.writeFileSync(
      'batch-compliance-results.json',
      JSON.stringify(results, null, 2)
    );
  });
});
