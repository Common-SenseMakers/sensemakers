import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))
import os
import pytest
from pydantic import ValidationError

from utils import create_multi_chain_for_tests
from desci_sense.shared_functions.parsers.multi_chain_parser import MultiChainParser
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
    kp = KeywordPParserChainConfig(name="test")
    multi_config = MultiParserChainConfig(parser_configs=[kp])
    mcp = MultiChainParser(multi_config)
    assert "test" in mcp.pparsers


def test_kw_chain_md_disabled():
    kp = KeywordPParserChainConfig(
        name="kw_test",
        use_metadata=True,
    )
    kp.llm_config.llm_type = "mistralai/mistral-7b-instruct:free"
    kp2 = KeywordPParserChainConfig(
        name="kw_test_2",
        use_metadata=False,
    )
    kp2.llm_config.llm_type = "mistralai/mistral-7b-instruct:free"

    multi_config = MultiParserChainConfig(parser_configs=[kp, kp2])
    mcp = MultiChainParser(multi_config)
    url = "https://mastodon.social/@psmaldino@qoto.org/111405098400404613"
    post = scrape_post(url)
    res = mcp.process_ref_post(post)
    output = res["kw_test_2"]
    assert "academic_kw" in res["kw_test"].answer
    assert "keywords" in res["kw_test"].answer
    assert "keywords" in res["kw_test_2"].answer
    assert "itemType" not in output.extra["prompt"]


def test_process_text():
    kp = KeywordPParserChainConfig(
        name="kw_test",
        use_metadata=True,
    )
    kp.llm_config.llm_type = "mistralai/mistral-7b-instruct:free"
    multi_config = MultiParserChainConfig(parser_configs=[kp])
    mcp = MultiChainParser(multi_config)
    res = mcp.process_text(TEST_POST_TEXT_W_REF)
    prompt = res["kw_test"].extra["prompt"]
    assert "Google Scholar is manipulatable" in prompt


def test_active_list():
    kp = KeywordPParserChainConfig(
        name="kw_test",
        use_metadata=True,
    )
    kp.llm_config.llm_type = "mistralai/mistral-7b-instruct:free"
    kp2 = KeywordPParserChainConfig(
        name="kw_test_2",
        use_metadata=False,
    )
    kp2.llm_config.llm_type = "mistralai/mistral-7b-instruct:free"

    multi_config = MultiParserChainConfig(parser_configs=[kp, kp2])
    mcp = MultiChainParser(multi_config)
    url = "https://mastodon.social/@psmaldino@qoto.org/111405098400404613"
    post = scrape_post(url)
    res = mcp.process_ref_post(post, active_list=["kw_test"])
    # output = res["kw_test_2"]
    assert "academic_kw" in res["kw_test"].answer
    assert "keywords" in res["kw_test"].answer
    assert list(res.keys()) == ["kw_test"]
    # assert "keywords" in res["kw_test_2"].answer
    # assert "itemType" not in output.extra["prompt"]


def test_ref_tagger():
    rtc = RefTaggerChainConfig(name="rt_test")
    rtc.llm_config.llm_type = "mistralai/mistral-7b-instruct:free"
    multi_config = MultiParserChainConfig(parser_configs=[rtc])
    mcp = MultiChainParser(multi_config)

    res = mcp.process_text(TEST_POST_TEXT_W_REF)

    prompt = res["rt_test"].extra["prompt"]
    assert "Google Scholar is manipulatable" in prompt


def test_topics():
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
    assert "Google Scholar is manipulatable" in prompt
    assert "allowed_tags" in output.extra


def test_topics_kw_ref_tagging():
    kp = KeywordPParserChainConfig(
        name="kw_test",
        use_metadata=True,
        llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
    )
    rtc = RefTaggerChainConfig(
        name="rt_test",
        use_metadata=True,
        llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
    )
    tpc = TopicsPParserChainConfig(
        name="topic_test",
        use_metadata=True,
        llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
    )
    multi_config = MultiParserChainConfig(
        parser_configs=[
            rtc,
            tpc,
            kp,
        ]
    )
    mcp = MultiChainParser(multi_config)

    res = mcp.process_text(TEST_POST_TEXT_W_REF)
    assert "topic_test" in res
    assert "kw_test" in res
    assert "rt_test" in res


def test_multi_chain_batch_simple():
    # get a few posts for input
    urls = [
        "https://mastodon.social/@psmaldino@qoto.org/111405098400404613",
        "https://mastodon.social/@UlrikeHahn@fediscience.org/111732713776994953",
        "https://mastodon.social/@ronent/111687038322549430",
    ]
    posts = [scrape_post(url) for url in urls]
    multi_chain_parser = create_multi_chain_for_tests()
    res = multi_chain_parser.batch_process_ref_posts(posts)

    assert len(res) == 3


if __name__ == "__main__":
    kp = KeywordPParserChainConfig(name="test")
    multi_config = MultiParserChainConfig(parser_configs=[kp])
    mcp = MultiChainParser(multi_config)
    # assert "test" in mcp.pparsers
    # assert "Google Scholar is manipulatable" in prompt
