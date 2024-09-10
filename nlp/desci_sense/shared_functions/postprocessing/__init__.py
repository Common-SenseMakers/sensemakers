from typing import List, Dict, Optional, Any, Union
from enum import Enum
from loguru import logger
from langchain_core.pydantic_v1 import Field as FieldLC
from langchain_core.pydantic_v1 import BaseModel as BaseModelLC
from rdflib.namespace import RDF
from rdflib import URIRef, Literal, Graph
from ..interface import (
    RDFTriplet,
    isAConceptDefintion,
    KeywordConceptDefinition,
    ParserSupport,
    ParserResult,
    OntologyInterface,
    ZoteroItemTypeDefinition,
    QuotedPostDefinition,
)

from ..configs import ParserChainType, PostProcessType
from ..filters import SciFilterClassfication
from ..schema.ontology_base import OntologyBase
from ..schema.post import RefPost, ThreadRefPost
from ..web_extractors.metadata_extractors import (
    RefMetadata,
    get_ref_post_metadata_list,
)
from pydantic import (
    Field,
    BaseModel,
)


class SubAnswer(BaseModelLC):
    ref_number: int = FieldLC(
        description="ID number of current reference",
        default=1,
    )
    reasoning_steps: Optional[str] = FieldLC(description="Model reasoning steps")
    candidate_tags: Optional[Union[str, Any]] = FieldLC(
        description="Candidate tags and explanation of why they were chosen."
    )
    final_answer: List[str] = FieldLC(
        description="Set of final tags, based on the Candidate Tags."
    )
    ref_url: Optional[str] = FieldLC(
        description="reference url this subanswer refers to"
    )


class Answer(BaseModelLC):
    sub_answers: List[SubAnswer] = FieldLC(
        description="List of SubAnswers.", default_factory=list
    )
    debug: Dict = FieldLC(
        description="Debug information for error diagnosis, etc.",
        default_factory=dict,
    )

    def is_err(self) -> bool:
        return "errors" in self.debug

    def to_combined_format(self) -> List[List[str]]:
        return [sub_ans.final_answer for sub_ans in self.sub_answers]


class ParserChainOutput(BaseModel):
    answer: Any
    pparser_type: ParserChainType
    reasoning: Optional[Any] = Field(
        description="Reasoning steps.",
        default=None,
    )
    extra: Optional[Dict] = Field(
        description="Extra data for debugging.",
        default_factory=dict,
    )

    def to_combined_format(self) -> Dict:
        if self.pparser_type == ParserChainType.KEYWORDS:
            return self.answer
        elif self.pparser_type == ParserChainType.REFERENCE_TAGGER:
            return {self.pparser_type.value: self.answer}
        elif self.pparser_type == ParserChainType.TOPICS:
            return {self.pparser_type.value: self.answer}
        elif self.pparser_type == ParserChainType.HASHTAGS:
            return {self.pparser_type.value: self.answer}
        elif self.pparser_type == ParserChainType.MULTI_REF_TAGGER:
            return {
                ParserChainType.MULTI_REF_TAGGER.value: self.answer.to_combined_format()
            }
        else:
            raise ValueError(f"Unsupported ParserChainType: {self.pparser_type}")


def nested_list_init():
    return [[]]


class CombinedParserOutput(BaseModel):
    post_url: str = Field(description="Target post URL.")
    research_keyword: str = Field(
        description="Output of keywords submodule for research classification",
        default="not-detected",
    )
    filter_classification: SciFilterClassfication = (
        SciFilterClassfication.NOT_CLASSIFIED
    )
    item_types: List[str] = Field(
        default_factory=list,
        description="Item types of `reference_urls` as returned by metadata extractor",
    )
    reference_urls: List[str] = Field(
        default_factory=list,
        description="Reference URLs mentioned in the parsed post.",
    )
    reference_tagger: Union[None, List[List[str]]] = Field(
        default=None,
        description="Results returned by reference tagger or None if N/A",
    )
    multi_reference_tagger: Union[None, List[List[str]]] = Field(
        default=None,
        description="Results returned by multi reference tagger or None if N/A",
    )
    keywords: List[str] = Field(
        default_factory=list,
        description="Results returned by keywords parser",
    )
    topics: List[str] = Field(
        default_factory=list,
        description="Results returned by topics parser",
    )
    hashtags: List[str] = Field(
        default_factory=list,
        description="Results returned by hashtags parser",
    )
    metadata_list: List[RefMetadata] = Field(
        default_factory=list,
        description="List of extracted reference metadata returned by metadata extractor",
    )
    quoted_post_url: Optional[str] = Field(
        default=None,
        description="URL of quoted post, if processed post quotes another post.",
    )
    debug: Optional[Dict] = Field(
        default_factory=dict,
        description="Diagnostic information for debugging purposes.",
    )

    def all_keywords(self) -> List[str]:
        # return union of hashtags and keywords
        return list(set(self.hashtags).union(set(self.keywords)))

    @property
    def gen_ref_tags(self) -> List[List[str]]:
        if self.multi_reference_tagger is not None:
            return self.multi_reference_tagger
        elif self.reference_tagger is not None:
            return self.reference_tagger
        else:
            return [[]]


