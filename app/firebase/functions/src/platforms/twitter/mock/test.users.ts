import { TestUserCredentials } from '../../../@shared/types/types.user';
import {
  TEST_USER_ACCOUNTS,
  USE_REAL_TWITTERX,
} from '../../../config/config.runtime';
import { logger } from '../../../instances/logger';

/** must be a function to make sure it is called at runtime */
export const getTestCredentials = () => {
  const testUserAccountsStr = TEST_USER_ACCOUNTS.value();
  if (!USE_REAL_TWITTERX.value() && testUserAccountsStr) {
    logger.debug('using mock twitter', testUserAccountsStr);
    const testCredentials = JSON.parse(testUserAccountsStr);

    if (!testCredentials) {
      throw new Error('test acccounts undefined');
    }
    if (testCredentials.length < 1) {
      throw new Error('not enough twitter account credentials provided');
    }

    return testCredentials as TestUserCredentials[];
  }
  return undefined;
};
