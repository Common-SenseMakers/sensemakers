# Description

- In this doc I specify what triplets are to be present in our app Semantic Post assertion.
- The next section describes the spacial notation I use in the Schema below.

## Notations

- `this:` is a place holder for the nanopublication URI
- `sub:`  is `this:#`
- `xHandle` is a place holder for the nanopublication creators twitter handle without `@` e.g. `ronent`
- Literal values, if not fixed, will appear in schema between “{}” with description inside, and will be dynamically assigned by the Nanopub contractor. For example, `"{ RSA public key}"` will be replaced with the string of the RSA public key of the specific sensemaker.
- `keyDecleration` is an id generated for the key declaration which is part of the assertion.
- `#text`  Is used to annotate new or edited triplets.
- The object property presented by`cosmo:{relation}` is a place holder to one of the properties in CoSMO [binary-relation table](https://www.notion.so/6e1d5ba0db0d475eab5043aef2689e3e?pvs=21), which represent a relation between the assertion and a URL.
- If bellow a triplet `<sub> <{prop}> <{obj}>;` there is a line of `...` it means there are potentially more triplets with the same subject and property classs.
- and If bellow a triplet `<{sub}> <prop> <{obj}>;` there is a line of `...` it means there are potentially more triplets with the same property and object class.
- If after a triplet `<sub> schema:keyword "{keyword}";` there is a line of `...` it means there are potentially more triplets with the same subject and property, and different literals as objects.

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

sub:assertion {
  sub:assertion dct:creator x:xHandle;
	  #specifing the CoSMO relations to the mentioned references from the post
    cosmo:{relation} <{reference URL}>;
    ...
    
    schema:keywords  "{keywords}"...;
    
    rdfs:comment "{text from post}".
    
    #Here, we assign the Zotero item types
  <{reference URL}> cosmo:hasZoteroItemType  "{Zotero ItemType}" .
  ...
}

```