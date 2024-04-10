import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))
import os
import pytest
from pydantic import ValidationError

from utils import create_multi_chain_for_tests, create_multi_config_for_tests
from desci_sense.shared_functions.parsers.multi_chain_parser import MultiChainParser
from desci_sense.shared_functions.filters import SciFilterClassfication
from desci_sense.shared_functions.runners.configs import (
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

def test_combined_pp():
    multi_config = create_multi_config_for_tests()
    multi_config.post_process_type = PostProcessType.COMBINED
    mcp = MultiChainParser(multi_config)
    res = mcp.process_text(TEST_POST_TEXT_W_REF)
    assert res.item_types == ['preprint']
    assert len(res.keywords) > 0
    assert len(res.metadata_list) == 1
    assert res.filter_classification == SciFilterClassfication.RESEARCH
    
def test_firebase_pp():
    multi_config = create_multi_config_for_tests()
    multi_config.post_process_type = PostProcessType.FIREBASE
    mcp = MultiChainParser(multi_config)
    res = mcp.process_text(TEST_POST_TEXT_W_REF)
    len(res.support.refs_meta) == 1
    assert res.filter_classification == SciFilterClassfication.RESEARCH

if __name__ == "__main__":
    
    multi_config = create_multi_config_for_tests()
    multi_config.post_process_type = PostProcessType.FIREBASE
    mcp = MultiChainParser(multi_config)
    res = mcp.process_text(TEST_POST_TEXT_W_REF)
    len(res.support.refs_meta) == 1
    # assert "test" in mcp.pparsers
    # assert "Google Scholar is manipulatable" in prompt
