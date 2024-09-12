import { Nanopub } from '@nanopub/sign';
import { DataFactory, Quad, Store, Writer } from 'n3';

import { GenericAuthor } from '../../@shared/types/types.posts';
import { AutopostOption } from '../../@shared/types/types.user';
import { logger } from '../../instances/logger';
import * as URI from './constants';

const DEBUG = false;

const { namedNode, quad, literal } = DataFactory;

//define interface for possible extra values
export interface SupersedesOptions {
  latest: string;
  root: string;
}
interface BuildSpostNpOptions {
  supersedesOptions?: SupersedesOptions;
  orcidId?: string;
}

//Interface for optional intro input.
//ORCID and keyDelegation
interface BuildIntroNpOptions {
  orcidId?: string;
  author?: GenericAuthor;
  signDelegation?: boolean;
  supersedesOptions?: SupersedesOptions;
  //Add to function
}

//define interface for possible extra values
//oldNpUri is used for updates
interface BuildSpostNpOptions {
  supersedesOptions?: SupersedesOptions;
  orcidId?: string;
}

// Define the function
export const sendTriplets = (): Store => {
  // Create a store
  const store = new Store();

  // Create a simple triple with a literal as the object
  store.addQuad(
    quad(
      namedNode('http://example.org/mosquito'),
      namedNode('http://example.org/hasLabel'),
      literal('Mosquito')
    )
  );

  return store;
};

export const buildSpostProv = (
  postType: string,
  introUri: string,
  accountUrl: string,
  postUrl: string,
  options: BuildSpostNpOptions = {}
): Store => {
  const { orcidId } = options;
  const store = new Store();

  // Define the graph URI
  const provenanceGraphUri = namedNode(URI.PROVENANCE_URI);

  // Define the subjects, predicates, and objects
  const cosmo = namedNode(URI.COSMO_PREFIX);
  const accountNode = namedNode(accountUrl);
  const assertion = namedNode(URI.ASSERTION_URI);
  const activity = namedNode(URI.ACTIVITY_URI);
  const introNode = namedNode(introUri);

  // Add quads to the store based on post_type
  const activityType =
    postType === AutopostOption.MANUAL
      ? namedNode(URI.SUPERVISED_ACTIVITY)
      : namedNode(URI.UNSUPERVISED_ACTIVITY);

  store.addQuad(
    cosmo,
    namedNode(URI.PROV_ACTED_ON_BEHALF_OF),
    introNode,
    provenanceGraphUri
  );
  store.addQuad(
    cosmo,
    namedNode(URI.RDF_TYPE),
    namedNode(URI.PROV_SOFTWARE_AGENT),
    provenanceGraphUri
  );
  store.addQuad(
    activity,
    namedNode(URI.RDF_TYPE),
    activityType,
    provenanceGraphUri
  );
  store.addQuad(
    activity,
    namedNode(URI.PROV_WAS_ASSOCIATED_WITH),
    cosmo,
    provenanceGraphUri
  );
  store.addQuad(
    assertion,
    namedNode(URI.PROV_WAS_ATTRIBUTED_TO),
    introNode,
    provenanceGraphUri
  );
  store.addQuad(
    introNode,
    namedNode(URI.FOAF_ACCOUNT),
    accountNode,
    provenanceGraphUri
  );
  store.addQuad(
    assertion,
    namedNode(URI.PROV_WAS_ASSOCIATED_WITH),
    accountNode,
    provenanceGraphUri
  );
  store.addQuad(
    assertion,
    namedNode(URI.PROV_WAS_GENERATED_BY),
    activity,
    provenanceGraphUri
  );
  store.addQuad(
    assertion,
    namedNode(URI.PROV_LINKS_TO),
    namedNode(postUrl),
    provenanceGraphUri
  );

  // If ORCID ID exists, add it to the provenance graph
  if (orcidId) {
    const orcidNode = namedNode(URI.ORCID_PREFIX + orcidId);
    store.addQuad(
      assertion,
      namedNode(URI.PROV_WAS_ATTRIBUTED_TO),
      orcidNode,
      provenanceGraphUri
    );
    store.addQuad(
      introNode,
      namedNode(URI.FOAF_ACCOUNT),
      orcidNode,
      provenanceGraphUri
    );
  }

  return store;
};

