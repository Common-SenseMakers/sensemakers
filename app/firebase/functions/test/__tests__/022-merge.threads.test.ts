import { expect } from 'chai';

import { PlatformPostCreate } from '../../src/@shared/types/types.platform.posts';
import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { logger } from '../../src/instances/logger';
import { resetDB } from '../utils/db';
import {
  brokenThreadWithRoot,
  brokenThreadWithRootNotPartOfMain,
  brokenThreadWithoutRoot,
  rootThread,
} from './022.test.data';
import {
  USE_REAL_BLUESKY,
  USE_REAL_MASTODON,
  USE_REAL_PARSER,
  USE_REAL_TWITTER,
} from './setup';
import { getTestServices } from './test.services';

describe.only('022 Merge Broken Threads', () => {
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

  beforeEach(async () => {
    logger.debug('resetting DB');
    await resetDB();

    /** ARRANGE the existing thread */
    const platformPostCreate: PlatformPostCreate = (
      services.postsManager as any
    ).initPlatformPost(PLATFORM.Bluesky, rootThread);

    const platformPostCreated = await services.db.run(async (manager) => {
      return services.postsManager.processing.createOrMergePlatformPost(
        platformPostCreate,
        manager
      );
    });
    expect(platformPostCreated).to.exist;
  });

  it('merges a broken thread with an existing thread', async () => {
    const { postsManager } = services;

    /** ACT merge the broken thread into the existing thread */
    const brokenThreadPlatformPostCreate: PlatformPostCreate = (
      postsManager as any
    ).initPlatformPost(PLATFORM.Bluesky, brokenThreadWithRoot);

    const mergedPlatformPostCreated = await services.db.run(async (manager) => {
      return postsManager.processing.createOrMergePlatformPost(
        brokenThreadPlatformPostCreate,
        manager
      );
    });

    /** ASSERT the broken thread has been merged into the existing thread */
    expect(mergedPlatformPostCreated).to.exist;
    expect(mergedPlatformPostCreated?.post.generic.thread.length).to.equal(4);
  });

  it('ignores a broken thread when the root thread is not found', async () => {
    const { postsManager } = services;

    /** ACT merge the broken thread into the existing thread */
    const brokenThreadPlatformPostCreate: PlatformPostCreate = (
      postsManager as any
    ).initPlatformPost(PLATFORM.Bluesky, brokenThreadWithoutRoot);

    const mergedPlatformPostCreated = await services.db.run(async (manager) => {
      return postsManager.processing.createOrMergePlatformPost(
        brokenThreadPlatformPostCreate,
        manager
      );
    });

    /** ASSERT the broken thread has been ignored */
    expect(mergedPlatformPostCreated).to.not.exist;
  });
  it("ignores a broken thread with existing root thead but isn't part of the roots main thread", async () => {
    const { postsManager } = services;

    /** ACT merge the broken thread into the existing thread */
    const brokenThreadPlatformPostCreate: PlatformPostCreate = (
      postsManager as any
    ).initPlatformPost(PLATFORM.Bluesky, brokenThreadWithRootNotPartOfMain);

    const mergedPlatformPostCreated = await services.db.run(async (manager) => {
      return postsManager.processing.createOrMergePlatformPost(
        brokenThreadPlatformPostCreate,
        manager
      );
    });

    /** ASSERT the broken thread has been ignored */
    expect(mergedPlatformPostCreated).to.not.exist;
  });
});
