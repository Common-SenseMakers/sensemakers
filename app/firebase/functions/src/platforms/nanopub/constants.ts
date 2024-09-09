// Base URIs
export const BASE_URI = 'http://purl.org/nanopub/temp/mynanopub#';
export const ASSERTION_URI = BASE_URI + 'assertion';
export const PROVENANCE_URI = BASE_URI + 'provenance';
export const ACTIVITY_URI = BASE_URI + 'activity';
export const PUBINFO_URI = BASE_URI + 'pubinfo';
export const HEAD_URI = BASE_URI + 'head';
export const DERIVATION_PROOF_URI = BASE_URI + 'derivationProof';
export const SIGNING_DELEGATION_URI = BASE_URI + 'signingDelegation';
export const RETRACTS_URI = BASE_URI + 'assertion';
export const KEY_DECLARATION_URI = BASE_URI + 'RSAkeyDeclaration';
export const SIGNATURE_URI = BASE_URI + 'sig';
// Specific Activity URIs
export const SUPERVISED_ACTIVITY = 'https://sense-nets.xyz/supervisedActivity';
export const UNSUPERVISED_ACTIVITY =
  'https://sense-nets.xyz/unsupervisedActivity';

// Prefixes
export const COSMO_PREFIX = 'https://sense-nets.xyz/';
export const X_PREFIX = 'https://x.com/';
export const NP_TEMP_PREFIX = 'http://purl.org/nanopub/temp/mynanopub#';
export const DCT_PREFIX = 'http://purl.org/dc/terms/';
export const XSD_PREFIX = 'http://www.w3.org/2001/XMLSchema#';
export const RDFS_PREFIX = 'http://www.w3.org/2000/01/rdf-schema#';
export const NS1_PREFIX = 'http://purl.org/np/';
export const FOAF_PREFIX = 'http://xmlns.com/foaf/0.1/';
export const SCHEMA_PREFIX = 'https://schema.org/';
export const NP_PREFIX = 'http://www.nanopub.org/nschema#';
export const NPX_PREFIX = 'http://purl.org/nanopub/x/';
export const PROV_PREFIX = 'http://www.w3.org/ns/prov#';
export const ORCID_PREFIX = 'https://orcid.org/';

// RDF and PROV URIs
export const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
export const PROV_WAS_ASSOCIATED_WITH =
  'http://www.w3.org/ns/prov#wasAssociatedWith';
export const PROV_WAS_ATTRIBUTED_TO =
  'http://www.w3.org/ns/prov#wasAttributedTo';
export const PROV_WAS_GENERATED_BY = 'http://www.w3.org/ns/prov#wasGeneratedBy';
export const PROV_LINKS_TO = 'http://www.w3.org/ns/prov#linksTo';
export const PROV_ACTED_ON_BEHALF_OF =
  'http://www.w3.org/ns/prov#actedOnBehalfOf';
export const PROV_WAS_DERIVED_FROM = 'http://www.w3.org/ns/prov#wasDerivedFrom';
export const PROV_HAS_PROVENANCE = 'http://www.w3.org/ns/prov#hasProvenance';
export const PROV_HAS_PUBLICATION_INFO =
  'http://www.w3.org/ns/prov#hasPublicationInfo';
export const PROV_SOFTWARE_AGENT = 'http://www.w3.org/ns/prov#SoftwareAgent';
export const PROV_HAS_SIGNATURE = 'http://www.w3.org/ns/prov#hasSignature';

// Other URIs
export const FOAF_NAME = 'http://xmlns.com/foaf/0.1/name';
export const FOAF_ACCOUNT = 'http://xmlns.com/foaf/0.1/account';
export const RDFS_COMMENT = 'http://www.w3.org/2000/01/rdf-schema#comment';
export const NP_HAS_ASSERTION = 'http://www.nanopub.org/nschema#hasAssertion';
export const NP_HAS_PROVENANCE = 'http://www.nanopub.org/nschema#hasProvenance';
export const NP_HAS_PUBLICATION_INFO =
  'http://www.nanopub.org/nschema#hasPublicationInfo';
export const NP_NANOPUBLICATION =
  'http://www.nanopub.org/nschema#Nanopublication';
export const NP_SIGNED_BY = 'http://purl.org/nanopub/x/signedBy';
export const NP_SUPERSEDES = 'http://purl.org/nanopub/x/supersedes';
export const NP_RETRACTS = 'http://purl.org/nanopub/x/retracts';
export const NP_HAS_NANOPUB_TYPE = 'http://purl.org/nanopub/x/hasNanopubType';
export const NP_WAS_CREATED_AT = 'http://purl.org/nanopub/x/wasCreatedAt';
export const NP_DECLARED_BY = 'http://purl.org/nanopub/x/declaredBy';
export const NP_DECLARED_AS_DELEGATION_BY =
  'http://purl.org/nanopub/x/declaredAsDelegationBy';
