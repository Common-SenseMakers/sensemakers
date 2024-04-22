import sys
from pathlib import Path
import nest_asyncio

nest_asyncio.apply()

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

from desci_sense.shared_functions.interface import ParserResult
from desci_sense.configs import default_init_parser_config

# from utils import default_init_parser_config
from desci_sense.shared_functions.parsers.firebase_api_parser import (
    FirebaseAPIParser,
    PromptCase,
)
from desci_sense.shared_functions.dataloaders import (
    scrape_post,
    convert_text_to_ref_post,
)


def test_abatch_simple():
    config = default_init_parser_config(
        semantics_model="mistralai/mistral-7b-instruct",
        kw_model="mistralai/mistral-7b-instruct",
    )
    config["general"]["ref_metadata_method"] = "citoid"

    # get a few posts for input
    urls = [
        "https://mastodon.social/@psmaldino@qoto.org/111405098400404613",
        "https://mastodon.social/@UlrikeHahn@fediscience.org/111732713776994953",
        "https://mastodon.social/@ronent/111687038322549430",
    ]
    posts = [scrape_post(url) for url in urls]

    parser = FirebaseAPIParser(config=config)

    res = parser.abatch_process_ref_post(posts)

    assert len(res) == 3
