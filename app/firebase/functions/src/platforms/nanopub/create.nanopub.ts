import { Store } from 'n3';

import { AppPostFull } from '../../@shared/types/types.posts';
import { TwitterUserDetails } from '../../@shared/types/types.twitter';
import { AppUser, PLATFORM } from '../../@shared/types/types.user';
import { parseRDF } from '../../@shared/utils/n3.utils';
import { logger } from '../../instances/logger';
import { PostsHelper } from '../../posts/posts.helper';
import { UsersHelper } from '../../users/users.helper';
import { buildSpostNp } from './utils';

const DEBUG = false;

export const createNanopublication = async (
  post: AppPostFull,
  user: AppUser
) => {
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

  if (!twitterUsername) {
    throw new Error('Twitter username not found');
  }

  if (!twitterName) {
    throw new Error('Twitter name not found');
  }

  const originalPlatformPost = post.mirrors.find(
    (platformPost) => platformPost.platformId === PLATFORM.Twitter
  )?.posted;

  const originalPlatformPostId = originalPlatformPost?.post_id;

  if (!originalPlatformPostId) {
    throw new Error('Original platform post id not found');
  }

  const twitterPath = `${twitterUsername}`;

  if (DEBUG)
    logger.debug(`Creating nanopub twitterPath:${twitterPath}`, {
      twitterPath,
    });

  const semanticsStore = await (async () => {
    if (!semantics) return new Store();

    return await parseRDF(semantics);
  })();

  const nanoDetails = user[PLATFORM.Nanopub];
  const ethAddress = nanoDetails && nanoDetails[0].profile?.ethAddress;
  if (!ethAddress) {
    throw new Error('Eth address not found');
  }

  const orcidDetails = user[PLATFORM.Orcid];
  const orcidId = orcidDetails && orcidDetails[0].user_id;
  const tweetUrl = `https://x.com/${twitterPath}/status/${originalPlatformPostId}`;

  //Need to fetch oldNpUri when update,  hardcoded for now.
  const options = {
    oldNpUri: 'https://example.org/oldNp',
    orcidId: orcidId as string,
  };

  return await buildSpostNp(
    ethAddress,
    twitterUsername,
    'sup', // hardcoded for now. Update to get from post
    twitterName,
    semanticsStore,
    content,
    tweetUrl,
    options
  );
};