export const NP_HAS_ALGORITHM = 'http://purl.org/nanopub/x/hasAlgorithm';
export const NP_HAS_PUBLIC_KEY = 'http://purl.org/nanopub/x/hasPublicKey';
export const NP_HAS_SIGNATURE_TARGET =
  'http://purl.org/nanopub/x/hasSignatureTarget';
export const NP_HAS_ROOT_SIGNER = 'https://sense-nets.xyz/hasRootSigner';
export const NP_HAS_DERIVATION_PATH =
  'https://sense-nets.xyz/hasDerivationPath';
export const NP_HAS_DERIVATION_STANDARD =
  'https://sense-nets.xyz/hasDerivationStandard';
export const NP_HAS_DERIVATION_PROOF =
  'https://sense-nets.xyz/hasDerivationProof';
export const NP_HAS_SIGNATURE_TARGET_TEXT =
  'https://sense-nets.xyz/hasSignatureTargetText';
export const NP_HAS_SIGNATURE = 'https://sense-nets.xyz/hasSignature';
export const NP_DELEGATED_TO = 'https://sense-nets.xyz/DelegatedTo';
export const NP_DELEGATED_BY = 'https://sense-nets.xyz/DelegatedBy';
export const NP_WITH_KEY_DECLARATION =
  'https://sense-nets.xyz/withKeyDecleration';
export const COSMO_SEMANTIC_POST = 'https://sense-nets.xyz/SemanticPost';
export const NP_HAS_ORIGNAL_VERSION = NPX_PREFIX + 'hasOriginalVersion';
// Other constants
export const ETHEREUM_EIP_191 = 'https://eips.ethereum.org/EIPS/eip-191';
export const SCHEMA = 'https://schema.org/';
export const CREATOR = 'http://purl.org/dc/terms/creator';
export const LICENSE = 'http://purl.org/dc/terms/license';
export const LABEL = 'http://www.w3.org/2000/01/rdf-schema#label';
export const RDF_SYNTAX_NS_TYPE =
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
export const CREATIVECOMMONS4 = 'https://creativecommons.org/licenses/by/4.0/';

//cosmo special constants
export const APP_SPOST_PLACEHOLDER = 'https://sense-nets.xyz/mySemanticPost';
export const COSMO_APP_INTRO = 'https://sense-nets.xyz/AppIntro';
export const LINKING_KEYS_DOCUMENT =
  'https://sense-nets.xyz/LinkingKeysDocument';
export const APP_RSA_DECLARATION_URI =
  'https://w3id.org/np/RAy9QxREM5clpg5l-XDvYoyE55kBCO6pb2950R5ZSwigo#RSAkeyDeclaration-approved';

//Strings
export const DELEGATION_STRING = 'signingDelegation';
export const APPROVES_PUBLISHING_AS_US =
  'https://sense-nets.xyz/approvesPublishingAsUs';

export const HAS_KEYS_LINKING_DOCUMENT =
  'https://sense-nets.xyz/hasLinkingKeysDocument';

// Prefixes JSONs
export const sPostPrefixes = {
  base: BASE_URI,
  cosmo: COSMO_PREFIX,
  dct: DCT_PREFIX,
  xsd: XSD_PREFIX,
  rdfs: RDFS_PREFIX,
  ns1: NS1_PREFIX,
  foaf: FOAF_PREFIX,
  schema: SCHEMA_PREFIX,
  x: X_PREFIX,
  np: NP_PREFIX,
  npx: NPX_PREFIX,
  prov: PROV_PREFIX,
  orcid: ORCID_PREFIX,
};

export const retractionPrefixes = {
  np: NPX_PREFIX,
  dct: DCT_PREFIX,
  npx: NPX_PREFIX,
  xsd: XSD_PREFIX,
  rdfs: RDFS_PREFIX,
  orcid: ORCID_PREFIX,
  prov: PROV_PREFIX,
  foaf: FOAF_PREFIX,
  x: X_PREFIX,
};

export const introPrefixes = {
  base: BASE_URI,
  cosmo: COSMO_PREFIX,
  dct: DCT_PREFIX,
  xsd: XSD_PREFIX,
  rdfs: RDFS_PREFIX,
  ns1: NS1_PREFIX,
  foaf: FOAF_PREFIX,
  x: X_PREFIX,
  np: NP_PREFIX,
  npx: NPX_PREFIX,
  prov: PROV_PREFIX,
  orcid: ORCID_PREFIX,
};
