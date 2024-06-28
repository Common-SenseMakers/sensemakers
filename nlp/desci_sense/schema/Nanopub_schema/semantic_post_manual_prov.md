# Description

 In this doc I specify what triplets are to be present in our app Supervised Semantic Post provenance, Nanopublication Schema. 

## Template Schema

```TriG

@prefix cosmo: <https://sense-nets.xyz/> .
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
@prefix schema: <https://schema.org/>
@prefix x: <https://twitter.com/>


sub:provenance {
	#Worked with Tobias on a more rebust prov, TODO
  cosmo: a prov:SoftwareAgent ;
    prov:actedOnBehalfOf x:xHandle .
  sub:activity a cosmo:nlpFacilitatedActivity ;
    prov:wasAssociatedWith cosmo:.
  sub:assertion prov:wasAttributedTo x:xHandle ;
    prov:wasGeneratedBy sub:activity ;
    #For twitter we use linksTo but once we add more social networks, we will use prov:wasDerivedFrom
    cosmo:linksTo <{original post URL}> .
}

```