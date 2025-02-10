import { TestUserCredentials } from '../../src/@shared/types/types.user';
import { TestProfileData } from './setup';

export const testCredentials: TestUserCredentials[] = process.env
  .TEST_USER_ACCOUNTS
  ? JSON.parse(process.env.TEST_USER_ACCOUNTS)
  : [];

export const testProfilesBase: TestProfileData[] = process.env
  .TEST_PROFILES_ACCOUNTS
  ? JSON.parse(process.env.TEST_PROFILES_ACCOUNTS)
  : [];

if (!testCredentials) {
  throw new Error('test acccounts undefined');
}

if (!testProfilesBase) {
  throw new Error('test profiles undefined');
}
