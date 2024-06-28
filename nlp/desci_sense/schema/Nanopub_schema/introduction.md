# Description

- In this doc I specify what triplets are to be present in our app intro Nanopublication Schema.
- The intro nanopub announces any new sensemaker in our app to the Nanopublication network.
- These intros are later used for approving Nanopubs creators and effect on their discoverability in Nanodash and other SPARQL query services.
- In the publication info I only present triplets which are changed or added from the default pubinfo.
- `sub:keyDeclearation`
- The next section describes the spacial notation I use in the Schema below.

## Notations

- `this:` is a place holder for the nanopublication URI
- `sub:`  is `this:#`
- `xHandle` is a place holder for the nanopublication creators twitter handle without `@` e.g. `ronent`
- Literal values, if not fixed, will appear in schema between “{}” with description inside, and will be dynamically assigned by the Nanopub contractor. For example, `"{ RSA public key}"` will be replaced with the string of the RSA public key of the specific sensemaker.
- `keyDecleration` is an id generated for the key declaration which is part of the assertion.
- `#text`  Is used to annotate new or edited triplets.

## Template Schema

```TriG
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
@prefix cosmo: <https://sense-nets.xyz/> .
@prefix x: <https://twitter.com/>

sub:Head {
  this: np:hasAssertion sub:assertion;
    np:hasProvenance sub:provenance;
    np:hasPublicationInfo sub:pubinfo;
    a np:Nanopublication .
}

sub:assertion {
  x:xHandle foaf:name "{creators name}" .
  
  sub:keyDecleration npx:declaredBy
      x:xHandle;
    npx:hasAlgorithm "RSA";
    npx:hasPublicKey "{The declared RSA public key}" .
    #ADDED TRIPLETS
    
  sub:keyDeclaration prove:wasDerivedFrom "{eth wallet address that derives the RSA key pair}" .
    cosmo:hasDerivationPath "/nanopub/0" .  
    cosmo:hasDerivationWithStandard "BIP-32" . 
  
  sub:derivationProof npx:hasAlgorithm "https://eips.ethereum.org/EIPS/eip-191";
	  npx:hasPublicKey "{eth address}";
    npx:hasSignatureTarget "{This account controls the RSA public key: ${publicKey}}"
		npx:hasSignature "{signature}"
	
	#Give permission on behalf of user to a key
	sub:signingDelegation npx:declaredAsDelegationBy x:xHandle;
		cosmo:DelegatedTo cosmo: ;
		cosmo:DelegatedBy x:xHandle ;
	  cosmo:withKeyDecleration <{URI of the apps keyDecleration}>;
    
	
}

sub:provenance {

  sub:assertion prov:wasAttributedTo x:xHandle .
}

sub:pubinfo {
  
    #Changed the next triplet:
    this: npx:wasCreatedAt <https://sense-nets.xyz/> .
    
    
}

```