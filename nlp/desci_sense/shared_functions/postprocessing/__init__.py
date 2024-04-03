from typing import List, Dict, Optional, Any
from enum import Enum
from rdflib.namespace import RDF
from rdflib import URIRef, Literal, Graph
from ..interface import (
    RDFTriplet,
    isAConceptDefintion,
    KeywordConceptDefinition,
)
from ..schema.ontology_base import OntologyBase
from ..schema.post import RefPost
from ..web_extractors.metadata_extractors import (
    RefMetadata,
)
from pydantic import (
    Field,
    BaseModel,
)


class ParserChainOutput(BaseModel):
    answer: Any
    full_prompt: str
    reasoning: Optional[str]
    extra: Dict


class CombinedParserOutput(BaseModel):
    research_keyword: str
    research_filter: str = None  # TODO make enum
    item_types: List[str]
    reference_urls: List[str]
    semantic_tags: List[str]
    keywords: List[str]
    topics: List[str]
    metadata_list: List[RefMetadata]
    debug: Optional[Dict] = Field(default_factory=dict)


def convert_raw_output_to_st_format(
    post: RefPost,
    sem_prompt: str,
    kw_prompt: str,
    topics_prompt: str,
    output: dict,
    md_dict: Dict[str, RefMetadata],
) -> CombinedParserOutput:
    reference_urls = post.ref_urls
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
        semantic_tags=semantic_tags,
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
    refs = post.ref_urls

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
