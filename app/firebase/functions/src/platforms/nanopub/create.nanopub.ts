import { Nanopub } from '@nanopub/sign';
import { DataFactory, Store } from 'n3';
import { PlatformPost } from 'src/@shared/types/types.platform.posts';
import { TwitterThread } from 'src/@shared/types/types.twitter';

import { AppUser, PLATFORM } from '../../@shared/types/types';
import { AppPostFull } from '../../@shared/types/types.posts';
import { parseRDF, replaceNodes, writeRDF } from '../../@shared/utils/n3.utils';
import {
  ASSERTION_URI,
  HAS_COMMENT_URI,
  NANOPUB_PLACEHOLDER,
  THIS_POST_NAME,
} from '../../@shared/utils/semantics.helper';

export const createNanopublication = async (
  post: AppPostFull,
  user: AppUser
) => {
  const semantics = post.semantics;
  const content = post.content;
  const twitterUsername = user[PLATFORM.Twitter]?.[0].profile?.username;
  if (!twitterUsername) {
    throw new Error('Twitter username not found');
  }
  const originalPlatformPost = post.mirrors.find(
    (platformPost) => platformPost.platformId === PLATFORM.Twitter
  )?.posted as PlatformPost<TwitterThread> | undefined;
  const originalPlatformPostId = originalPlatformPost?.posted?.post_id;
  if (!originalPlatformPostId) {
    throw new Error('Original platform post id not found');
  }
  const originalPostUrl = `https://twitter.com/${twitterUsername}/status/${originalPlatformPostId}`;

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

  const rdfStr = `
          @prefix : <${NANOPUB_PLACEHOLDER}> .
          @prefix np: <http://www.nanopub.org/nschema#> .
          @prefix dct: <http://purl.org/dc/terms/> .
          @prefix nt: <https://w3id.org/np/o/ntemplate/> .
          @prefix npx: <http://purl.org/nanopub/x/> .
          @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
          @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
          @prefix twitter: <https://twitter.com/> .
          @prefix ns1: <http://purl.org/np/> .
          @prefix prov: <http://www.w3.org/ns/prov#> .
          @prefix foaf: <http://xmlns.com/foaf/0.1/> .
          
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
            :assertion prov:wasAttributedTo twitter:${twitterUsername} ;
            :assertion prov:wasDerivedFrom twitter:${originalPostUrl} .
          }
          
          :pubinfo {
            ${hasEthSigner ? ethSignerRdf : ''}      
            ${exampleTriplet}
            ${semanticPostTriplet}
          }
        `;

  const np = new Nanopub(rdfStr);
  return np;
};
