import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))
import os
import pytest
from pydantic import ValidationError

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
    MultiParserChainConfig,
    MultiRefTaggerChainConfig,
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


def test_simple_init():
    mt = MultiRefTaggerChainConfig(name="test")
    multi_config = MultiParserChainConfig(parser_configs=[mt])
    mcp = MultiChainParser(multi_config)
    assert "test" in mcp.pparsers


if __name__ == "__main__":
    tpc = TopicsPParserChainConfig(
        name="topic_test",
        use_metadata=True,
        llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
    )
    multi_config = MultiParserChainConfig(
        parser_configs=[
            tpc,
        ]
    )
    mcp = MultiChainParser(multi_config)

    res = mcp.process_text(TEST_POST_TEXT_W_REF)
    output = res["topic_test"]
    prompt = output.extra["prompt"]
    # multi_config = create_multi_config_for_tests(llm_type="google/gemma-7b-it:free")
    # multi_config.post_process_type = PostProcessType.COMBINED
    # mcp = MultiChainParser(multi_config)
    # res = mcp.process_text(TEST_POST_TEXT_W_REF)
    # assert "test" in mcp.pparsers
    # assert "Google Scholar is manipulatable" in prompt