def convert_raw_output_to_st_format(
    post: RefPost,
    sem_prompt: str,
    kw_prompt: str,
    topics_prompt: str,
    output: dict,
    md_dict: Dict[str, RefMetadata],
) -> CombinedParserOutput:
    reference_urls = post.md_ref_urls()
    item_types = [
        md_dict[url].item_type if md_dict[url] else "unknown" for url in reference_urls
    ]
    semantic_tags = output["semantics"]["multi_tag"]
    keywords = output["keywords"]["valid_keywords"]
    topics = output["topics"]["multi_tag"]
    academic_kw = output["keywords"]["academic_kw"]
    md_list = list(md_dict.values())
    debug = {
        "semantics": {
            "prompt": sem_prompt,
            "reasoning": output["semantics"]["reasoning"],
            "allowed_tags": output["semantics"]["allowed_tags"],
        },
        "keywords": {
            "prompt": kw_prompt,
            "reasoning": output["keywords"]["reasoning"],
        },
        "topics": {
            "prompt": topics_prompt,
            "reasoning": output["topics"]["reasoning"],
        },
    }
    return CombinedParserOutput(
        research_keyword=academic_kw,
        item_types=item_types,
        reference_urls=reference_urls,
        reference_tagger=semantic_tags,
        topics=topics,
        keywords=keywords,
        metadata_list=md_list,
        debug=debug,
    )


def convert_raw_outputs_to_st_format(
    posts: List[RefPost],
    outputs: List[dict],
    prompts,
    md_dict: Dict[str, RefMetadata],
) -> List[CombinedParserOutput]:
    assert len(prompts) == len(outputs)
    assert len(posts) == len(outputs)
    st_results = []
    for post, output, prompt_dict in zip(posts, outputs, prompts):
        st_result = convert_raw_output_to_st_format(
            post,
            prompt_dict["input"],
            prompt_dict["kw_input"],
            prompt_dict["topics_input"],
            output,
            md_dict,
        )
        st_results.append(st_result)
    return st_results


def convert_predicted_relations_to_rdf_triplets(
    prediction: Dict,
    ontology: OntologyBase,
) -> List[RDFTriplet]:
    post: RefPost = prediction.get("post")
    refs = post.md_ref_urls()

    # extract predicted labels
    predicted_labels = prediction["answer"]["multi_tag"]

    triplets = []

    # for each tag decide if it's the object or predicate
    for label in predicted_labels:
        concept = ontology.get_concept_by_label(label)
        if concept.can_be_predicate():
            # for now, if concept can be predicate we assume triplet
            # of form assertion concept ref
            assert len(refs) > 0
            # TODO change to real URI once we have that
            triplets += [
                RDFTriplet(
                    predicate=URIRef(concept.uri),
                    object=URIRef(ref),
                )
                for ref in refs
            ]

        elif concept.can_be_object():
            # for now, if concept can be subject we assume triplet
            # of form assertion isA concept
            assert len(refs) == 0
            triplets += [
                RDFTriplet(
                    predicate=RDF.type,
                    object=URIRef(ref),
                )
                for ref in refs
            ]

        else:
            raise ValueError(
                f"Label type {label} is netiher a subject \
                              or predicate"
            )

    return triplets


