import { expect } from 'chai';

import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { AppPostParsingStatus } from '../../src/@shared/types/types.posts';
import { AppUser } from '../../src/@shared/types/types.user';
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
  USE_REAL_BLUESKY,
  USE_REAL_MASTODON,
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
    bluesky: USE_REAL_BLUESKY
      ? undefined
      : { publish: true, signup: true, fetch: true, get: true },
    mastodon: USE_REAL_MASTODON
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
    let twitterUser: AppUser | undefined;
    let mastodonUser: AppUser | undefined;
    let blueskyUser: AppUser | undefined;

    before(async () => {
      const users = await services.db.run((manager) => {
        return createUsers(services, testUsers, manager);
      });
      twitterUser = users.find(
        (u) => UsersHelper.getAccount(u, PLATFORM.Twitter) !== undefined
      );
      mastodonUser = users.find(
        (u) => UsersHelper.getAccount(u, PLATFORM.Mastodon) !== undefined
      );
      blueskyUser = users.find(
        (u) => UsersHelper.getAccount(u, PLATFORM.Bluesky) !== undefined
      );
    });

    it('gets a post (thread) from twitter and parses it', async () => {
      const { postsManager } = services;

      const post_id = process.env.TEST_THREAD_ID || '0';

      if (!post_id) {
        throw new Error('TEST_THREAD_ID not defined in .env.test file');
      }

      if (!twitterUser) {
        throw new Error('Twitter user not created');
      }

      const post = await fetchPostInTests(
        twitterUser.userId,
        post_id,
        services,
        PLATFORM.Twitter
      );

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

    it('gets a post from mastodon and parses it', async () => {
      const { postsManager } = services;

      const post_id = '113091870835600081'; //https://cosocial.ca/@weswalla/113091870835600081

      if (!post_id) {
        throw new Error('TEST_MASTODON_POST_ID not defined in .env.test file');
      }

      if (!mastodonUser) {
        throw new Error('Mastodon user not created');
      }

      const post = await fetchPostInTests(
        mastodonUser.userId,
        post_id,
        services,
        PLATFORM.Mastodon
      );

      if (!post) {
        throw new Error('post undefined');
      }

      const parsedPost = await postsManager.getPost(post.id, true);
      expect(parsedPost).to.not.be.undefined;
      expect(parsedPost.parsingStatus).to.equal(AppPostParsingStatus.IDLE);
      expect(parsedPost.semantics).to.not.be.undefined;

      if (process.env.TEST_MASTODON_POST_ID) {
        console.log('parsedPost', JSON.stringify(parsedPost, null, 2));
      }
    });

    it('gets a post from bluesky and parses it', async () => {
      const { postsManager } = services;

      const post_id =
        'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z';

      if (!post_id) {
        throw new Error('TEST_BLUESKY_POST_ID not defined');
      }

      if (!blueskyUser) {
        throw new Error('Bluesky user not created');
      }

      const post = await fetchPostInTests(
        blueskyUser.userId,
        post_id,
        services,
        PLATFORM.Bluesky
      );

      if (!post) {
        throw new Error('post undefined');
      }

      const parsedPost = await postsManager.getPost(post.id, true);
      expect(parsedPost).to.not.be.undefined;
      expect(parsedPost.parsingStatus).to.equal(AppPostParsingStatus.IDLE);
      expect(parsedPost.semantics).to.not.be.undefined;
    });
  });
});
