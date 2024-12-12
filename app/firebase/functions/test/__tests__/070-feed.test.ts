import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { AppUser } from '../../src/@shared/types/types.user';
import { SCIENCE_TOPIC_URI } from '../../src/@shared/utils/semantics.helper';
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
      expect(doesQueryUseSubcollection(query1).useLinksSubcollection).to.be
        .false;

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
      expect(doesQueryUseSubcollection(query2).useLinksSubcollection).to.be
        .false;

      const query3 = {
        fetchParams: { expectedAmount: 10 },
        semantics: { labels: [] },
      };
      const result3 = await feed.getFeed(query3);
      expect(result3).to.have.length(5);
      expect(doesQueryUseSubcollection(query3).useLinksSubcollection).to.be
        .false;
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
      expect(doesQueryUseSubcollection(query1).useLinksSubcollection).to.be
        .false;
      result1.forEach((post) => {
        expect(post.meta?.references).to.not.be.undefined;
        post.meta &&
          expect(Object.keys(post.meta.references)).to.have.length.greaterThan(
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
      expect(doesQueryUseSubcollection(query2).useLinksSubcollection).to.be
        .false;
      result2.forEach((post) => {
        expect(post.meta?.references).to.not.be.undefined;
        post.meta &&
          expect(Object.keys(post.meta.references)).to.have.length.greaterThan(
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
      expect(doesQueryUseSubcollection(query3).useLinksSubcollection).to.be
        .false;
      result3.forEach((post) => {
        expect(post.meta?.references).to.not.be.undefined;
        post.meta &&
          expect(Object.keys(post.meta.references)).to.have.length.greaterThan(
            0
          );
      });
    });
    describe('reference page feed', () => {
      const TEST_REF =
        'https://twitter.com/ItaiYanai/status/1780813867213336910';

      it('returns unfiltered reference page feed', async () => {
        if (USE_REAL_TWITTER) {
          logger.warn(`Feed test disbaled with real twitter`);
          return;
        }
        const { feed } = services;
        const query = {
          fetchParams: { expectedAmount: 10 },
          semantics: {
            refs: [TEST_REF],
            topic: SCIENCE_TOPIC_URI,
          },
          hydrateConfig: { addAggregatedLabels: false },
        };
        const result = await feed.getFeed(query);
        expect(result).to.have.length(1);
        expect(doesQueryUseSubcollection(query).useLinksSubcollection).to.be
          .true;
      });

      it('returns reference page feed filtered by labels', async () => {
        if (USE_REAL_TWITTER) {
          logger.warn(`Feed test disbaled with real twitter`);
          return;
        }
        const { feed } = services;
        const query = {
          fetchParams: { expectedAmount: 10 },
          semantics: {
            refs: [TEST_REF],
            labels: [
              'http://purl.org/spar/cito/discusses',
              'http://sense-nets.xyz/includesQuotationFrom',
            ],
          },
          hydrateConfig: { addAggregatedLabels: false },
        };
        const result = await feed.getFeed(query);
        expect(result).to.have.length(1);
        expect(doesQueryUseSubcollection(query).useLinksSubcollection).to.be
          .true;
      });

      it('returns reference page feed filtered by keywords', async () => {
        if (USE_REAL_TWITTER) {
          logger.warn(`Feed test disabled with real twitter`);
          return;
        }
        const { feed } = services;
        const query = {
          fetchParams: { expectedAmount: 10 },
          semantics: {
            refs: [TEST_REF],
            keywords: ['AI'],
            topic: SCIENCE_TOPIC_URI,
          },
          hydrateConfig: { addAggregatedLabels: false },
        };
        const result = await feed.getFeed(query);
        expect(result).to.have.length(1); // there are 2 posts with this tag and reference, but one of them is marked as not science
        expect(doesQueryUseSubcollection(query).useLinksSubcollection).to.be
          .true;
      });
    });

    describe('keyword page feed', () => {
      const TEST_KEYWORD = 'AI';

      it('returns unfiltered keyword page feed', async () => {
        if (USE_REAL_TWITTER) {
          logger.warn(`Feed test disabled with real twitter`);
          return;
        }
        const { feed } = services;
        const query = {
          fetchParams: { expectedAmount: 10 },
          semantics: {
            keywords: [TEST_KEYWORD],
            topic: SCIENCE_TOPIC_URI,
          },
          hydrateConfig: { addAggregatedLabels: false },
        };
        const result = await feed.getFeed(query);
        expect(result).to.have.length(1);
        expect(doesQueryUseSubcollection(query).useKeywordsSubcollection).to.be
          .true;
      });

      it('returns keyword page feed filtered by labels', async () => {
        if (USE_REAL_TWITTER) {
          logger.warn(`Feed test disabled with real twitter`);
          return;
        }
        const { feed } = services;
        const query = {
          fetchParams: { expectedAmount: 10 },
          semantics: {
            keywords: [TEST_KEYWORD],
            labels: ['http://purl.org/spar/cito/discusses'],
          },
          hydrateConfig: { addAggregatedLabels: false },
        };
        const result = await feed.getFeed(query);
        expect(result).to.have.length(1);
        expect(doesQueryUseSubcollection(query).useKeywordsSubcollection).to.be
          .true;
      });

      it('returns keyword page feed filtered by references', async () => {
        if (USE_REAL_TWITTER) {
          logger.warn(`Feed test disabled with real twitter`);
          return;
        }
        const { feed } = services;
        const query = {
          fetchParams: { expectedAmount: 10 },
          semantics: {
            keywords: [TEST_KEYWORD],
            refs: ['https://x.com/ItaiYanai/status/1780813867213336910'],
            topic: SCIENCE_TOPIC_URI,
          },
          hydrateConfig: { addAggregatedLabels: false },
        };
        const result = await feed.getFeed(query);
        expect(result).to.have.length(1);
        expect(doesQueryUseSubcollection(query).useKeywordsSubcollection).to.be
          .false; // in this case it would use the reference subcollection
      });
    });
  });
});
