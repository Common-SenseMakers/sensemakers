import init, { Nanopub } from '@nanopub/sign';
import { DataFactory, Store } from 'n3';

import { THIS_POST_NAME } from '../app/config';
import { parseRDF, replaceNodes, writeRDF } from '../shared/n3.utils';
import { AppPostSemantics } from '../shared/parser.types';
import { AppUserRead } from '../shared/types';
import {
  ASSERTION_URI,
  HAS_COMMENT_URI,
  NANOPUB_PLACEHOLDER,
} from './semantics.helper';

export const constructPostNanopub = async (
  content: string,
  user: AppUserRead,
  semantics?: AppPostSemantics
): Promise<Nanopub> => {
  await (init as any)();

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
  const exampleTriplet =
    process.env.NODE_ENV !== 'production' ? `: a npx:ExampleNanopub .` : '';

  const semanticPostTriplet =  `: a <https://sense-nets.xyz/SemanticPost> .`

  /** append the data related to the author (including) identity */
  const orcid = user.orcid?.orcid;

  const hasEthSigner = user.eth !== undefined;
  const address = user.eth?.ethAddress;

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
      :assertion dct:creator orcid:${orcid} .
      ${assertionsRdf}
    }
    
    
    :provenance {
      :assertion prov:wasAttributedTo orcid:${orcid} .
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