def convert_ref_tags_to_rdf_triplets(
    reference_urls: List[str],
    all_reference_tags: List[List[str]],
    ontology: OntologyBase,
) -> List[RDFTriplet]:
    triplets = []

    # handle zero ref case
    if len(reference_urls) == 0:
        assert len(all_reference_tags) == 1

        # add labels as objects in triplets
        ref_tags = all_reference_tags[0]
        for label in ref_tags:
            concept = ontology.get_concept_by_label(label)
            assert concept.can_be_object()
            triplets += [
                RDFTriplet(
                    predicate=RDF.type,
                    object=URIRef(concept.uri),
                )
            ]
    else:
        # non zero refs - add labels as predicates to corresponding urls
        if len(all_reference_tags) == len(reference_urls):
            for ref_tags, ref_url in zip(all_reference_tags, reference_urls):
                if len(ref_tags) == 0:
                    # if no ref tags provided, add default mention label
                    # add warning since this should be handled prior
                    logger.warning("No ref tags provided, adding default label!")
                    updated_ref_tags = [ontology.default_mention_label()]
                else:
                    updated_ref_tags = ref_tags
                for label in updated_ref_tags:
                    concept = ontology.get_concept_by_label(label)
                    assert concept.can_be_predicate()
                    triplets += [
                        RDFTriplet(
                            predicate=URIRef(concept.uri),
                            object=URIRef(ref_url),
                        )
                    ]
        else:
            logger.warning(
                "No predictions in input corresponding to references!\n"
                f"{all_reference_tags} != {reference_urls}"
            )
            # logger.warning(f"{all_reference_tags} != {reference_urls}")
    return triplets

    # # for each tag decide if it's the object or predicate
    # for label in reference_tags:
    #     concept = ontology.get_concept_by_label(label)
    #     if concept.can_be_predicate():
    #         # for now, if concept can be predicate we assume triplet
    #         # of form assertion concept ref
    #         assert len(reference_urls) > 0
    #         # TODO change to real URI once we have that
    #         triplets += [
    #             RDFTriplet(
    #                 predicate=URIRef(concept.uri),
    #                 object=URIRef(ref),
    #             )
    #             for ref in reference_urls
    #         ]

    #     elif concept.can_be_object():
    #         # for now, if concept can be subject we assume triplet
    #         # of form assertion isA concept
    #         assert len(reference_urls) == 0
    #         triplets += [
    #             RDFTriplet(
    #                 predicate=RDF.type,
    #                 object=URIRef(concept.uri),
    #             )
    #         ]

    #     else:
    #         raise ValueError(
    #             f"Label type {label} is neither a subject \
    #                           or predicate"
    #         )

    # return triplets


def convert_keywords_to_triplets(prediction: Dict) -> List[RDFTriplet]:
    keywords = prediction["answer"].get("valid_keywords")

    triplets = [
        RDFTriplet(
            predicate=URIRef(KeywordConceptDefinition().uri),
            object=Literal(kw),
        )
        for kw in keywords
    ]

    return triplets


def convert_keywords_to_rdf_triplets(keywords: List[str]) -> List[RDFTriplet]:
    triplets = [
        RDFTriplet(
            predicate=URIRef(KeywordConceptDefinition().uri),
            object=Literal(kw),
        )
        for kw in keywords
    ]

    return triplets


def create_quoted_post_triplet(quoted_post_url: str):
    triplet = RDFTriplet(
        predicate=URIRef(QuotedPostDefinition().uri),
        object=URIRef(quoted_post_url),
    )
    return triplet


def create_links_to_triplet(
    source_url: str,
    target_url: str,
    ontology: OntologyBase,
) -> RDFTriplet:
    """
    Returns RDF triplet of (subject_url, linksTo, target_url)
    """
    triplet = convert_ref_tags_to_rdf_triplets(
        [target_url],
        all_reference_tags=[[ontology.default_mention_label()]],
        ontology=ontology,
    )[0]
    triplet.subject = URIRef(source_url)
    return triplet


def add_quote_post_ref_links(
    post_url: str,
    md_list: List[RefMetadata],
    ontology: OntologyBase,
) -> List[RDFTriplet]:
    """Return list of triplets representing links between
    quoted posts and references mentioned by quoted post.
    E.g., triplets of format (subject_url, linksTo, target_url),
    where subject_url is the url of a quoted post and target_url is the url of
    the reference mentioned in source_url
    """
    triplets = []
    for md in md_list:
        if md.ref_source_url != post_url:
            # if refernce source is not the orig thread, add to list
            triplet = create_links_to_triplet(
                md.ref_source_url,
                md.url,
                ontology,
            )
            triplets.append(triplet)

    return triplets


