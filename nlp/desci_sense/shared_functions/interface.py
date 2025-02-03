from __future__ import annotations
from typing import Optional, List, Dict, TypedDict, Union, Any
from enum import Enum
from pydantic import (
    Field,
    BaseModel,
    validator,
    ConfigDict,
    field_validator,
    field_serializer,
    model_validator,
    ValidationError,
)
from pydantic_settings import BaseSettings, SettingsConfigDict
from rdflib import URIRef, Literal, Graph
from .prompting.jinja.topics_template import ALLOWED_TOPICS
from .filters import SciFilterClassfication
from .utils import (
    normalize_tweet_urls_in_text,
    normalize_tweet_url,
    clean_notion_text,
)

# for calculating thread length limits
MAX_CHARS_PER_POST = 280

# maximum allowed posts per request from parser
MAX_POSTS_PER_REQUEST = 40


class PlatformType(str, Enum):
    TWITTER = "twitter"
    MASTODON = "mastodon"
    BLUESKY = "bluesky"
    LOCAL = "local"  # our platform
    ORCID = "orcid"
    UNKNOWN = "unknown"


# TODO fix using alias for env var default loading
class NotionOntologyConfig(BaseSettings):
    model_config = SettingsConfigDict(populate_by_name=True)
    db_id: str = Field(
        default=None,
        description="Database ID of Notion ontology",
        validate_default=False,
    )
    notion_api_token: str = Field(
        default=None,
        description="Notion integration API key",
        validate_default=False,
        exclude=True,
    )
    versions: List[str] = Field(
        default_factory=lambda: ["v0"],
        description="Versions for which to take rows from ontology",
    )


class OntologyConceptDefinition(BaseModel):
    name: str = Field(description="Concept name.")
    uri: Union[str, None] = Field(description="Linked data URI for this concept.")
    versions: List[str] = Field(
        description="Which ontology versions is this item included in."
    )


class KeywordConceptDefinition(OntologyConceptDefinition):
    """
    Special OntologyPredicateDefinition class intialized to represent
    a keyword concept.
    """

    name: str = Field(default="hasKeyword", description="Concept name.")
    uri: str = Field(
        default="https://schema.org/keywords",
        description="Linked data URI for this concept.",
    )
    versions: List[str] = Field(
        ["v0"], description="Which ontology versions is this item included in."
    )


class TopicConceptDefinition(OntologyConceptDefinition):
    """
    Special OntologyPredicateDefinition class intialized to represent
    the topic concept.
    """

    name: str = Field(default="hasTopic", description="Concept name.")
    uri: str = Field(
        default="https://schema.org/about",
        description="Linked data URI for this concept.",
    )
    versions: List[str] = Field(
        ["v0"], description="Which ontology versions is this item included in."
    )


class ZoteroItemTypeDefinition(OntologyConceptDefinition):
    """
    Definition of the ZoteroItemType predicate which is used to represent a reference's
    item type according to the Zotero ontology.
    https://www.zotero.org/support/kb/item_types_and_fields
    """

    name: str = Field(default="zoteroItemType", description="Concept name.")
    uri: str = Field(
        default="https://sense-nets.xyz/hasZoteroItemType",
        description="Linked data URI for this concept.",
    )
    versions: List[str] = Field(
        ["v0"], description="Which ontology versions is this item included in."
    )


class QuotedPostDefinition(OntologyConceptDefinition):
    """
    Definition of quotedPost relation for a post that quotes another post
    https://github.com/Common-SenseMakers/sensemakers/blob/nlp-dev/nlp/desci_sense/schema/Nanopub_schema/semantic_post_quote_schema.md
    """

    name: str = Field(default="zoteroItemType", description="Concept name.")
    uri: str = Field(
        default="https://sense-nets.xyz/quotesPost",
        description="Linked data URI for this concept.",
    )
    versions: List[str] = Field(
        ["v0"], description="Which ontology versions is this item included in."
    )


