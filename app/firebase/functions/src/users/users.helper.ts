import {
  AppUser,
  DefinedIfTrue,
  PUBLISHABLE_PLATFORMS,
  UserDetailsBase,
} from '../@shared/types/types';

export class UsersHelper {
  /**
   * From a AppUser object return the account of a platform
   * (undefined if not found, throw if _throw = true
   * */
  static getAccounts(
    user: AppUser,
    platformId: PUBLISHABLE_PLATFORMS
  ): UserDetailsBase[] {
    const platformAccounts = user[platformId];

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
    platformId: PUBLISHABLE_PLATFORMS,
    user_id?: string,
    _throw?: T
  ): DefinedIfTrue<T, UserDetailsBase> {
    const platformAccounts = UsersHelper.getAccounts(user, platformId);

    if (platformAccounts.length === 0) {
      return undefined as DefinedIfTrue<T, UserDetailsBase>;
    }
    if (platformAccounts.length === 0 && _throw) {
      throw new Error('Platform account not found');
    }

    const account = user_id
      ? platformAccounts.find((p) => p.user_id === user_id)
      : platformAccounts[0];

    if (!account) {
      return undefined as DefinedIfTrue<T, UserDetailsBase>;
    }

    return account as DefinedIfTrue<T, UserDetailsBase>;
  }
}
