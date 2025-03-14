import { TestUserCredentials } from '../../@shared/types/types.user';
import { logger } from '../../instances/logger';

const DEBUG = false;

/** must be a function to make sure it is called at runtime */
export const getTestCredentials = (testUserAccountsStr: string) => {
  if (testUserAccountsStr) {
    if (DEBUG) logger.debug('using mock twitter', testUserAccountsStr);
    const testCredentials = JSON.parse(testUserAccountsStr);

    if (!testCredentials) {
      throw new Error('test acccounts undefined');
    }

    return testCredentials as TestUserCredentials[];
  }
  return undefined;
};
