import { NotificationFreq } from '../../src/@shared/types/types.notifications';
import {
  AppUser,
  AutopostOption,
  PLATFORM,
} from '../../src/@shared/types/types.user';
import { TestUserCredentials } from './authenticate.users';

export const getMockedUser = (credentials: TestUserCredentials): AppUser => {
  return {
    userId: credentials.userId,
    settings: {
      autopost: {
        [PLATFORM.Nanopub]: {
          value: AutopostOption.MANUAL,
        },
      },
      notificationFreq: NotificationFreq.None,
    },
    platformIds: [
      `${PLATFORM.Twitter}:${credentials.twitter.username}`,
      `${PLATFORM.Nanopub}:${credentials.nanopub.ethPrivateKey}`,
    ],
    [PLATFORM.Twitter]: [
      {
        user_id: credentials[PLATFORM.Twitter].username,
        signupDate: 0,
        profile: {
          profile_image_url:
            'https://pbs.twimg.com/profile_images/1753077803258449920/2vI5Y2Wx_normal.png',
          id: credentials[PLATFORM.Twitter].username,
          name: credentials[PLATFORM.Twitter].username,
          username: credentials[PLATFORM.Twitter].username,
        },
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
    ],
    [PLATFORM.Nanopub]: [
      {
        signupDate: 0,
        user_id: '0x59b277c77F738e9B758B73Dd9Bfc6DE36D6e0EB1',
        profile: {
          ethAddress: '0x59b277c77F738e9B758B73Dd9Bfc6DE36D6e0EB1',
          rsaPublickey:
            '-----BEGIN PUBLIC KEY-----\r\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAj7mSvsl6URu4Vt7hzYWh\r\nn4AqqGHpUabpOUl5YErTWP7xcuK25dVd2RE2NHqL6fUeJQFB9ijKr9jUkVGVVLXa\r\n+A1HOsJXSMVhB8Owv/VnDJwA+92qjA3bN3//H98PR3UOXBmZDNUiwZ2IB6jmDkjO\r\n2NknJKsOpYVE3lc/VRKOATNoi1MFDR4dyDU9XjyPcn/p420GYafEkdoEnuihvML+\r\nr5UwIBzkhs20IQhEZivExUBnxLE/jC2sdUmN0aHlqAGKU0x7uMmrMpx1MekAJ3Ic\r\nLtoUYLyo39eOqfeGE5mgom/XRI4J7TPoFDQdzbKdz+wgkzPDRrQ9L4MCMKc0YJL6\r\nMwIDAQAB\r\n-----END PUBLIC KEY-----\r\n',
          ethToRsaSignature:
            '0xc0416f86379aecce40b0cf959adf40ea9043b1098cee66c80bfe667094ea88914112134c17090ae09ec86e98fc4651436377df05ef16c46afd6fe260bfac76fe1c',
        },
      },
    ],
  };
};
