import { AppUserRead, PLATFORM } from '../shared/types/types';

export function getPlatformProfile(
  user: AppUserRead,
  platform: PLATFORM,
  authorId: string
) {
  if (!user) {
    return undefined;
  }
  if (platform === PLATFORM.Local) {
    return undefined;
  }
  const platformProfiles = user[platform];
  if (!platformProfiles) {
    return undefined;
  }
  for (const platformProfile of platformProfiles) {
    if (`${platform}:${platformProfile.user_id}` === authorId) {
      const profile = platformProfile.profile;
      return profile;
    }
  }
  return undefined;
}
