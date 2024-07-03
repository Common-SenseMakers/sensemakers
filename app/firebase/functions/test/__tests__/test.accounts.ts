import { TestUserCredentials } from '../../src/@shared/types/types.user';

export const testCredentials: TestUserCredentials[] = JSON.parse(
  process.env.TEST_USER_ACCOUNTS as string
);

if (!testCredentials) {
  throw new Error('test acccounts undefined');
}
if (testCredentials.length < 1) {
  throw new Error('not enough twitter account credentials provided');
}
