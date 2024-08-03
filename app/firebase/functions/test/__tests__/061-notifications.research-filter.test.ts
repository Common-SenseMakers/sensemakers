import { expect } from 'chai';

import { AppPostParsingStatus } from '../../src/@shared/types/types.posts';
import { AppUser, PLATFORM } from '../../src/@shared/types/types.user';
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
import { testUsers } from './setup';
import { getTestServices } from './test.services';

describe.skip('061 notifications - research filter', () => {
  const services = getTestServices({
    time: 'mock',
    twitter: { get: true },
    nanopub: 'mock-publish',
    parser: 'mock',
    emailSender: 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();
  });

  describe('get and process', () => {
    let user: AppUser | undefined;

    before(async () => {
      const platformAuthorId = process.env.TEST_THREAD_AUTHOR_ID;

      if (!platformAuthorId) {
        throw new Error('TEST_THREAD_AUTHOR_ID not defined in .env.test file');
      }

      const users = await services.db.run((manager) => {
        return createUsers(services, testUsers, manager);
      });
      user = users.find(
        (u) =>
          UsersHelper.getAccount(u, PLATFORM.Twitter, platformAuthorId) !==
          undefined
      );
    });

    it('gets a post (thread) from twitter and parses it', async () => {
      const { postsManager } = services;

      const post_id = process.env.TEST_THREAD_ID;

      if (!post_id) {
        throw new Error('TEST_THREAD_ID not defined in .env.test file');
      }

      if (!user) {
        throw new Error('user not created');
      }

      const post = await fetchPostInTests(user.userId, post_id, services);

      const parsedPost = await postsManager.getPost(post.id, true);
      expect(parsedPost).to.not.be.undefined;
      expect(parsedPost.parsingStatus).to.equal(AppPostParsingStatus.IDLE);
      expect(parsedPost.semantics).to.not.be.undefined;
    });
  });
});
