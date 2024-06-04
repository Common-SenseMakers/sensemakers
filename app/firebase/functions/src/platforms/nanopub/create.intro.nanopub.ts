import { Nanopub } from '@nanopub/sign';
import { DataFactory, Store } from 'n3';

import { NanupubSignupData } from '../../@shared/types/types.nanopubs';
import { writeRDF } from '../../@shared/utils/n3.utils';
import { getEthToRSAMessage } from '../../@shared/utils/nanopub.sign.util';
import { NANOPUB_PLACEHOLDER } from '../../@shared/utils/semantics.helper';

export const createIntroNanopublication = async (
  details: NanupubSignupData,
  authorizedKey: string
) => {
  const assertionsStore = new Store();

  /**
   * TODO: This makes no sense. Its a placeholder but the actual
   * structure is completely TBD
   */

  assertionsStore.addQuad(
    DataFactory.namedNode(`https://sense-nets.xyz/${details.ethAddress}`),
    DataFactory.namedNode('https://schema.org/owns'),
    DataFactory.literal(details.rsaPublickey),
    DataFactory.defaultGraph()
  );

  assertionsStore.addQuad(
    DataFactory.namedNode(`https://sense-nets.xyz/${details.ethAddress}`),
    DataFactory.namedNode('https://schema.org/hasSignature'),
    DataFactory.literal(details.ethToRsaSignature),
    DataFactory.defaultGraph()
  );

  assertionsStore.addQuad(
    DataFactory.namedNode(`https://sense-nets.xyz/thisSignature`),
    DataFactory.namedNode('https://schema.org/isOfText'),
    DataFactory.literal(getEthToRSAMessage(details.rsaPublickey)),
    DataFactory.defaultGraph()
  );

  assertionsStore.addQuad(
    DataFactory.namedNode(`https://sense-nets.xyz/${details.ethAddress}`),
    DataFactory.namedNode('https://schema.org/approvesPostingOnBahalf'),
    DataFactory.literal(authorizedKey),
    DataFactory.defaultGraph()
  );

  /** Then get the RDF as triplets */
  const assertionsRdf = await writeRDF(assertionsStore);

  /** append the npx:ExampleNanopub (manually for now) */
  const exampleTriplet = `: <http://purl.org/nanopub/x/hasNanopubType> npx:ExampleNanopub .`;

  const rdfStr = `
    @prefix : <${NANOPUB_PLACEHOLDER}> .
    @prefix np: <http://www.nanopub.org/nschema#> .
    @prefix dct: <http://purl.org/dc/terms/> .
    @prefix nt: <https://w3id.org/np/o/ntemplate/> .
    @prefix npx: <http://purl.org/nanopub/x/> .
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
    @prefix orcid: <https://orcid.org/> .
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
      ${assertionsRdf}
    }
    
    :provenance {
      :assertion prov:wasAttributedTo "${details.ethAddress}" .
    }
    
    :pubinfo {
      ${exampleTriplet}
    }
  `;

  const np = new Nanopub(rdfStr);
  return np;
};
