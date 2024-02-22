import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))


# from desci_sense.parsers.multi_stage_parser import MultiStageParser, PromptCase
from desci_sense.configs import default_init_parser_config
from desci_sense.shared_functions.parsers.firebase_api_parser import FirebaseAPIParser
from desci_sense.shared_functions.dataloaders import (
    convert_text_to_ref_post,
    scrape_post,
)


def test_scrape_post():
    url = "https://mastodon.social/@psmaldino@qoto.org/111405098400404613"
    ref_post = scrape_post(url)
    assert ref_post.ref_urls == [
        "https://royalsocietypublishing.org/doi/10.1098/rstb.2022.0267"
    ]


def test_scrape_tw_post():
    url = "https://twitter.com/bingbrunton/status/1719789465739333972"
    ref_post = scrape_post(url)
    assert ref_post.ref_urls == ["https://apply.interfolio.com/130336"]
