import { TestUserCredentials } from '../../src/@shared/types/types.user';
import { TestProfileData } from './setup';

export const testCredentials: TestUserCredentials[] = JSON.parse(
  process.env.TEST_USER_ACCOUNTS as string
);

export const testProfilesBase: TestProfileData[] = JSON.parse(
  process.env.TEST_PROFILES_ACCOUNTS as string
);

if (!testCredentials) {
  throw new Error('test acccounts undefined');
}

if (!testProfilesBase) {
  throw new Error('test profiles undefined');
}
