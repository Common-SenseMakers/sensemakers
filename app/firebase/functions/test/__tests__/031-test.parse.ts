import { expect } from 'chai';

import { AppPostParsingStatus } from '../../src/@shared/types/types.posts';
import { AppUser, PLATFORM } from '../../src/@shared/types/types.user';
import { USE_REAL_EMAIL } from '../../src/config/config.runtime';
import { logger } from '../../src/instances/logger';
import { resetDB } from '../utils/db';
import {
  _01_createAndFetchUsers,
  _02_publishTweet,
  _03_fetchAfterPublish,
} from './reusable/create-post-fetch';
import { USE_REAL_NANOPUB, USE_REAL_PARSER, USE_REAL_TWITTER } from './setup';
import { testCredentials } from './test.accounts';
import { getTestServices } from './test.services';

const DEBUG_PREFIX = `030-process`;
const DEBUG = false;

describe.only('031 test parse', () => {
  const services = getTestServices({
    time: 'mock',
    twitter: USE_REAL_TWITTER ? 'real' : 'mock-publish',
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
      const platformAuthorId = process.env.TEST_THREAD_AUTHOR_ID;

      if (!platformAuthorId) {
        throw new Error('TEST_THREAD_AUTHOR_ID not defined in .env.test file');
      }

      const testUser = testCredentials[1];
      user = await _01_createAndFetchUsers(services, testUser.twitter.id, {
        DEBUG,
        DEBUG_PREFIX,
      });
    });

    it('gets a post (thread) from twitter and parses it', async () => {
      if (!user) {
        throw new Error('user not created');
      }
      const { postsManager, db } = services;

      const platformPostId = process.env.TEST_THREAD_ID;

      if (!platformPostId) {
        throw new Error('TEST_THREAD_ID not defined in .env.test file');
      }

      const { post } = await db.run((manager) =>
        postsManager.fetchPostFromPlatform(
          user!.userId,
          PLATFORM.Twitter,
          platformPostId,
          manager
        )
      );

      await postsManager.parsePost(post.id);
      const parsedPost = await postsManager.getPost(post.id, true);
      expect(parsedPost).to.not.be.undefined;
      expect(parsedPost.parsingStatus).to.equal(AppPostParsingStatus.IDLE);
      expect(parsedPost.semantics).to.not.be.undefined;
    });
  });
});
