export const URLS_QUERY = `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX np: <http://www.nanopub.org/nschema#>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX dct: <http://purl.org/dc/terms/>

  SELECT DISTINCT ?sub ?name ?date WHERE {
    ?sub a <https://sense-nets.xyz/SemanticPost> ;
        dct:creator ?creator ;
        dct:created ?date .
    ?creator foaf:name ?name .
  }
  ORDER BY ?date
  LIMIT 100
`;

export const POSTERS_QUERY = `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX np: <http://www.nanopub.org/nschema#>
  PREFIX foaf: <http://xmlns.com/foaf/0.1/>
  PREFIX dct: <http://purl.org/dc/terms/>

  SELECT DISTINCT ?sub ?name ?date WHERE {
    ?sub a <https://sense-nets.xyz/SemanticPost> ;
        dct:creator ?creator ;
        dct:created ?date .
    ?creator foaf:name ?name .
  }
  ORDER BY ?date
  LIMIT 100
`;
