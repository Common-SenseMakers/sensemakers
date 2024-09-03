import { expect } from 'chai';

import { AppPostParsingStatus } from '../../src/@shared/types/types.posts';
import { AppUser, PLATFORM } from '../../src/@shared/types/types.user';
import { USE_REAL_EMAIL } from '../../src/config/config.runtime';
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
  USE_REAL_NANOPUB,
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
  testUsers,
} from './setup';
import { getTestServices } from './test.services';

describe('031 test parse', () => {
  const services = getTestServices({
    time: 'mock',
    twitter: USE_REAL_TWITTER
      ? undefined
      : { publish: true, signup: true, fetch: true, get: true },
    nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
    parser: USE_REAL_PARSER ? 'real' : 'mock',
    emailSender: USE_REAL_EMAIL ? 'spy' : 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
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

    it('gets a post (thread) from twitter and parses it', async () => {
      const { postsManager } = services;

      const post_id = process.env.TEST_THREAD_ID || '0';

      if (!post_id) {
        throw new Error('TEST_THREAD_ID not defined in .env.test file');
      }

      if (!user) {
        throw new Error('user not created');
      }

      const post = await fetchPostInTests(user.userId, post_id, services);

      if (!post) {
        throw new Error('post undefined');
      }

      const parsedPost = await postsManager.getPost(post.id, true);
      expect(parsedPost).to.not.be.undefined;
      expect(parsedPost.parsingStatus).to.equal(AppPostParsingStatus.IDLE);
      expect(parsedPost.semantics).to.not.be.undefined;

      if (process.env.TEST_THREAD_ID) {
        logger.debug('parsedPost', JSON.stringify(parsedPost, null, 2));
      }
    });
  });
});
