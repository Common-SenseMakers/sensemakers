import { Context } from 'mocha';

import { loadEnv } from '../../load.env';
import { resetDB } from '../__tests_support__/db';
import { LocalLogger, LogLevel } from '../__tests_support__/test.logger';

loadEnv();

export type InjectableContext = Readonly<{
  // properties injected using the Root Mocha Hooks
}>;

(global as any).logger = new LocalLogger(LogLevel.debug, LogLevel.debug, [
  'Testing authorization',
]);

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
