import { Nanopub, NpProfile } from '@nanopub/sign';
import { expect } from 'chai';

import { AppUser, PLATFORM } from '../../src/@shared/types/types';
import { RSAKeys } from '../../src/@shared/types/types.nanopubs';
import { AppPost } from '../../src/@shared/types/types.posts';
import { getRSAKeys } from '../../src/@shared/utils/rsa.keys';
import { cleanPrivateKey } from '../../src/@shared/utils/semantics.helper';
import { logger } from '../../src/instances/logger';
import { FetchUserPostsParams } from '../../src/platforms/platforms.interface';
import { TwitterService } from '../../src/platforms/twitter/twitter.service';
import { UsersHelper } from '../../src/users/users.helper';
import { resetDB } from '../__tests_support__/db';
import { createTestAppUsers } from '../utils/user.factory';
import { MockedTime, services, userRepo } from './test.services';

describe('platforms', () => {
  let users: AppUser[] = [];
  let rsaKeys: RSAKeys | undefined;

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
      const users = await createTestAppUsers();
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

        const fetchParams: FetchUserPostsParams[] = [
          {
            userDetails: {
              ...userDetails,
              user_id: '1753077743816777728', // this is `sensemakergod`'s user_id, since we want to test pagination.
            },
            start_time: 1708560000000,
            end_time: 1708646400000,
          },
        ];

        const tweets = await twitterService.fetch(fetchParams);
        expect(tweets).to.not.be.undefined;
        expect(tweets.length).to.be.equal(11);
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
      const twitterService = new TwitterService(MockedTime, userRepo, {
        clientId: process.env.TWITTER_CLIENT_ID as string,
        clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
      });

      const tweets = await twitterService.fetch([
        {
          userDetails,
          start_time: Date.now() - 1000,
        },
      ]);
      expect(tweets).to.not.be.undefined;
      const user = await services.users.repo.getUserWithPlatformAccount(
        PLATFORM.Twitter,
        userDetails.user_id,
        true
      );
      const newUserDetails = user[PLATFORM.Twitter];
      if (!newUserDetails || newUserDetails.length != 1) {
        throw new Error('Unexpected');
      }
      expect(newUserDetails[0]).to.not.deep.equal(userDetails);
    });
  });

  describe.only('nanopub', () => {
    let post: AppPost | undefined;

    it('creates a draft nanopub', async () => {
      const nanopubService = services.platforms.get(PLATFORM.Nanopub);

      try {
        post = {
          authorId: users[0].userId,
          content: 'test content',
          id: 'test-id',
          semantics: '',
          mirrors: {},
          origin: PLATFORM.Twitter,
          parseStatus: 'processed',
          reviewedStatus: 'pending',
        };

        const nanopub = await nanopubService.convertFromGeneric({
          post,
          author: users[0],
        });

        expect(nanopub).to.not.be.undefined;
        post.mirrors.nanopub = [
          {
            user_id: '123456',
            platformId: PLATFORM.Nanopub,
            postApproval: 'pending',
            status: 'draft',
            platformDraft: nanopub,
          },
        ];
      } catch (error) {
        console.error('error: ', error);
        throw error;
      }
    });

    it('publish signed nanopub', async () => {
      try {
        const nanopubService = services.platforms.get(PLATFORM.Nanopub);

        if (!post) {
          throw new Error('Post not created');
        }

        // const nanopub = PostsHelper.getMirror(post, PLATFORM.Nanopub, true);
        // const nanopubObj = new Nanopub(nanopub.platformDraft.original);
        const nanopubObj =
          new Nanopub(`@prefix : <http://purl.org/nanopub/temp/mynanopub#> .
        @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
        @prefix dc: <http://purl.org/dc/terms/> .
        @prefix pav: <http://purl.org/pav/> .
        @prefix prov: <http://www.w3.org/ns/prov#> .
        @prefix np: <http://www.nanopub.org/nschema#> .
        @prefix npx: <http://purl.org/nanopub/x/> .
        @prefix ex: <http://example.org/> .
        
        :Head {
          : np:hasAssertion :assertion ;
            np:hasProvenance :provenance ;
            np:hasPublicationInfo :pubinfo ;
            a np:Nanopublication .
        }
        
        :assertion {
          ex:mosquito ex:transmits ex:malaria .
        }
        
        :provenance {
          :assertion prov:hadPrimarySource <http://dx.doi.org/10.3233/ISU-2010-0613> .
        }
        
        :pubinfo {
          : a npx:ExampleNanopub .
        }
        `);

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

        const published = await nanopubService.publish([
          { post, userDetails: nanopubAccount },
        ]);
        expect(published).to.not.be.undefined;
        expect(published.length).to.be.equal(1);
      } catch (error) {
        console.error('error: ', error);
        throw error;
      }
    });
  });
});
