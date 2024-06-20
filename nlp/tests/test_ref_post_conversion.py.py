import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))
import pytest

from desci_sense.shared_functions.dataloaders import (
    PostScrapeError,
    UnknownSocialMediaTypeError,
    scrape_post,
    convert_text_to_ref_post,
)
from desci_sense.shared_functions.dataloaders.twitter.twitter_utils import (
    extract_external_ref_urls,
    scrape_tweet,
    extract_twitter_status_id,
)
from desci_sense.shared_functions.utils import unshorten_url


if __name__ == "__main__":
    #     p = """
    #  #HigherEd #GenAI: Assessment Reform for the Age of AI: in a nutshell here's the outcome from the @TEQSAGov expert forum 👉Report + HE sector consultation https://www.teqsa.gov.au/About-us/engagement/consultation """
    #     ref_post = convert_text_to_ref_post(p)

    res = unshorten_url("https://www.teqsa.gov.au/About-us/engagement/consultation")
