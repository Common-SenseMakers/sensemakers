import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))
import os
import pytest
from rdflib import Literal

from pydantic import ValidationError
from desci_sense.shared_functions.parsers.hashtag_parser import HashtagPostParserChain
from desci_sense.shared_functions.dataloaders import (
    scrape_post,
    convert_text_to_ref_post,
)
from desci_sense.shared_functions.schema.ontology_base import OntologyBase
from desci_sense.shared_functions.configs import (
    OpenrouterAPIConfig,
    WandbConfig,
    HashtagPParserChainConfig,
    KeywordPParserChainConfig,
    validate_env_var,
    MultiParserChainConfig,
    ParserChainType,
    PostProcessType,
)  # Adjust the import as necessary
from desci_sense.shared_functions.parsers.multi_chain_parser import MultiChainParser


"""def test_base():
    ht = HashtagPParserChainConfig(name="hashtags")
    multi_config = MultiParserChainConfig(parser_configs=[ht])
    mpc = MultiChainParser(multi_config)
    input_text = (
        "Let's meet at #sunrise and later at #sunset! #sunrise is the best time!"
    )

    res = mpc.process_text(input_text)
    assert set(res["hashtags"].answer) == set(["sunset", "sunrise"])"""


def test_tweet_graph_item_type():
    ht = HashtagPParserChainConfig(name="hashtags")
    multi_config = MultiParserChainConfig(
        parser_configs=[ht], post_process_type=PostProcessType.FIREBASE
    )
    mpc = MultiChainParser(multi_config)
    url = "https://x.com/ItaiYanai/status/1875229245309686137"
    post = scrape_post(url)

    res = mpc.process_ref_post(post)
    graph = res.semantics
    assert Literal("forumPost") in graph.all_nodes()
    

    
def test_tweet_item_type_metadata():
    ht = HashtagPParserChainConfig(name="hashtags")
    kp = KeywordPParserChainConfig(name="keywords")
    multi_config = MultiParserChainConfig(
        parser_configs=[ht, kp], post_process_type=PostProcessType.COMBINED
    )
    mpc = MultiChainParser(multi_config)
    url = "https://x.com/ItaiYanai/status/1875229245309686137"
    post = scrape_post(url)

    res = mpc.process_ref_post(post, active_list=["hashtags"])
    assert res.item_types == ['forumPost']
    assert res.metadata_list[0].title == 'twitter post'

def test_blsky_item_type_metadata():
    ht = HashtagPParserChainConfig(name="hashtags")
    kp = KeywordPParserChainConfig(name="keywords")
    multi_config = MultiParserChainConfig(
        parser_configs=[ht, kp], post_process_type=PostProcessType.COMBINED
    )
    mpc = MultiChainParser(multi_config)
    
    post = convert_text_to_ref_post("https://bsky.app/profile/alfredtwu.com/post/3lfqz7zk6ok2t")
    

    res = mpc.process_ref_post(post, active_list=["hashtags"])
    assert res.item_types == ['forumPost']
    assert res.metadata_list[0].title == 'bluesky post'

def test_mastodon_item_type_metadata():
    ht = HashtagPParserChainConfig(name="hashtags")
    kp = KeywordPParserChainConfig(name="keywords")
    multi_config = MultiParserChainConfig(
        parser_configs=[ht, kp], post_process_type=PostProcessType.COMBINED
    )
    mpc = MultiChainParser(multi_config)
    
    post = convert_text_to_ref_post("https://vis.social/@kristinHenry/113832253780784624")
    

    res = mpc.process_ref_post(post, active_list=["hashtags"])
    assert res.item_types == ['forumPost']
    assert res.metadata_list[0].title == 'mastodon post'
if __name__ == "__main__":
    """ht = HashtagPParserChainConfig(name="hashtags")
    kp = KeywordPParserChainConfig(name="keywords")
    multi_config = MultiParserChainConfig(
        parser_configs=[ht, kp], post_process_type=PostProcessType.COMBINED
    )
    mpc = MultiChainParser(multi_config)
    url = "https://twitter.com/yoginho/status/1782475359545389138"
    post = scrape_post(url)

    res = mpc.process_ref_post(post, active_list=["hashtags"])"""
