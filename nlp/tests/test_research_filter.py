import sys
from pathlib import Path

# https://stackoverflow.com/a/63539722/2882125
import nest_asyncio

nest_asyncio.apply()

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))
import os
import pytest
from pydantic import ValidationError

from utils import create_multi_chain_for_tests, create_multi_config_for_tests
from desci_sense.shared_functions.parsers.multi_chain_parser import MultiChainParser
from desci_sense.shared_functions.filters import SciFilterClassfication
from desci_sense.shared_functions.configs import (
    OpenrouterAPIConfig,
    WandbConfig,
    LLMConfig,
    KeywordPParserChainConfig,
    RefTaggerChainConfig,
    TopicsPParserChainConfig,
    validate_env_var,
    MultiParserChainConfig,
    ParserChainType,
    PostProcessType,
)  # Adjust the import as necessary
from desci_sense.shared_functions.dataloaders import (
    scrape_post,
    convert_text_to_ref_post,
)

TEST_POST_TEXT_W_REF = """
I really liked this paper!
https://arxiv.org/abs/2402.04607
"""

NO_REF_RESEARCH_POST = """Collective intelligence is one of the most important rising trends to focus on in HCI research.
""" 

TEST_NON_RESEARCH_POST = """
My favorite sports are soccer and skiing!
"""

def test_citoid_detection():
    multi_config = create_multi_config_for_tests(
        llm_type="mistralai/mistral-7b-instruct:free"
    )
    multi_config.post_process_type = PostProcessType.COMBINED
    mcp = MultiChainParser(multi_config)
    res = mcp.process_text(TEST_POST_TEXT_W_REF)
    assert res.filter_classification == SciFilterClassfication.CITOID_DETECTED_RESEARCH
    
def test_not_research():
    multi_config = create_multi_config_for_tests(
        llm_type="mistralai/mistral-7b-instruct:free"
    )
    multi_config.post_process_type = PostProcessType.COMBINED
    mcp = MultiChainParser(multi_config)
    res = mcp.process_text(TEST_NON_RESEARCH_POST)
    assert res.filter_classification == SciFilterClassfication.NOT_RESEARCH
    
def test_ai_filter():
    multi_config = create_multi_config_for_tests(
        llm_type="mistralai/mistral-7b-instruct:free"
    )
    multi_config.post_process_type = PostProcessType.COMBINED
    mcp = MultiChainParser(multi_config)
    res = mcp.process_text(NO_REF_RESEARCH_POST)
    assert res.filter_classification == SciFilterClassfication.AI_DETECTED_RESEARCH
    

if __name__ == "__main__":
    multi_config = create_multi_config_for_tests(
        llm_type="mistralai/mistral-7b-instruct:free"
    )
    multi_config.post_process_type = PostProcessType.COMBINED
    mcp = MultiChainParser(multi_config)
    res = mcp.process_text(NO_REF_RESEARCH_POST)
    assert res.filter_classification == SciFilterClassfication.AI_DETECTED_RESEARCH

    # len(res.support.refs_meta) == 1
    # assert "test" in mcp.pparsers
    # assert "Google Scholar is manipulatable" in prompt
