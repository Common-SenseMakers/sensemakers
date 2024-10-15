import {
  ALL_IDENTITY_PLATFORMS,
  PLATFORM,
} from '../src/@shared/types/types.platforms';
import { AppUserCreate } from '../src/@shared/types/types.user';
import { logger } from '../src/instances/logger';
import { getGlobalMastodonUsername } from '../src/platforms/mastodon/mastodon.utils';
import { getProfileId } from '../src/profiles/profiles.repository';
import { servicesSource, servicesTarget } from './migrations.services';

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

  await Promise.all(
    users.map(async (user) => {
      await servicesTarget.db.run(
        async (managerTarget) => {
          if (DEBUG) logger.debug(`processing ${user.userId}`);

          /** create profiles */
          await Promise.all(
            ALL_IDENTITY_PLATFORMS.map(async (platformId) => {
              const accounts = (user as any)[platformId] || [];

              return Promise.all(
                accounts.map(async (account: any) => {
                  if (DEBUG)
                    logger.debug(`${user.userId} account`, { account });
                  const fetched = (account as any)['fetched'];

                  const user_id = (() => {
                    if (platformId === PLATFORM.Mastodon) {
                      return getGlobalMastodonUsername(
                        (account as any)['profile'].username,
                        (account as any)['profile'].mastodonServer
                      );
                    }
                    return account.user_id;
                  })();

                  /** create profile */
                  const profileId = getProfileId(platformId, user_id);

                  /** this reads the profile from the platforms */
                  await servicesTarget.users.getOrCreateProfile(
                    profileId,
                    managerTarget
                  );

                  /** The fetched status needs to change from the User account to the profile */
                  if (fetched) {
                    await servicesTarget.users.profiles.setAccountProfileFetched(
                      platformId,
                      account.user_id,
                      fetched,
                      managerTarget
                    );
                  }
                })
              );
            })
          );

          /** create user */
          const twitterAccounts = (user as any)['twitter'] || [];
          const nanopubAccounts = (user as any)['nanopub'] || [];

          twitterAccounts.forEach((account: any) => {
            delete account['fetched'];
            delete account['profile'];
          });

          nanopubAccounts.forEach((account: any) => {
            delete account['fetched'];
            delete account['profile'];
          });

          const userCreate: AppUserCreate = {
            settings: user.settings,
            signupDate: user.signupDate,
            email: user.email,
            accounts: {
              twitter: twitterAccounts,
              nanopub: nanopubAccounts,
            },
          };

          await servicesTarget.users.repo.createUser(
            user.userId,
            userCreate,
            managerTarget
          );
        },
        undefined,
        undefined,
        `USER ${user.userId} tx`,
        true
      );
    })
  );

  if (DEBUG) logger.debug(`done`);

  /** The user_id of Mastodon should be updated */

  /** All posts should be updated with the authorProfileId and the authorUserId */

  /** All posts generic property should have the username updated for Mastodon,
   * and the avatarUrl should be added */

  /** All platform posts should have the post_id in the root */

  /** Mastodon platform posts .posted object should have the post_id and user_id updated */

  /** Set Triples collection */

  /** Set Updates collection */
})();
