import {
  ALL_IDENTITY_PLATFORMS,
  ALL_PUBLISH_PLATFORMS,
  IDENTITY_PLATFORM,
  PLATFORM,
  PUBLISHABLE_PLATFORM,
} from '../@shared/types/types.platforms';
import { AppPostFull } from '../@shared/types/types.posts';
import { PlatformProfile } from '../@shared/types/types.profiles';
import {
  AccountDetailsBase,
  AccountDetailsRead,
  AppUser,
  AppUserCreate,
  AppUserRead,
  DefinedIfTrue,
} from '../@shared/types/types.user';
import { parseBlueskyURI } from '../@shared/utils/bluesky.utils';
import { parseMastodonGlobalUsername } from '../@shared/utils/mastodon.utils';
import { getProfileId } from '../@shared/utils/profiles.utils';

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

  static getProfiles<P extends PlatformProfile = PlatformProfile>(
    user: AppUserRead,
    platformId: IDENTITY_PLATFORM
  ): AccountDetailsRead<P>[] {
    const platformProfiles = user.profiles[platformId];

    if (!platformProfiles) {
      return [];
    }

    return platformProfiles as AccountDetailsRead<P>[];
  }

  static getProfile<
    T extends boolean,
    P extends PlatformProfile = PlatformProfile,
  >(
    user: AppUserRead,
    platformId: IDENTITY_PLATFORM,
    user_id?: string,
    _throw?: T
  ): DefinedIfTrue<T, AccountDetailsRead<P>> {
    const platformProfiles = UsersHelper.getProfiles<P>(user, platformId);

    if (platformProfiles.length === 0 && _throw) {
      throw new Error('Platform profile not found');
    }

    if (platformProfiles.length === 0) {
      return undefined as DefinedIfTrue<T, AccountDetailsRead<P>>;
    }

    const account = user_id
      ? platformProfiles.find((p) => p.user_id === user_id)
      : platformProfiles[0];

    if (!account) {
      return undefined as DefinedIfTrue<T, AccountDetailsRead<P>>;
    }

    return account as DefinedIfTrue<T, AccountDetailsRead<P>>;
  }

  static getOriginAccountDetails(user: AppUserRead, post: AppPostFull) {
    const platformUsername = post.generic.author.username;
    const platformName = post.generic.author.name || platformUsername;

    const originAccount = UsersHelper.getProfile<boolean, PlatformProfile>(
      user,
      post.origin as PUBLISHABLE_PLATFORM
    );

    if (!originAccount) {
      throw new Error('Platform account details for post origin not found');
    }

    const platformPost =
      post.mirrors &&
      post.mirrors.find(
        (platformPost) => platformPost.platformId === post.origin
      )?.posted;

    const platformPostId = platformPost?.post_id;

    const {
      platformAccountUrl,
      platformPostUrl,
    }: {
      platformAccountUrl: string | undefined;
      platformPostUrl: string | undefined;
    } = (() => {
      if (post.origin === PLATFORM.Twitter) {
        return {
          platformAccountUrl: platformUsername
            ? `https://x.com/${platformUsername}`
            : undefined,
          platformPostUrl: platformPostId
            ? `https://x.com/${platformUsername}/status/${platformPostId}`
            : undefined,
        };
      }
      if (post.origin === PLATFORM.Mastodon) {
        const { localUsername, server } =
          parseMastodonGlobalUsername(platformUsername);
        return {
          platformAccountUrl: platformUsername
            ? `https://${server}/@${localUsername}`
            : undefined,
          platformPostUrl: platformPostId
            ? `https://${server}/@${platformUsername}/${platformPostId}`
            : undefined,
        };
      }
      if (post.origin === PLATFORM.Bluesky) {
        return {
          platformAccountUrl: platformUsername
            ? `https://bsky.app/profile/${platformUsername}`
            : undefined,
          platformPostUrl: platformPostId
            ? `https://bsky.app/profile/${platformUsername}/post/${parseBlueskyURI(platformPostId).rkey}`
            : undefined,
        };
      } else {
        return {
          platformAccountUrl: undefined,
          platformPostUrl: undefined,
        };
      }
    })();

    return {
      platformAccountUrl,
      platformName,
      platformPostUrl,
    };
  }

  static accountsToAccountsIds = (accounts: AppUser['accounts']) => {
    let newAccountsIds: string[] = [];
    ALL_IDENTITY_PLATFORMS.forEach((_platform) => {
      if (accounts[_platform]) {
        accounts[_platform].forEach((a) => {
          newAccountsIds.push(getProfileId(_platform, a.user_id));
        });
      }
    });
    return newAccountsIds;
  };
}
