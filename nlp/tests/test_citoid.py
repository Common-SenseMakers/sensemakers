import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

# https://stackoverflow.com/a/63539722/2882125
import nest_asyncio

nest_asyncio.apply()

import asyncio
import time
from aiohttp.client import ClientSession
from desci_sense.shared_functions.web_extractors.citoid import (
    fetch_citation_async,
    fetch_all_citations,
    fetch_citation,
)
from desci_sense.shared_functions.web_extractors.metadata_extractors import (
    extract_urls_citoid_metadata,
)


def test_error_handling_single_call():
    bad_test_input = ["httpsss://ept.ms/3VUYqTRsdfs/ff"]
    res = extract_urls_citoid_metadata(bad_test_input, max_summary_length=30)
    assert len(res) == 1
    assert "error" in res[0].debug


def test_error_handling_batch_call():
    bad_test_inputs = ["httpsss://ept.ms/3VUYqTRsdfs/ff"] * 2
    res = extract_urls_citoid_metadata(bad_test_inputs, max_summary_length=30)
    assert len(res) == 2
    assert [r.url for r in res] == bad_test_inputs
    assert "error" in res[0].debug
    assert "error" in res[1].debug


def test_scale_citoid():
    # warning - may take 3-5 minutes
    # https://github.com/Common-SenseMakers/sensemakers/issues/66
    # from https://twitter.com/mbauwens/status/1779543397528740338
    test_input = ["https://ept.ms/3VUYqTR", "https://ept.ms/43XPhLZ"] * 60
    res = extract_urls_citoid_metadata(test_input, max_summary_length=30)
    num_res = len(res)
    assert num_res == len(test_input)


def test_i99():
    # https://github.com/Common-SenseMakers/sensemakers/issues/99
    res = fetch_citation("https://accidental-expert.com/p/the-bob-ross-of-adobe")
    assert res["title"] == "The Bob Ross of Adobe"
    assert res["url"] == "https://accidental-expert.com/p/the-bob-ross-of-adobe"


from urllib.parse import urlparse


def identify_social_media(url):
    """
    Identify whether a given URL is from Twitter.

    Parameters:
        url (str): The URL to be identified.

    Returns:
        str: The identified social media platform ('Twitter', 'Mastodon'), or 'Unknown' if not identified.
    """
    twitter_domains = ["twitter.com", "t.co", "x.com"]

    parsed_url = urlparse(url)
    domain = parsed_url.netloc.lower()

    if any(twitter_domain in domain for twitter_domain in twitter_domains):
        return "twitter"
    else:
        return "Unknown"


if __name__ == "__main__":
    # test_input = ["'https://accidental-expert.com/p/the-bob-ross-of-adobe'"]
    res = fetch_citation("https://accidental-expert.com/p/the-bob-ross-of-adobe")
    # assert len(res) == 1
    # print(res)
