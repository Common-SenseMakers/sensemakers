import { Context } from 'mocha';
import * as sinon from 'sinon';

import { AppUser } from '../../src/@shared/types/types.user';
import { envDeploy } from '../../src/config/typedenv.deploy';
import * as tasksSupport from '../../src/tasks.support';
import { enqueueTaskMock } from '../../src/tasks.support.mock';
import {
  TestUserCredentials,
  authenticateTestUser,
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
export const USE_REAL_NOTIFICATIONS =
  process.env.USE_REAL_NOTIFICATIONS === 'true';

export type InjectableContext = Readonly<{
  // properties injected using the Root Mocha Hooks
}>;
export let testUsers: Map<string, AppUser> = new Map();

// TestContext will be used by all the test
export type TestContext = Mocha.Context & Context;

export const mochaHooks = (): Mocha.RootHookObject => {
  const services = getTestServices({
    time: 'real',
    twitter: USE_REAL_TWITTER ? 'real' : 'mock-publish',
    nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
    parser: USE_REAL_PARSER ? 'real' : 'mock',
    notifications: USE_REAL_NOTIFICATIONS ? 'real' : 'mock',
  });

  return {
    async beforeAll(this: Mocha.Context) {
      const context: InjectableContext = {};

      /** reset db */
      await resetDB();

      /** mock enqueueTask */
      (global as any).enqueueTaskStub = sinon
        .stub(tasksSupport, 'enqueueTask')
        .callsFake(enqueueTaskMock);

      /** prepare/authenticate users  */
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
      });

      Object.assign(this, context);
    },
  };
};
