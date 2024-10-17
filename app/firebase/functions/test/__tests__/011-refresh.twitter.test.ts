// import { expect } from 'chai';

// import { PLATFORM } from '../../src/@shared/types/types.platforms';
// import { TwitterAccountDetails } from '../../src/@shared/types/types.twitter';
// import { AppUser } from '../../src/@shared/types/types.user';
// import { USE_REAL_EMAIL } from '../../src/config/config.runtime';
// import { logger } from '../../src/instances/logger';
// import { getTestCredentials } from '../../src/platforms/mock/test.users';
// import { TwitterService } from '../../src/platforms/twitter/twitter.service';
// import { UsersHelper } from '../../src/users/users.helper';
// import { resetDB } from '../utils/db';
// import { createUsers } from '../utils/users.utils';
// import {
//   USE_REAL_NANOPUB,
//   USE_REAL_PARSER,
//   USE_REAL_TWITTER,
//   testUsers,
// } from './setup';
// import { testCredentials } from './test.accounts';
// import { getTestServices } from './test.services';

// describe.skip('011-twitter refresh', () => {
//   let user: AppUser | undefined;

//   const services = getTestServices({
//     time: 'mock',
//     twitter: USE_REAL_TWITTER ? undefined : { publish: true, signup: true },
//     nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
//     parser: USE_REAL_PARSER ? 'real' : 'mock',
//     emailSender: USE_REAL_EMAIL ? 'spy' : 'mock',
//   });

//   before(async () => {
//     logger.debug('resetting DB');
//     await resetDB();

//     await services.db.run(async (manager) => {
//       const users = await createUsers(
//         services,
//         Array.from(testUsers.values()),
//         manager
//       );
//       const testUser = testCredentials[0];

//       user = users.find(
//         (u) =>
//           UsersHelper.getAccount(u, PLATFORM.Twitter, testUser.twitter.id) !==
//           undefined
//       );
//     });
//   });

//   describe('refresh token manually', () => {
//     it('refresh token', async () => {
//       if (!USE_REAL_TWITTER) {
//         logger.debug(
//           'skipping refresh token test. Enabled only with real twitter'
//         );
//         return;
//       }
//       const twitterService = (services.platforms as any).platforms.get(
//         PLATFORM.Twitter
//       ) as TwitterService;

//       const account = await services.db.run(async (manager) => {
//         if (!user) {
//           throw new Error('unexpected');
//         }

//         const account = UsersHelper.getAccount(
//           user,
//           PLATFORM.Twitter,
//           undefined,
//           true
//         );

//         return account;
//       });

//       let expectedDetails: TwitterAccountDetails | undefined = undefined;

//       await services.db.run(async (manager) => {
//         (services.time as any).set(account?.credentials.read.expiresAtMs);

//         const { client, oldDetails, newDetails } = (await (
//           twitterService as any
//         ).getUserClientInternal(
//           account.user_id,
//           'read',
//           manager
//         )) as GetClientResultInternal;

//         expect(client).to.not.be.undefined;

//         expectedDetails = newDetails;

//         logger.debug(`oldDetails, newDetails`, { oldDetails, newDetails });
//       });

//       await services.db.run(async (manager) => {
//         if (!user) {
//           throw new Error('unexpected');
//         }

//         const userRead = await services.users.repo.getUser(
//           user.userId,
//           manager,
//           true
//         );

//         const accountRead = UsersHelper.getAccount(
//           userRead,
//           PLATFORM.Twitter,
//           account.user_id
//         );

//         expect(accountRead?.read.refreshToken).to.equal(
//           expectedDetails?.read?.refreshToken
//         );

//         logger.debug(`accountRead`, { accountRead });
//       });

//       expect(user).to.not.be.undefined;
//     });
//   });

//   describe('refresh token through getOfUser', () => {
//     it('refresh token', async () => {
//       if (!user) {
//         throw new Error('unexpected');
//       }

//       /** read the expireTime */
//       const account = await services.db.run(async (manager) => {
//         if (!user) {
//           throw new Error('unexpected');
//         }

//         const userRead = await services.users.repo.getUser(
//           user.userId,
//           manager,
//           true
//         );

//         return UsersHelper.getAccount(
//           userRead,
//           PLATFORM.Twitter,
//           undefined,
//           true
//         );
//       });

//       logger.debug(`account ${account.read?.refreshToken}`, {
//         account,
//       });

//       /** set the mock time service time to that value */
//       (services.time as any).set(account.read?.expiresAtMs);

//       // call getOfUsers (this should update the refresh token)
//       void (await services.postsManager.getOfUser({
//         userId: user?.userId,
//         fetchParams: { expectedAmount: 10 },
//       }));

