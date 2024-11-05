export enum PlatformsKeys {
  XTwitter = 'platforms-s001',
  ORCID = 'platforms-s002',
  TweetX = 'platforms-s003',
  ThreadX = 'platforms-s004',
  TootMastodon = 'platforms-s005',
  ThreadMastodon = 'platforms-s006',
  PostBluesky = 'platforms-s007',
  ThreadBluesky = 'platforms-s008',
}

export const platformsValues: Record<PlatformsKeys, string> = {
  [PlatformsKeys.XTwitter]: 'X · Twitter',
  [PlatformsKeys.ORCID]: 'ORCID',
  [PlatformsKeys.TweetX]: 'X · Tweet',
  [PlatformsKeys.ThreadX]: 'X · Thread',
  [PlatformsKeys.TootMastodon]: 'Mastodon · Toot',
  [PlatformsKeys.ThreadMastodon]: 'Mastodon · Thread',
  [PlatformsKeys.PostBluesky]: 'Bluesky · Post',
  [PlatformsKeys.ThreadBluesky]: 'Bluesky · Thread',
};
