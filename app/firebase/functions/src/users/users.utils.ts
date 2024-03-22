import { PLATFORM } from '../@shared/types';

export function getPrefixedUserId(platform: PLATFORM, user_id: string) {
  return `${platform}:${user_id}`;
}
