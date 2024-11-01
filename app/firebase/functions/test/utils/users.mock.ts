import { PLATFORM } from '../../src/@shared/types/types.platforms';
import {
  AppUser,
  AppUserRead,
  TestUserCredentials,
} from '../../src/@shared/types/types.user';

export const getMockedUser = (credentials: TestUserCredentials): AppUser => {
  return {
    userId: credentials.userId,
    signupDate: 1719938012425,
    settings: {},
    accounts: {
      [PLATFORM.Mastodon]: [
        {
          user_id: credentials[PLATFORM.Mastodon].id,
          signupDate: 0,
          credentials: {
            read: {
              accessToken: '',
              server: '',
            },
            write: {
              accessToken: '',
              server: '',
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
    },
  };
};

export const getMockedUserRead = (
  credentials: TestUserCredentials
): AppUserRead => {
  return {
    userId: credentials.userId,
    signupDate: 1719938012425,
    settings: {},
    profiles: {
      [PLATFORM.Mastodon]: [
        {
          user_id: credentials[PLATFORM.Mastodon].id,
          read: true,
          write: false,
          profile: {
            id: '1234',
            username: 'test@test.com',
            displayName: 'Test User',
            avatar: 'https://test.com/avatar.jpg',
            description: 'Test description',
          },
        },
      ],
      [PLATFORM.Bluesky]: [
        {
          user_id: credentials[PLATFORM.Bluesky].id,
          read: true,
          write: false,
          profile: {
            id: '1234',
            username: 'test',
            displayName: 'Test User',
            avatar: 'https://test.com/avatar.jpg',
          },
        },
      ],
      [PLATFORM.Twitter]: [
        {
          user_id: credentials[PLATFORM.Twitter].id,
          read: true,
          write: false,
          profile: {
            id: '1234',
            username: 'test',
            displayName: 'Test User',
            avatar: 'https://test.com/avatar.jpg',
            description: 'Test description',
          },
        },
      ],
    },
  };
};
