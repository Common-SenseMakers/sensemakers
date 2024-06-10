import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))
import os
import pytest
from pydantic import ValidationError

from desci_sense.shared_functions.dataloaders import (
    scrape_post,
    convert_text_to_ref_post,
)
from desci_sense.shared_functions.web_extractors.metadata_extractors import (
    extract_posts_ref_metadata_dict,
    get_ref_post_metadata_list,
    RefMetadata,
)
from desci_sense.shared_functions.parsers.multi_chain_parser import MultiChainParser
from desci_sense.shared_functions.parsers.keyword_pparser import KeywordPostParserChain
from desci_sense.shared_functions.schema.ontology_base import OntologyBase
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

TEST_POST_TEXT_W_REF = """
I really liked this paper!
https://arxiv.org/abs/2402.04607
"""

TARGET_INPUT_POST = """- Author: default_author
- Content: 
I really liked this paper!
https://arxiv.org/abs/2402.04607

- References:
1: https://arxiv.org/abs/2402.04607
Item type: preprint
Title: Google Scholar is manipulatable
Summary: Citations are widely considered in scientists' evaluation. As such, scientists may be incentivized to inflate their citation counts. While previous literature has examined self-citations and citation cartels, it remains unclear whether scientists can purchase citations. Here, we compile a dataset of ~1.6 million profiles on Google Scholar to examine instances of citation fraud on the platform. We survey faculty at highly-ranked universities, and confirm that Google Scholar is widely used when ev
------------------"""

def test_simple_init():
    kp = KeywordPParserChainConfig(name="test")
    ontology = OntologyBase()
    multi_config = MultiParserChainConfig(parser_configs=[kp])
    kppc = KeywordPostParserChain(kp, multi_config, ontology)
    assert kppc.parser_config.name == "test"


def test_kw_parser_init():
    ontology = OntologyBase()
    kp = KeywordPParserChainConfig(name="test")
    multi_config = MultiParserChainConfig(parser_configs=[kp])
    kppc = KeywordPostParserChain(kp, multi_config, ontology)
    assert kppc.ontology.ontology_interface.keyword_predicate.name == "hasKeyword"


def test_prompt_kw():
    multi_config = MultiParserChainConfig(
        parser_configs=[
            KeywordPParserChainConfig(
                name="keywords",
                llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
            )
        ],
        metadata_extract_config=MetadataExtractionConfig(extraction_method="citoid"),
    )
    mcp = MultiChainParser(multi_config)
    ref_post = convert_text_to_ref_post(TEST_POST_TEXT_W_REF)
    md_dict = extract_posts_ref_metadata_dict([ref_post])
    prompt = mcp.instantiate_prompts(ref_post, md_dict)
    assert TARGET_INPUT_POST in prompt["keywords_input"]


if __name__ == "__main__":
    multi_config = MultiParserChainConfig(
        parser_configs=[
            KeywordPParserChainConfig(
                name="keywords",
                llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
            )
        ],
        metadata_extract_config=MetadataExtractionConfig(extraction_method="citoid"),
    )
    mcp = MultiChainParser(multi_config)
    ref_post = convert_text_to_ref_post(TEST_POST_TEXT_W_REF)
    md_dict = extract_posts_ref_metadata_dict([ref_post])
    prompt = mcp.instantiate_prompts(ref_post, md_dict)
