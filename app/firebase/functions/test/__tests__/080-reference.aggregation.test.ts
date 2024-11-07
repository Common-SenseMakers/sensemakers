import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { AppUser } from '../../src/@shared/types/types.user';
import { logger } from '../../src/instances/logger';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { fetchPostInTests } from '../utils/posts.utils';
import { createUsers } from '../utils/users.utils';
import {
  _01_createAndFetchUsers,
  _02_publishTweet,
  _03_fetchAfterPublish,
} from './reusable/create-post-fetch';
import {
  USE_REAL_LINKS,
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
  testUsers,
} from './setup';
import { getTestServices } from './test.services';

const feedThreads = [[''], [''], [''], [''], ['']];

describe('080 get reference aggregation', () => {
  const services = getTestServices({
    time: 'mock',
    twitter: USE_REAL_TWITTER
      ? undefined
      : { publish: true, signup: true, fetch: true, get: true },
    parser: USE_REAL_PARSER ? 'real' : 'mock',
    links: USE_REAL_LINKS ? undefined : { get: true, enable: true },
  });

  before(async () => {
    logger.debug('resetting DB');
    /**
     * Creates threads in the twitter mock with post_id = 0, 1, 2 for each element
     * in the feedThreads array
     */
    await resetDB(feedThreads);
  });

  describe('get and process', () => {
    let user: AppUser | undefined;

    before(async () => {
      const users = await services.db.run((manager) => {
        return createUsers(services, testUsers, manager);
      });
      user = users.find(
        (u) => UsersHelper.getAccount(u, PLATFORM.Twitter) !== undefined
      );
    });

    it('fetch and parse all posts', async () => {
      if (USE_REAL_TWITTER) {
        logger.warn(`Feed test disabled with real twitter`);
        return;
      }
      for (let ix = 0; ix < feedThreads.length; ix++) {
        const post_id = ix.toString();

        if (!post_id) {
          throw new Error('TEST_THREAD_ID not defined in .env.test file');
        }

        if (!user) {
          throw new Error('user not created');
        }

        const post = await fetchPostInTests(
          user.userId,
          post_id,
          services,
          PLATFORM.Twitter
        );

        if (!post) {
          throw new Error('post undefined');
        }
      }
    });

    it('aggregates labels for a reference', async () => {
      if (USE_REAL_TWITTER) {
        logger.warn(`Feed test disbaled with real twitter`);
        return;
      }
      const { postsManager } = services;

      const references = [
        'https://twitter.com/ItaiYanai/status/1780813867213336910',
        'https://twitter.com/DeSciMic/status/1765391765358436666',
        'https://twitter.com/Rainmaker1973/status/1788916168008368195',
        'https://gatherfor.medium.com/maslow-got-it-wrong-ae45d6217a8c',
        'https://twitter.com/andrea_is_a/status/1679471381929402369/photo/1',
        '',
      ];
      const aggregatedLabels =
        await postsManager.processing.posts.getAggregatedRefLabels(references);
      expect(aggregatedLabels).to.not.be.undefined;
    });
  });
});
