import { PLATFORM } from '../../src/@shared/types/types.platforms';
import { logger } from '../../src/instances/logger';
import { processInBatches } from '../migration.utils';
import { servicesSource, servicesTarget } from '../migrations.services';
import { processPost } from './process.post';
import { processUser } from './process.user';

const DEBUG = true;

(async () => {
  /**
   * All users should move their profiles from the Users into the Profiles collection. The profiles should also change to
   * be a generic PlatformProfile object.
   */
  const usersIds = await servicesSource.users.repo.getAll();
  const users = await Promise.all(
    usersIds.map((userId) =>
      servicesSource.db.run((managerSource) =>
        servicesSource.users.repo.getUser(userId, managerSource, true)
      )
    )
  );

  if (DEBUG) logger.debug(`${users.length} users found`);

  await servicesTarget.db.clear();

  /** create users */
  await Promise.all(users.map((user) => processUser(user, servicesTarget)));

  if (DEBUG) logger.debug(`users migration done`);

  const posts =
    await servicesSource.postsManager.processing.posts.getAllOfQuery(
      {
        userId: 'nanopub:0x23fC0DAb9BD663d1bb64B0867d6a00FbC8f0D08A',
        origins: [PLATFORM.Twitter],
        fetchParams: { expectedAmount: 100 },
      },
      undefined
    );

  if (DEBUG) logger.debug(`${posts.length} posts found`);

  await processInBatches(
    posts.map(
      (post) => () => processPost(post, servicesSource, servicesTarget)
    ),
    10
  );

  /** All platform posts should have the post_id in the root */

  /** Create Triples collection */
})();