export const buildSpostAssertion = (
  semanticsStore: Store,
  introUri: string,
  postText: string
): Store => {
  // Define the graph URI
  const assertionGraphUri = namedNode(URI.ASSERTION_URI);

  // Create a new store for the assertion
  const store = new Store();
  //attributing the assertion to twitter user
  store.addQuad(
    assertionGraphUri,
    namedNode(URI.RDFS_COMMENT),
    literal(postText),
    assertionGraphUri
  );

  // Add quads from the semantics store to the assertion store with the graph URI
  semanticsStore
    .getQuads(null, null, null, null)
    .forEach((parsedQuad: Quad) => {
      const newQuad = quad(
        parsedQuad.subject,
        parsedQuad.predicate,
        parsedQuad.object,
        assertionGraphUri
      );
      store.addQuad(newQuad);
    });

  store.addQuad(
    assertionGraphUri,
    namedNode(URI.CREATOR),
    namedNode(introUri),
    assertionGraphUri
  );

  return store;
};

export const buildSpostPubinfo = (
  ethAddress: string,
  introUri: string,
  postType: string,
  name: string,
  options: BuildSpostNpOptions = {}
): Store => {
  const { supersedesOptions, orcidId } = options;
  const baseGraphUri = namedNode(URI.BASE_URI);
  const pubinfoGraphUri = namedNode(URI.PUBINFO_URI);
  //const xHandle = namedNode(URI.X_PREFIX + twitterHandle);
  const introNode = namedNode(introUri);
  // Create a new store for the assertion
  const store = new Store();
  //adding constant triplets
  store.addQuad(
    namedNode(URI.BASE_URI),
    namedNode(URI.LICENSE),
    namedNode(URI.CREATIVECOMMONS4),
    pubinfoGraphUri
  );

  store.addQuad(
    introNode,
    namedNode(URI.FOAF_NAME),
    literal(name),
    pubinfoGraphUri
  );
  // If ORCID ID exists, add it to the provenance graph
  if (orcidId) {
    const orcidNode = namedNode(URI.ORCID_PREFIX + orcidId);
    store.addQuad(
      introNode,
      namedNode(URI.FOAF_ACCOUNT),
      orcidNode,
      pubinfoGraphUri
    );
    store.addQuad(
      baseGraphUri,
      namedNode(URI.PROV_WAS_ATTRIBUTED_TO),
      orcidNode,
      pubinfoGraphUri
    );
  }

  store.addQuad(
    baseGraphUri,
    namedNode(URI.NP_HAS_NANOPUB_TYPE),
    namedNode(URI.COSMO_SEMANTIC_POST),
    pubinfoGraphUri
  );
  store.addQuad(
    baseGraphUri,
    namedNode(URI.NP_WAS_CREATED_AT),
    namedNode(URI.COSMO_PREFIX),
    pubinfoGraphUri
  );
  store.addQuad(
    baseGraphUri,
    namedNode(URI.CREATOR),
    introNode,
    pubinfoGraphUri
  );
  store.addQuad(
    baseGraphUri,
    namedNode(URI.LABEL),
    literal('CoSMO Semantic Post'),
    pubinfoGraphUri
  );
  store.addQuad(
    baseGraphUri,
    namedNode(URI.NP_HAS_ROOT_SIGNER),
    literal(ethAddress),
    pubinfoGraphUri
  );
  //If we call this function to update, then supersedesOptions is non empty and we add  triplets
  if (supersedesOptions) {
    const { latest, root } = supersedesOptions;
    store.addQuad(
      namedNode(URI.BASE_URI),
      namedNode(URI.NP_SUPERSEDES),
      namedNode(latest),
      pubinfoGraphUri
    );
    store.addQuad(
      namedNode(URI.BASE_URI),
      namedNode(URI.NP_HAS_ORIGNAL_VERSION),
      namedNode(root),
      pubinfoGraphUri
    );
  }
  //if post type is unsupervised then add

  store.addQuad(
    namedNode(URI.SIGNATURE_URI),
    namedNode(URI.NP_SIGNED_BY),
    namedNode(URI.COSMO_PREFIX),
    pubinfoGraphUri
  );

  store.addQuad(
    namedNode(URI.SIGNATURE_URI),
    namedNode(URI.PROV_WAS_ASSOCIATED_WITH),
    namedNode(introUri + URI.DELEGATION_STRING),
    pubinfoGraphUri
  );
  return store;
};

