import { initializeApp } from 'firebase-admin/app';
import { Context } from 'mocha';
import * as sinon from 'sinon';

import { AppUser } from '../../src/@shared/types/types.user';
import { envRuntime } from '../../src/config/typedenv.runtime';
import * as tasksSupport from '../../src/tasksUtils/tasks.support';
import { authenticateTestUser } from '../utils/authenticate.users';
import { resetDB } from '../utils/db';
import { enqueueTaskMockOnTests } from '../utils/tasks.enqueuer.mock.tests';
import { testCredentials } from './test.accounts';
import { getTestServices } from './test.services';

export const LOG_LEVEL_MSG = envRuntime.LOG_LEVEL_MSG.value();
export const LOG_LEVEL_OBJ = envRuntime.LOG_LEVEL_OBJ.value();
export const TEST_USERS_FILE_PATH = './test/__tests__/test.users.json';
export const USE_REAL_TWITTER = process.env.USE_REAL_TWITTERX === 'true';
export const USE_REAL_NANOPUB = process.env.USE_REAL_NANOPUB === 'true';
export const USE_REAL_PARSER = process.env.USE_REAL_PARSER === 'true';
export const USE_REAL_EMAIL = process.env.USE_REAL_EMAIL === 'true';
export const EMAIL_SENDER_FROM = process.env.EMAIL_SENDER_FROM as string;
export const TEST_EMAIL = process.env.TEST_EMAIL as string;

export type InjectableContext = Readonly<{
  // properties injected using the Root Mocha Hooks
}>;
export let testUsers: AppUser[] = [];

export const TEST_THREADS: string[][] = process.env.TEST_THREADS
  ? JSON.parse(process.env.TEST_THREADS as string)
  : [];

// TestContext will be used by all the test
export type TestContext = Mocha.Context & Context;

export const app = initializeApp({
  projectId: 'demo-sensenets',
});

export let globalTestServices = getTestServices({
  time: 'mock',
  twitter: USE_REAL_TWITTER
    ? undefined
    : { publish: true, signup: true, fetch: true, get: true },
  nanopub: USE_REAL_NANOPUB ? 'real' : 'mock-publish',
  parser: USE_REAL_PARSER ? 'real' : 'mock',
  emailSender: USE_REAL_EMAIL ? 'spy' : 'mock',
});

export const mochaHooks = (): Mocha.RootHookObject => {
  return {
    async beforeAll(this: Mocha.Context) {
      const context: InjectableContext = {};

      /** reset db */
      await resetDB();

      /** mock enqueueTask */
      (global as any).enqueueTaskStub = sinon
        .stub(tasksSupport, 'enqueueTask')
        .callsFake((name: string, params: any) =>
          enqueueTaskMockOnTests(name, params, globalTestServices)
        );

      /** prepare/authenticate users  */
      await globalTestServices.db.run(async (manager) => {
        await Promise.all(
          testCredentials.map(async (accountCredentials) => {
            const user = await authenticateTestUser(
              accountCredentials,
              globalTestServices,
              manager
            );
            testUsers.push(user);
          })
        );
      });

      Object.assign(this, context);
    },
  };
};
