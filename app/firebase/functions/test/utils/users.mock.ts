import { NotificationFreq } from '../../src/@shared/types/types.notifications';
import { PLATFORM } from '../../src/@shared/types/types.platforms';
import {
  AppUser,
  AutopostOption,
  TestUserCredentials,
} from '../../src/@shared/types/types.user';

export const getMockedUser = (credentials: TestUserCredentials): AppUser => {
  return {
    userId: credentials.userId,
    signupDate: 1719938012425,
    settings: {
      autopost: {
        [PLATFORM.Nanopub]: {
          value: AutopostOption.MANUAL,
        },
      },
      notificationFreq: NotificationFreq.None,
    },
    accounts: {
      [PLATFORM.Mastodon]: [
        {
          user_id: credentials[PLATFORM.Mastodon].id,
          signupDate: 0,
          credentials: {
            read: {
              accessToken: '',
            },
            write: {
              accessToken: '',
            },
          },
        },
      ],
      [PLATFORM.Bluesky]: [
        {
          user_id: credentials[PLATFORM.Bluesky].id,
          signupDate: 0,
          credentials: {
            read: {
              username: '',
              appPassword: '',
            },
            write: {
              username: '',
              appPassword: '',
            },
          },
        },
      ],
      [PLATFORM.Twitter]: [
        {
          user_id: credentials[PLATFORM.Twitter].id,
          signupDate: 0,

          credentials: {
            read: {
              accessToken: '',
              refreshToken: '',
              expiresIn: 7200,
              expiresAtMs: 9718901096756,
            },
            write: {
              accessToken: '',
              refreshToken: '',
              expiresIn: 7200,
              expiresAtMs: 9718901096756,
            },
          },
        },
      ],
      [PLATFORM.Nanopub]: [
        {
          signupDate: 0,
          user_id: '0x59b277c77F738e9B758B73Dd9Bfc6DE36D6e0EB1',
          credentials: {},
        },
      ],
    },
  };
};