class isAConceptDefintion(OntologyConceptDefinition):
    name: str = Field(default="isA", description="Concept name.")
    uri: str = Field(
        default="",
        description="Linked data URI for this concept.",
    )
    versions: List[str] = Field(
        ["v0"], description="Which ontology versions is this item included in."
    )


class LLMOntologyConceptDefinition(OntologyConceptDefinition):
    label: str = Field(description="Output label model should use for this predicate")
    display_name: str = Field(description="Name to display in app front-ends.")
    prompt: str = Field(description="Description to use in prompt for this predicate")
    prompt_zero_ref: Optional[str] = Field(
        description="Description to use in prompt for this predicate for cases of zero reference posts"
    )
    prompt_single_ref: Optional[str] = Field(
        description="Description to use in prompt for this predicate for cases of single reference posts"
    )
    prompt_multi_ref: Optional[str] = Field(
        description="Description to use in prompt for this predicate for cases of multi reference posts"
    )
    valid_subject_types: List[str] = Field(
        description="List of valid subject entity types for this predicate"
    )
    valid_object_types: List[str] = Field(
        description="List of valid object entity types for this predicate"
    )
    re_post: Optional[bool] = Field(default = False, description = "Indicates tags used in re-post parsing")

    def can_be_predicate(self):
        return "ref" in self.valid_object_types

    def can_be_object(self):
        return "nan" in self.valid_object_types

    @validator("*", pre=True)
    def clean_all_text_fields(cls, value):
        if isinstance(value, str):
            return clean_notion_text(value)
        elif isinstance(value, list):
            return [
                clean_notion_text(item) if isinstance(item, str) else item
                for item in value
            ]
        elif isinstance(value, dict):
            return {
                k: clean_notion_text(v) if isinstance(v, str) else v
                for k, v in value.items()
            }
        return value


class OntologyInterface(BaseModel):
    semantic_predicates: List[LLMOntologyConceptDefinition]
    keyword_predicate: KeywordConceptDefinition = Field(
        default_factory=KeywordConceptDefinition
    )
    topics_predicate: TopicConceptDefinition = Field(
        default_factory=TopicConceptDefinition
    )
    allowed_topics: List[str] = Field(default=ALLOWED_TOPICS)
    ontology_config: NotionOntologyConfig = Field(default_factory=NotionOntologyConfig)


class RefMetadata(BaseModel):
    """
    Schema representing extracted metadata of reference URLs
    mentioned in a post.
    """

    ref_id: int = Field(
        description="Unique ID of reference. 0 is the original post id,"
        "so all references will be positive integers.",
    )
    order: int = Field(
        default=0,
        description="1 indexed ordering of reference, sorted by ascending appearance order in the post. 1 - first, 2 - 2nd,. 0 - unassigned",
    )
    ref_source_url: Union[str, None] = Field(
        description="source url referencing this url or None if N/A."
        "`ref_source_url` refers to the thread url (top post) if the reference is mentioned by any of the thread posts."
        "If the reference is mentioned by a quoted post, `source_ref_url` will be the url of the quoted post",
        default=None,
    )
    citoid_url: Union[str, None] = Field(
        description="URL used by citoid (might have different subdomain or final slashes).",
    )
    url: Union[str, None] = Field(description="URL of reference.")
    item_type: Union[str, None] = Field(
        default="unknown",
        description="Item type label returned from metadata extractor. \
          Citoid uses https://www.zotero.org/support/kb/item_types_and_fields ",
    )
    title: str = Field(default="", description="Title of reference.")
    summary: str = Field(default="", description="Summary of reference.")
    image: str = Field(default="", description="Reference thumbnail image url.")
    debug: Dict = Field(description="Debug information.", default_factory=dict)

    @field_validator("item_type", mode="before")
    @classmethod
    def convert_none_unk(cls, v):
        if type(v) is type(None):
            v = "unknown"
        return v

    def to_str(
        self, skip_list: List[str] = ["citoid_url", "image", "debug", "ref_source_url"]
    ):
        """
        Prints each attribute on a new line in the form: attribute: value
        """
        result = []
        for attr, value in vars(self).items():
            # attributes to skip printing
            if attr in skip_list:
                continue
            if isinstance(value, str) or value is None:
                value = value or "None"  # Convert None or empty strings to "None"
                result.append(f"{attr}: {value}")
        return "\n".join(result)


