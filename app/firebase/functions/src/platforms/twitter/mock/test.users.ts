import { TestUserCredentials } from '../../../@shared/types/types.user';
import {
  TEST_USER_ACCOUNTS,
  USE_REAL_TWITTERX,
} from '../../../config/config.runtime';

export let testCredentialsRuntime: TestUserCredentials[] = [];

if (!USE_REAL_TWITTERX.value()) {
  testCredentialsRuntime = JSON.parse(TEST_USER_ACCOUNTS.value() as string);

  if (!testCredentialsRuntime) {
    throw new Error('test acccounts undefined');
  }
  if (testCredentialsRuntime.length < 1) {
    throw new Error('not enough twitter account credentials provided');
  }
}
