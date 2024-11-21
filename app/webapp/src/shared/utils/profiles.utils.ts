import { ALL_IDENTITY_PLATFORMS, PLATFORM } from '../types/types.platforms';

export const getProfileId = (platform: PLATFORM, user_id: string) =>
  `${platform}-${user_id}`;

export const splitProfileId = (profileId: string) => {
  for (const platform of ALL_IDENTITY_PLATFORMS) {
    if (profileId.startsWith(`${platform}-`)) {
      return {
        platform,
        user_id: profileId.replace(`${platform}-`, ''),
      };
    }
  }
  throw new Error(`Cant split unexpected profileId ${profileId}`);
};
