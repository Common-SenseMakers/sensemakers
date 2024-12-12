import {
  ALL_IDENTITY_PLATFORMS,
  IDENTITY_PLATFORM,
  PLATFORM,
} from '../types/types.platforms';

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

export const parseProfileUrl = (
  profileUrl: string
):
  | {
      username: string;
      platformId: IDENTITY_PLATFORM;
    }
  | undefined => {
  const url = new URL(profileUrl);
  const platformId = PLATFORM_URLS_MAP[url.hostname] || PLATFORM.Mastodon;

  const structured = (() => {
    if (platformId === PLATFORM.Twitter) {
      const [, , , username] = profileUrl.split('/');
      return { username, platformId };
    }
    if (platformId === PLATFORM.Bluesky) {
      const [, , , , username] = profileUrl.split('/');
      return { username, platformId };
    }
    if (platformId === PLATFORM.Mastodon) {
      const [, , server, username] = profileUrl.split('/');
      const numberOfAtSymbols = username.split('@').length - 1;
      if (numberOfAtSymbols === 2 && username.startsWith('@')) {
        return { username: username.slice(1), platformId };
      }
      if (numberOfAtSymbols === 1 && username.startsWith('@')) {
        const globalUsername = `${username.slice(1)}@${server}`;
        return { username: globalUsername, platformId };
      }
    }
    return undefined;
  })();
  return structured;
};

export const PLATFORM_URLS_MAP: Record<string, IDENTITY_PLATFORM> = {
  'twitter.com': PLATFORM.Twitter,
  'x.com': PLATFORM.Twitter,
  'bsky.app': PLATFORM.Bluesky,
  'mastodon.social': PLATFORM.Mastodon,
};
