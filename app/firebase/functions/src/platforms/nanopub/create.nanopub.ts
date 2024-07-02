import { Nanopub } from '@nanopub/sign';
import { DataFactory, Store } from 'n3';

import { AppPostFull } from '../../@shared/types/types.posts';
import { TwitterUserDetails } from '../../@shared/types/types.twitter';
import { AppUser, PLATFORM } from '../../@shared/types/types.user';
import { parseRDF, replaceNodes, writeRDF } from '../../@shared/utils/n3.utils';
import {
  ASSERTION_URI,
  HAS_COMMENT_URI,
  NANOPUB_PLACEHOLDER,
  THIS_POST_NAME,
} from '../../@shared/utils/semantics.helper';
import { logger } from '../../instances/logger';
import { PostsHelper } from '../../posts/posts.helper';
import { UsersHelper } from '../../users/users.helper';

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

  if (!twitterUsername) {
    throw new Error('Twitter username not found');
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

  /** Then get the RDF as triplets */
  const assertionsStore = await (async () => {
    if (!semantics) return new Store();

    const store = await parseRDF(semantics);

    /** Manipulate assertion semantics on the N3 store */

    /** replace THIS_POST_NAME node with the nanopub:assertion node */
    const assertionsStore = replaceNodes(store, {
      [THIS_POST_NAME]: ASSERTION_URI,
    });

    return assertionsStore;
  })();

  /** Add the post context as a comment of the assertion */
  assertionsStore.addQuad(
    DataFactory.namedNode(ASSERTION_URI),
    DataFactory.namedNode(HAS_COMMENT_URI),
    DataFactory.literal(content),
    DataFactory.defaultGraph()
  );

  /** Then get the RDF as triplets */
  const assertionsRdf = await writeRDF(assertionsStore);

  /** append the npx:ExampleNanopub (manually for now) */
  const exampleTriplet = `: a npx:ExampleNanopub .`;

  const semanticPostTriplet = `: a <https://sense-nets.xyz/SemanticPost> .`;

  /** append the data related to the author (including) identity */
  const nanoDetails = user[PLATFORM.Nanopub];
  const hasEthSigner = nanoDetails !== undefined;
  const address = nanoDetails && nanoDetails[0].profile?.ethAddress;

  const ethSignerRdf = hasEthSigner
    ? `
            : <http://sense-nets.xyz/rootSigner> "${address}" .
        `
    : '';

  if (DEBUG) logger.debug(`Creating nanopub`, { ethSignerRdf });

  const rdfStr = `
          @prefix : <${NANOPUB_PLACEHOLDER}> .
          @prefix np: <http://www.nanopub.org/nschema#> .
          @prefix npx: <http://purl.org/nanopub/x/> .
          @prefix dct: <http://purl.org/dc/terms/> .
          @prefix twitter: <https://twitter.com/> .
          @prefix prov: <http://www.w3.org/ns/prov#> .
          
          :Head {
            : np:hasAssertion :assertion ;
              np:hasProvenance :provenance ;
              np:hasPublicationInfo :pubinfo ;
              a np:Nanopublication .
          }
          
          :assertion {
            :assertion dct:creator twitter:${twitterUsername} .
            ${assertionsRdf}
          }
          
          
          :provenance {
            :assertion prov:wasAttributedTo twitter:${twitterUsername} .
            :assertion prov:wasDerivedFrom twitter:${twitterPath} .
          }
          
          :pubinfo {
            ${hasEthSigner ? ethSignerRdf : ''}      
            ${exampleTriplet}
            ${semanticPostTriplet}
          }
        `;

  try {
    if (DEBUG)
      logger.debug(`Creating nanopub rdfStr:${rdfStr.slice(0, 320)}`, {
        rdfStr,
      });
    const np = new Nanopub(rdfStr);

    if (DEBUG) logger.debug(`Created nanopub!`);
    return np;
  } catch (e: any) {
    logger.error(e);
    throw new Error(`Error creating nanopub: ${e}`);
  }
};
