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
  static getAccount<T extends boolean>(
    user: AppUser,
    platformId: PUBLISHABLE_PLATFORMS,
    user_id: string | undefined,
    _throw: T
  ): DefinedIfTrue<T, UserDetailsBase> {
    const platformAccounts = user[platformId];

    if (!platformAccounts && _throw) {
      throw new Error('Platform account not found');
    }

    if (!platformAccounts) {
      return undefined as DefinedIfTrue<T, UserDetailsBase>;
    }

    const account = user_id
      ? platformAccounts.find((p) => p.user_id === user_id)
      : platformAccounts[0];

    if (!platformAccounts && _throw) {
      throw new Error('Platform account not found');
    }

    if (!account) {
      return undefined as DefinedIfTrue<T, UserDetailsBase>;
    }

    return account as DefinedIfTrue<T, UserDetailsBase>;
  }
}
