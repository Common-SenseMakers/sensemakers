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
import { USE_REAL_PARSER, USE_REAL_TWITTER, testUsers } from './setup';
import { getTestServices } from './test.services';

const feedThreads = [[''], [''], [''], [''], ['']];

describe('070 test feed', () => {
  const services = getTestServices({
    time: 'mock',
    twitter: USE_REAL_TWITTER
      ? undefined
      : { publish: true, signup: true, fetch: true, get: true },
    parser: USE_REAL_PARSER ? 'real' : 'mock',
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
        logger.warn(`Feed test disbaled with real twitter`);
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

    it('returns a feed', async () => {
      if (USE_REAL_TWITTER) {
        logger.warn(`Feed test disbaled with real twitter`);
        return;
      }
      const { feed } = services;
      const result1 = await feed.getFeed({
        fetchParams: { expectedAmount: 10 },
        semantics: {
          labels: [
            { label: 'https://sense-nets.xyz/announcesResource', uri: '' },
            { label: 'http://purl.org/spar/cito/discusses', uri: '' },
          ],
        },
      });
      expect(result1).to.have.length(3);

      const result2 = await feed.getFeed({
        fetchParams: { expectedAmount: 10 },
        semantics: {
          labels: [
            { label: 'https://sense-nets.xyz/asksQuestionAbout', uri: '' },
            {
              label: 'http://purl.org/spar/cito/includesQuotationFrom',
              uri: '',
            },
          ],
        },
      });
      expect(result2).to.have.length(2);

      const result3 = await feed.getFeed({
        fetchParams: { expectedAmount: 10 },
        semantics: { labels: [] },
      });
      expect(result3).to.have.length(5);
    });
  });
});
