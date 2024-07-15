import { Nanopub } from '@nanopub/sign';
import { DataFactory, Quad, Store, Writer } from 'n3';
import * as URI from './constants';

const { namedNode, quad, literal } = DataFactory;

//define interface for possible extra values
//oldNpUri is used for updates
interface BuildSpostNpOptions {
  oldNpUri?: string;
  orcidId?: string;
}

//Interface for optional intro input.
//ORCID and keyDelegation
interface BuildIntroNpOptions {
  orcidId?: string;
  signDelegation?: boolean;
  oldNpUri?: string;
  //Add to function
}

//define interface for possible extra values
//oldNpUri is used for updates
interface BuildSpostNpOptions {
  oldNpUri?: string;
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
  twitterHandle: string,
  tweetUrl: string,
  options: BuildSpostNpOptions = {}
): Store => {
  const { orcidId } = options;
  const store = new Store();

  // Define the graph URI
  const provenanceGraphUri = namedNode(URI.PROVENANCE_URI);

  // Define the subjects, predicates, and objects
  const cosmo = namedNode(URI.COSMO_PREFIX);
  const xHandle = namedNode(URI.X_PREFIX + twitterHandle);
  const assertion = namedNode(URI.ASSERTION_URI);
  const activity = namedNode(URI.ACTIVITY_URI);

  // Add quads to the store based on post_type
  const activityType =
    postType === 'sup'
      ? namedNode(URI.SUPERVISED_ACTIVITY)
      : namedNode(URI.UNSUPERVISED_ACTIVITY);

  store.addQuad(
    cosmo,
    namedNode(URI.PROV_ACTED_ON_BEHALF_OF),
    xHandle,
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
    xHandle,
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
    namedNode(tweetUrl),
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
      xHandle,
      namedNode(URI.PROV_WAS_ATTRIBUTED_TO),
      orcidNode,
      provenanceGraphUri
    );
  }

  return store;
};

export const buildSpostAssertion = (
  semanticsStore: Store,
  twitterHandle: string,
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
    namedNode(URI.PROV_WAS_ATTRIBUTED_TO),
    namedNode(URI.X_PREFIX + twitterHandle),
    assertionGraphUri
  );

  return store;
};

export const buildSpostPubinfo = (
  ethAddress: string,
  twitterHandle: string,
  postType: string,
  name: string,
  options: BuildSpostNpOptions = {}
): Store => {
  const { oldNpUri, orcidId } = options;
  const baseGraphUri = namedNode(URI.BASE_URI);
  const pubinfoGraphUri = namedNode(URI.PUBINFO_URI);
  const xHandle = namedNode(URI.X_PREFIX + twitterHandle);

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
    xHandle,
    namedNode(URI.FOAF_NAME),
    literal(name),
    pubinfoGraphUri
  );
  // If ORCID ID exists, add it to the provenance graph
  if (orcidId) {
    const orcidNode = namedNode(URI.ORCID_PREFIX + orcidId);
    store.addQuad(
      quad(
        orcidNode,
        namedNode(URI.FOAF_NAME),
        literal(name),
        pubinfoGraphUri
      )
    );
    store.addQuad(
      quad(
        baseGraphUri,
        namedNode(URI.PROV_WAS_ATTRIBUTED_TO),
        orcidNode,
        pubinfoGraphUri
      )
    );
  }

  store.addQuad(
    baseGraphUri,
    namedNode(URI.PROV_WAS_ATTRIBUTED_TO),
    namedNode(URI.X_PREFIX + twitterHandle),
    pubinfoGraphUri
  );
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
  //If we call this function to update, then oldNpUri is non empty and we add a triplet
  if (oldNpUri) {
    store.addQuad(
      namedNode(URI.BASE_URI),
      namedNode(URI.NP_SUPERSEDES),
      namedNode(oldNpUri),
      namedNode(URI.PUBINFO_URI)
    );
  }
  //if post type is unsupervised then add
  if (postType == 'unsup') {
    store.addQuad(
      quad(
        namedNode(URI.BASE_URI + 'sig'),
        namedNode(URI.NP_SIGNED_BY),
        namedNode(URI.COSMO_PREFIX),
        pubinfoGraphUri
      )
    );
  }
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
  twitterHandle: string,
  postType: string,
  name: string,
  semantics: Store,
  postText: string,
  tweetUrl: string,
  options: BuildSpostNpOptions = {}
): Promise<Nanopub> => {
  return new Promise((resolve, reject) => {
    const assertionStore = buildSpostAssertion(
      semantics,
      twitterHandle,
      postText
    );
    const provStore = buildSpostProv(
      postType,
      twitterHandle,
      tweetUrl,
      options
    );
    const pubinfoStore = buildSpostPubinfo(
      ethAddress,
      twitterHandle,
      postType,
      name,
      options
    );
    const headStore = buildNpHead();
    // Create a writer and add prefixes
    const writer = new Writer({ format: 'application/trig' });
    writer.addPrefixes({
      base: URI.BASE_URI,
      cosmo: URI.COSMO_PREFIX,
      dct: 'http://purl.org/dc/terms/',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      ns1: 'http://purl.org/np/',
      foaf: 'http://xmlns.com/foaf/0.1/',
      schema: 'https://schema.org/',
      x: URI.X_PREFIX,
      np: 'http://www.nanopub.org/nschema#',
      npx: 'http://purl.org/nanopub/x/',
      prov: 'http://www.w3.org/ns/prov#',
      orcid: 'https://orcid.org/',
    });

    headStore
      .getQuads(
        null,
        null,
        null,
        namedNode(URI.HEAD_URI)
      )
      .forEach((quad: Quad) => {
        writer.addQuad(quad);
      });

    // Add quads from the store to the writer
    assertionStore
      .getQuads(
        null,
        null,
        null,
        namedNode(URI.ASSERTION_URI)
      )
      .forEach((quad: Quad) => {
        writer.addQuad(quad);
      });

    // Add quads from the store to the writer
    provStore
      .getQuads(
        null,
        null,
        null,
        namedNode(URI.PROVENANCE_URI)
      )
      .forEach((quad: Quad) => {
        writer.addQuad(quad);
      });

    // Add quads from the store to the writer
    pubinfoStore
      .getQuads(
        null,
        null,
        null,
        namedNode(URI.PROVENANCE_URI)
      )
      .forEach((quad: Quad) => {
        writer.addQuad(quad);
      });

    // End the writer and display the TriG content
    writer.end(async (error, result) => {
      if (error) {
        console.error('Error writing the TriG data:', error);
        reject(error);
      } else {
        console.log('TriG data:', result);

        try {
          const np = new Nanopub(result);
          resolve(np);
        } catch (e) {
          console.error('Error creating or publishing Nanopub:', e);
          reject(e);
        }
      }
    });
  });
};