export const buildNpHead = (): Store => {
  // build nanopub head
  const headStore = new Store();
  const baseGraphUri = namedNode(URI.BASE_URI);
  const headGraphUri = namedNode(URI.HEAD_URI);

  headStore.addQuad(
    baseGraphUri,
    namedNode(URI.NP_HAS_ASSERTION),
    namedNode(URI.ASSERTION_URI),
    headGraphUri
  );
  headStore.addQuad(
    baseGraphUri,
    namedNode(URI.NP_HAS_PROVENANCE),
    namedNode(URI.PROVENANCE_URI),
    headGraphUri
  );

  headStore.addQuad(
    baseGraphUri,
    namedNode(URI.NP_HAS_PUBLICATION_INFO),
    namedNode(URI.PUBINFO_URI),
    headGraphUri
  );
  headStore.addQuad(
    baseGraphUri,
    namedNode(URI.RDF_TYPE),
    namedNode(URI.NP_NANOPUBLICATION),
    headGraphUri
  );

  return headStore;
};

export const buildSpostNp = async (
  ethAddress: string,
  introUri: string,
  accountUrl: string,
  postType: string,
  name: string,
  semantics: Store,
  postText: string,
  postUrl: string,
  options: BuildSpostNpOptions = {}
): Promise<Nanopub> => {
  return new Promise((resolve, reject) => {
    const assertionStore = buildSpostAssertion(semantics, introUri, postText);
    const provStore = buildSpostProv(
      postType,
      introUri,
      accountUrl,
      postUrl,
      options
    );
    const pubinfoStore = buildSpostPubinfo(
      ethAddress,
      introUri,
      postType,
      name,
      options
    );
    const headStore = buildNpHead();
    // Create a writer and add prefixes
    const writer = new Writer({ format: 'application/trig' });
    writer.addPrefixes(URI.sPostPrefixes);

    headStore
      .getQuads(null, null, null, namedNode(URI.HEAD_URI))
      .forEach((quad: Quad) => {
        writer.addQuad(quad);
      });

    // Add quads from the store to the writer
    assertionStore
      .getQuads(null, null, null, namedNode(URI.ASSERTION_URI))
      .forEach((quad: Quad) => {
        writer.addQuad(quad);
      });

    // Add quads from the store to the writer
    provStore
      .getQuads(null, null, null, namedNode(URI.PROVENANCE_URI))
      .forEach((quad: Quad) => {
        writer.addQuad(quad);
      });

    // Add quads from the store to the writer
    pubinfoStore.getQuads(null, null, null, null).forEach((quad: Quad) => {
      writer.addQuad(quad);
    });

    // End the writer and display the TriG content
    writer.end(async (error, result) => {
      if (error) {
        logger.error('Error writing the TriG data:', error);
        reject(error);
      } else {
        if (DEBUG) logger.debug('Nanopub prepared', { text: result });

        try {
          const np = new Nanopub(result);
          resolve(np);
        } catch (e) {
          logger.error('Error creating or publishing Nanopub:', e);
          reject(e);
        }
      }
    });
  });
};

