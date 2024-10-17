import {
  ALL_IDENTITY_PLATFORMS,
  PLATFORM,
} from '../../src/@shared/types/types.platforms';
import {
  AccountProfileBase,
  AccountProfileCreate,
} from '../../src/@shared/types/types.profiles';
import {
  AccountCredentials,
  AppUser,
  AppUserCreate,
} from '../../src/@shared/types/types.user';
import { DEBUG } from '../../src/emailSender/email.sender.service';
import { logger } from '../../src/instances/logger';
import { Services } from '../../src/instances/services';
import { getGlobalMastodonUsername } from '../../src/platforms/mastodon/mastodon.utils';
import { servicesTarget } from '../migrations.services';

export const processUser = async (user: AppUser, services: Services) => {
  await services.db.run(
    async (manager) => {
      if (DEBUG) logger.debug(`processing ${user.userId}`);

      /** create profiles */
      await Promise.all(
        ALL_IDENTITY_PLATFORMS.map(async (platformId) => {
          const accounts = (user as any)[platformId] || [];

          return Promise.all(
            accounts.map(async (account: any) => {
              if (DEBUG) logger.debug(`${user.userId} account`, { account });
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

              /** this reads the profile from the platforms */
              const profileBase: AccountProfileBase = {
                user_id,
                fetched,
                profile: account.profile,
                userId: user.userId,
              };

              const profileCreate: AccountProfileCreate = {
                ...profileBase,
                platformId: platformId,
              };

              const id = servicesTarget.users.profiles.create(
                profileCreate,
                manager
              );

              if (DEBUG)
                logger.debug(`profile ${id} created`, { profileCreate });
            })
          );
        })
      );

      /** create user */
      const twitterAccounts = (user as any)['twitter'] || [];
      const nanopubAccounts = (user as any)['nanopub'] || [];
      const orcidAccounts = (user as any)['orcid'] || [];

      const accounts = [
        ...twitterAccounts,
        ...nanopubAccounts,
        ...orcidAccounts,
      ];

      accounts.forEach((account: any) => {
        delete account['fetched'];
        delete account['profile'];

        const credentials: AccountCredentials = {};

        if (account['read']) {
          credentials.read = { ...account['read'] };
        }

        if (account['write']) {
          credentials.write = { ...account['write'] };
        }

        delete account['read'];
        delete account['write'];

        account.credentials = credentials;
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
        manager
      );
    },
    undefined,
    undefined,
    `USER ${user.userId} tx`,
    false
  );
};
