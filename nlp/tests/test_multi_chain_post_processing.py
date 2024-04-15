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


def test_combined_pp():
    multi_config = create_multi_config_for_tests()
    multi_config.post_process_type = PostProcessType.COMBINED
    mcp = MultiChainParser(multi_config)
    res = mcp.process_text(TEST_POST_TEXT_W_REF)
    assert res.item_types == ["preprint"]
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


def test_multi_chain_batch_pp_simple():
    # get a few posts for input
    urls = [
        "https://mastodon.social/@psmaldino@qoto.org/111405098400404613",
        "https://mastodon.social/@UlrikeHahn@fediscience.org/111732713776994953",
        "https://mastodon.social/@ronent/111687038322549430",
    ]
    posts = [scrape_post(url) for url in urls]
    multi_chain_parser = create_multi_chain_for_tests()
    multi_chain_parser.config.post_process_type == PostProcessType.NONE
    res = multi_chain_parser.batch_process_ref_posts(posts)

    assert len(res) == 3


def test_multi_chain_batch_pp_combined():
    # get a few posts for input
    urls = [
        "https://mastodon.social/@psmaldino@qoto.org/111405098400404613",
        "https://mastodon.social/@UlrikeHahn@fediscience.org/111732713776994953",
        "https://mastodon.social/@ronent/111687038322549430",
    ]
    posts = [scrape_post(url) for url in urls]
    multi_config = create_multi_config_for_tests(llm_type="google/gemma-7b-it:free")
    multi_chain_parser = MultiChainParser(multi_config)
    multi_chain_parser.config.post_process_type = PostProcessType.COMBINED
    res = multi_chain_parser.batch_process_ref_posts(posts)

    out_0 = res[0]
    assert (
        out_0.metadata_list[0].url
        == "https://royalsocietypublishing.org/doi/10.1098/rstb.2022.0267"
    )
    assert len(out_0.metadata_list) == 1

    out_1 = res[1]
    assert len(out_1.metadata_list) == 1
    assert (
        out_1.metadata_list[0].url
        == "https://write.as/ulrikehahn/some-thoughts-on-social-media-for-science"
    )

    out_2 = res[2]
    assert len(out_2.metadata_list) == 2
    assert set(out_2.reference_urls) == set(
        [
            "https://paragraph.xyz/@sense-nets/sense-nets-intro",
            "https://paragraph.xyz/@sense-nets/2-project-plan",
        ]
    )


if __name__ == "__main__":
    # get a few posts for input
    urls = [
        "https://mastodon.social/@psmaldino@qoto.org/111405098400404613",
        "https://mastodon.social/@UlrikeHahn@fediscience.org/111732713776994953",
        "https://mastodon.social/@ronent/111687038322549430",
    ]
    posts = [scrape_post(url) for url in urls]
    multi_config = create_multi_config_for_tests(llm_type="google/gemma-7b-it")
    multi_chain_parser = MultiChainParser(multi_config)
    multi_chain_parser.config.post_process_type = PostProcessType.FIREBASE
    res = multi_chain_parser.batch_process_ref_posts(posts)


    # len(res.support.refs_meta) == 1
    # assert "test" in mcp.pparsers
    # assert "Google Scholar is manipulatable" in prompt