//       const accountAfter = await services.db.run(async (manager) => {
//         if (!user) {
//           throw new Error('unexpected');
//         }

//         const userRead = await services.users.repo.getUser(
//           user.userId,
//           manager,
//           true
//         );

//         return UsersHelper.getAccount(
//           userRead,
//           PLATFORM.Twitter,
//           undefined,
//           true
//         );
//       });

//       logger.debug(`accountAfter ${accountAfter.read?.refreshToken}`, {
//         accountAfter,
//       });

//       expect(account.read?.refreshToken).to.not.equal(
//         accountAfter.read?.refreshToken
//       );
//     });
//   });

//   describe('remove platform on invalid token', () => {
//     it('removes platform', async () => {
//       if (!USE_REAL_TWITTER) {
//         logger.debug(
//           'skipping refresh token test. Enabled only with real twitter'
//         );
//         return;
//       }

//       const twitterService = (services.platforms as any).platforms.get(
//         PLATFORM.Twitter
//       ) as TwitterService;

//       const tweetId = '1818267753016381936';
//       const testCredentials = getTestCredentials(
//         process.env.TEST_USER_ACCOUNTS as string
//       );
//       if (!testCredentials) {
//         throw new Error('test credentials not found');
//       }

//       if (!user) {
//         throw new Error('unexpected');
//       }

//       const userId = user.userId;
//       const user_id = testCredentials[0].twitter.id;

//       const tweet = await services.db.run(async (manager) =>
//         twitterService.getPost(tweetId, manager, user_id)
//       );

//       expect(tweet).to.not.be.undefined;

//       const account = UsersHelper.getAccount(
//         user,
//         PLATFORM.Twitter,
//         undefined,
//         true
//       );

//       let expectedDetails: TwitterUserDetails | undefined = undefined;

//       await services.db.run(async (manager) => {
//         (services.time as any).set(account?.read.expiresAtMs);

//         const { client, oldDetails, newDetails } = (await (
//           twitterService as any
//         ).getUserClientInternal(
//           account.user_id,
//           'read',
//           manager
//         )) as GetClientResultInternal;

//         expect(client).to.not.be.undefined;

//         expectedDetails = newDetails;

//         logger.debug(`oldDetails, newDetails`, { oldDetails, newDetails });
//       });

//       await services.db.run(async (manager) => {
//         const userRead = await services.users.repo.getUser(
//           userId,
//           manager,
//           true
//         );

//         const accountRead = UsersHelper.getAccount(
//           userRead,
//           PLATFORM.Twitter,
//           account.user_id
//         );

//         expect(accountRead?.read.refreshToken).to.equal(
//           expectedDetails?.read?.refreshToken
//         );

//         logger.debug(`accountRead`, { accountRead });
//       });

//       // check refresh token is valid
//       const tweet2 = await services.db.run(async (manager) =>
//         twitterService.getPost(tweetId, manager, user_id)
//       );

//       expect(tweet2).to.not.be.undefined;

//       // corrupt the refresh token
//       await services.db.run(async (manager) => {
//         const latestUser = await services.users.repo.getUser(
//           userId,
//           manager,
//           true
//         );

//         const latestDetails = UsersHelper.getAccount(
//           latestUser,
//           PLATFORM.Twitter,
//           account.user_id
//         ) as TwitterUserDetails;

//         if (!latestDetails.read) {
//           throw new Error('unexpected read undefined');
//         }

//         const currentRefresh = latestDetails?.read?.refreshToken;

//         if (!currentRefresh) {
//           throw new Error('unexpected refresh token undefined');
//         }
//         const newRefresh = 'ABCD' + currentRefresh.slice(4);

//         latestDetails.read.refreshToken = newRefresh;

//         await services.users.repo.setPlatformDetails(
//           userId,
//           PLATFORM.Twitter,
//           latestDetails,
//           manager
//         );
//       });

//       // check refresh token is not valid
//       await services.db.run(async (manager) => {
//         const latestUser = await services.users.repo.getUser(
//           userId,
//           manager,
//           true
//         );

//         const latestDetails = UsersHelper.getAccount(
//           latestUser,
//           PLATFORM.Twitter,
//           account.user_id
//         ) as TwitterUserDetails;

//         if (!latestDetails || !latestDetails.read) {
//           throw new Error('unexpected');
//         }

//         (services.time as any).set(latestDetails.read.expiresAtMs);
//       });

//       // check refresh token is valid
//       const { post } = await services.db.run(async (manager) =>
//         services.postsManager.fetchPostFromPlatform(
//           userId,
//           PLATFORM.Twitter,
//           tweetId,
//           manager
//         )
//       );

//       expect(post).to.be.undefined;
//     });
//   });
// });