export const buildIntroNp = async (
  ethAddress: string,
  pubKey: string,
  signature: string,
  options: BuildIntroNpOptions = {}
): Promise<Nanopub> => {
  return new Promise((resolve, reject) => {
    const { orcidId, author, signDelegation, supersedesOptions } = options;
    const headStore = buildNpHead();

    // Define the graph URIs
    const assertionGraph = namedNode(URI.ASSERTION_URI);
    const provenanceGraph = namedNode(URI.PROVENANCE_URI);
    const pubinfoGraph = namedNode(URI.PUBINFO_URI);
    const keyDeclarationNode = namedNode(
      `${URI.KEY_DECLARATION_URI}${ethAddress}`
    );
    const baseNode = namedNode(URI.BASE_URI);
    const ethNode = namedNode(`${URI.BASE_URI}${ethAddress}`);
    // Create a writer and add prefixes
    const writer = new Writer({ format: 'application/trig' });
    writer.addPrefixes(URI.introPrefixes);

    // Add headStore quads to the writer
    headStore.getQuads(null, null, null, null).forEach((quad) => {
      writer.addQuad(quad);
    });

    writer.addQuad(
      baseNode,
      namedNode(URI.FOAF_ACCOUNT),
      ethNode,
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode,
      namedNode(URI.NP_DECLARED_BY),
      namedNode(URI.BASE_URI + ethAddress),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode,
      namedNode(URI.NP_HAS_ALGORITHM),
      literal('RSA'),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode,
      namedNode(URI.NP_HAS_PUBLIC_KEY),
      literal(pubKey),
      assertionGraph
    );

    writer.addQuad(
      keyDeclarationNode,
      namedNode(URI.PROV_WAS_DERIVED_FROM),
      literal(ethAddress),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode,
      namedNode(URI.NP_HAS_DERIVATION_PATH),
      literal('/nanopub/0'),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode,
      namedNode(URI.NP_HAS_DERIVATION_STANDARD),
      literal('BIP-32'),
      assertionGraph
    );

    const verifivationProofNode = namedNode(URI.DERIVATION_PROOF_URI);
    writer.addQuad(
      keyDeclarationNode,
      namedNode(URI.NP_HAS_DERIVATION_PROOF),
      verifivationProofNode,
      assertionGraph
    );
    writer.addQuad(
      verifivationProofNode,
      namedNode(URI.NP_HAS_ALGORITHM),
      namedNode(URI.ETHEREUM_EIP_191),
      assertionGraph
    );
    writer.addQuad(
      verifivationProofNode,
      namedNode(URI.NP_HAS_PUBLIC_KEY),
      literal(ethAddress),
      assertionGraph
    );
    writer.addQuad(
      verifivationProofNode,
      namedNode(URI.NP_HAS_SIGNATURE_TARGET),
      literal(`This account controls the RSA public key: ${pubKey}`),
      assertionGraph
    );
    writer.addQuad(
      verifivationProofNode,
      namedNode(URI.PROV_HAS_SIGNATURE),
      literal(signature),
      assertionGraph
    );

    // Give permission on behalf of user to a key
    if (signDelegation) {
      const signingDelegationNode = namedNode(URI.SIGNING_DELEGATION_URI);
      writer.addQuad(
        signingDelegationNode,
        namedNode(URI.NP_DECLARED_AS_DELEGATION_BY),
        ethNode,
        assertionGraph
      );
      writer.addQuad(
        signingDelegationNode,
        namedNode(URI.NP_DELEGATED_TO),
        namedNode(URI.COSMO_PREFIX),
        assertionGraph
      );
      writer.addQuad(
        signingDelegationNode,
        namedNode(URI.NP_DELEGATED_BY),
        ethNode,
        assertionGraph
      );
      writer.addQuad(
        signingDelegationNode,
        namedNode(URI.NP_WITH_KEY_DECLARATION),
        namedNode(URI.APP_RSA_DECLARATION_URI),
        assertionGraph
      );
    }

    // Add triples to the provenance graph
    writer.addQuad(
      namedNode(URI.ASSERTION_URI),
      namedNode(URI.PROV_WAS_ATTRIBUTED_TO),
      ethNode,
      provenanceGraph
    );

    // Add triples to the pubinfo graph
    writer.addQuad(
      namedNode(URI.BASE_URI),
      namedNode(URI.LICENSE),
      namedNode(URI.CREATIVECOMMONS4),
      pubinfoGraph
    );

    writer.addQuad(
      namedNode(URI.BASE_URI),
      namedNode(URI.NP_WAS_CREATED_AT),
      namedNode(URI.COSMO_PREFIX),
      pubinfoGraph
    );

    writer.addQuad(
      namedNode(URI.BASE_URI),
      namedNode(URI.LABEL),
      literal('CoSMO Sensemaker intro'),
      pubinfoGraph
    );

    writer.addQuad(
      namedNode(URI.BASE_URI),
      namedNode(URI.NP_HAS_ROOT_SIGNER),
      ethNode,
      pubinfoGraph
    );

    writer.addQuad(
      namedNode(URI.BASE_URI),
      namedNode(URI.CREATOR),
      ethNode,
      pubinfoGraph
    );
    writer.addQuad(
      ethNode,
      namedNode(URI.NP_HAS_PUBLIC_KEY),
      literal(ethAddress),
      namedNode(URI.PUBINFO_URI)
    );
    if (author) {
      const platformAuthorNode = namedNode(`${author.username}`);

      writer.addQuad(
        baseNode,
        namedNode(URI.FOAF_NAME),
        literal(author.name),
        assertionGraph
      );
      writer.addQuad(
        baseNode,
        namedNode(URI.FOAF_ACCOUNT),
        platformAuthorNode,
        assertionGraph
      );
    }
    if (orcidId) {
      const orcidNode = namedNode(URI.ORCID_PREFIX + orcidId);
      writer.addQuad(
        baseNode,
        namedNode(URI.FOAF_ACCOUNT),
        orcidNode,
        assertionGraph
      );
      writer.addQuad(
        namedNode(URI.ASSERTION_URI),
        namedNode(URI.PROV_WAS_ATTRIBUTED_TO),
        orcidNode,
        provenanceGraph
      );
    }
    if (supersedesOptions) {
      const { latest, root } = supersedesOptions;
      writer.addQuad(
        namedNode(URI.BASE_URI),
        namedNode(URI.NP_SUPERSEDES),
        namedNode(latest),
        namedNode(URI.PUBINFO_URI)
      );
      writer.addQuad(
        namedNode(URI.BASE_URI),
        namedNode(URI.NP_HAS_ORIGNAL_VERSION),
        namedNode(root),
        namedNode(URI.PUBINFO_URI)
      );
    }

    // Instantiate Nanopub profile (ORCID and name are optional)
    //const profile = new NpProfile(privateKey, "https://orcid.org/" + orcidId, name);

    // End the writer and handle the resulting TriG data
    writer.end(async (error, result) => {
      if (error) {
        logger.error('Error writing the TriG data:', error);
        reject(error);
      } else {
        if (DEBUG) logger.debug('Intro nanopub prepared', { text: result });
        try {
          // Create and sign the nanopub
          const np = new Nanopub(result);
          resolve(np);
        } catch (e) {
          logger.error('Error creating or signing Nanopub:', e);
          reject(e);
        }
      }
    });
  });
};

