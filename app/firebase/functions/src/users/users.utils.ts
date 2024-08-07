import { randomBytes } from 'crypto';

import { PLATFORM } from '../@shared/types/types.user';

export function getPrefixedUserId(platform: PLATFORM, user_id: string) {
  return `${platform}:${user_id}`;
}

export function getUniquePostId(platform: PLATFORM, post_id: string) {
  return `${platform}:${post_id}`;
}
export const getUsernameTag = (platformId: PLATFORM) => {
  if (platformId === PLATFORM.Twitter) {
    return 'username';
  }

  throw new Error('unexpected for now');
};

export const generateToken = () => {
  return randomBytes(16).toString('hex'); // generates a 32-character hex string
};
