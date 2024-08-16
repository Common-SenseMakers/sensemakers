import { Store } from 'n3';

import { AppPostFull } from '../../@shared/types/types.posts';
import { AppUser, PLATFORM } from '../../@shared/types/types.user';
import { parseRDF, replaceNodes } from '../../@shared/utils/n3.utils';
import { logger } from '../../instances/logger';
import { PostsHelper } from '../../posts/posts.helper';
import { buildSpostNp } from './nanopub.utils';

const DEBUG = false;

export const createNanopublication = async (
  post: AppPostFull,
  user: AppUser
) => {
  const {
    introUri,
    twitterUsername,
    twitterName,
    autopostOption,
    ethAddress,
    orcidId,
  } = PrepareNanopubDetails(user, post);

  const semantics = post.semantics;
  const content = PostsHelper.concatenateThread(post.generic);

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

  PREPARING SCRIPT

  return buildSpostNp(
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
