import { Nanopub } from '@nanopub/sign';
import { DataFactory, Writer } from 'n3';

import { getEthToRSAMessage } from '../../@shared/utils/nanopub.sign.util';
import { logger } from '../../instances/logger';
import * as URI from './constants';
import { SupersedesOptions, buildNpHead } from './nanopub.utils';

const DEBUG = false;

const { namedNode, literal } = DataFactory;

export const buildLinkAccountsNanopub = async (
  ethAddress: string,
  pubKey: string,
  signature: string
): Promise<Nanopub> => {
  return new Promise((resolve, reject) => {
    const headStore = buildNpHead();

    // Define the graph URIs
    const baseNode = namedNode(URI.BASE_URI);
    const assertionGraph = namedNode(URI.ASSERTION_URI);
    const provenanceGraph = namedNode(URI.PROVENANCE_URI);
    const pubinfoGraph = namedNode(URI.PUBINFO_URI);
    const keyDeclarationNode = namedNode(
      `${URI.KEY_DECLARATION_URI}${ethAddress}`
    );
    const name = 'Sensenets';
    // Create a writer and add prefixes
    const writer = new Writer({ format: 'application/trig' });
    writer.addPrefixes(URI.introPrefixes);

    // Add headStore quads to the writer
    headStore.getQuads(null, null, null, null).forEach((quad) => {
      writer.addQuad(quad);
    });

    // Add triples to the assertion graph
    // first key declaration, for the official key
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

    const verificationProofNode = namedNode(
      `${URI.VERIFICATION_PROOF_URI}${ethAddress}`
    );
    writer.addQuad(
      keyDeclarationNode,
      namedNode(URI.NP_HAS_DERIVATION_PROOF),
      verificationProofNode,
      assertionGraph
    );
    writer.addQuad(
      verificationProofNode,
      namedNode(URI.NP_HAS_ALGORITHM),
      namedNode('https://eips.ethereum.org/EIPS/eip-191'),
      assertionGraph
    );
    writer.addQuad(
      verificationProofNode,
      namedNode(URI.NP_HAS_PUBLIC_KEY),
      literal(ethAddress),
      assertionGraph
    );
    writer.addQuad(
      verificationProofNode,
      namedNode(URI.NP_HAS_SIGNATURE_TARGET),
      literal(getEthToRSAMessage(ethAddress)),
      assertionGraph
    );
    writer.addQuad(
      verificationProofNode,
      namedNode(URI.NP_HAS_SIGNATURE),
      literal(signature),
      assertionGraph
    );

    const appAgentNode = namedNode(URI.COSMO_PREFIX);

    // Add triples to the provenance graph
    writer.addQuad(
      assertionGraph,
      namedNode(URI.PROV_WAS_ATTRIBUTED_TO),
      appAgentNode,
      provenanceGraph
    );

    writer.addQuad(
      baseNode,
      namedNode(URI.LABEL),
      literal('CoSMO Sensemaker RSA-ETH Keys Linking'),
      pubinfoGraph
    );

    writer.addQuad(
      baseNode,
      namedNode(URI.NP_HAS_ROOT_SIGNER),
      literal(ethAddress),
      pubinfoGraph
    );

    writer.addQuad(
      baseNode,
      namedNode(URI.CREATOR),
      appAgentNode,
      pubinfoGraph
    );

    // Instantiate Nanopub profile (ORCID and name are optional)
    //const profile = new NpProfile(privateKey, "https://orcid.org/" + orcidId, name);

    // End the writer and handle the resulting TriG data
    writer.end(async (error, result) => {
      if (error) {
        logger.error('Error writing the TriG data:', error);
        reject(error);
      } else {
        if (DEBUG) logger.debug('TriG data:', result);
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

export const buildAppIntroNp = async (
  ethAddress1: string,
  ethAddress2: string,
  pubKey1: string,
  pubKey2: string,
  signature1: string,
  signature2: string,
  supersedesOptions?: SupersedesOptions
): Promise<Nanopub> => {
  return new Promise((resolve, reject) => {
    const headStore = buildNpHead();

    // Define the graph URIs
    const baseNode = namedNode(URI.BASE_URI);
    const assertionGraph = namedNode(URI.ASSERTION_URI);
    const provenanceGraph = namedNode(URI.PROVENANCE_URI);
    const pubinfoGraph = namedNode(URI.PUBINFO_URI);
    const keyDeclarationNode1 = namedNode(
      `${URI.KEY_DECLARATION_URI}${ethAddress1}`
    );
    const keyDeclarationNode2 = namedNode(
      `${URI.KEY_DECLARATION_URI}${ethAddress2}`
    );
    const appAgentNode = namedNode(URI.COSMO_PREFIX);
    const name = 'Sensenets';
    // Create a writer and add prefixes
    const writer = new Writer({ format: 'application/trig' });
    writer.addPrefixes(URI.introPrefixes);

    // Add headStore quads to the writer
    headStore.getQuads(null, null, null, null).forEach((quad) => {
      writer.addQuad(quad);
    });

    // Add triples to the assertion graph
    // first key declaration, for the official key
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
      `${URI.DERIVATION_PROOF_URI}${ethAddress1}`
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
      namedNode(URI.NP_HAS_SIGNATURE),
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
      `${URI.DERIVATION_PROOF_URI}${ethAddress2}`
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
      namedNode(URI.NP_HAS_SIGNATURE),
      literal(signature2),
      assertionGraph
    );

    // Add triples to the provenance graph
    writer.addQuad(
      assertionGraph,
      namedNode(URI.PROV_WAS_ATTRIBUTED_TO),
      appAgentNode,
      provenanceGraph
    );

    // Add triples to the pubinfo graph
    writer.addQuad(
      baseNode,
      namedNode(URI.NP_WAS_CREATED_AT),
      namedNode(URI.COSMO_PREFIX),
      pubinfoGraph
    );

    writer.addQuad(
      baseNode,
      namedNode(URI.LABEL),
      literal('CoSMO Sensemaker intro'),
      pubinfoGraph
    );

    writer.addQuad(
      baseNode,
      namedNode(URI.NP_HAS_ROOT_SIGNER),
      literal(ethAddress1),
      pubinfoGraph
    );

    writer.addQuad(
      baseNode,
      namedNode(URI.CREATOR),
      appAgentNode,
      pubinfoGraph
    );
    if (supersedesOptions) {
      writer.addQuad(
        baseNode,
        namedNode(URI.NP_SUPERSEDES),
        namedNode(supersedesOptions.latest),
        pubinfoGraph
      );
      writer.addQuad(
        namedNode(URI.BASE_URI),
        namedNode(URI.NP_HAS_ORIGNAL_VERSION),
        namedNode(supersedesOptions.root),
        pubinfoGraph
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
        if (DEBUG) logger.debug('TriG data:', result);
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
