import AtpAgent from '@atproto/api';
import { expect } from 'chai';

import {
  BlueskyThread,
  BlueskyUserDetails,
} from '../../src/@shared/types/types.bluesky';
import {
  FetchParams,
  PlatformFetchParams,
} from '../../src/@shared/types/types.fetch';
import { RSAKeys } from '../../src/@shared/types/types.nanopubs';
import { PlatformPostCreate } from '../../src/@shared/types/types.platform.posts';
import { AppTweet, TwitterThread } from '../../src/@shared/types/types.twitter';
import { AppUser, PLATFORM } from '../../src/@shared/types/types.user';
import { signNanopublication } from '../../src/@shared/utils/nanopub.sign.util';
import { getRSAKeys } from '../../src/@shared/utils/rsa.keys';
import { USE_REAL_EMAIL } from '../../src/config/config.runtime';
import { logger } from '../../src/instances/logger';
import { BlueskyService } from '../../src/platforms/bluesky/bluesky.service';
import { MastodonService } from '../../src/platforms/mastodon/mastodon.service';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { convertToAppTweets } from '../../src/platforms/twitter/twitter.utils';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { getMockPost } from '../utils/posts.utils';
import { createUsers } from '../utils/users.utils';
import {
  USE_REAL_BLUESKY,
  USE_REAL_MASTODON,
  USE_REAL_NANOPUB,
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
  testUsers,
} from './setup';
import { testCredentials } from './test.accounts';
import { getTestServices } from './test.services';

