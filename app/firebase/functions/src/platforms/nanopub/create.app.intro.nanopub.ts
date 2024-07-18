import { Nanopub } from '@nanopub/sign';
import { DataFactory, Writer } from 'n3';
import * as URI from './constants';

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
    const assertionGraph = namedNode(URI.ASSERTION_URI);
    const provenanceGraph = namedNode(URI.PROVENANCE_URI);
    const pubinfoGraph = namedNode(URI.PUBINFO_URI);
    const keyDeclarationNode1 = namedNode(`${URI.BASE_URI}${ethAddress1}`);
    const keyDeclarationNode2 = namedNode(`${URI.BASE_URI}${ethAddress2}`);
    const appAgentNode = namedNode(URI.COSMO_PREFIX);
    const npx = URI.NPX_PREFIX;
    const name = 'SenseCast';
    // Create a writer and add prefixes
    const writer = new Writer({ format: 'application/trig' });
    writer.addPrefixes(
      URI.introPrefixes
    );

    // Add headStore quads to the writer
    headStore.getQuads(null, null, null, null).forEach((quad) => {
      writer.addQuad(quad);
    });

    // Add triples to the assertion graph
    //first key declaration, for the official key
    writer.addQuad(
      appAgentNode,
      namedNode(URI.FOAF_NAME),
      literal(name),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode1,
      namedNode(URI.NP_DECLARED_BY),
      appAgentNode,
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode1,
      namedNode(URI.NP_HAS_ALGORITHM),
      literal('RSA'),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode1,
      namedNode(URI.NP_HAS_PUBLIC_KEY),
      literal(pubKey1),
      assertionGraph
    );

    writer.addQuad(
      keyDeclarationNode1,
      namedNode(URI.PROV_WAS_DERIVED_FROM),
      literal(ethAddress1),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode1,
      namedNode(URI.NP_HAS_DERIVATION_PATH),
      literal('/nanopub/0'),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode1,
      namedNode(URI.NP_HAS_DERIVATION_STANDARD),
      literal('BIP-32'),
      assertionGraph
    );

    const derivationProofNode1 = namedNode(
      `${URI.BASE_URI}derivationProof${ethAddress1}`
    );
    writer.addQuad(
      keyDeclarationNode1,
      namedNode(URI.NP_HAS_DERIVATION_PROOF),
      derivationProofNode1,
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode1,
      namedNode(URI.NP_HAS_ALGORITHM),
      namedNode('https://eips.ethereum.org/EIPS/eip-191'),
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode1,
      namedNode(URI.NP_HAS_PUBLIC_KEY),
      literal(ethAddress1),
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode1,
      namedNode(URI.NP_HAS_SIGNATURE_TARGET),
      literal(`This account controls the RSA public key: ${pubKey1}`),
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode1,
      namedNode(URI.NP_HAS_ALGORITHM),
      literal(signature1),
      assertionGraph
    );

    //Declare the second RSA key

    writer.addQuad(
      keyDeclarationNode2,
      namedNode(URI.NP_DECLARED_BY),
      appAgentNode,
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode2,
      namedNode(URI.NP_HAS_ALGORITHM),
      literal('RSA'),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode2,
      namedNode(URI.NP_HAS_PUBLIC_KEY),
      literal(pubKey2),
      assertionGraph
    );

    writer.addQuad(
      keyDeclarationNode2,
      namedNode(URI.PROV_WAS_DERIVED_FROM),
      literal(ethAddress2),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode2,
      namedNode(URI.NP_HAS_DERIVATION_PATH),
      literal('/nanopub/0'),
      assertionGraph
    );
    writer.addQuad(
      keyDeclarationNode2,
      namedNode(URI.NP_HAS_DERIVATION_STANDARD),
      literal('BIP-32'),
      assertionGraph
    );

    const derivationProofNode2 = namedNode(
      `${URI.BASE_URI}derivationProof${ethAddress2}`
    );
    writer.addQuad(
      keyDeclarationNode2,
      namedNode(URI.NP_HAS_DERIVATION_PROOF),
      derivationProofNode2,
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode2,
      namedNode(URI.NP_HAS_ALGORITHM),
      namedNode('https://eips.ethereum.org/EIPS/eip-191'),
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode2,
      namedNode(URI.NP_HAS_PUBLIC_KEY),
      literal(ethAddress2),
      assertionGraph
    );
    writer.addQuad(
      derivationProofNode2,
      namedNode(URI.NP_HAS_SIGNATURE_TARGET),
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
      namedNode(URI.ASSERTION_URI),
      namedNode(URI.PROV_WAS_ATTRIBUTED_TO),
      appAgentNode,
      provenanceGraph
    );

    // Add triples to the pubinfo graph
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
      literal(ethAddress1),
      pubinfoGraph
    );

    writer.addQuad(
      namedNode(URI.BASE_URI),
      namedNode(URI.CREATOR),
      appAgentNode,
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
