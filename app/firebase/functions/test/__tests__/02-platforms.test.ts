import { expect } from 'chai';

import { AppUser, PLATFORM } from '../../src/@shared/types';
import { AppPost } from '../../src/@shared/types.posts';
import { logger } from '../../src/instances/logger';
import { FetchUserPostsParams } from '../../src/platforms/platforms.interface';
import { resetDB } from '../__tests_support__/db';
import { services } from './test.services';

describe('platforms', () => {
  let users: AppUser[] = [];

  before(async () => {
    logger.debug('resetting DB');
    await resetDB();

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
    });
  });

  describe('twitter', () => {
    it("get's all tweets in a time range using pagination", async () => {
      const twitterService = services.platforms.get(PLATFORM.Twitter);

      try {
        const user = users[0];
        const twitter = user[PLATFORM.Twitter];

        if (!twitter) {
          throw new Error('User does not have Twitter credentials');
        }

        const fetchParams: FetchUserPostsParams[] = [
          {
            userDetails: twitter[0],
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
  });

  describe.only('nanopub', () => {
    it("get's all tweets in a time range using pagination", async () => {
      const nanopubService = services.platforms.get(PLATFORM.Nanopub);

      try {
        const post: AppPost = {
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
      } catch (error) {
        console.error('error: ', error);
        throw error;
      }
    });
  });
});
