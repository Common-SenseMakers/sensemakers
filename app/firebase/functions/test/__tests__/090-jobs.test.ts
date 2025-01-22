import { AtpAgent } from '@atproto/api';
import { CarReader } from '@ipld/car';
import pkg from 'cbor';
import fs from 'fs';
import TwitterApi, { BatchComplianceJobV2 } from 'twitter-api-v2';

import { TWITTER_BEARER_TOKEN } from './setup';

// const { CarReader } = require('@ipld/car');

const { decode } = pkg;

describe('twitter job manager', () => {
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

describe.only('bsky delete compliance', async () => {
  it.skip('should delete a compliance job', async () => {
    const client = new AtpAgent({ service: 'https://bsky.social' });
    await client.login({
      identifier: 'did:plc:6z5botgrc5vekq7j26xnvawq',
      password: 'tocp-llhi-bxkf-l4kf',
    });
    const repo = await client.com.atproto.sync.getRepo({
      did: 'did:plc:6z5botgrc5vekq7j26xnvawq',
    });
    // save this car file
    fs.writeFileSync('bsky-repo.car', repo.data);
  });
  it('reads car file', async () => {
    const repoData = fs.readFileSync('bsky-repo.car');
    const carReader = await CarReader.fromBytes(repoData);
    const collections = new Set();

    for await (const { cid: _cid, bytes } of carReader.blocks()) {
      try {
        // Decode the bytes into a record
        const record = decode(bytes);

        // Check if it's a valid AT Protocol record
        if (record && typeof record === 'object' && record.$type) {
          const collection = record.$type.split('/')[0];
          collections.add(collection);
        }
      } catch (error) {
        // Ignore non-JSON blocks
      }
    }

    if (collections.size === 0) {
      console.log('No collections found.');
    } else {
      console.log(`Collections found:\n${[...collections].join('\n')}`);
    }
  });
});

// const parseCarFile = async (carBlob: Blob) => {
//   const arrayBuffer = await carBlob.arrayBuffer();
//   const reader = await CarReader.fromBytes(new Uint8Array(arrayBuffer));

//   for await (const block of reader.blocks()) {
//     console.log(block.cid.toString(), block.bytes);
//     // Process the block here
//   }
// };

// // Assuming you've already fetched the response from the API
// const handleCarFile = async (response: ComAtprotoSyncGetRepo.Response) => {
//   if (response.success) {
//     const carBlob = new Blob([response.data], { type: 'application/car' });
//     const arrayBuffer = await carBlob.arrayBuffer();

//     // Create a stream from the Uint8Array
//     const stream = Readable.from(new Uint8Array(arrayBuffer));

//     try {
//       // Parse the CAR file from the stream
//       const reader = await CarReader.fromIterable(stream);

//       // Get the roots (entry points) of the CAR file
//       const roots = await reader.getRoots();

//       // Retrieve the first block from the CAR file using its CID
//       const got = await reader.get(roots[0]);

//       // Output the content of the block
//       console.log(
//         'Retrieved [%s] from the CAR file with CID [%s]',
//         new TextDecoder().decode(got?.bytes),
//         roots[0].toString()
//       );
//     } catch (err) {
//       console.error('Error reading CAR file:', err);
//     }
//   } else {
//     console.error('Failed to fetch repo');
//   }
// };
