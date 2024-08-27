import { Nanopub } from '@nanopub/sign';
import { DataFactory, Writer } from 'n3';

import { getEthToRSAMessage } from '../../@shared/utils/nanopub.sign.util';
import { logger } from '../../instances/logger';
import * as URI from './constants';
import { buildNpHead } from './nanopub.utils';


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
    const appAgentNode = namedNode(URI.COSMO_PREFIX);

    
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
      assertionGraph,
      namedNode(URI.NP_DECLARED_BY),
      appAgentNode,
      assertionGraph
    );
    writer.addQuad(
      assertionGraph,
      namedNode(URI.NP_HAS_ALGORITHM),
      literal('RSA'),
      assertionGraph
    );
    writer.addQuad(
      assertionGraph,
      namedNode(URI.NP_HAS_PUBLIC_KEY),
      literal(pubKey),
      assertionGraph
    );

    writer.addQuad(
      assertionGraph,
      namedNode(URI.PROV_WAS_DERIVED_FROM),
      literal(ethAddress),
      assertionGraph
    );

    const verificationProofNode = namedNode(
      `${URI.VERIFICATION_PROOF_URI}${ethAddress}`
    );
    writer.addQuad(
      assertionGraph,
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
      literal('CoSMO RSA-ETH Keys Linking'),
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
    writer.addQuad(
      namedNode(URI.BASE_URI),
      namedNode(URI.LICENSE),
      namedNode(URI.CREATIVECOMMONS4),
      pubinfoGraph
    );
    writer.addQuad(
      namedNode(URI.BASE_URI),
      namedNode(URI.NP_HAS_NANOPUB_TYPE),
      namedNode(URI.LINKING_KEYS_DOCUMENT),
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
  rootKeysUri: string,
  rootRSAKey: string,
  approvedKeysUri: string,
  approvedRSAKey: string
): Promise<Nanopub> => {
  return new Promise((resolve, reject) => {
    const headStore = buildNpHead();

    // Define the graph URIs
    const baseNode = namedNode(URI.BASE_URI);
    const assertionGraph = namedNode(URI.ASSERTION_URI);
    const provenanceGraph = namedNode(URI.PROVENANCE_URI);
    const pubinfoGraph = namedNode(URI.PUBINFO_URI);

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
    // useful FOAF_NAME
    writer.addQuad(
      appAgentNode,
      namedNode(URI.FOAF_NAME),
      literal(name),
      assertionGraph
    );

    // Keys declaration nodes
    const rootKeyDeclarationNode = namedNode(`${URI.KEY_DECLARATION_URI}-root`);
    const approvedKeyDeclarationNode = namedNode(
      `${URI.KEY_DECLARATION_URI}-approved`
    );
    writer.addQuad(
      rootKeyDeclarationNode,
      namedNode(URI.NP_DECLARED_BY),
      appAgentNode,
      assertionGraph
    );
    writer.addQuad(
      rootKeyDeclarationNode,
      namedNode(URI.NP_HAS_ALGORITHM),
      literal('RSA'),
      assertionGraph
    );
    writer.addQuad(
      rootKeyDeclarationNode,
      namedNode(URI.NP_HAS_PUBLIC_KEY),
      literal(rootRSAKey),
      assertionGraph
    );
    writer.addQuad(
      rootKeyDeclarationNode,
      namedNode(URI.HAS_KEYS_LINKING_DOCUMENT),
      namedNode(rootKeysUri),
      assertionGraph
    );
    writer.addQuad(
      approvedKeyDeclarationNode,
      namedNode(URI.NP_DECLARED_BY),
      appAgentNode,
      assertionGraph
    );
    writer.addQuad(
      approvedKeyDeclarationNode,
      namedNode(URI.NP_HAS_ALGORITHM),
      literal('RSA'),
      assertionGraph
    );
    writer.addQuad(
      approvedKeyDeclarationNode,
      namedNode(URI.NP_HAS_PUBLIC_KEY),
      literal(approvedRSAKey),
      assertionGraph
    );
    writer.addQuad(
      approvedKeyDeclarationNode,
      namedNode(URI.HAS_KEYS_LINKING_DOCUMENT),
      namedNode(approvedKeysUri),
      assertionGraph
    );

    // attribution
    writer.addQuad(
      assertionGraph,
      namedNode(URI.PROV_WAS_ATTRIBUTED_TO),
      appAgentNode,
      provenanceGraph
    );

    // explicit approval from root to approved key
    /*writer.addQuad(
      rootKeyDeclarationNode,
      namedNode(URI.APPROVES_PUBLISHING_AS_US),
      approvedKeyDeclarationNode,
      assertionGraph
    );*/

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
      literal('CoSMO Sensemaking Networks app intro'),
      pubinfoGraph
    );

    writer.addQuad(
      baseNode,
      namedNode(URI.CREATOR),
      appAgentNode,
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
      namedNode(URI.NP_HAS_NANOPUB_TYPE),
      namedNode(URI.COSMO_APP_INTRO),
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
