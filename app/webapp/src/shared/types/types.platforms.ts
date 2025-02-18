export enum PLATFORM {
  Local = 'local', // local referst to out platform
  Orcid = 'orcid',
  Twitter = 'twitter',
  Mastodon = 'mastodon',
  Bluesky = 'bluesky',
}

export type PUBLISHABLE_PLATFORM =
  | PLATFORM.Twitter
  | PLATFORM.Mastodon
  | PLATFORM.Bluesky;

export const ALL_SOURCE_PLATFORMS: PUBLISHABLE_PLATFORM[] = [
  PLATFORM.Twitter,
  PLATFORM.Mastodon,
  PLATFORM.Bluesky,
];

export const ALL_PUBLISH_PLATFORMS: PUBLISHABLE_PLATFORM[] = [
  PLATFORM.Twitter,
  PLATFORM.Mastodon,
  PLATFORM.Bluesky,
];

export type IDENTITY_PLATFORM =
  | PLATFORM.Orcid
  | PLATFORM.Twitter
  | PLATFORM.Mastodon
  | PLATFORM.Bluesky;

export const ALL_IDENTITY_PLATFORMS: IDENTITY_PLATFORM[] = [
  PLATFORM.Twitter,
  PLATFORM.Orcid,
  PLATFORM.Mastodon,
  PLATFORM.Bluesky,
];

export const PLATFORM_SESSION_REFRESH_ERROR = 'platform-session-refresh';

export class PlatformSessionRefreshError extends Error {
  constructor(error: any) {
    super(String(error));
    this.name = PLATFORM_SESSION_REFRESH_ERROR;
  }
}
