import { Store } from 'n3';

import { NanopubUserDetails } from '../../@shared/types/types.nanopubs';
import { AppPostFull } from '../../@shared/types/types.posts';
import { TwitterUserDetails } from '../../@shared/types/types.twitter';
import {
  AppUser,
  AutopostOption,
  PLATFORM,
} from '../../@shared/types/types.user';
import { parseRDF, replaceNodes } from '../../@shared/utils/n3.utils';
import { logger } from '../../instances/logger';
import { PostsHelper } from '../../posts/posts.helper';
import { UsersHelper } from '../../users/users.helper';
import { buildSpostNp } from './utils';

const DEBUG = false;

export const createNanopublication = async (
  post: AppPostFull,
  user: AppUser
) => {
  const autopostOption: AutopostOption =
    user.settings.autopost[PLATFORM.Nanopub].value;
  const semantics = post.semantics;
  const content = PostsHelper.concatenateThread(post.generic);
  const twitter = UsersHelper.getAccount(
    user,
    PLATFORM.Twitter,
    undefined,
    true
  ) as TwitterUserDetails;
  const twitterUsername = twitter.profile?.username;
  const twitterName = twitter.profile?.name;

  const nanopubAccount = UsersHelper.getAccount(
    user,
    PLATFORM.Nanopub,
    undefined,
    true
  ) as NanopubUserDetails;

  if (!twitterUsername) {
    throw new Error('Twitter username not found');
  }

  if (!twitterName) {
    throw new Error('Twitter name not found');
  }

  const originalPlatformPost = post.mirrors.find(
    (platformPost) => platformPost.platformId === PLATFORM.Twitter
  )?.posted;
  const nanopubPlatformPost = post.mirrors.find(
    (platformPost) => platformPost.platformId === PLATFORM.Nanopub
  );
  const latestNanopubUri = nanopubPlatformPost?.posted?.post_id;
  const rootNanopubUri = nanopubPlatformPost?.post_id;

  const originalPlatformPostId = originalPlatformPost?.post_id;

  if (!originalPlatformPostId) {
    throw new Error('Original platform post id not found');
  }

  const twitterPath = `${twitterUsername}`;

  if (DEBUG)
    logger.debug(`Creating nanopub twitterPath:${twitterPath}`, {
      twitterPath,
    });

  const semanticsParserStore = await (async () => {
    if (!semantics) return new Store();

    return await parseRDF(semantics);
  })();
  // Define the replacement map that swaps our placeholder with np placeholder
  const replaceMap: Record<string, string> = {
    'https://sense-nets.xyz/mySemanticPost':
      'http://purl.org/nanopub/temp/mynanopub#',
  };

  const semanticsStore = replaceNodes(semanticsParserStore, replaceMap);

  const nanoDetails = user[PLATFORM.Nanopub];
  const ethAddress = nanoDetails && nanoDetails[0].profile?.ethAddress;
  if (!ethAddress) {
    throw new Error('Eth address not found');
  }

  const orcidDetails = user[PLATFORM.Orcid];
  const orcidId = orcidDetails && orcidDetails[0].user_id;
  const tweetUrl = `https://x.com/${twitterPath}/status/${originalPlatformPostId}`;
  const introUri = nanopubAccount.profile?.introNanopubUri;
  if (!introUri) {
    throw new Error('Intro nanopub uri not found');
  }

  const supersedesOptions = (() => {
    if (rootNanopubUri && latestNanopubUri) {
      return {
        root: rootNanopubUri,
        latest: latestNanopubUri,
      };
    } else {
      return undefined;
    }
  })();

  const options = {
    orcidId: orcidId,
    supersedesOptions,
  };

  return await buildSpostNp(
    ethAddress,
    introUri,
    twitterUsername,
    autopostOption,
    twitterName,
    semanticsStore,
    content,
    tweetUrl,
    options
  );
};
