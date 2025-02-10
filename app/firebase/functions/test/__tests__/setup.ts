import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { Context } from 'mocha';
import * as sinon from 'sinon';

import { PLATFORM } from '../../src/@shared/types/types.platforms';
import {
  AccountProfile,
  AccountProfileCreate,
} from '../../src/@shared/types/types.profiles';
import { AppUser } from '../../src/@shared/types/types.user';
import { envRuntime } from '../../src/config/typedenv.runtime';
import * as tasksSupport from '../../src/tasksUtils/tasks.support';
import { authenticateTestUser } from '../utils/authenticate.users';
import { resetDB } from '../utils/db';
import { enqueueTaskMockOnTests } from '../utils/tasks.enqueuer.mock.tests';
import { testCredentials, testProfilesBase } from './test.accounts';
import { getTestServices } from './test.services';

export const LOG_LEVEL_MSG = envRuntime.LOG_LEVEL_MSG.value();
export const LOG_LEVEL_OBJ = envRuntime.LOG_LEVEL_OBJ.value();
export const TEST_USERS_FILE_PATH = './test/__tests__/test.users.json';
export const USE_REAL_TWITTER = process.env.USE_REAL_TWITTERX === 'true';
export const USE_REAL_MASTODON = process.env.USE_REAL_MASTODON === 'true';
export const USE_REAL_BLUESKY = process.env.USE_REAL_BLUESKY === 'true';
export const USE_REAL_NANOPUB = process.env.USE_REAL_NANOPUB === 'true';
export const USE_REAL_PARSER = process.env.USE_REAL_PARSER === 'true';
export const USE_REAL_LINKS = process.env.USE_REAL_LINKS === 'true';
export const EMAIL_SENDER_FROM = process.env.EMAIL_SENDER_FROM as string;
export const TEST_EMAIL = process.env.TEST_EMAIL as string;
export const INCLUDE_TEST_PLATFORMS_STR = process.env
  .INCLUDE_TEST_PLATFORMS_STR as string;
export const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN as string;

export type InjectableContext = Readonly<{
  // properties injected using the Root Mocha Hooks
}>;
export interface TestUserData {
  user: AppUser;
  profiles: AccountProfile[];
  clustersIds: string[];
}

export interface TestProfileData {
  profile: AccountProfileCreate<{ id: string; username: string }>;
  clustersIds: string[];
}

export let testUsers: TestUserData[] = [];
export let testProfiles: TestProfileData[] = [];

export const TEST_THREADS: string[][] = process.env.TEST_THREADS
  ? JSON.parse(process.env.TEST_THREADS as string)
  : [];

// TestContext will be used by all the test
export type TestContext = Mocha.Context & Context;

export const app = getApps().length
  ? getApp() // Return the existing app if already initialized
  : initializeApp({
      projectId: 'demo-sensenets',
    });

export let globalTestServices = getTestServices({
  time: 'mock',
  twitter: USE_REAL_TWITTER
    ? { signup: true }
    : { publish: true, signup: true, fetch: true, get: true },
  bluesky: USE_REAL_BLUESKY
    ? undefined
    : { publish: true, signup: true, fetch: true, get: true },
  mastodon: USE_REAL_MASTODON
    ? undefined
    : { publish: true, signup: true, fetch: true, get: true },
  parser: USE_REAL_PARSER ? 'real' : 'mock',
  links: USE_REAL_LINKS
    ? undefined
    : {
        get: true,
        enable: true,
      },
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

      console.log(INCLUDE_TEST_PLATFORMS_STR);
      const includePlatforms = INCLUDE_TEST_PLATFORMS_STR
        ? JSON.parse(INCLUDE_TEST_PLATFORMS_STR)
        : [PLATFORM.Twitter, PLATFORM.Mastodon, PLATFORM.Bluesky];

      /** prepare/authenticate users and store them on a global variable
       * the DB is reset at every test
       */
      const users = await globalTestServices.db.run(async (manager) => {
        return Promise.all(
          testCredentials.map(async (accountCredentials) => {
            const userId = await globalTestServices.users.createUser(
              accountCredentials.clerkId,
              manager
            );
            return authenticateTestUser(
              { ...accountCredentials, userId },
              globalTestServices,
              includePlatforms,
              manager
            );
          })
        );
      });

      /** Profiles are created in the DB but need to be moved to the global test variable */
      await Promise.all(
        users.map(async (user) => {
          const profiles = await globalTestServices.db.run(async (manager) => {
            return globalTestServices.profiles.repo.getOfUser(
              user.userId,
              manager
            );
          });

          const clustersIds =
            testCredentials.find((cred) =>
              profiles.some((p) => p.user_id === cred.twitter?.id)
            )?.clustersIds || [];

          const userData: TestUserData = {
            user,
            profiles,
            clustersIds,
          };
          testUsers.push(userData);
        })
      );

      testUsers.sort((a, b) => a.user.userId.localeCompare(b.user.userId));
      testProfiles = testProfilesBase;

      Object.assign(this, context);
    },
  };
};
