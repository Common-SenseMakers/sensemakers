import { TestUserCredentials } from '../../src/@shared/types/types.user';

export const testCredentials: TestUserCredentials[] = JSON.parse(
  process.env.TEST_USER_ACCOUNTS as string
);

if (!testCredentials) {
  throw new Error('test acccounts undefined');
}
