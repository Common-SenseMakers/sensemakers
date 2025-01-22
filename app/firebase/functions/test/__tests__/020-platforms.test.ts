import AtpAgent from '@atproto/api';
import { expect } from 'chai';

import {
  BlueskyAccountDetails,
  BlueskyThread,
} from '../../src/@shared/types/types.bluesky';
import {
  FetchParams,
  PlatformFetchParams,
} from '../../src/@shared/types/types.fetch';
import {
  MastodonAccountDetails,
  MastodonThread,
} from '../../src/@shared/types/types.mastodon';
import { PlatformPostCreate } from '../../src/@shared/types/types.platform.posts';
import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { AppUser } from '../../src/@shared/types/types.user';
import {
  parseMastodonGlobalUsername,
  parseMastodonPostURI,
} from '../../src/@shared/utils/mastodon.utils';
import { getProfileId } from '../../src/@shared/utils/profiles.utils';
import { logger } from '../../src/instances/logger';
import { BlueskyService } from '../../src/platforms/bluesky/bluesky.service';
import { MastodonService } from '../../src/platforms/mastodon/mastodon.service';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../utils/db';
import { createUsers } from '../utils/users.utils';
import {
  USE_REAL_BLUESKY,
  USE_REAL_MASTODON,
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
  testUsers,
} from './setup';
import { testCredentials } from './test.accounts';
import { getTestServices } from './test.services';

