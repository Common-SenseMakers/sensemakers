import { SciFilterClassfication } from '../@shared/types/types.parser';
import { AppPost, AppPostFull } from '../@shared/types/types.posts';
import {
  ALL_PUBLISH_PLATFORMS,
  AppUser,
  AppUserCreate,
  AutopostOption,
  DefinedIfTrue,
  IDENTITY_PLATFORMS,
  PLATFORM,
  PUBLISHABLE_PLATFORMS,
  UserDetailsBase,
} from '../@shared/types/types.user';
import { extractRKeyFromURI } from '../platforms/bluesky/bluesky.utils';

export interface PlatformDetails {
  platform: PUBLISHABLE_PLATFORMS;
  account: UserDetailsBase;
}

export class UsersHelper {
  /**
   * From a AppUser object return the account of a platform
   * (undefined if not found, throw if _throw = true
   * */
  static getAccounts(
    user: AppUser | AppUserCreate,
    platformId: IDENTITY_PLATFORMS
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
    platformId: IDENTITY_PLATFORMS,
    user_id?: string,
    _throw?: T
  ): DefinedIfTrue<T, UserDetailsBase> {
    const platformAccounts = UsersHelper.getAccounts(user, platformId);

    if (platformAccounts.length === 0 && _throw) {
      throw new Error('Platform account not found');
    }

    if (platformAccounts.length === 0) {
      return undefined as DefinedIfTrue<T, UserDetailsBase>;
    }

    const account = user_id
      ? platformAccounts.find((p) => p.user_id === user_id)
      : platformAccounts[0];

    if (!account) {
      return undefined as DefinedIfTrue<T, UserDetailsBase>;
    }

    return account as DefinedIfTrue<T, UserDetailsBase>;
  }

  static getAllAccounts(user: AppUserCreate | AppUser): PlatformDetails[] {
    const perPlatform = ALL_PUBLISH_PLATFORMS.map((platform) => {
      return {
        platform,
        accounts: UsersHelper.getAccounts(user, platform),
      };
    });

    const allAccounts: PlatformDetails[] = [];
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

  /** return a list of platformIds which have at least one account that hasn't yet fetched from platform */
  static platformsWithoutFetch(user: AppUser): PUBLISHABLE_PLATFORMS[] {
    return Array.from(
      new Set(
        UsersHelper.getAllAccounts(user)
          .filter((platformDetails) => !platformDetails.account.fetched)
          .map((platformDetails) => platformDetails.platform)
      )
    );
  }

  static getOriginAccountDetails(user: AppUser, post: AppPostFull) {
    const platformUsername = post.generic.author.username;
    const platformName = post.generic.author.name || platformUsername;

    let platformAccountUrl: string | undefined;
    let platformPostUrl: string | undefined;

    const twitterAccount = UsersHelper.getAccount(user, PLATFORM.Twitter);
    const mastodonAccount = UsersHelper.getAccount(user, PLATFORM.Mastodon);
    const blueskyAccount = UsersHelper.getAccount(user, PLATFORM.Bluesky);

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
