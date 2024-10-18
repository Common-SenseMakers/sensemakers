import { Store } from 'n3';

import { AppPostFull } from '../../@shared/types/types.posts';
import { AppUserRead, AutopostOption } from '../../@shared/types/types.user';
import { parseRDF, replaceNodes } from '../../@shared/utils/n3.utils';
import {
  ASSERTION_URI,
  THIS_POST_NAME,
} from '../../@shared/utils/semantics.helper';
import { PostsHelper } from '../../posts/posts.helper';
import { buildSpostNp } from './nanopub.utils';
import { prepareNanopubDetails } from './prepare.nanopub.details';

export const createNanopublication = async (
  post: AppPostFull,
  user: AppUserRead
) => {
  const {
    introUri,
    platformAccountUrl,
    platformName,
    autopostOption,
    ethAddress,
    orcidId,
    platformPostUrl,
    latestNanopubUri,
    rootNanopubUri,
  } = prepareNanopubDetails(user, post);

  const semantics = post.semantics;
  const content = PostsHelper.concatenateThread(post.generic);

  const semanticsParserStore = await (async () => {
    if (!semantics) return new Store();

    return await parseRDF(semantics);
  })();
  // Define the replacement map that swaps our placeholder with np placeholder
  const replaceMap: Record<string, string> = {
    [THIS_POST_NAME]: ASSERTION_URI,
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

  return buildSpostNp(
    ethAddress,
    introUri,
    platformAccountUrl,
    supersedesOptions ? AutopostOption.MANUAL : autopostOption,
    platformName,
    semanticsStore,
    content,
    platformPostUrl,
    options
  );
};
