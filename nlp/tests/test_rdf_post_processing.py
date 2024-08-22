import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))
import os
import pytest
from pydantic import ValidationError
from rdflib import URIRef

from utils import create_multi_chain_for_tests, create_multi_config_for_tests
from desci_sense.shared_functions.parsers.multi_chain_parser import MultiChainParser
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
