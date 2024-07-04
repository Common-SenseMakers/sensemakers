import { Nanopub } from '@nanopub/sign';
import { DataFactory, Writer } from 'n3';

import { NanupubSignupData } from '../../@shared/types/types.nanopubs';
import { buildNpHead } from './create.nanopub';

const { namedNode, literal } = DataFactory;

export const createIntroNanopublication = async (
  details: NanupubSignupData,
  authorizedKey: string
) => {
  return buildIntroNp(
    '',
    'test-user-handle', //TODO: hardcoded for now but figure out how to get this info
    details.ethAddress,
    'test-user-name', //TODO: hardcoded for now but figure out how to get this info
    details.rsaPublickey,
    details.ethToRsaSignature
  );
};

export const buildIntroNp = async (
  orcidId: string,
  twitterHandle: string,
  ethAddress: string,
  name: string,
  pubKey: string,
  signature: string
): Promise<Nanopub> => {
  return new Promise((resolve, reject) => {
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

    // End the writer and handle the resulting TriG data
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
