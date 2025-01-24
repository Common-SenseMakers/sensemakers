import { expect } from 'chai';

import { PlatformPostCreate } from '../../src/@shared/types/types.platform.posts';
import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { rootBlueskyThread } from './022-test.data';
import {
  USE_REAL_BLUESKY,
  USE_REAL_MASTODON,
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
} from './setup';
import { getTestServices } from './test.services';

describe('090 Posts', () => {
  const services = getTestServices({
    time: 'mock',
    twitter: USE_REAL_TWITTER
      ? undefined
      : { publish: true, signup: true, fetch: true, get: true },
    bluesky: USE_REAL_BLUESKY
      ? undefined
      : { publish: true, signup: true, fetch: true, get: true },
    mastodon: USE_REAL_MASTODON
      ? undefined
      : { publish: true, signup: true, fetch: true, get: true },
    parser: USE_REAL_PARSER ? 'real' : 'mock',
  });
  it('deletes a post', async () => {
    const platformPostCreate: PlatformPostCreate = (
      services.postsManager as any
    ).initPlatformPost(PLATFORM.Bluesky, rootBlueskyThread);

    const platformPostCreated = await services.db.run(async (manager) => {
      return services.postsManager.processing.createOrMergePlatformPost(
        platformPostCreate,
        manager
      );
    });
    expect(platformPostCreated).to.exist;

    await services.db.run(async (manager) => {
      const post = await services.postsManager.processing.posts.get(
        platformPostCreated!.post.id,
        manager
      );
      const platformPost =
        await services.postsManager.processing.platformPosts.get(
          platformPostCreated!.platformPost.id,
          manager
        );
      expect(post).to.exist;
      expect(platformPost).to.exist;

      await services.postsManager.processing.deletePostFull(post!.id, manager);

      const postDeleted = await services.postsManager.processing.posts.get(
        platformPostCreated!.post.id,
        manager
      );
      const platformPostDeleted =
        await services.postsManager.processing.platformPosts.get(
          platformPostCreated!.platformPost.id,
          manager
        );
      expect(postDeleted).to.exist;
      expect(platformPostDeleted).to.exist;
    });
  });
});
