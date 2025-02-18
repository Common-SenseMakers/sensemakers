import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { PostsQueryDefined } from '../../src/@shared/types/types.posts';
import { AppUser } from '../../src/@shared/types/types.user';
import { normalizeUrl } from '../../src/@shared/utils/links.utils';
import { SCIENCE_TOPIC_URI } from '../../src/@shared/utils/semantics.helper';
import { logger } from '../../src/instances/logger';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { fetchPostInTests } from '../utils/posts.utils';
import { createProfiles, createUsers } from '../utils/users.utils';
import {
  _01_createAndFetchUsers,
  _02_publishTweet,
  _03_fetchAfterPublish,
} from './reusable/create-post-fetch';
import {
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
  testProfiles,
  testUsers,
} from './setup';
import { getTestServices } from './test.services';

const feedThreads = [
  [''],
  [''],
  [''],
  [''],
  [''],
  [''],
  [''],
  [''],
  [''],
  [''],
];

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
      const { users } = await services.db.run(async (manager) => {
        const createdUsers = await createUsers(services, testUsers, manager);
        const profiles = await createProfiles(services, testProfiles, manager);

        return { users: createdUsers, profiles };
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

    it('returns a feed', async () => {
      if (USE_REAL_TWITTER) {
        logger.warn(`Feed test disbaled with real twitter`);
        return;
      }
      const { feed } = services;
      // all tab
      const query1: PostsQueryDefined = {
        fetchParams: { expectedAmount: 10 },
        semantics: {
          tab: 1,
        },
      };
      const result1 = await feed.getFeed(query1);
      expect(result1).to.have.length(10);

      // recommendations tab
      const query2: PostsQueryDefined = {
        fetchParams: { expectedAmount: 10 },
        semantics: {
          tab: 2,
        },
      };
      const result2 = await feed.getFeed(query2);
      expect(result2).to.have.length(3);

      const query3: PostsQueryDefined = {
        fetchParams: { expectedAmount: 10 },
        semantics: {
          tab: 3,
        },
      };
      const result3 = await feed.getFeed(query3);
      expect(result3).to.have.length(2);

      const query4: PostsQueryDefined = {
        fetchParams: { expectedAmount: 10 },
        semantics: {
          tab: 4,
        },
      };
      const result4 = await feed.getFeed(query4);
      expect(result4).to.have.length(0);

      const query5: PostsQueryDefined = {
        fetchParams: { expectedAmount: 10 },
        semantics: {
          tab: 5,
        },
      };
      const result5 = await feed.getFeed(query5);
      expect(result5).to.have.length(8);

      /** check aggregatred labels */
      const query5a: PostsQueryDefined = {
        fetchParams: { expectedAmount: 10 },
        semantics: {
          tab: 5,
        },
        hydrateConfig: { addAggregatedLabels: true },
      };
      const result5a = await feed.getFeed(query5a);

      result5a.forEach((post) => {
        expect(post.meta?.references).to.not.be.undefined;
        post.meta &&
          expect(Object.keys(post.meta.references)).to.have.length.greaterThan(
            0
          );
      });
    });

    it('returns a cluster feed', async () => {
      if (USE_REAL_TWITTER) {
        logger.warn(`Feed test disbaled with real twitter`);
        return;
      }
      const { feed } = services;
      // all tab
      const query1: PostsQueryDefined = {
        fetchParams: { expectedAmount: 10 },
        semantics: {
          tab: 1,
        },
        clusterId: 'test-cluster-01',
      };
      const result1 = await feed.getFeed(query1);
      expect(result1).to.have.length(7);

      const query2: PostsQueryDefined = {
        fetchParams: { expectedAmount: 10 },
        semantics: {
          tab: 1,
        },
        clusterId: 'test-cluster-02',
      };
      const result2 = await feed.getFeed(query2);
      expect(result2).to.have.length(5);
    });

    describe('reference page feed', () => {
      const TEST_REF = normalizeUrl(
        'https://twitter.com/ItaiYanai/status/1780813867213336910'
      );

      it('returns unfiltered reference page feed', async () => {
        if (USE_REAL_TWITTER) {
          logger.warn(`Feed test disbaled with real twitter`);
          return;
        }
        const { feed } = services;
        const query: PostsQueryDefined = {
          fetchParams: { expectedAmount: 10 },
          semantics: {
            ref: TEST_REF,
            topic: SCIENCE_TOPIC_URI,
          },
          hydrateConfig: { addAggregatedLabels: false },
        };
        const result = await feed.getFeed(query);
        expect(result).to.have.length(5);
      });

      it('returns reference page feed filtered by labels', async () => {
        if (USE_REAL_TWITTER) {
          logger.warn(`Feed test disbaled with real twitter`);
          return;
        }
        const { feed } = services;
        const query: PostsQueryDefined = {
          fetchParams: { expectedAmount: 10 },
          semantics: {
            ref: TEST_REF,
            tab: 3,
          },
          hydrateConfig: { addAggregatedLabels: false },
        };
        const result = await feed.getFeed(query);
        expect(result).to.have.length(2);
      });

      it('returns reference page feed filtered by keywords', async () => {
        if (USE_REAL_TWITTER) {
          logger.warn(`Feed test disabled with real twitter`);
          return;
        }
        const { feed } = services;
        const query: PostsQueryDefined = {
          fetchParams: { expectedAmount: 10 },
          semantics: {
            ref: TEST_REF,
            keyword: 'AI',
            topic: SCIENCE_TOPIC_URI,
          },
          hydrateConfig: { addAggregatedLabels: false },
        };
        const result = await feed.getFeed(query);
        expect(result).to.have.length(5);
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
        const query: PostsQueryDefined = {
          fetchParams: { expectedAmount: 10 },
          semantics: {
            keyword: TEST_KEYWORD,
            topic: SCIENCE_TOPIC_URI,
          },
          hydrateConfig: { addAggregatedLabels: false },
        };
        const result = await feed.getFeed(query);
        expect(result).to.have.length(5);
      });

      it('returns keyword page feed filtered by tab', async () => {
        if (USE_REAL_TWITTER) {
          logger.warn(`Feed test disabled with real twitter`);
          return;
        }
        const { feed } = services;
        const query: PostsQueryDefined = {
          fetchParams: { expectedAmount: 10 },
          semantics: {
            keyword: TEST_KEYWORD,
            tab: 3,
          },
          hydrateConfig: { addAggregatedLabels: false },
        };
        const result = await feed.getFeed(query);
        expect(result).to.have.length(2);
      });

      it('returns keyword page feed filtered by references', async () => {
        if (USE_REAL_TWITTER) {
          logger.warn(`Feed test disabled with real twitter`);
          return;
        }
        const { feed } = services;
        const query: PostsQueryDefined = {
          fetchParams: { expectedAmount: 10 },
          semantics: {
            keyword: TEST_KEYWORD,
            ref: 'https://x.com/ItaiYanai/status/1780813867213336910',
            topic: SCIENCE_TOPIC_URI,
          },
          hydrateConfig: { addAggregatedLabels: false },
        };
        const result = await feed.getFeed(query);
        expect(result).to.have.length(5);
      });
    });
  });
});
