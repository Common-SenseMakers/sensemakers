const FROM_DATE = '2024-02-28T15:00:00';

export const TOP_URLS_QUERY = `
PREFIX rel: <https://w3id.org/np/RA4-9EhvPmX6Y2w_Ih3BiAZxyRehqm6ZVFW2DYA7v1Rjg#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX ns1: <https://sense-nets.xyz/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX np: <http://www.nanopub.org/nschema#>

SELECT ?url (COUNT(DISTINCT ?creator) AS ?uniqueRef)
WHERE {
  ?np a ns1:SemanticPost ;
      np:hasAssertion ?assertion .
  ?np dct:created ?date .
  FILTER(?date > "${FROM_DATE}"^^xsd:date)  # Replace YYYY-MM-DD with your cutoff date
  ?assertion dct:creator ?creator .
  ?assertion ?relation ?url .
   GRAPH  rel:assertion {
    ?relation rdfs:label ?label .
  }
}
GROUP BY ?url
ORDER BY DESC(?uniqueRef)
`;

export const URLS_DATA_QUERIES = `
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX np: <http://www.nanopub.org/nschema#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX schema: <https://schema.org/>
PREFIX rel: <https://w3id.org/np/RA4-9EhvPmX6Y2w_Ih3BiAZxyRehqm6ZVFW2DYA7v1Rjg#>

SELECT DISTINCT ?url ?name ?relation
WHERE {
  ?np np:hasAssertion ?assertion .
  ?np dct:created ?date .
  FILTER(?date > "${FROM_DATE}"^^xsd:date)  # Replace YYYY-MM-DD with your cutoff date
  
  ?assertion ?relation ?url .
  GRAPH rel:assertion {
    ?relation rdfs:label ?label .
  }
  ?assertion dct:creator ?creator ;
             schema:keywords ?keyword .
  ?creator foaf:name ?name .
  
  OPTIONAL{?assertion rdfs:comment ?post }
  OPTIONAL{?assertion <https://www.w3.org/2000/01/rdf-schema#comment> ?post}
  
  # Assuming dct:issued is used for publication date
  
}
LIMIT 1000
`;
