import { logger } from '../src/instances/logger';
import { UsersHelper } from '../src/users/users.helper';
import { services } from './scripts.services';

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const userId = process.env.USER_ID;
  if (!userId) {
    throw new Error('USER_ID not defined in .script.env');
  }

  await services.db.run(async (manager) => {
    const user = await services.users.repo.getUser(userId, manager, true);
    logger.info(`User found: ${user.userId}`, { user });

    const accountsIds = UsersHelper.accountsToAccountsIds(user.accounts);

    await Promise.all(
      accountsIds.map(async (accountId) => {
        const profile = await services.users.profiles.getByProfileId(
          accountId,
          manager
        );
        logger.info(
          `Profile found: userId: ${user.userId} - profileId: ${profile?.id}`,
          { profile }
        );
      })
    );

    // const posts = await services.postsManager.processing.posts.getMany({
    //   fetchParams: { expectedAmount: 10 },
    //   userId,
    // });

    // logger.info(`${posts.length} Posts for user: ${user.userId} read`);
    // posts.forEach((post) => {
    //   const postClean = { ...post };
    //   delete postClean.originalParsed?.support;
    //   delete postClean.originalParsed?.metadata;

    //   logger.info(`Posts ${post.id}`, { post });
    // });
  });
})();
