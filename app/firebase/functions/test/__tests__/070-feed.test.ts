import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { AppUser } from '../../src/@shared/types/types.user';
import { logger } from '../../src/instances/logger';
import { doesQueryUseSubcollection } from '../../src/posts/posts.helper';
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

describe.only('070 test feed', () => {
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
      const query1 = {
        fetchParams: { expectedAmount: 10 },
        semantics: {
          labels: [
            'https://sense-nets.xyz/announcesResource',
            'http://purl.org/spar/cito/discusses',
          ],
        },
      };
      const result1 = await feed.getFeed(query1);
      expect(result1).to.have.length(3);
      expect(doesQueryUseSubcollection(query1).useLinksSubcollection).to.be.false;

      const query2 = {
        fetchParams: { expectedAmount: 10 },
        semantics: {
          labels: [
            'https://sense-nets.xyz/asksQuestionAbout',
            'http://purl.org/spar/cito/includesQuotationFrom',
          ],
        },
      };
      const result2 = await feed.getFeed(query2);
      expect(result2).to.have.length(2);
      expect(doesQueryUseSubcollection(query2).useLinksSubcollection).to.be.false;

      const query3 = {
        fetchParams: { expectedAmount: 10 },
        semantics: { labels: [] },
      };
      const result3 = await feed.getFeed(query3);
      expect(result3).to.have.length(5);
      expect(doesQueryUseSubcollection(query3).useLinksSubcollection).to.be.false;
    });
    it('returns a feed with aggregated reference labels', async () => {
      if (USE_REAL_TWITTER) {
        logger.warn(`Feed test disbaled with real twitter`);
        return;
      }
      const { feed } = services;
      const query1 = {
        fetchParams: { expectedAmount: 10 },
        semantics: {
          labels: [
            'https://sense-nets.xyz/announcesResource',
            'http://purl.org/spar/cito/discusses',
          ],
        },
        hydrateConfig: { addAggregatedLabels: true },
      };
      const result1 = await feed.getFeed(query1);
      expect(result1).to.have.length(3);
      expect(doesQueryUseSubcollection(query1).useLinksSubcollection).to.be.false;
      result1.forEach((post) => {
        expect(post.meta?.refLabels).to.not.be.undefined;
        post.meta &&
          expect(Object.keys(post.meta!.refLabels)).to.have.length.greaterThan(
            0
          );
      });

      const query2 = {
        fetchParams: { expectedAmount: 10 },
        semantics: {
          labels: [
            'https://sense-nets.xyz/asksQuestionAbout',
            'http://purl.org/spar/cito/includesQuotationFrom',
          ],
        },
        hydrateConfig: { addAggregatedLabels: true },
      };
      const result2 = await feed.getFeed(query2);
      expect(result2).to.have.length(2);
      expect(doesQueryUseSubcollection(query2).useLinksSubcollection).to.be.false;
      result2.forEach((post) => {
        expect(post.meta?.refLabels).to.not.be.undefined;
        post.meta &&
          expect(Object.keys(post.meta.refLabels)).to.have.length.greaterThan(
            0
          );
      });

      const query3 = {
        fetchParams: { expectedAmount: 10 },
        semantics: { labels: [] },
        hydrateConfig: { addAggregatedLabels: true },
      };
      const result3 = await feed.getFeed(query3);
      expect(result3).to.have.length(5);
      expect(doesQueryUseSubcollection(query3).useLinksSubcollection).to.be.false;
      result3.forEach((post) => {
        expect(post.meta?.refLabels).to.not.be.undefined;
        post.meta &&
          expect(Object.keys(post.meta.refLabels)).to.have.length.greaterThan(
            0
          );
      });
    });
    it('returns a reference page feed filtered by labels', async () => {
      if (USE_REAL_TWITTER) {
        logger.warn(`Feed test disbaled with real twitter`);
        return;
      }
      const { feed } = services;
      const query1 = {
        fetchParams: { expectedAmount: 10 },
        semantics: {
          refs: ['https://twitter.com/ItaiYanai/status/1780813867213336910'],
        },
        hydrateConfig: { addAggregatedLabels: false },
      };
      const result1 = await feed.getFeed(query1);
      expect(result1).to.have.length(2);
      expect(doesQueryUseSubcollection(query1).useLinksSubcollection).to.be
        .true;

      const query2 = {
        fetchParams: { expectedAmount: 10 },
        semantics: {
          refs: ['https://twitter.com/ItaiYanai/status/1780813867213336910'],
          labels: [
            'http://purl.org/spar/cito/discusses',
            'https://sense-nets.xyz/includesQuotationFrom',
          ],
          hydrateConfig: { addAggregatedLabels: false },
        },
      };
      const result2 = await feed.getFeed(query2);
      expect(result2).to.have.length(2);
      expect(doesQueryUseSubcollection(query2).useLinksSubcollection).to.be
        .true;

      const query3 = {
        fetchParams: { expectedAmount: 10 },
        semantics: {
          refs: ['https://twitter.com/ItaiYanai/status/1780813867213336910'],
          labels: ['http://purl.org/spar/cito/discusses'],
        },
        hydrateConfig: { addAggregatedLabels: false },
      };
      const result3 = await feed.getFeed(query3);
      expect(result3).to.have.length(1);
      expect(doesQueryUseSubcollection(query3).useLinksSubcollection).to.be
        .true;
    });
  });
});
