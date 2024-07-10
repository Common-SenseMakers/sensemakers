import { Nanopub } from '@nanopub/sign';
import { DataFactory, Quad, Store, Writer } from 'n3';

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
  const PROVENANCE_URI = 'http://purl.org/nanopub/temp/mynanopub#provenance';
  const provenanceGraphUri = namedNode(PROVENANCE_URI);

  // Define the subjects, predicates, and objects
  const cosmo = namedNode('https://sense-nets.xyz/');
  const xHandle = namedNode('https://x.com/' + twitterHandle);
  const assertion = namedNode(
    'http://purl.org/nanopub/temp/mynanopub#assertion'
  );
  const activity = namedNode('http://purl.org/nanopub/temp/mynanopub#activity');

  // Add quads to the store based on post_type
  const activityType =
    postType === 'sup'
      ? namedNode('https://sense-nets.xyz/supervisedActivity')
      : namedNode('https://sense-nets.xyz/unsupervisedActivity');

  store.addQuad(
    quad(
      cosmo,
      namedNode('http://www.w3.org/ns/prov#actedOnBehalfOf'),
      xHandle,
      provenanceGraphUri
    )
  );
  store.addQuad(
    quad(
      cosmo,
      namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      namedNode('http://www.w3.org/ns/prov#SoftwareAgent'),
      provenanceGraphUri
    )
  );
  store.addQuad(
    quad(
      activity,
      namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
      activityType,
      provenanceGraphUri
    )
  );
  store.addQuad(
    quad(
      activity,
      namedNode('http://www.w3.org/ns/prov#wasAssociatedWith'),
      cosmo,
      provenanceGraphUri
    )
  );
  store.addQuad(
    quad(
      assertion,
      namedNode('http://www.w3.org/ns/prov#wasAttributedTo'),
      xHandle,
      provenanceGraphUri
    )
  );
  store.addQuad(
    quad(
      assertion,
      namedNode('http://www.w3.org/ns/prov#wasGeneratedBy'),
      activity,
      provenanceGraphUri
    )
  );
  store.addQuad(
    quad(
      assertion,
      namedNode('http://www.w3.org/ns/prov#linksTo'),
      namedNode(tweetUrl),
      provenanceGraphUri
    )
  );

  // If ORCID ID exists, add it to the provenance graph
  if (orcidId) {
    const orcidNode = namedNode('https://orcid.org/' + orcidId);
    store.addQuad(
      quad(
        assertion,
        namedNode('http://www.w3.org/ns/prov#wasAttributedTo'),
        orcidNode,
        provenanceGraphUri
      )
    );
    store.addQuad(
      quad(
        xHandle,
        namedNode('http://www.w3.org/ns/prov#wasAttributedTo'),
        orcidNode,
        provenanceGraphUri
      )
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
  const ASSERTION_URI = 'http://purl.org/nanopub/temp/mynanopub#assertion';
  const assertionGraphUri = namedNode(ASSERTION_URI);

  // Create a new store for the assertion
  const store = new Store();
  //attributing the assertion to twitter user
  store.addQuad(
    assertionGraphUri,
    namedNode('http://www.w3.org/2000/01/rdf-schema#comment'),
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
    namedNode('http://www.w3.org/ns/prov#wasAttributedTo'),
    namedNode('https://x.com/' + twitterHandle),
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
  const BASE_URI = 'http://purl.org/nanopub/temp/mynanopub#';
  const baseGraphUri = namedNode(BASE_URI);
  const pubinfoGraphUri = namedNode(BASE_URI + 'pubinfo');
  const xHandle = namedNode('https://x.com/' + twitterHandle);

  // Create a new store for the assertion
  const store = new Store();
  //adding constant triplets
  store.addQuad(
    xHandle,
    namedNode('http://xmlns.com/foaf/0.1/name'),
    literal(name),
    pubinfoGraphUri
  );
  // If ORCID ID exists, add it to the provenance graph
  if (orcidId) {
    const orcidNode = namedNode('https://orcid.org/' + orcidId);
    store.addQuad(
      quad(
        orcidNode,
        namedNode('http://xmlns.com/foaf/0.1/name'),
        literal(name),
        pubinfoGraphUri
      )
    );
    store.addQuad(
      quad(
        baseGraphUri,
        namedNode('http://www.w3.org/ns/prov#wasAttributedTo'),
        orcidNode,
        pubinfoGraphUri
      )
    );
  }

  store.addQuad(
    baseGraphUri,
    namedNode('http://www.w3.org/ns/prov#wasAttributedTo'),
    namedNode('https://x.com/' + twitterHandle),
    pubinfoGraphUri
  );
  store.addQuad(
    baseGraphUri,
    namedNode('http://purl.org/nanopub/x/hasNanopubType'),
    namedNode('https://sense-nets.xyz/SemanticPost'),
    pubinfoGraphUri
  );
  store.addQuad(
    baseGraphUri,
    namedNode('http://purl.org/nanopub/x/wasCreatedAt'),
    namedNode('https://sense-nets.xyz/'),
    pubinfoGraphUri
  );
  store.addQuad(
    baseGraphUri,
    namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
    literal('CoSMO Semantic Post'),
    pubinfoGraphUri
  );
  store.addQuad(
    baseGraphUri,
    namedNode('https://sense-nets.xyz/hasRootSinger'),
    literal(ethAddress),
    pubinfoGraphUri
  );
  //If we call this function to update, then oldNpUri is non empty and we add a triplet
  if (oldNpUri) {
    store.addQuad(
      namedNode('http://purl.org/nanopub/temp/mynanopub#'),
      namedNode('http://purl.org/nanopub/x/supersesdes'),
      namedNode(oldNpUri),
      namedNode('http://purl.org/nanopub/temp/mynanopub#pubinfo')
    );
  }
  //if post type is unsupervised then add
  if (postType == 'unsup') {
    store.addQuad(
      quad(
        namedNode(BASE_URI + 'sig'),
        namedNode('http://purl.org/nanopub/x/singedBy'),
        namedNode('https://sense-nets.xyz/'),
        pubinfoGraphUri
      )
    );
  }
  return store;
};

export const buildNpHead = (): Store => {
  // build nanopub head
  const headStore = new Store();
  const BASE_URI = 'http://purl.org/nanopub/temp/mynanopub#';
  const baseGraphUri = namedNode(BASE_URI);
  const headGraphUri = namedNode(BASE_URI + 'head');

  headStore.addQuad(
    baseGraphUri,
    namedNode('http://www.nanopub.org/nschema#hasAssertion'),
    namedNode(BASE_URI + 'assertion'),
    headGraphUri
  );
  headStore.addQuad(
    baseGraphUri,
    namedNode('http://www.nanopub.org/nschema#hasProvenance'),
    namedNode(BASE_URI + 'provenance'),
    headGraphUri
  );

  headStore.addQuad(
    baseGraphUri,
    namedNode('http://www.nanopub.org/nschema#hasPublicationInfo'),
    namedNode(BASE_URI + 'pubinfo'),
    headGraphUri
  );
  headStore.addQuad(
    baseGraphUri,
    namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'),
    namedNode('http://www.nanopub.org/nschema#Nanopublication'),
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
      base: 'http://purl.org/nanopub/temp/mynanopub#',
      cosmo: 'https://sense-nets.xyz/',
      dct: 'http://purl.org/dc/terms/',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      ns1: 'http://purl.org/np/',
      foaf: 'http://xmlns.com/foaf/0.1/',
      schema: 'https://schema.org/',
      x: 'https://x.com/',
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
        namedNode('http://purl.org/nanopub/temp/mynanopub#head')
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
        namedNode('http://purl.org/nanopub/temp/mynanopub#assertion')
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
        namedNode('http://purl.org/nanopub/temp/mynanopub#provenance')
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
        namedNode('http://purl.org/nanopub/temp/mynanopub#pubinfo')
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
    const BASE_URI = 'http://purl.org/nanopub/temp/mynanopub#';
    const assertionGraph = namedNode(`${BASE_URI}assertion`);
    const provenanceGraph = namedNode(`${BASE_URI}provenance`);
    const pubinfoGraph = namedNode(`${BASE_URI}pubinfo`);
    const x = 'https://x.com/';
    const keyDeclarationNode = namedNode(`${BASE_URI}${ethAddress}`);
    const twitterNode = namedNode(`${x}${twitterHandle}`);
    const npx = 'http://purl.org/nanopub/x/';

    // Create a writer and add prefixes
    const writer = new Writer({ format: 'application/trig' });
    writer.addPrefixes({
      base: BASE_URI,
      cosmo: 'https://sense-nets.xyz/',
      dct: 'http://purl.org/dc/terms/',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      ns1: 'http://purl.org/np/',
      foaf: 'http://xmlns.com/foaf/0.1/',
      schema: 'https://schema.org/',
      x: 'https://x.com/',
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
      namedNode('http://xmlns.com/foaf/0.1/name'),
      literal(name),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode,
      namedNode(`${npx}declaredBy`),
      twitterNode,
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode,
      namedNode(`${npx}hasAlgorithm`),
      literal('RSA'),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode,
      namedNode(`${npx}hasPublicKey`),
      literal(pubKey),
      assertionGraph
    );

    writer.addQuad(
      keyDeclarationNode,
      namedNode('http://www.w3.org/ns/prov#wasDerivedFrom'),
      literal(ethAddress),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode,
      namedNode('https://sense-nets.xyz/hasDerivationPath'),
      literal('/nanopub/0'),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode,
      namedNode('https://sense-nets.xyz/hasDerivationWithStandard'),
      literal('BIP-32'),
      assertionGraph
    );

    const derivationProofNode = namedNode(`${BASE_URI}derivationProof`);
    writer.addQuad(
      derivationProofNode,
      namedNode(`${npx}hasAlgorithm`),
      namedNode('https://eips.ethereum.org/EIPS/eip-191'),
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode,
      namedNode(`${npx}hasPublicKey`),
      literal(ethAddress),
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode,
      namedNode(`${npx}hasSignatureTarget`),
      literal(`This account controls the RSA public key: ${pubKey}`),
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode,
      namedNode(`${npx}hasSignature`),
      literal(signature),
      assertionGraph
    );

    // Give permission on behalf of user to a key
    if (signDelegation) {
      const signingDelegationNode = namedNode(`${BASE_URI}signingDelegation`);
      writer.addQuad(
        signingDelegationNode,
        namedNode(`${npx}declaredAsDelegationBy`),
        twitterNode,
        assertionGraph
      );
      writer.addQuad(
        signingDelegationNode,
        namedNode('https://sense-nets.xyz/DelegatedTo'),
        namedNode('https://sense-nets.xyz/'),
        assertionGraph
      );
      writer.addQuad(
        signingDelegationNode,
        namedNode('https://sense-nets.xyz/DelegatedBy'),
        twitterNode,
        assertionGraph
      );
      writer.addQuad(
        signingDelegationNode,
        namedNode('https://sense-nets.xyz/withKeyDecleration'),
        namedNode('https://example.org/appKeyDecleration'),
        assertionGraph
      );
    }

    // Add triples to the provenance graph
    writer.addQuad(
      namedNode(`${BASE_URI}assertion`),
      namedNode('prov:wasAttributedTo'),
      twitterNode,
      provenanceGraph
    );
    if (orcidId) {
      const orcidNode = namedNode('https://orcid.org/' + orcidId);
      writer.addQuad(
        namedNode(`${BASE_URI}assertion`),
        namedNode('http://www.w3.org/ns/prov#wasAttributedTo'),
        orcidNode,
        provenanceGraph
      );
    }

    // Add triples to the pubinfo graph
    writer.addQuad(
      namedNode(`${BASE_URI}`),
      namedNode(`${npx}wasCreatedAt`),
      namedNode('https://sense-nets.xyz/'),
      pubinfoGraph
    );

    writer.addQuad(
      namedNode(BASE_URI),
      namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
      literal('CoSMO Sensemaker intro'),
      pubinfoGraph
    );

    writer.addQuad(
      namedNode(BASE_URI),
      namedNode('https://sense-nets.xyz/hasRootSinger'),
      literal(ethAddress),
      pubinfoGraph
    );

    writer.addQuad(
      namedNode(BASE_URI),
      namedNode('http://purl.org/dc/terms/creator'),
      twitterNode,
      pubinfoGraph
    );
    if (oldNpUri) {
        writer.addQuad(
          namedNode('http://purl.org/nanopub/temp/mynanopub#'),
          namedNode('http://purl.org/nanopub/x/supersesdes'),
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
  const xHandle = `https://x.com/${twitter_handle}`;
  const BASE_URI = 'http://purl.org/nanopub/temp/mynanopub#';
  const assertionGraph = namedNode(`${BASE_URI}assertion`);
  const provenanceGraph = namedNode(`${BASE_URI}provenance`);
  const pubinfoGraph = namedNode(`${BASE_URI}pubinfo`);

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
    x: 'https://x.com/',
  });

  const headStore = buildNpHead();
  headStore.getQuads(null, null, null, null).forEach((quad) => {
    writer.addQuad(quad);
  });

  writer.addQuad(
    namedNode(xHandle),
    namedNode('http://purl.org/nanopub/x/retracts'),
    namedNode(targetNp),
    assertionGraph
  );

  writer.addQuad(
    namedNode(`${BASE_URI}assertion`),
    namedNode('http://www.w3.org/ns/prov#wasAttributedTo'),
    namedNode(xHandle),
    provenanceGraph
  );
  if (orcidId) {
    writer.addQuad(
      namedNode(BASE_URI),
      namedNode('http://www.w3.org/ns/prov#wasAttributedTo'),
      namedNode(`https://orcid.org/${orcidId}`),
      provenanceGraph
    );
  }

  writer.addQuad(
    namedNode(xHandle),
    namedNode('http://xmlns.com/foaf/0.1/name'),
    literal(name),
    pubinfoGraph
  );

  writer.addQuad(
    namedNode(BASE_URI),
    namedNode('http://purl.org/dc/terms/creator'),
    namedNode(xHandle),
    pubinfoGraph
  );

  writer.addQuad(
    namedNode(BASE_URI),
    namedNode('http://purl.org/dc/terms/license'),
    namedNode('https://creativecommons.org/licenses/by/4.0/'),
    pubinfoGraph
  );

  writer.addQuad(
    namedNode(BASE_URI),
    namedNode('http://purl.org/nanopub/x/wasCreatedAt'),
    namedNode('https://sense-nets.xyz/'),
    pubinfoGraph
  );

  writer.addQuad(
    namedNode(BASE_URI),
    namedNode('http://www.w3.org/2000/01/rdf-schema#label'),
    literal('CoSMO Semantic Post retraction'),
    pubinfoGraph
  );

  writer.addQuad(
    namedNode(BASE_URI),
    namedNode('https://sense-nets.xyz/hasRootSinger'),
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
