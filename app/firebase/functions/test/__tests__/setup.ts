import fs from 'fs';
import { Context } from 'mocha';

import { AppUser, PLATFORM } from '../../src/@shared/types/types';
import { envDeploy } from '../../src/config/typedenv.deploy';
import { resetDB } from '../__tests_support__/db';
import { LocalLogger, LogLevel } from '../__tests_support__/test.logger';
import {
  TestUserCredentials,
  authenticateTestUser,
  authenticateTwitterUser,
} from '../utils/authenticate.users';
import { getTestServices } from './test.services';

export const LOG_LEVEL_MSG = envDeploy.LOG_LEVEL_MSG.value();
export const LOG_LEVEL_OBJ = envDeploy.LOG_LEVEL_OBJ.value();
export const NUM_TEST_USERS = 1;
export const TEST_USERS_FILE_PATH = './test/__tests__/test.users.json';
export const MOCK_TWITTER = process.env.MOCK_TWITTERX === 'true';

export type InjectableContext = Readonly<{
  // properties injected using the Root Mocha Hooks
}>;
export let testUsers: Map<string, AppUser> = new Map();

(global as any).logger = new LocalLogger(
  (LOG_LEVEL_MSG as LogLevel) || LogLevel.warn,
  (LOG_LEVEL_OBJ as LogLevel) || LogLevel.warn,
  ['Testing authorization']
);

// TestContext will be used by all the test
export type TestContext = Mocha.Context & Context;

export const mochaHooks = (): Mocha.RootHookObject => {
  const services = getTestServices();

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

          /** check if any of the twitter access tokens have expired, and if so, re-authenticate */
          await Promise.all(
            appUsers.map(async (appUser) => {
              const accounts = appUser[PLATFORM.Twitter] || [];
              let updatedUser: AppUser | undefined = undefined;
              await Promise.all(
                accounts.map(async (twitterDetails) => {
                  if (
                    twitterDetails.read?.expiresAtMs &&
                    twitterDetails.read.expiresAtMs < Date.now()
                  ) {
                    const credentials = testAccountsCredentials.find(
                      (testCredentials) =>
                        testCredentials.twitter.username ===
                        twitterDetails.profile?.name
                    );
                    if (!credentials) {
                      throw new Error('unexpected');
                    }

                    const user = await authenticateTwitterUser(
                      credentials.twitter,
                      services,
                      manager
                    );

                    return user;
                  }

                  return undefined;
                })
              );

              if (updatedUser) {
                /** replace twitter credentials */
                appUser[PLATFORM.Twitter] = updatedUser[PLATFORM.Twitter];
              }

              testUsers.set(appUser.userId, appUser);
            })
          );
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
      // the contents of the Before Each hook
    },

    /** update stored test users after all tests run */
    async afterAll(this: TestContext) {
      if (testUsers.size > 0) {
        fs.writeFileSync(
          TEST_USERS_FILE_PATH,
          JSON.stringify(Array.from(testUsers.values())),
          'utf8'
        );
      }
    },

    /** update test users global variable after each test in case tokens have been refreshed */
    async afterEach(this: TestContext) {
      const testAppUsers = await services.users.repo.getAll();
      testAppUsers.forEach((appUser) => {
        testUsers.set(appUser.userId, appUser);
      });
    },
  };
};