export const buildIntroNp = async (
  twitterHandle: string,
  ethAddress: string,
  name: string,
  pubKey: string,
  signature: string,
  options: BuildIntroNpOptions = {}
): Promise<Nanopub> => {
  return new Promise((resolve, reject) => {
    const { orcidId, signDelegation, oldNpUri } = options;
    const headStore = buildNpHead();

    // Define the graph URIs
    const assertionGraph = namedNode(URI.ASSERTION_URI);
    const provenanceGraph = namedNode(URI.PROVENANCE_URI);
    const pubinfoGraph = namedNode(URI.PUBINFO_URI);
    const x = URI.X_PREFIX;
    const keyDeclarationNode = namedNode(`${URI.BASE_URI}${ethAddress}`);
    const twitterNode = namedNode(`${x}${twitterHandle}`);
    const npx = URI.NPX_PREFIX;

    // Create a writer and add prefixes
    const writer = new Writer({ format: 'application/trig' });
    writer.addPrefixes({
      base: URI.BASE_URI,
      cosmo: URI.COSMO_PREFIX,
      dct: 'http://purl.org/dc/terms/',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      ns1: 'http://purl.org/np/',
      foaf: 'http://xmlns.com/foaf/0.1/',
      schema: 'https://schema.org/',
      x: URI.X_PREFIX,
      np: 'http://www.nanopub.org/nschema#',
      npx: 'http://purl.org/nanopub/x/',
      prov: 'http://www.w3.org/ns/prov#',
      orcid: 'https://orcid.org/',
    });

    // Add headStore quads to the writer
    headStore.getQuads(null, null, null, null).forEach((quad) => {
      writer.addQuad(quad);
    });

    // Add triples to the assertion graph
    writer.addQuad(
      twitterNode,
      namedNode(URI.FOAF_NAME),
      literal(name),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode,
      namedNode(URI.NP_DECLARED_BY),
      twitterNode,
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

    const derivationProofNode = namedNode(URI.DERIVATION_PROOF_URI);
    writer.addQuad(
      keyDeclarationNode,
      namedNode(URI.NP_HAS_DERIVATION_PROOF),
      derivationProofNode,
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode,
      namedNode(URI.NP_HAS_ALGORITHM),
      namedNode(URI.ETHEREUM_EIP_191),
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode,
      namedNode(URI.NP_HAS_PUBLIC_KEY),
      literal(ethAddress),
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode,
      namedNode(URI.NP_HAS_SIGNATURE_TARGET),
      literal(`This account controls the RSA public key: ${pubKey}`),
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode,
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
        twitterNode,
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
        twitterNode,
        assertionGraph
      );
      writer.addQuad(
        signingDelegationNode,
        namedNode(URI.NP_WITH_KEY_DECLARATION),
        namedNode('https://example.org/appKeyDecleration'),
        assertionGraph
      );
    }

    // Add triples to the provenance graph
    writer.addQuad(
      namedNode(URI.ASSERTION_URI),
      namedNode(URI.PROV_WAS_ATTRIBUTED_TO),
      twitterNode,
      provenanceGraph
    );
    if (orcidId) {
      const orcidNode = namedNode(URI.ORCID_PREFIX + orcidId);
      writer.addQuad(
        namedNode(URI.ASSERTION_URI),
        namedNode(URI.PROV_WAS_ATTRIBUTED_TO),
        orcidNode,
        provenanceGraph
      );
    }

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
      literal(ethAddress),
      pubinfoGraph
    );

    writer.addQuad(
      namedNode(URI.BASE_URI),
      namedNode(URI.CREATOR),
      twitterNode,
      pubinfoGraph
    );
    if (oldNpUri) {
      writer.addQuad(
        namedNode(URI.BASE_URI),
        namedNode(URI.NP_SUPERSEDES),
        namedNode(oldNpUri),
        pubinfoGraph
      );
    }

    // Instantiate Nanopub profile (ORCID and name are optional)
    //const profile = new NpProfile(privateKey, "https://orcid.org/" + orcidId, name);

    // End the writer and handle the resulting TriG data
    writer.end(async (error, result) => {
      if (error) {
        console.error('Error writing the TriG data:', error);
        reject(error);
      } else {
        console.log('TriG data:', result);
        try {
          // Create and sign the nanopub
          const np = new Nanopub(result);
          resolve(np);
        } catch (e) {
          console.error('Error creating or signing Nanopub:', e);
          reject(e);
        }
      }
    });
  });
};

