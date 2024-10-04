import { SciFilterClassfication } from '../@shared/types/types.parser';
import {
  ALL_PUBLISH_PLATFORMS,
  IDENTITY_PLATFORM,
  PLATFORM,
  PUBLISHABLE_PLATFORM,
} from '../@shared/types/types.platforms';
import { AppPost } from '../@shared/types/types.posts';
import {
  AccountDetailsBase,
  AppUser,
  AppUserCreate,
  AutopostOption,
  DefinedIfTrue,
} from '../@shared/types/types.user';

export interface PlatformAccount {
  platform: PUBLISHABLE_PLATFORM;
  account: AccountDetailsBase;
}

export class UsersHelper {
  /**
   * From a AppUser object return the account of a platform
   * (undefined if not found, throw if _throw = true
   * */
  static getAccounts(
    user: AppUser | AppUserCreate,
    platformId: IDENTITY_PLATFORM
  ): AccountDetailsBase[] {
    const platformAccounts = user.accounts[platformId];

    if (!platformAccounts) {
      return [];
    }

    return platformAccounts;
  }

  /**
   * From a AppUser object return the account of a platform
   * (undefined if not found, throw if _throw = true
   * */
  static getAccount<T extends boolean>(
    user: AppUser,
    platformId: IDENTITY_PLATFORM,
    user_id?: string,
    _throw?: T
  ): DefinedIfTrue<T, AccountDetailsBase> {
    const platformAccounts = UsersHelper.getAccounts(user, platformId);

    if (platformAccounts.length === 0 && _throw) {
      throw new Error('Platform account not found');
    }

    if (platformAccounts.length === 0) {
      return undefined as DefinedIfTrue<T, AccountDetailsBase>;
    }

    const account = user_id
      ? platformAccounts.find((p) => p.user_id === user_id)
      : platformAccounts[0];

    if (!account) {
      return undefined as DefinedIfTrue<T, AccountDetailsBase>;
    }

    return account as DefinedIfTrue<T, AccountDetailsBase>;
  }

  static getAllAccounts(user: AppUserCreate | AppUser): PlatformAccount[] {
    const perPlatform = ALL_PUBLISH_PLATFORMS.map((platform) => {
      return {
        platform,
        accounts: UsersHelper.getAccounts(user, platform),
      };
    });

    const allAccounts: PlatformAccount[] = [];
    perPlatform.forEach((p) => {
      p.accounts.forEach((account) => {
        allAccounts.push({ platform: p.platform, account });
      });
    });

    return allAccounts;
  }

  static getAutopostPlatformIds(user: AppUser, post: AppPost): PLATFORM[] {
    const platformIds = (
      Object.keys(user.settings.autopost) as PLATFORM[]
    ).filter((platformId: PLATFORM) => {
      if (platformId !== PLATFORM.Nanopub) {
        throw new Error('Only autopost to nanopub is suported for now');
      }

      /** only if the user has autopost configured as deterministic
       * and the post was detected as reserach using citoid */
      if (
        user.settings.autopost[platformId].value !== AutopostOption.MANUAL &&
        post.originalParsed?.filter_classification ===
          SciFilterClassfication.CITOID_DETECTED_RESEARCH
      ) {
        return true;
      }

      return false;
    });

    return platformIds;
  }
}