def add_ref_ordering_info(
    post: RefPost,
    md_dict: Dict[str, RefMetadata],
) -> Dict[str, RefMetadata]:
    """_summary_

    Args:
        post (RefPost): _description_
        md_dict (Dict[str, RefMetadata]): _description_

    Returns:
        Dict[str, RefMetadata]: _description_
    """
    all_ref_urls = post.md_ref_urls()

    for i, ref in enumerate(all_ref_urls):
        if ref in md_dict:
            md = md_dict.get(ref)
            if md:
                # add ordering info (1-indexed)
                md.order = i + 1
    return md_dict


def add_ref_source_info(
    threaded_post: RefPost,
    md_dict: Dict[str, RefMetadata],
) -> Dict[str, RefMetadata]:
    """
    Adds quote tweet reference source information to RefMetadata.
    See `RefMetadata:ref_source_url`.


    Note: assumes metadata is only used for this thread, and not shared
    over a batch!

    Args:
        thread (ThreadRefPost): _description_
        md_dict (Dict[str,RefMetadata]): _description_

    Returns:
        Dict[str, RefMetadata]
    """
    for post in threaded_post.thread_posts():
        # link all directly referenced url to thread url
        for ref_url in post.md_ref_urls(include_quoted_ref_urls=False):
            if ref_url in md_dict:
                md_dict[ref_url].ref_source_url = threaded_post.url
        if post.has_quote_post:
            # link urls mentioned in quoted posts to quoting post
            quoted_post = post.quoted_post
            source_url = quoted_post.url
            for ref_url in quoted_post.md_ref_urls():
                if ref_url in md_dict:
                    md_dict[ref_url].ref_source_url = source_url
    return md_dict


def convert_item_types_to_rdf_triplets(
    item_types: List[str], reference_urls: List[str]
) -> List[RDFTriplet]:
    """
    Converts item type and reference url information into RDF triplets
    using the ZoteroItemTypeDefinition predicate.
    For example,
    convert_item_types_to_rdf_triplets(['preprint'], ['https://arxiv.org/abs/2402.04607']) -->
    `[RDFTriplet(subject=rdflib.term.URIRef('https://arxiv.org/abs/2402.04607'), predicate=rdflib.term.URIRef('https://sense-nets.xyz/hasZoteroItemType'), object=rdflib.term.Literal('preprint'))]`


    """
    assert len(reference_urls) == len(item_types)
    triplets = [
        RDFTriplet(
            subject=URIRef(ref_url),
            predicate=URIRef(ZoteroItemTypeDefinition().uri),
            object=Literal(item_type),
        )
        for ref_url, item_type in zip(reference_urls, item_types)
    ]

    return triplets


def convert_triplets_to_graph(triplets: List[RDFTriplet]) -> Graph:
    """Convert list of rdf triplets to rdf graph"""
    g = Graph()
    for t in triplets:
        g.add(t.to_tuple())
    return g


def convert_raw_output_to_queue_format(
    outputs: List[dict], md_list: Dict[str, RefMetadata]
):
    pass


def combine_from_raw_results(
    post: RefPost,
    raw_results: Dict[str, ParserChainOutput],
    md_dict: Dict[str, RefMetadata],
    ontology: OntologyBase,
    unprocessed_urls: Optional[List[str]] = None,
) -> CombinedParserOutput:
    if unprocessed_urls is None:
        unprocessed_urls = []

    # add source reference info to reference metadata
    md_dict = add_ref_source_info(post, md_dict)

    # get metadata list, add ordering info
    md_list = get_ref_post_metadata_list(
        post,
        md_dict,
        extra_urls=unprocessed_urls,
        add_ordering=True,
    )

    # init output object
    combined_parser_output = {
        "post_url": post.url,
        "reference_urls": post.md_ref_urls(),
        "item_types": [md.item_type for md in md_list],
        "metadata_list": md_list,
        "debug": {},
    }

    # add module specific answers
    # TODO handle case with multiple modules of same type
    for output in raw_results.values():
        combined_parser_output.update(output.to_combined_format())
        combined_parser_output["debug"][output.pparser_type.value] = output.extra
        combined_parser_output["debug"][output.pparser_type.value][
            "reasoning"
        ] = output.reasoning

    combined = CombinedParserOutput(**combined_parser_output)

    # add quoted post url
    combined.quoted_post_url = post.quoted_url

    if unprocessed_urls:
        # add unprocessed urls to result
        combined.reference_urls += unprocessed_urls

        # add default labels for unprocessed urls if exist
        if combined.multi_reference_tagger:
            labels_for_unprocessed = [
                [ontology.default_mention_label()] for _ in unprocessed_urls
            ]
            combined.multi_reference_tagger += labels_for_unprocessed

    # add default label to any empty prediction (no predicted tags)
    if combined.multi_reference_tagger:
        # check if no reference case
        no_ref = len(combined.reference_urls) == 0

        default_label = ontology.default_label(no_ref=no_ref)
        for pred_labels in combined.multi_reference_tagger:
            if len(pred_labels) == 0:
                logger.debug(f"Empty prediction replaced by {default_label}")
                pred_labels.append(default_label)

    return combined