describe('02-platforms', () => {
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
    parser: USE_REAL_PARSER ? 'real' : 'mock',
  });

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();

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
      if (userDetails.credentials.read === undefined) {
        throw new Error('Unexpected');
      }

      const twitter = user.accounts[PLATFORM.Twitter];

      if (!twitter) {
        throw new Error('User does not have Twitter credentials');
      }

      const fetchParams: FetchParams = {
        expectedAmount: 5,
      };

      const threads = await twitterService.fetch(
        userDetails.user_id,
        fetchParams,
        userDetails.credentials
      );

      expect(threads).to.not.be.undefined;
      expect(threads.platformPosts.length).to.be.greaterThanOrEqual(1);
    });

    it.skip('gets account by username', async () => {
      const twitterService = services.platforms.get(
        PLATFORM.Twitter
      ) as TwitterService;
      const username = 'wesleyfinck';
      const bearerToken = process.env.TWITTER_BEARER_TOKEN;
      if (!bearerToken) {
        throw new Error('Missing TWITTER_BEARER_TOKEN');
      }

      const result = (await twitterService.getProfileByUsername(username))
        ?.profile;

      expect(result).to.not.be.null;
      if (result) {
        expect(result.id).to.be.a('string');
        expect(result.username).to.equal(username);
        expect(result.displayName).to.be.a('string');
        expect(result.avatar).to.be.a('string');
      }
    });
  });

  describe('mastodon', () => {
    let mastodonService: MastodonService;
    let userDetails: MastodonAccountDetails;

    before(() => {
      if (!user) {
        throw new Error('appUser not created');
      }
      const allUserDetails = user.accounts[PLATFORM.Mastodon];
      if (!allUserDetails || allUserDetails.length < 0) {
        throw new Error('Unexpected');
      }
      userDetails = allUserDetails[0];
      if (userDetails.credentials.read === undefined) {
        throw new Error('Unexpected');
      }

      mastodonService = services.platforms.get(
        PLATFORM.Mastodon
      ) as MastodonService;
    });

    it('fetches the latest posts', async () => {
      if (!user) {
        throw new Error('appUser not created');
      }
      const allUserDetails = user.accounts[PLATFORM.Mastodon];
      if (!allUserDetails || allUserDetails.length < 0) {
        throw new Error('Unexpected');
      }
      const userDetails = allUserDetails[0];
      if (userDetails.credentials.read === undefined) {
        throw new Error('Unexpected');
      }

      const mastodonService = services.platforms.get(PLATFORM.Mastodon);
      const fetchParams: PlatformFetchParams = {
        expectedAmount: 3,
      };

      const result = await services.db.run((manager) =>
        mastodonService.fetch(
          userDetails.user_id,
          fetchParams,
          userDetails.credentials
        )
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
      if (userDetails.credentials.read === undefined) {
        throw new Error('Unexpected');
      }

      const mastodonService = services.platforms.get(PLATFORM.Mastodon);
      const fetchParams: PlatformFetchParams = {
        expectedAmount: 5,
        until_id: `https://cosocial.ca/users/weswalla/statuses/112639305281497968`,
      };

      const result = await services.db.run((manager) =>
        mastodonService.fetch(
          userDetails.user_id,
          fetchParams,
          userDetails.credentials
        )
      );

      if (USE_REAL_MASTODON) {
        expect(result).to.not.be.undefined;
        expect(result.platformPosts.length).to.be.greaterThan(0);
      }
    });
    it('it can use repost post ids in fetch params', async () => {
      if (!user) {
        throw new Error('appUser not created');
      }
      const allUserDetails = user.accounts[PLATFORM.Mastodon];
      if (!allUserDetails || allUserDetails.length < 0) {
        throw new Error('Unexpected');
      }
      const userDetails = allUserDetails[0];
      if (userDetails.credentials.read === undefined) {
        throw new Error('Unexpected');
      }

      const mastodonService = services.platforms.get(PLATFORM.Mastodon);
      const fetchParams: PlatformFetchParams = {
        expectedAmount: 5,
        until_id:
          'https://cosocial.ca/users/weswalla/statuses/113801618847445543/activity',
      };

      const result = await mastodonService.fetch(
        userDetails.user_id,
        fetchParams,
        userDetails.credentials
      );

      if (USE_REAL_MASTODON) {
        expect(result).to.not.be.undefined;
        expect(result.platformPosts.length).to.be.greaterThan(0);
        result.platformPosts.forEach((post) => {
          expect(
            BigInt('113801618847445543') -
              BigInt(parseMastodonPostURI(post.post_id).postId) >
              0
          ).to.be.true;
        });
      }

      const fetchParams2: PlatformFetchParams = {
        expectedAmount: 5,
        since_id:
          'https://cosocial.ca/users/weswalla/statuses/113430780810995021/activity',
      };

      const result2 = await mastodonService.fetch(
        userDetails.user_id,
        fetchParams2,
        userDetails.credentials
      );

      if (USE_REAL_MASTODON) {
        expect(result2).to.not.be.undefined;
        expect(result2.platformPosts.length).to.be.greaterThan(0);
        result2.platformPosts.forEach((post) => {
          const postId = parseMastodonPostURI(post.post_id).postId;
          expect(BigInt('113430780810995021') - BigInt(postId) < 0).to.be.true;
        });
      }
    });

    it('gets account by username', async () => {
      // https://fediscience.org/@petergleick
      const username = 'petergleick@fediscience.org';

      const accessToken = process.env.MASTODON_ACCESS_TOKEN;
      if (!accessToken) {
        throw new Error('Missing MASTODON_ACCESS_TOKEN');
      }

      const mastodonService = services.platforms.get(
        PLATFORM.Mastodon
      ) as MastodonService;

      const result = (
        await mastodonService.getProfileByUsername(username, {
          accessToken,
          server: parseMastodonGlobalUsername(username).server,
        })
      ).profile;

      expect(result).to.not.be.null;
      if (result) {
        expect(result.id).to.be.a('string');
        expect(result.username).to.equal(username);
        expect(result.displayName).to.be.a('string');
        expect(result.avatar).to.be.a('string');
      }
    });
    it('handles newlines in the content html', async () => {
      const post_id =
        'https://w3c.social/users/w3c/statuses/113561528162272973';
      const result = await mastodonService.getThread(
        post_id,
        userDetails.credentials
      );

      const genericPost = await mastodonService.convertToGeneric({
        posted: result.platformPost,
      } as PlatformPostCreate<MastodonThread>);

      const content = genericPost.thread[0].content;

      const accessibilityIndex = content.indexOf('#accessibility');
      const charAfterAccessibility = content[accessibilityIndex + 14];

      expect(charAfterAccessibility).to.be.equal('\n');
    });
  });

  describe('bluesky', () => {
    let blueskyService: BlueskyService;
    let userDetails: BlueskyAccountDetails;

    before(() => {
      if (!user) {
        throw new Error('appUser not created');
      }
      const allUserDetails = user.accounts[PLATFORM.Bluesky];
      if (!allUserDetails || allUserDetails.length < 0) {
        throw new Error('Unexpected');
      }
      userDetails = allUserDetails[0];
      if (userDetails.credentials.read === undefined) {
        throw new Error('Unexpected');
      }

      blueskyService = services.platforms.get(
        PLATFORM.Bluesky
      ) as BlueskyService;
    });

    it('gets account by username', async () => {
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

      const result = (
        await blueskyService.getProfileByUsername(username, agent.session)
      )?.profile;

      expect(result).to.not.be.null;
      if (result) {
        expect(result.id).to.be.a('string');
        expect(result.username).to.equal(username);
        expect(result.displayName).to.be.a('string');
        expect(result.avatar).to.be.a('string');
      }
    });

    (USE_REAL_BLUESKY ? it : it.skip)(
      'fetches the main thread of a post',
      async () => {
        const postId =
          'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3l4wdgnynfq2h';
        // https://bsky.app/profile/weswalla.bsky.social/post/3l4wdgnynfq2h

        const result = (
          await services.db.run((manager) =>
            blueskyService.getThread(postId, userDetails.credentials)
          )
        ).platformPost;
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
        const authorDid = result.post.author.id;
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

    it('can fetch since and until with dates instead of post_ids', async () => {
      if (!user) {
        throw new Error('appUser not created');
      }

      const untilPost_id =
        'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3ldc6uw4czr2y?reposted_by=did:plc:xq36vykdkrzknmcxo3jnn5wq';
      const sincePost_id =
        'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3lcwqe3td4d2m?reposted_by=did:plc:xq36vykdkrzknmcxo3jnn5wq';

      const fetchParams: FetchParams = {
        expectedAmount: 1,
      };

      await services.postsManager.fetchUser({
        userId: user!.userId,
        params: fetchParams,
        platformIds: [PLATFORM.Bluesky],
      });

      const sinceAndUntilPosts = await services.db.run(async (manager) => {
        const sincePlatformPostId =
          await services.postsManager.processing.platformPosts.getFrom_post_id(
            PLATFORM.Bluesky,
            sincePost_id,
            manager,
            true
          );
        const sincePlatformPost =
          await services.postsManager.processing.platformPosts.get(
            sincePlatformPostId,
            manager,
            true
          );
        const sincePost = await services.postsManager.processing.posts.get(
          sincePlatformPost.postId!,
          manager,
          true
        );
        const untilPlatformPostId =
          await services.postsManager.processing.platformPosts.getFrom_post_id(
            PLATFORM.Bluesky,
            untilPost_id,
            manager,
            true
          );
        const untilPlatformPost =
          await services.postsManager.processing.platformPosts.get(
            untilPlatformPostId,
            manager,
            true
          );
        const untilPost = await services.postsManager.processing.posts.get(
          untilPlatformPost.postId!,
          manager,
          true
        );
        return {
          sincePost,
          untilPost,
        };
      });
      if (!sinceAndUntilPosts.sincePost || !sinceAndUntilPosts.untilPost) {
        throw new Error('since and until posts should exists');
      }

      const allProfilePosts =
        await services.postsManager.processing.posts.getAllOfQuery({
          profileId: getProfileId(PLATFORM.Bluesky, userDetails.user_id),
          fetchParams: { expectedAmount: 100 },
        });
      await services.db.run(async (manager) => {
        for (const post of allProfilePosts) {
          if (
            post.id !== sinceAndUntilPosts.sincePost.id &&
            post.id !== sinceAndUntilPosts.untilPost.id
          ) {
            await services.postsManager.processing.deletePostFull(
              post.id,
              manager
            );
          }
        }
      });

      const fetchParamsSince: FetchParams = {
        expectedAmount: 1,
        sinceId: sinceAndUntilPosts.sincePost.id,
      };

      const fetchParamsUntil: FetchParams = {
        expectedAmount: 1,
        untilId: sinceAndUntilPosts.untilPost.id,
      };
      await services.db.run(async (manager) => {
        await services.users.profiles.setAccountProfileFetched(
          PLATFORM.Bluesky,
          userDetails.user_id,
          { newest_id: sincePost_id, oldest_id: untilPost_id },
          manager
        );
      });

      const sincePlatformPosts = await services.postsManager.fetchUser({
        userId: user!.userId,
        params: fetchParamsSince,
        platformIds: [PLATFORM.Bluesky],
      });

      await services.db.run(async (manager) => {
        await services.users.profiles.setAccountProfileFetched(
          PLATFORM.Bluesky,
          userDetails.user_id,
          { newest_id: sincePost_id, oldest_id: untilPost_id },
          manager
        );
      });
      const untilPlatformPosts = await services.postsManager.fetchUser({
        userId: user!.userId,
        params: fetchParamsUntil,
        platformIds: [PLATFORM.Bluesky],
      });
      expect(untilPlatformPosts.length).to.not.be.equal(0);
      expect(sincePlatformPosts.length).to.not.be.equal(0);

      sincePlatformPosts.forEach((platformPost) => {
        expect(platformPost.post.createdAtMs).to.be.greaterThan(
          sinceAndUntilPosts.sincePost.createdAtMs
        );
      });

      untilPlatformPosts.forEach((platformPost) => {
        expect(platformPost.post.createdAtMs).to.be.lessThan(
          sinceAndUntilPosts.untilPost.createdAtMs
        );
      });
    });

    it('fetches the latest posts without since_id or until_id', async () => {
      const fetchParams: PlatformFetchParams = {
        expectedAmount: 10,
      };

      const result = await services.db.run((manager) =>
        blueskyService.fetch(
          userDetails.user_id,
          fetchParams,
          userDetails.credentials
        )
      );

      expect(result).to.not.be.undefined;
      expect(result.platformPosts.length).to.be.greaterThan(0);
    });
    it('includes quoted posts in the thread when the embed is of type app.bsky.embed.recordWithMedia#view', async () => {
      const post_id =
        'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3lcmhumbudk2m';
      const result = await blueskyService.getThread(
        post_id,
        userDetails.credentials
      );

      const genericPost = await blueskyService.convertToGeneric({
        posted: result.platformPost,
      } as PlatformPostCreate<BlueskyThread>);

      expect(genericPost.thread[0].quotedThread).to.not.be.undefined;
    });

    it('it can fetch a single post', async () => {
      const post_id =
        'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3lcmhumbudk2m';
      const result = await blueskyService.getSinglePost(
        post_id,
        userDetails.credentials
      );

      expect(result.platformPost.post.posts).to.have.length(1);
    });
    it('it cannot fetch a single post if it is a repost', async () => {
      const post_id =
        'at://did:plc:6z5botgrc5vekq7j26xnvawq/app.bsky.feed.post/3lcmhumbudk2m?reposted_by=did:plc:xq36vykdkrzknmcxo3jnn5wq';
      try {
        await blueskyService.getSinglePost(post_id, userDetails.credentials);
        throw new Error('Should not have reached here');
      } catch (error: any) {
        expect(error).to.not.be.undefined;
        expect(error.message).to.equal(
          `reposts cannot be fetched with getSinglePost. Tried to fetch ${post_id}`
        );
      }
    });
  });
});