//nanopub for retration:

export const buildRetractionNp = async (
  targetNp: string,
  twitter_handle: string,
  name: string,
  ethAddress: string,
  orcidId?: string
): Promise<Nanopub> => {
  const xHandle = `${URI.X_PREFIX}${twitter_handle}`;
  const assertionGraph = namedNode(URI.ASSERTION_URI);
  const provenanceGraph = namedNode(URI.PROVENANCE_URI);
  const pubinfoGraph = namedNode(URI.PUBINFO_URI);

  const writer = new Writer({ format: 'application/trig' });
  writer.addPrefixes({
    np: 'http://www.nanopub.org/nschema#',
    dct: 'http://purl.org/dc/terms/',
    nt: 'https://w3id.org/np/o/ntemplate/',
    npx: 'http://purl.org/nanopub/x/',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    orcid: 'https://orcid.org/',
    prov: 'http://www.w3.org/ns/prov#',
    foaf: 'http://xmlns.com/foaf/0.1/',
    x: URI.X_PREFIX,
  });

  const headStore = buildNpHead();
  headStore.getQuads(null, null, null, null).forEach((quad) => {
    writer.addQuad(quad);
  });

  writer.addQuad(
    namedNode(xHandle),
    namedNode(URI.NP_RETRACTS),
    namedNode(targetNp),
    assertionGraph
  );

  writer.addQuad(
    namedNode(URI.ASSERTION_URI),
    namedNode(URI.PROV_WAS_ATTRIBUTED_TO),
    namedNode(xHandle),
    provenanceGraph
  );
  if (orcidId) {
    writer.addQuad(
      namedNode(URI.BASE_URI),
      namedNode(URI.PROV_WAS_ATTRIBUTED_TO),
      namedNode(`${URI.ORCID_PREFIX}${orcidId}`),
      provenanceGraph
    );
  }

  writer.addQuad(
    namedNode(xHandle),
    namedNode(URI.FOAF_NAME),
    literal(name),
    pubinfoGraph
  );

  writer.addQuad(
    namedNode(URI.BASE_URI),
    namedNode(URI.CREATOR),
    namedNode(xHandle),
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
        console.error('Error writing the TriG data:', error);
        reject(error);
      } else {
        console.log('TriG data:', result);

        try {
          const np = new Nanopub(result);
          resolve(np);
        } catch (e) {
          console.error('Error creating or signing Nanopub:', e);
          reject(e);
        }
      }
    });
  });
};
