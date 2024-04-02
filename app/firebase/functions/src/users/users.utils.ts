import { PLATFORM } from '../@shared/types';

export function getPrefixedUserId(platform: PLATFORM, user_id: string) {
  return `${platform}:${user_id}`;
}

export function getUniquePostId(platform: PLATFORM, post_id: string) {
  return `${platform}:${post_id}`;
}
