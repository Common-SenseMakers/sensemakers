import { Context } from 'mocha';

import { env } from '../../src/config/typedenv';
import { resetDB } from '../__tests_support__/db';
import { LocalLogger, LogLevel } from '../__tests_support__/test.logger';

export const LOG_LEVEL_MSG = env.LOG_LEVEL_MSG;
export const LOG_LEVEL_OBJ = env.LOG_LEVEL_OBJ;

export type InjectableContext = Readonly<{
  // properties injected using the Root Mocha Hooks
}>;

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
