# Description

- In this doc I specify what triplets are to be present in our app Semantic Post pubinfo, Nanopublication Schema. Supervised or auto-posted.
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

sub:pubinfo {

  x:xHandle foaf:name "{retractos name}" . 

  sub:sig npx:hasAlgorithm "RSA";
    npx:hasPublicKey "{Our app pubkey}";
    npx:hasSignature "{Our app signature}";
    npx:hasSignatureTarget this:;
    npx:signedBy cosmo: . //In the auto-scenario the object is x:xHandle
 this: dct:created "2024-04-01T18:09:48.060Z"^^xsd:dateTime;
    dct:creator x:xHandle;
    dct:license <https://creativecommons.org/licenses/by/4.0/>;
    
  this: npx:hasNanopubType cosmo:SemanticPost;
    npx:wasCreatedAt cosmo:;
    rdfs:label "CoSMO Semantic Post".
    this: cosmo:hasRootSinger "{eth address}"
    
}