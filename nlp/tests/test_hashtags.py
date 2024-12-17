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


def test_base():
    ht = HashtagPParserChainConfig(name="hashtags")
    multi_config = MultiParserChainConfig(parser_configs=[ht])
    mpc = MultiChainParser(multi_config)
    input_text = (
        "Let's meet at #sunrise and later at #sunset! #sunrise is the best time!"
    )

    res = mpc.process_text(input_text)
    assert set(res["hashtags"].answer) == set(["sunset", "sunrise"])


def test_tweet_only_htags():
    ht = HashtagPParserChainConfig(name="hashtags")
    multi_config = MultiParserChainConfig(
        parser_configs=[ht], post_process_type=PostProcessType.FIREBASE
    )
    mpc = MultiChainParser(multi_config)
    url = "https://twitter.com/yoginho/status/1782475359545389138"
    post = scrape_post(url)

    res = mpc.process_ref_post(post)
    graph = res.semantics
    assert Literal("tescreal") in graph.all_nodes()
    assert Literal("transhumanist") in graph.all_nodes()

def test_tweet_htags_kw():
    ht = HashtagPParserChainConfig(name="hashtags")
    kp = KeywordPParserChainConfig(name="keywords")
    multi_config = MultiParserChainConfig(
        parser_configs=[ht, kp], post_process_type=PostProcessType.FIREBASE
    )
    mpc = MultiChainParser(multi_config)
    url = "https://twitter.com/yoginho/status/1782475359545389138"
    post = scrape_post(url)

    res = mpc.process_ref_post(post)
    graph = res.semantics
    assert Literal("tescreal") in graph.all_nodes()
    assert Literal("transhumanist") in graph.all_nodes()
    
def test_hashtags_combined_postproc():
    ht = HashtagPParserChainConfig(name="hashtags")
    kp = KeywordPParserChainConfig(name="keywords")
    multi_config = MultiParserChainConfig(
        parser_configs=[ht, kp], post_process_type=PostProcessType.COMBINED
    )
    mpc = MultiChainParser(multi_config)
    url = "https://twitter.com/yoginho/status/1782475359545389138"
    post = scrape_post(url)

    res = mpc.process_ref_post(post, active_list=["hashtags"])
    assert set(res.hashtags) == set(['tescreal', 'transhumanist'])

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
    test_base()