def get_support_data(
    ontology_interface: OntologyInterface,
    metadata_list: List[RefMetadata],
) -> ParserSupport:
    # Initialize an empty dictionary
    md_dict = {}

    for m in metadata_list:
        if hasattr(m, "url"):
            md_dict[m.url] = m

    return ParserSupport(
        ontology=ontology_interface,
        refs_meta=md_dict,
    )


def post_process_firebase(
    combined_parser_output: CombinedParserOutput,
    ontology_base: OntologyBase,
) -> ParserResult:
    """convert parser output result into format
    required by app interface."""
    semantics = combined_parser_output.gen_ref_tags

    # combine keywords and hashtags
    # https://github.com/Common-SenseMakers/sensemakers/issues/59
    keywords = combined_parser_output.all_keywords()

    # get metadata
    metadata_list: List[RefMetadata] = combined_parser_output.metadata_list

    # convert model outputs to triplets
    triplets = convert_ref_tags_to_rdf_triplets(
        combined_parser_output.reference_urls,
        semantics,
        ontology_base,
    )

    # convert triplets to graph
    graph = convert_triplets_to_graph(triplets)

    # add keywords to graph
    if keywords:
        kw_triplets = convert_keywords_to_rdf_triplets(keywords)
        for t in kw_triplets:
            graph.add(t.to_tuple())

    # add item type triplets
    item_type_triplets = convert_item_types_to_rdf_triplets(
        combined_parser_output.item_types,
        combined_parser_output.reference_urls,
    )
    for t in item_type_triplets:
        graph.add(t.to_tuple())

    # add quotesPost triplet if present
    if combined_parser_output.quoted_post_url:
        triplet = create_quoted_post_triplet(combined_parser_output.quoted_post_url)
        graph.add(triplet.to_tuple())

    # add links between quote posts and references they mention
    quote_ref_triplets = add_quote_post_ref_links(
        combined_parser_output.post_url,
        metadata_list,
        ontology_base,
    )
    for t in quote_ref_triplets:
        graph.add(t.to_tuple())

    # gather support info
    parser_support: ParserSupport = get_support_data(
        ontology_base.ontology_interface,
        metadata_list,
    )

    return ParserResult(
        semantics=graph,
        support=parser_support,
        filter_classification=combined_parser_output.filter_classification,
        metadata={"model_debug": combined_parser_output.debug},
    )


def post_process_chain_output(
    post: RefPost,
    raw_results: Dict[str, ParserChainOutput],
    md_dict: Dict[str, RefMetadata],
    ontology_base: OntologyBase,
    post_process_type: PostProcessType,
    unprocessed_urls: Optional[List[str]] = None,
) -> Union[CombinedParserOutput, ParserResult, Dict[str, ParserChainOutput]]:
    if unprocessed_urls is None:
        unprocessed_urls = []
    if post_process_type == PostProcessType.NONE:
        return raw_results
    elif post_process_type == PostProcessType.COMBINED:
        return combine_from_raw_results(
            post,
            raw_results,
            md_dict,
            ontology_base,
            unprocessed_urls,
        )
    elif post_process_type == PostProcessType.FIREBASE:
        combined_results = combine_from_raw_results(
            post,
            raw_results,
            md_dict,
            ontology_base,
            unprocessed_urls,
        )
        firebase_results = post_process_firebase(
            combined_results,
            ontology_base,
        )
        return firebase_results
    else:
        raise ValueError(f"Unknown post process type: {post_process_type}")
