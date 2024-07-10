import { Nanopub } from '@nanopub/sign';
import { DataFactory, Writer } from 'n3';

import { buildNpHead } from './utils';

const { namedNode, literal } = DataFactory;

export const buildAppIntroNp = async (
  ethAddress1: string,
  ethAddress2: string,
  pubKey1: string,
  pubKey2: string,
  signature1: string,
  signature2: string,
  oldNpUri?: string
): Promise<Nanopub> => {
  return new Promise((resolve, reject) => {
    const headStore = buildNpHead();

    // Define the graph URIs
    const BASE_URI = 'http://purl.org/nanopub/temp/mynanopub#';
    const assertionGraph = namedNode(`${BASE_URI}assertion`);
    const provenanceGraph = namedNode(`${BASE_URI}provenance`);
    const pubinfoGraph = namedNode(`${BASE_URI}pubinfo`);
    const keyDeclarationNode1 = namedNode(`${BASE_URI}${ethAddress1}`);
    const keyDeclarationNode2 = namedNode(`${BASE_URI}${ethAddress2}`);
    const appAgentNode = namedNode('https://sense-nets.xyz/');
    const npx = 'http://purl.org/nanopub/x/';
    const name = 'SenseCast';
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
    //first key declaration, for the official key
    writer.addQuad(
      appAgentNode,
      namedNode('http://xmlns.com/foaf/0.1/name'),
      literal(name),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode1,
      namedNode(`${npx}declaredBy`),
      appAgentNode,
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode1,
      namedNode(`${npx}hasAlgorithm`),
      literal('RSA'),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode1,
      namedNode(`${npx}hasPublicKey`),
      literal(pubKey1),
      assertionGraph
    );

    writer.addQuad(
      keyDeclarationNode1,
      namedNode('http://www.w3.org/ns/prov#wasDerivedFrom'),
      literal(ethAddress1),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode1,
      namedNode('https://sense-nets.xyz/hasDerivationPath'),
      literal('/nanopub/0'),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode1,
      namedNode('https://sense-nets.xyz/hasDerivationWithStandard'),
      literal('BIP-32'),
      assertionGraph
    );

    const derivationProofNode1 = namedNode(
      `${BASE_URI}derivationProof${ethAddress1}`
    );
    writer.addQuad(
      keyDeclarationNode1,
      namedNode('https://sense-nets.xyz/hasDerivationProof'),
      derivationProofNode1,
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode1,
      namedNode(`${npx}hasAlgorithm`),
      namedNode('https://eips.ethereum.org/EIPS/eip-191'),
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode1,
      namedNode(`${npx}hasPublicKey`),
      literal(ethAddress1),
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode1,
      namedNode(`${npx}hasSignatureTarget`),
      literal(`This account controls the RSA public key: ${pubKey1}`),
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode1,
      namedNode(`${npx}hasSignature`),
      literal(signature1),
      assertionGraph
    );

    //Declare the second RSA key

    writer.addQuad(
      keyDeclarationNode2,
      namedNode(`${npx}declaredBy`),
      appAgentNode,
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode2,
      namedNode(`${npx}hasAlgorithm`),
      literal('RSA'),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode2,
      namedNode(`${npx}hasPublicKey`),
      literal(pubKey2),
      assertionGraph
    );

    writer.addQuad(
      keyDeclarationNode2,
      namedNode('http://www.w3.org/ns/prov#wasDerivedFrom'),
      literal(ethAddress2),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode2,
      namedNode('https://sense-nets.xyz/hasDerivationPath'),
      literal('/nanopub/0'),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode2,
      namedNode('https://sense-nets.xyz/hasDerivationWithStandard'),
      literal('BIP-32'),
      assertionGraph
    );

    const derivationProofNode2 = namedNode(
      `${BASE_URI}derivationProof${ethAddress2}`
    );
    writer.addQuad(
      keyDeclarationNode2,
      namedNode('https://sense-nets.xyz/hasDerivationProof'),
      derivationProofNode2,
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode2,
      namedNode(`${npx}hasAlgorithm`),
      namedNode('https://eips.ethereum.org/EIPS/eip-191'),
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode2,
      namedNode(`${npx}hasPublicKey`),
      literal(ethAddress2),
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode2,
      namedNode(`${npx}hasSignatureTarget`),
      literal(`This account controls the RSA public key: ${pubKey1}`),
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode2,
      namedNode(`${npx}hasSignature`),
      literal(signature2),
      assertionGraph
    );

    // Add triples to the provenance graph
    writer.addQuad(
      namedNode(`${BASE_URI}assertion`),
      namedNode('prov:wasAttributedTo'),
      appAgentNode,
      provenanceGraph
    );

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
      literal(ethAddress1),
      pubinfoGraph
    );

    writer.addQuad(
      namedNode(BASE_URI),
      namedNode('http://purl.org/dc/terms/creator'),
      appAgentNode,
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
