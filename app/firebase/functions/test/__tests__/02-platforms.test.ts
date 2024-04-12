import { Nanopub, NpProfile } from '@nanopub/sign';
import { expect } from 'chai';
import { PlatformPostDraft } from 'src/@shared/types/types.platform.posts';

import { AppUser, PLATFORM } from '../../src/@shared/types/types';
import { RSAKeys } from '../../src/@shared/types/types.nanopubs';
import { AppPostFull } from '../../src/@shared/types/types.posts';
import { getRSAKeys } from '../../src/@shared/utils/rsa.keys';
import { cleanPrivateKey } from '../../src/@shared/utils/semantics.helper';
import { logger } from '../../src/instances/logger';
import { FetchUserPostsParams } from '../../src/platforms/platforms.interface';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../__tests_support__/db';
import { createTestAppUsers } from '../utils/user.factory';
import { getTestServices } from './test.services';

describe('platforms', () => {
  let users: AppUser[] = [];
  let rsaKeys: RSAKeys | undefined;
  const services = getTestServices();

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();

    rsaKeys = getRSAKeys('');

    users.push({
      userId: 'twitter:123456',
      platformIds: ['twitter:123456'],
      twitter: [
        {
          user_id: '123456',
          signupDate: 1708560000000,
          read: {
            accessToken: '',
            refreshToken: '',
            expiresAtMs: 0,
            expiresIn: 0,
            lastFetchedMs: 0,
          },
        },
      ],
      nanopub: [
        {
          user_id: '123456',
          signupDate: 1708560000000,
          profile: {
            introNanopub: 'https://nanopub.org/np/123456',
            ethAddress: '0x123456',
            rsaPublickey: 'publickey',
          },
        },
      ],
    });
  });

  describe('twitter', () => {
    let appUser: AppUser | undefined;

    before(async () => {
      const users = await services.db.runWithTransactionManager((manager) =>
        createTestAppUsers(services, manager)
      );
      appUser = users[0];
    });

    it("get's all tweets in a time range using pagination", async () => {
      if (!appUser) {
        throw new Error('appUser not created');
      }
      const allUserDetails = appUser[PLATFORM.Twitter];
      if (!allUserDetails || allUserDetails.length < 0) {
        throw new Error('Unexpected');
      }
      const twitterService = services.platforms.get(PLATFORM.Twitter);
      const userDetails = allUserDetails[0];
      if (userDetails.read === undefined) {
        throw new Error('Unexpected');
      }
      try {
        const user = users[0];
        const twitter = user[PLATFORM.Twitter];

        if (!twitter) {
          throw new Error('User does not have Twitter credentials');
        }

        const fetchParams: FetchUserPostsParams = {
          userDetails: {
            ...userDetails,
            user_id: '1753077743816777728', // this is `sensemakergod`'s user_id, since we want to test pagination.
          },
          start_time: 1708560000000,
          end_time: 1708646400000,
        };

        const tweets = await services.db.runWithTransactionManager((manager) =>
          twitterService.fetch(fetchParams, manager)
        );

        expect(tweets).to.not.be.undefined;
        expect(tweets.length).to.be.equal(0);
      } catch (error) {
        console.error('error: ', error);
        throw error;
      }
    });

    it.skip('refreshes the access token if it has expired when using the twitter service', async () => {
      if (!appUser) {
        throw new Error('appUser not created');
      }
      const allUserDetails = appUser[PLATFORM.Twitter];
      if (!allUserDetails || allUserDetails.length < 0) {
        throw new Error('Unexpected');
      }
      const userDetails = allUserDetails[0];
      const twitterService = new TwitterService(
        services.time,
        services.users.repo,
        {
          clientId: process.env.TWITTER_CLIENT_ID as string,
          clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
        }
      );

      await services.db.runWithTransactionManager(async (manager) => {
        const tweets = await twitterService.fetch(
          {
            userDetails,
            start_time: Date.now() - 1000,
          },
          manager
        );

        expect(tweets).to.not.be.undefined;

        const user = await services.users.repo.getUserWithPlatformAccount(
          PLATFORM.Twitter,
          userDetails.user_id,
          manager,
          true
        );

        const newUserDetails = user[PLATFORM.Twitter];
        if (!newUserDetails || newUserDetails.length != 1) {
          throw new Error('Unexpected');
        }

        expect(newUserDetails[0]).to.not.deep.equal(userDetails);
      });
    });
  });

  describe('nanopub', () => {
    let nanopub: PlatformPostDraft | undefined;

    it('creates a draft nanopub', async () => {
      const nanopubService = services.platforms.get(PLATFORM.Nanopub);

      try {
        const post: AppPostFull = {
          id: 'test-id',
          authorId: users[0].userId,
          content: 'test content',
          semantics: '',
          origin: PLATFORM.Twitter,
          parseStatus: 'processed',
          reviewedStatus: 'pending',
          mirrors: [],
        };

        nanopub = await nanopubService.convertFromGeneric({
          post,
          author: users[0],
        });
      } catch (error) {
        console.error('error: ', error);
        throw error;
      }
    });

    it('publish signed nanopub', async () => {
      try {
        const nanopubService = services.platforms.get(PLATFORM.Nanopub);

        if (!nanopub) {
          throw new Error('Post not created');
        }

        const nanopubObj = new Nanopub(nanopub.post);

        const nanopubAccount = UsersHelper.getAccount(
          users[0],
          PLATFORM.Nanopub,
          undefined,
          true
        );

        if (!nanopubAccount.profile?.introNanopub) {
          throw new Error('User does not have an introduction nanopub URI');
        }

        if (!rsaKeys) {
          throw new Error('RSA keys not found');
        }

        const keyBody = cleanPrivateKey(rsaKeys);

        const profile = new NpProfile(
          keyBody,
          '',
          '',
          nanopubAccount.profile.introNanopub
        );

        const signed = nanopubObj.sign(profile);

        expect(signed).to.not.be.undefined;

        const published = await services.db.runWithTransactionManager(
          (manager) =>
            nanopubService.publish(
              {
                draft: signed.rdf(),
                userDetails: nanopubAccount,
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
});
