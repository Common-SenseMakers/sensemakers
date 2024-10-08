import { SciFilterClassfication } from '../@shared/types/types.parser';
import {
  ALL_PUBLISH_PLATFORMS,
  IDENTITY_PLATFORM,
  PLATFORM,
  PUBLISHABLE_PLATFORM,
} from '../@shared/types/types.platforms';
import { AppPostFull } from '../@shared/types/types.posts';
import { AppPost } from '../@shared/types/types.posts';
import {
  AccountDetailsBase,
  AccountDetailsRead,
  AppUser,
  AppUserCreate,
  AppUserRead,
  AutopostOption,
  DefinedIfTrue,
} from '../@shared/types/types.user';
import { extractRKeyFromURI } from '../@shared/utils/bluesky.utils';

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

  static getProfiles<P = any>(
    user: AppUserRead,
    platformId: IDENTITY_PLATFORM
  ): AccountDetailsRead<P>[] {
    const platformProfiles = user.profiles[platformId];

    if (!platformProfiles) {
      return [];
    }

    return platformProfiles as AccountDetailsRead<P>[];
  }

  static getProfile<T extends boolean, P = any>(
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
      return undefined as DefinedIfTrue<T, AccountDetailsRead>;
    }

    return account as DefinedIfTrue<T, AccountDetailsRead>;
  }

  static getOriginAccountDetails(user: AppUserRead, post: AppPostFull) {
    const platformUsername = post.generic.author.username;
    const platformName = post.generic.author.name || platformUsername;

    let platformAccountUrl: string | undefined;
    let platformPostUrl: string | undefined;

    const twitterAccount = UsersHelper.getProfile(user, PLATFORM.Twitter);
    const mastodonAccount = UsersHelper.getProfile(user, PLATFORM.Mastodon);
    const blueskyAccount = UsersHelper.getProfile(user, PLATFORM.Bluesky);

    const platformPost = post.mirrors.find(
      (platformPost) => platformPost.platformId === post.origin
    )?.posted;

    const platformPostId = platformPost?.post_id;

    if (twitterAccount && post.origin === PLATFORM.Twitter) {
      platformAccountUrl = platformUsername
        ? `https://x.com/${platformUsername}`
        : undefined;
      platformPostUrl = platformPostId
        ? `https://x.com/${platformUsername}/status/${platformPostId}`
        : undefined;
    } else if (mastodonAccount && post.origin === PLATFORM.Mastodon) {
      const server = mastodonAccount.profile?.mastodonServer;
      platformAccountUrl =
        platformUsername && server
          ? `https://${server}/@${platformUsername}`
          : undefined;
      platformPostUrl =
        platformPostId && server
          ? `https://${server}/@${platformUsername}/${platformPostId}`
          : undefined;
    } else if (blueskyAccount && post.origin === PLATFORM.Bluesky) {
      platformAccountUrl = platformUsername
        ? `https://bsky.app/profile/${platformUsername}`
        : undefined;
      platformPostUrl = platformPostId
        ? `https://bsky.app/profile/${platformUsername}/post/${extractRKeyFromURI(platformPostId)}`
        : undefined;
    } else {
      throw new Error(
        'Platform account details for post origin platform not found'
      );
    }

    return {
      platformAccountUrl,
      platformName,
      platformPostUrl,
    };
  }
}
