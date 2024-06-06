import fs from 'fs';
import { Context } from 'mocha';

import { ALL_PUBLISH_PLATFORMS, AppUser } from '../../src/@shared/types/types';
import { envDeploy } from '../../src/config/typedenv.deploy';
import { logger } from '../../src/instances/logger';
import { UsersHelper } from '../../src/users/users.helper';
import {
  TestUserCredentials,
  authenticateTestUser,
  checkOutdatedTwitterTokens,
} from '../utils/authenticate.users';
import { resetDB } from '../utils/db';
import { getTestServices } from './test.services';

export const LOG_LEVEL_MSG = envDeploy.LOG_LEVEL_MSG.value();
export const LOG_LEVEL_OBJ = envDeploy.LOG_LEVEL_OBJ.value();
export const NUM_TEST_USERS = 1;
export const TEST_USERS_FILE_PATH = './test/__tests__/test.users.json';
export const USE_REAL_TWITTER = process.env.USE_REAL_TWITTERX === 'true';
export const USE_REAL_NANOPUB = process.env.USE_REAL_NANOPUB === 'true';
export const USE_REAL_PARSER = process.env.USE_REAL_PARSER === 'true';

export type InjectableContext = Readonly<{
  // properties injected using the Root Mocha Hooks
}>;
export let testUsers: Map<string, AppUser> = new Map();

// TestContext will be used by all the test
export type TestContext = Mocha.Context & Context;

const DEBUG = false;

export const mochaHooks = (): Mocha.RootHookObject => {
  const services = getTestServices({
    time: 'real',
    twitter: USE_REAL_TWITTER ? 'real' : 'mock-publish',
    nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
    parser: USE_REAL_PARSER ? 'real' : 'mock',
  });

  return {
    async beforeAll(this: Mocha.Context) {
      const context: InjectableContext = {};
      await resetDB();

      await services.db.run(async (manager) => {
        const testAccountsCredentials: TestUserCredentials[] = JSON.parse(
          process.env.TEST_USER_ACCOUNTS as string
        );
        if (!testAccountsCredentials) {
          throw new Error('test acccounts undefined');
        }
        if (testAccountsCredentials.length < NUM_TEST_USERS) {
          throw new Error('not enough twitter account credentials provided');
        }
        let appUsers: AppUser[] = [];

        if (fs.existsSync(TEST_USERS_FILE_PATH)) {
          const fileContents = fs.readFileSync(TEST_USERS_FILE_PATH, 'utf8');
          appUsers = JSON.parse(fileContents);
          if (
            checkOutdatedTwitterTokens(appUsers) ||
            appUsers.length < testAccountsCredentials.length
          ) {
            await Promise.all(
              testAccountsCredentials.map(async (accountCredentials) => {
                const user = await authenticateTestUser(
                  accountCredentials,
                  services,
                  manager
                );
                testUsers.set(user.userId, user);
              })
            );
          } else {
            await Promise.all(
              appUsers.map(async (appUser) => {
                testUsers.set(appUser.userId, appUser);
              })
            );
          }
        } else {
          await Promise.all(
            testAccountsCredentials.map(async (accountCredentials) => {
              const user = await authenticateTestUser(
                accountCredentials,
                services,
                manager
              );
              testUsers.set(user.userId, user);
            })
          );
        }
      });

      Object.assign(this, context);
    },

    beforeEach(this: TestContext) {
      /**
       * by default each test will update the testUsers global object with
       * the latest user details in the DB
       */
      this.skipUsersUpdate = false;
    },

    async afterEach(this: TestContext) {
      if (this.skipUsersUpdate) {
        return;
      }

      const testUsersLocal = testUsers;

      if (testUsersLocal.size > 0) {
        // remove the fetchedDetails
        await Promise.all(
          Array.from(testUsersLocal.values()).map(async (user) => {
            const userRead = await services.db.run((manager) =>
              services.users.repo.getUser(user.userId, manager)
            );

            if (DEBUG) logger.debug('afterAll - userRead', { userRead });

            if (!userRead || !userRead.platformIds) {
              return;
            }

            /** delete the fetched details */
            ALL_PUBLISH_PLATFORMS.map((platform) => {
              const accounts = UsersHelper.getAccounts(userRead, platform);
              accounts.map((account) => {
                delete account['fetched'];
              });
            });

            if (DEBUG) logger.debug('afterAll - set', { userRead });

            /** update the testUser */
            testUsersLocal.set(userRead.userId, userRead);
          })
        );
      }
    },

    async afterAll(this: TestContext) {
      const testUsersLocal = testUsers;
      fs.writeFileSync(
        TEST_USERS_FILE_PATH,
        JSON.stringify(Array.from(testUsersLocal.values()), null, 2),
        'utf8'
      );
    },
  };
};
