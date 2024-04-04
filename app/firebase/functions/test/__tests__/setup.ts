import fs from 'fs';
import { Context } from 'mocha';

import { TwitterUserDetails } from '../../src/@shared/types.twitter';
import { envDeploy } from '../../src/config/typedenv.deploy';
import { resetDB } from '../__tests_support__/db';
import { LocalLogger, LogLevel } from '../__tests_support__/test.logger';
import {
  TwitterAccountCredentials,
  authenticateTwitterUsers,
} from '../utils/authenticateTwitterUsers';

export const LOG_LEVEL_MSG = envDeploy.LOG_LEVEL_MSG.value();
export const LOG_LEVEL_OBJ = envDeploy.LOG_LEVEL_OBJ.value();
export const NUM_TWITTER_USERS = 1;
const TEST_CREDENTIAL_FILE_PATH =
  './test/__tests__/test.twitter.credentials.json';

export type InjectableContext = Readonly<{
  // properties injected using the Root Mocha Hooks
}>;

export let testTwitterAccountTokens: Map<string, TwitterUserDetails> =
  new Map();

(global as any).logger = new LocalLogger(
  (LOG_LEVEL_MSG as LogLevel) || LogLevel.warn,
  (LOG_LEVEL_OBJ as LogLevel) || LogLevel.warn,
  ['Testing authorization']
);

// TestContext will be used by all the test
export type TestContext = Mocha.Context & Context;

export const mochaHooks = (): Mocha.RootHookObject => {
  return {
    async beforeAll(this: Mocha.Context) {
      const context: InjectableContext = {};
      await resetDB();

      const testAccountCredentials: TwitterAccountCredentials[] = JSON.parse(
        process.env.TEST_USER_TWITTER_ACCOUNTS as string
      );
      if (!testAccountCredentials) {
        throw new Error('test acccounts undefined');
      }
      if (testAccountCredentials.length < NUM_TWITTER_USERS) {
        throw new Error('not enough twitter account credentials provided');
      }
      let accountTokens: TwitterUserDetails[] = [];

      if (fs.existsSync(TEST_CREDENTIAL_FILE_PATH)) {
        const fileContents = fs.readFileSync(TEST_CREDENTIAL_FILE_PATH, 'utf8');
        const credentials: TwitterUserDetails[] = JSON.parse(fileContents);

        // check if any of the credentials have expired, if any of them have, return false, if they are all valid, return true
        let valid = true;
        credentials.forEach((credential) => {
          if (
            credential.read?.expiresAtMs &&
            credential.read.expiresAtMs < Date.now()
          ) {
            valid = false;
          }
        });
        if (credentials.length < NUM_TWITTER_USERS) {
          valid = false;
        }

        if (!valid) {
          accountTokens = await authenticateTwitterUsers(
            testAccountCredentials.splice(0, NUM_TWITTER_USERS)
          );
          fs.writeFileSync(
            TEST_CREDENTIAL_FILE_PATH,
            JSON.stringify(accountTokens),
            'utf8'
          );
        } else {
          accountTokens = credentials;
        }
      } else {
        accountTokens = await authenticateTwitterUsers(testAccountCredentials);
        fs.writeFileSync(
          TEST_CREDENTIAL_FILE_PATH,
          JSON.stringify(accountTokens),
          'utf8'
        );
      }

      accountTokens.forEach((accountToken) => {
        if (!accountToken.profile?.username) {
          throw new Error('unexpected: twitter account username missing');
        }
        testTwitterAccountTokens.set(
          accountToken.profile?.username,
          accountToken
        );
      });

      Object.assign(this, context);
    },

    beforeEach(this: TestContext) {
      // the contents of the Before Each hook
    },

    async afterAll(this: TestContext) {},

    afterEach(this: TestContext) {
      // the contents of the After Each hook
    },
  };
};
