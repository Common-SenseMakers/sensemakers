# Description

- In this doc I specify what triplets are to be present in our app retraction Nanopublication Schema.
- The retraction nanopub simply asserts that an agent retracts a Nanopub.
- Retractions are later used to filter retracted nanopubs, one hase to verify that a retraction is valid, i.e that the agent handle is and public key have permission to retract the nanopub.
- In the publication info I only present triplets which are changed or added from the default pubinfo.
- The next section describes the spacial notation I use in the Schema below.

## Notations

- `this:` is a place holder for the nanopublication URI
- `sub:`  is `this:#`
- `xHandle` is a place holder for the nanopublication creators twitter handle without `@` e.g. `ronent`
- Literal values, if not fixed, will appear in schema between “{}” with description inside, and will be dynamically assigned by the Nanopub contractor. For example, `"{ RSA public key}"` will be replaced with the string of the RSA public key of the specific sensemaker.
- `keyDecleration` is an id generated for the key declaration which is part of the assertion.
- `#text`  Is used to annotate new or edited triplets.

## Template Schema

```graphql
@prefix this: <https://w3id.org/np/RAsC47MMmOizB2K4q3y_pjx-_8Kh5Yg18CbaGC10F1afw> .
@prefix sub: <https://w3id.org/np/RAsC47MMmOizB2K4q3y_pjx-_8Kh5Yg18CbaGC10F1afw#> .
@prefix np: <http://www.nanopub.org/nschema#> .
@prefix dct: <http://purl.org/dc/terms/> .
@prefix nt: <https://w3id.org/np/o/ntemplate/> .
@prefix npx: <http://purl.org/nanopub/x/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix orcid: <https://orcid.org/> .
@prefix prov: <http://www.w3.org/ns/prov#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

sub:Head {
  this: np:hasAssertion sub:assertion;
    np:hasProvenance sub:provenance;
    np:hasPublicationInfo sub:pubinfo;
    a np:Nanopublication .
}

sub:assertion {
  x:xHandle npx:retracts <{"Target Nanopub URI"}> .
}

sub:provenance {
  sub:assertion prov:wasAttributedTo x:xHandle .
}

sub:pubinfo {
  x:xHandle foaf:name "{retractos name}" .
  
  sub:sig npx:hasAlgorithm "RSA";
    npx:hasPublicKey "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCiGALNWVeZ5kIOtDZszUkx4x2/Xi3iR8eKo42D2BrSA0QweID9Yfp9DrdrYSikPE82zvgyeQJizKBrdzBQjgLK9OASxjOtus/BivEzHKxZojTDD40Z/842Ss7V1NOBLcnRG+/CDa3hYaif1f+Kc0lxIsid33GYuGJNa4NXsHmMDwIDAQAB";
    npx:hasSignature "gWHYAOkrcd162UKu7tIb2gjyA/Xm0FctZsR+/GGz9QI6tcpSpSB+tJiPX9wnVWdcVf1UdOpx9Yz53p5jkTiW27qlB2mZRxMPXQUKV5lTaKuhWMEsmmqrgTNI4Z9OW27ASOUSWWM7UDa+JXTn4S3CVKozn/Y89RfN1H/dykUbYME=";
    npx:hasSignatureTarget this:;
    npx:signedBy x:xHandle .
  
  this: dct:created "2024-04-01T18:09:48.060Z"^^xsd:dateTime;
    dct:creator x:xHandle;
    dct:license <https://creativecommons.org/licenses/by/4.0/>;
    
    npx:wasCreatedAt cosmo:;
    rdfs:label "CoSMO Semantic Post retraction".
    this: cosmo:hasRootSinger "{eth address}"
}
```