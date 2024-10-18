import { envRuntime } from '../../src/config/typedenv.runtime';
import { InjectableContext } from './setup';

export const LOG_LEVEL_MSG = envRuntime.LOG_LEVEL_MSG.value();
export const LOG_LEVEL_OBJ = envRuntime.LOG_LEVEL_OBJ.value();
export const TEST_USERS_FILE_PATH = './test/__tests__/test.users.json';
export const USE_REAL_TWITTER = process.env.USE_REAL_TWITTERX === 'true';
export const USE_REAL_MASTODON = process.env.USE_REAL_MASTODON === 'true';
export const USE_REAL_BLUESKY = process.env.USE_REAL_BLUESKY === 'true';
export const USE_REAL_NANOPUB = process.env.USE_REAL_NANOPUB === 'true';
export const USE_REAL_PARSER = process.env.USE_REAL_PARSER === 'true';
export const USE_REAL_EMAIL = process.env.USE_REAL_EMAIL === 'true';

export const mochaHooks = (): Mocha.RootHookObject => {
  return {
    async beforeAll(this: Mocha.Context) {
      const context: InjectableContext = {};

      Object.assign(this, context);
    },
  };
};