describe('02-platforms', () => {
  let rsaKeys: RSAKeys | undefined;
  let user: AppUser | undefined;

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

    rsaKeys = getRSAKeys('');

    await services.db.run(async (manager) => {
      const users = await createUsers(
        services,
        Array.from(testUsers.values()),
        manager
      );
      const testUser = testCredentials[0];

      user = users.find(
        (u) =>
          UsersHelper.getAccount(u, PLATFORM.Twitter, testUser.twitter.id) !==
            undefined &&
          UsersHelper.getAccount(u, PLATFORM.Mastodon, testUser.mastodon.id) !==
            undefined &&
          UsersHelper.getAccount(u, PLATFORM.Bluesky, testUser.bluesky.id) !==
            undefined
      );
    });
  });

  // TODO, fix this test
  describe('twitter', () => {
    it('fetch the latest 5 threads', async () => {
      if (!user) {
        throw new Error('appUser not created');
      }
      const allUserDetails = user.accounts[PLATFORM.Twitter];
      if (!allUserDetails || allUserDetails.length < 0) {
        throw new Error('Unexpected');
      }
      const twitterService = services.platforms.get(PLATFORM.Twitter);
      const userDetails = allUserDetails[0];
      if (userDetails.read === undefined) {
        throw new Error('Unexpected');
      }

      const twitter = user.accounts[PLATFORM.Twitter];

      if (!twitter) {
        throw new Error('User does not have Twitter credentials');
      }

      const fetchParams: FetchParams = {
        expectedAmount: 5,
      };

      const threads = await services.db.run((manager) =>
        twitterService.fetch(fetchParams, userDetails, manager)
      );

      expect(threads).to.not.be.undefined;
      expect(threads.platformPosts.length).to.be.greaterThanOrEqual(1);
    });

    it.only('gets account by username', async () => {
      const twitterService = services.platforms.get(
        PLATFORM.Twitter
      ) as TwitterService;
      const username = 'wesleyfinck';
      const bearerToken = process.env.TWITTER_BEARER_TOKEN;
      if (!bearerToken) {
        throw new Error('Missing TWITTER_BEARER_TOKEN');
      }

      const result = await twitterService.getAccountByUsername(
        username,
        bearerToken
      );

      expect(result).to.not.be.null;
      if (result) {
        expect(result.id).to.be.a('string');
        expect(result.username).to.equal(username);
        expect(result.name).to.be.a('string');
        expect(result.profile_image_url).to.be.a('string');
      }
    });
    it('gets account by username', async () => {
      const twitterService = services.platforms.get(
        PLATFORM.Twitter
      ) as TwitterService;
      const username = 'wesleyfinck';
      const bearerToken = process.env.TWITTER_BEARER_TOKEN;
      if (!bearerToken) {
        throw new Error('Missing TWITTER_BEARER_TOKEN');
      }

      const result = await twitterService.getAccountByUsername(
        username,
        bearerToken
      );

      expect(result).to.not.be.null;
      if (result) {
        expect(result.id).to.be.a('string');
        expect(result.username).to.equal(username);
        expect(result.name).to.be.a('string');
        expect(result.profile_image_url).to.be.a('string');
      }
    });
  });

  describe('nanopub', () => {
    it('creates a draft nanopub, sign and publish', async () => {
      if (!user) {
        throw new Error('appUser not created');
      }

      try {
        const post = getMockPost({ authorId: user.userId, id: 'post-id-1' });

        const nanopubService = services.platforms.get(PLATFORM.Nanopub);

        const nanopub = await nanopubService.convertFromGeneric({
          post,
          author: user,
        });

        if (!nanopub) {
          throw new Error('Post not created');
        }

        if (!rsaKeys) {
          throw new Error('RSA keys not created');
        }

        const signed = await signNanopublication(
          nanopub.unsignedPost,
          rsaKeys,
          ''
        );
        expect(signed).to.not.be.undefined;

        const published = await services.db.run((manager) =>
          nanopubService.publish(
            {
              draft: signed.rdf(),
              userDetails: {
                signupDate: 0,
                user_id: '123456',
              },
            },
            manager
          )
        );
        expect(published).to.not.be.undefined;
      } catch (error) {
        console.error('error: ', error);
        throw error;
      }
    });
  });

  describe('mastodon', () => {
    it('fetches the latest posts', async () => {
      if (!user) {
        throw new Error('appUser not created');
      }
      const allUserDetails = user.accounts[PLATFORM.Mastodon];
      if (!allUserDetails || allUserDetails.length < 0) {
        throw new Error('Unexpected');
      }
      const userDetails = allUserDetails[0];
      if (userDetails.read === undefined) {
        throw new Error('Unexpected');
      }

      const mastodonService = services.platforms.get(PLATFORM.Mastodon);
      const fetchParams: PlatformFetchParams = {
        expectedAmount: 3,
      };

      const result = await services.db.run((manager) =>
        mastodonService.fetch(fetchParams, userDetails, manager)
      );

      expect(result).to.not.be.undefined;
      expect(result.platformPosts.length).to.be.greaterThan(0);
    });
    it('fetches posts until a certain id', async () => {
      if (!user) {
        throw new Error('appUser not created');
      }
      const allUserDetails = user.accounts[PLATFORM.Mastodon];
      if (!allUserDetails || allUserDetails.length < 0) {
        throw new Error('Unexpected');
      }
      const userDetails = allUserDetails[0];
      if (userDetails.read === undefined) {
        throw new Error('Unexpected');
      }

      const mastodonService = services.platforms.get(PLATFORM.Mastodon);
      const fetchParams: PlatformFetchParams = {
        expectedAmount: 5,
        until_id: '112639305281497968',
      };

      const result = await services.db.run((manager) =>
        mastodonService.fetch(fetchParams, userDetails, manager)
      );

      if (USE_REAL_MASTODON) {
        expect(result).to.not.be.undefined;
        expect(result.platformPosts.length).to.be.greaterThan(0);
      }
    });

    it('gets account by username', async () => {
      // https://fediscience.org/@petergleick
      const username = 'petergleick';
      const server = 'fediscience.org';

      const accessToken = process.env.MASTODON_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error('Missing MASTODON_ACCESS_TOKEN');
      }

      const mastodonService = services.platforms.get(
        PLATFORM.Mastodon
      ) as MastodonService;

      const result = await mastodonService.getAccountByUsername(
        username,
        server,
        accessToken
      );

      expect(result).to.not.be.null;
      if (result) {
        expect(result.id).to.be.a('string');
        expect(result.username).to.equal(username);
        expect(result.displayName).to.be.a('string');
        expect(result.avatar).to.be.a('string');
        expect(result.mastodonServer).to.equal(server);
      }
    });
  });

  describe('bluesky', () => {
    let blueskyService: BlueskyService;
    let userDetails: BlueskyUserDetails;

    before(() => {
      if (!user) {
        throw new Error('appUser not created');
      }
      const allUserDetails = user.accounts[PLATFORM.Bluesky];
      if (!allUserDetails || allUserDetails.length < 0) {
        throw new Error('Unexpected');
      }
      userDetails = allUserDetails[0];
      if (userDetails.read === undefined) {
        throw new Error('Unexpected');
      }

      blueskyService = services.platforms.get(
        PLATFORM.Bluesky
      ) as BlueskyService;
    });

    it.only('gets account by username', async () => {
      const username = 'ronent.bsky.social';
      const agent = new AtpAgent({ service: 'https://bsky.social' });
      const blueskyUsername = process.env.BLUESKY_USERNAME;
      const blueskyAppPassword = process.env.BLUESKY_APP_PASSWORD;
      if (!blueskyUsername || !blueskyAppPassword) {
        throw new Error('Missing BLUESKY_USERNAME or BLUESKY_APP_PASSWORD');
      }

      await agent.login({
        identifier: blueskyUsername,
        password: blueskyAppPassword,
      });

      const result = await blueskyService.getAccountByUsername(username, agent);

      expect(result).to.not.be.null;
      if (result) {
        expect(result.id).to.be.a('string');
        expect(result.username).to.equal(username);
        expect(result.name).to.be.a('string');
        expect(result.avatar).to.be.a('string');
      }
    });

    (USE_REAL_BLUESKY ? it : it.skip)(
      'fetches the main thread of a post',
      async () => {
        const postId =
          'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdgnynfq2h';
        // https://bsky.app/profile/weswalla.bsky.social/post/3l4wdgnynfq2h

        const result = await services.db.run((manager) =>
          blueskyService.get(postId, userDetails, manager)
        );
        const expectedThreadIds = [
          'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd2aares2z',
          'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wd52krts24',
          'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdaif3va2h',
          'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdcb3w322z',
        ];

        expect(result).to.not.be.undefined;
        expect(result.post).to.be.an('object');
        expect(result.post.thread_id).to.equal(expectedThreadIds[0]);
        expect(result.post.posts).to.be.an('array');
        expect(result.post.posts.length).to.equal(4);

        expect(result.post.posts.map((post) => post.uri)).to.deep.equal(
          expectedThreadIds
        );

        // Check that all posts in the thread are from the same author
        const authorDid = result.post.author.did;
        result.post.posts.forEach((post) => {
          expect(post.author.did).to.equal(authorDid);
        });

        // Check that posts are in chronological order
        for (let i = 1; i < result.post.posts.length; i++) {
          const prevTimestamp = new Date(
            result.post.posts[i - 1].record.createdAt
          ).getTime();
          const currTimestamp = new Date(
            result.post.posts[i].record.createdAt
          ).getTime();
          expect(currTimestamp).to.be.at.least(prevTimestamp);
        }
      }
    );

    it('fetches the latest posts without since_id or until_id', async () => {
      const fetchParams: PlatformFetchParams = {
        expectedAmount: 10,
      };

      const result = await services.db.run((manager) =>
        blueskyService.fetch(fetchParams, userDetails, manager)
      );

      expect(result).to.not.be.undefined;
      expect(result.platformPosts.length).to.be.greaterThan(0);
    });
  });
});
