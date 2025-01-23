import { services } from './scripts.services';

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  await services.profiles.parseAndAdd({
    cluster: 'test-cluster',
    profilesUrls: [
      'https://bsky.app/profile/adammarblestone.bsky.social',
      'https://x.com/michael_nielsen',
      'https://bsky.app/profile/elisabethbik.bsky.social',
    ],
  });
})();