//nanopub for retration:

export const buildRetractionNp = async (
  targetNp: string,
  introUri: string,
  accountUrl: string,
  name: string,
  ethAddress: string,
  orcidId?: string
): Promise<Nanopub> => {
  const accountNode = namedNode(accountUrl);
  const assertionGraph = namedNode(URI.ASSERTION_URI);
  const provenanceGraph = namedNode(URI.PROVENANCE_URI);
  const pubinfoGraph = namedNode(URI.PUBINFO_URI);
  const introNode = namedNode(introUri);
  const writer = new Writer({ format: 'application/trig' });
  writer.addPrefixes(URI.retractionPrefixes);

  const headStore = buildNpHead();
  headStore.getQuads(null, null, null, null).forEach((quad) => {
    writer.addQuad(quad);
  });

  writer.addQuad(
    introNode,
    namedNode(URI.NP_RETRACTS),
    namedNode(targetNp),
    assertionGraph
  );
  writer.addQuad(
    introNode,
    namedNode(URI.FOAF_ACCOUNT),
    accountNode,
    provenanceGraph
  );
  writer.addQuad(
    namedNode(URI.ASSERTION_URI),
    namedNode(URI.PROV_WAS_ATTRIBUTED_TO),
    accountNode,
    provenanceGraph
  );
  if (orcidId) {
    writer.addQuad(
      introNode,
      namedNode(URI.FOAF_ACCOUNT),
      namedNode(`${URI.ORCID_PREFIX}${orcidId}`),
      provenanceGraph
    );
    writer.addQuad(
      namedNode(URI.BASE_URI),
      namedNode(URI.PROV_WAS_ATTRIBUTED_TO),
      namedNode(`${URI.ORCID_PREFIX}${orcidId}`),
      provenanceGraph
    );
  }

  writer.addQuad(
    introNode,
    namedNode(URI.FOAF_NAME),
    literal(name),
    pubinfoGraph
  );

  writer.addQuad(
    namedNode(URI.BASE_URI),
    namedNode(URI.CREATOR),
    introNode,
    pubinfoGraph
  );

  writer.addQuad(
    namedNode(URI.BASE_URI),
    namedNode(URI.LICENSE),
    namedNode(URI.CREATIVECOMMONS4),
    pubinfoGraph
  );

  writer.addQuad(
    namedNode(URI.BASE_URI),
    namedNode(URI.NP_WAS_CREATED_AT),
    namedNode(URI.COSMO_PREFIX),
    pubinfoGraph
  );

  writer.addQuad(
    namedNode(URI.BASE_URI),
    namedNode(URI.LABEL),
    literal('CoSMO Semantic Post retraction'),
    pubinfoGraph
  );

  writer.addQuad(
    namedNode(URI.BASE_URI),
    namedNode(URI.NP_HAS_ROOT_SIGNER),
    literal(ethAddress),
    pubinfoGraph
  );

  return new Promise((resolve, reject) => {
    writer.end(async (error, result) => {
      if (error) {
        logger.error('Error writing the TriG data:', error);
        reject(error);
      } else {
        if (DEBUG) logger.debug('Retract nanopub prepared', { text: result });

        try {
          const np = new Nanopub(result);
          resolve(np);
        } catch (e) {
          logger.error('Error creating or signing Nanopub:', e);
          reject(e);
        }
      }
    });
  });
};
