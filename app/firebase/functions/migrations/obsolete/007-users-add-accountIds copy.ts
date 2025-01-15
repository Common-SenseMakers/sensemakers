import { ALL_IDENTITY_PLATFORMS } from '../../src/@shared/types/types.platforms';
import { processInBatches } from '../../src/db/db.utils';
import { UsersHelper } from '../../src/users/users.helper';
import { servicesSource } from '../migrations.services';

const DEBUG = true;

// Read posts from a source and create them in the target (uses new ids and creates the platform posts and profiles)
(async () => {
  const usersIds = await servicesSource.users.repo.getAll();

  const processUser = async (userId: string) => {
    try {
      if (DEBUG) console.log(`Processing userId ${userId}`);

      await servicesSource.db.run(async (managerSource) => {
        const user = await servicesSource.users.repo.getUser(
          userId,
          managerSource,
          true
        );
        await Promise.all(
          ALL_IDENTITY_PLATFORMS.map(async (platform) => {
            const accounts = UsersHelper.getAccounts(user, platform);

            await Promise.all(
              accounts.map(async (account) => {
                if (DEBUG)
                  console.log(
                    `Setting user account ${userId} - platform: ${platform}`,
                    { account }
                  );

                return servicesSource.users.repo.setAccountDetails(
                  userId,
                  platform,
                  account,
                  managerSource
                );
              })
            );
          })
        );
      });
    } catch (error) {
      console.error(`Error processing user ${userId}`, error);
    }
  };

  await processInBatches(
    usersIds.map((userId) => () => processUser(userId)),
    10
  );
})();