class RDFTriplet(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    subject: Union[Literal, URIRef] = Field(
        default=URIRef("https://sense-nets.xyz/mySemanticPost"),
        description="Subject of the triplet",
    )
    predicate: Union[Literal, URIRef] = Field(description="Predicate of the triplet")
    object: Union[Literal, URIRef] = Field(description="Object of the triplet")

    def to_tuple(self):
        return (self.subject, self.predicate, self.object)

    def __eq__(self, other):
        if not isinstance(other, RDFTriplet):
            return NotImplemented
        return self.to_tuple() == other.to_tuple()


class ParserSupport(BaseModel):
    ontology: OntologyInterface = Field(description="Ontology used by NLP module")
    refs_meta: Dict[str, RefMetadata] = Field(
        default_factory=dict,
        description="Metadata info, keyed by URL. (if extracted)",
    )


class ParserResult(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    semantics: Graph = Field(
        default_factory=Graph,
        description="Graph of triplets representing semantic relations \
        identified by the parser.",
    )
    support: ParserSupport = Field(
        description="Support information used \
                                    by parser"
    )
    filter_classification: SciFilterClassfication = (
        SciFilterClassfication.NOT_CLASSIFIED
    )
    metadata: Dict = Field(
        description="Other data such as diagnostics for debugging, etc.",
        default_factory=dict,
    )

    @field_serializer("semantics")
    def graph_serializer(graph: Graph):
        return graph.serialize(format="turtle")

    @field_validator(
        "semantics", mode="before"
    )  # before needed since arbitrary types allowed
    @classmethod
    def ensure_graph(cls, value: Any):
        if isinstance(value, Graph):
            return value
        elif isinstance(value, str):
            graph = Graph()
            graph.parse(data=value, format="turtle")
            return graph
        raise ValueError("Invalid graph format")


class Author(BaseModel):
    id: str = Field(description="Internal platform ID for author")
    name: str = Field(description="Author display name")
    username: str = Field(description="Platform username of author")
    platformId: PlatformType = Field(description="Name of platform")

    @validator("platformId", pre=True, always=True)
    def lower_case_platform_id(cls, v):
        return v.lower() if isinstance(v, str) else v


class AppPost(BaseModel):
    content: str = Field(description="Post content")
    url: Optional[str] = Field(description="Post url", default="")
    quotedThread: Optional[AppThread] = Field(
        description="Quoted thread",
        default=None,
    )

    @validator("content", pre=True, always=True)
    def normalize_twitter_urls(cls, v):
        return normalize_tweet_urls_in_text(v) if isinstance(v, str) else v

    @validator("url", pre=True, always=True)
    def normalize_twitter_url(cls, v):
        return normalize_tweet_url(v) if isinstance(v, str) else v


class AppThread(BaseModel):
    author: Author
    thread: List[AppPost] = Field(description="List of posts quoted in this thread")
    url: Optional[str] = Field(
        description="Thread url (url of first post)",
        default=None,
    )

    @validator("url", pre=True, always=True)
    def normalize_twitter_url(cls, v):
        return normalize_tweet_url(v) if isinstance(v, str) else v

    @property
    def source_network(self) -> PlatformType:
        return self.author.platformId


class ParsePostRequest(BaseModel):
    """
    The request passed to the parser by the ts app
    """

    post: AppThread = Field(description="Threaded post to be processed")
    parameters: Optional[Any] = Field(
        description="Additional params for parser (not used currently)",
        default_factory=dict,
    )
