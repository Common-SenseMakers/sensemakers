import { NotificationFreq } from '../../src/@shared/types/types.notifications';
import {
  AppUser,
  AutopostOption,
  PLATFORM,
} from '../../src/@shared/types/types.user';
import { TestUserCredentials } from './authenticate.users';

export const getMockedUser = (credentials: TestUserCredentials): AppUser => {
  return {
    userId: 'mocked-user-id',
    settings: {
      autopost: {
        [PLATFORM.Nanopub]: {
          value: AutopostOption.MANUAL,
        },
      },
      notificationFreq: NotificationFreq.None,
    },
    [PLATFORM.Twitter]: [
      {
        user_id: 'mocked-twitter-user-id',
        signupDate: Date.now(),
        read: {
          accessToken: '',
          expiresAtMs: 9999999999,
          expiresIn: 9999999999,
          refreshToken: '',
        },
        write: {
          accessToken: '',
          expiresAtMs: 9999999999,
          expiresIn: 9999999999,
          refreshToken: '',
        },
      },
    ],
    [PLATFORM.Nanopub]: {},
  };
};
