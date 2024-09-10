import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))
import os
import pytest
from pydantic import ValidationError
from rdflib import URIRef, Literal

from utils import create_multi_chain_for_tests, create_multi_config_for_tests
from desci_sense.shared_functions.parsers.multi_chain_parser import MultiChainParser
from desci_sense.shared_functions.interface import (
    RDFTriplet,
)
from desci_sense.shared_functions.configs import (
    OpenrouterAPIConfig,
    WandbConfig,
    LLMConfig,
    KeywordPParserChainConfig,
    RefTaggerChainConfig,
    TopicsPParserChainConfig,
    validate_env_var,
    MetadataExtractionConfig,
    MultiParserChainConfig,
    MultiRefTaggerChainConfig,
    ParserChainType,
    PostProcessType,
)  # Adjust the import as necessary
from desci_sense.shared_functions.postprocessing import (
    convert_ref_tags_to_rdf_triplets,
)


def test_no_ref():
    multi_config = MultiParserChainConfig(
        parser_configs=[
            MultiRefTaggerChainConfig(
                name="multi_ref_tagger",
                llm_config=LLMConfig(llm_type="mistralai/mixtral-8x7b-instruct:nitro"),
            )
        ],
        metadata_extract_config=MetadataExtractionConfig(extraction_method="citoid"),
    )
    mcp = MultiChainParser(multi_config)
    reference_urls = []
    reference_tags = [["missing-ref"]]
    triplets = convert_ref_tags_to_rdf_triplets(
        reference_urls,
        reference_tags,
        mcp.ontology,
    )
    triplet = triplets[0]
    assert triplet.predicate == URIRef(
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
    )
    assert triplet.object == URIRef("https://sense-nets.xyz/possibleMissingReference")


def test_default_pred_i146():
    multi_config = MultiParserChainConfig(
        parser_configs=[
            MultiRefTaggerChainConfig(
                name="multi_ref_tagger",
                llm_config=LLMConfig(llm_type="mistralai/mixtral-8x7b-instruct:nitro"),
            )
        ],
        metadata_extract_config=MetadataExtractionConfig(extraction_method="citoid"),
    )
    mcp = MultiChainParser(multi_config)
    reference_urls = []
    no_ref = len(reference_urls) == 0
    reference_tags = [[mcp.ontology.default_label(no_ref)]]
    triplets = convert_ref_tags_to_rdf_triplets(
        reference_urls,
        reference_tags,
        mcp.ontology,
    )
    triplet = triplets[0]
    assert triplet.object == URIRef("https://sense-nets.xyz/other")


def test_equality_same_triplets():
    triplet1 = RDFTriplet(
        subject=URIRef("https://example.com/subject"),
        predicate=URIRef("https://example.com/predicate"),
        object=Literal("Object"),
    )
    triplet2 = RDFTriplet(
        subject=URIRef("https://example.com/subject"),
        predicate=URIRef("https://example.com/predicate"),
        object=Literal("Object"),
    )

    assert (
        triplet1 == triplet2
    ), "Triplets with the same subject, predicate, and object should be equal."


def test_equality_different_subject():
    triplet1 = RDFTriplet(
        subject=URIRef("https://example.com/subject1"),
        predicate=URIRef("https://example.com/predicate"),
        object=Literal("Object"),
    )
    triplet2 = RDFTriplet(
        subject=URIRef("https://example.com/subject2"),
        predicate=URIRef("https://example.com/predicate"),
        object=Literal("Object"),
    )

    assert triplet1 != triplet2, "Triplets with different subjects should not be equal."


def test_equality_different_predicate():
    triplet1 = RDFTriplet(
        subject=URIRef("https://example.com/subject"),
        predicate=URIRef("https://example.com/predicate1"),
        object=Literal("Object"),
    )
    triplet2 = RDFTriplet(
        subject=URIRef("https://example.com/subject"),
        predicate=URIRef("https://example.com/predicate2"),
        object=Literal("Object"),
    )

    assert (
        triplet1 != triplet2
    ), "Triplets with different predicates should not be equal."


def test_equality_different_object():
    triplet1 = RDFTriplet(
        subject=URIRef("https://example.com/subject"),
        predicate=URIRef("https://example.com/predicate"),
        object=Literal("Object1"),
    )
    triplet2 = RDFTriplet(
        subject=URIRef("https://example.com/subject"),
        predicate=URIRef("https://example.com/predicate"),
        object=Literal("Object2"),
    )

    assert triplet1 != triplet2, "Triplets with different objects should not be equal."


def test_equality_different_type():
    triplet = RDFTriplet(
        subject=URIRef("https://example.com/subject"),
        predicate=URIRef("https://example.com/predicate"),
        object=Literal("Object"),
    )
    non_triplet = "Not an RDFTriplet"

    assert (
        triplet != non_triplet
    ), "A triplet should not be equal to an object of a different type."


if __name__ == "__main__":
    multi_config = MultiParserChainConfig(
        parser_configs=[
            MultiRefTaggerChainConfig(
                name="multi_ref_tagger",
                llm_config=LLMConfig(llm_type="mistralai/mixtral-8x7b-instruct:nitro"),
            )
        ],
        metadata_extract_config=MetadataExtractionConfig(extraction_method="citoid"),
    )
    mcp = MultiChainParser(multi_config)
    reference_urls = []
    no_ref = len(reference_urls) == 0
    reference_tags = [[mcp.ontology.default_label(no_ref)]]
    triplets = convert_ref_tags_to_rdf_triplets(
        reference_urls,
        reference_tags,
        mcp.ontology,
    )
