import sys
from pathlib import Path


ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))
import pytest

from desci_sense.shared_functions.utils import normalize_tweet_urls_in_text

from desci_sense.shared_functions.dataloaders import (
    PostScrapeError,
    UnknownSocialMediaTypeError,
    scrape_post,
)
from desci_sense.shared_functions.dataloaders.twitter.twitter_utils import (
    extract_external_ref_urls,
    scrape_tweet,
    extract_twitter_status_id,
)


def test_scrape_post_not_found_i95():
    post_url = "https://twitter.com/AravSrinivas/status/1770128084999758130"

    with pytest.raises(PostScrapeError) as exc_info:
        scrape_post(post_url)

    assert exc_info.value.post_url == post_url
    assert (
        exc_info.value.message
        == f"Post scraping failed, perhaps it has been deleted: {post_url}"
    )


def test_scrape_post_unknown_social_media_type():
    post_url = "https://unknownsocialmedia.com/example/status/1234567890"

    with pytest.raises(UnknownSocialMediaTypeError) as exc_info:
        scrape_post(post_url)

    assert exc_info.value.post_url == post_url
    assert exc_info.value.message == f"Unknown social media type: {post_url}"


def test_extract_twitter_status_id_from_twitter_url():
    url = "https://twitter.com/TechCrunch/status/1798026045544710492"
    expected_status_id = "1798026045544710492"
    assert extract_twitter_status_id(url) == expected_status_id


def test_extract_twitter_status_id_from_x_url():
    url = "https://x.com/TechCrunch/status/1798026045544710492"
    expected_status_id = "1798026045544710492"
    assert extract_twitter_status_id(url) == expected_status_id


def test_extract_twitter_status_id_invalid_url():
    url = "https://example.com/TechCrunch/status/1798026045544710492"
    assert extract_twitter_status_id(url) is None


def test_extract_twitter_status_id_no_status():
    url = "https://twitter.com/TechCrunch"
    assert extract_twitter_status_id(url) is None


def test_extract_twitter_status_id_malformed_url():
    url = "https://twitter.com/TechCrunch/status/"
    assert extract_twitter_status_id(url) is None


def test_extract_twitter_status_id_with_additional_parameters():
    url = (
        "https://twitter.com/TechCrunch/status/1798026045544710492?ref_src=twsrc%5Etfw"
    )
    expected_status_id = "1798026045544710492"
    assert extract_twitter_status_id(url) == expected_status_id


def test_ext_urls():
    test_urls = [
        ("https://twitter.com/maksym_andr/status/1722235666724192688", True),
        ("https://twitter.com/mpshanahan/status/1722283975450722407", False),
        ("https://twitter.com/victorveitch/status/1722303746397409698", False),
        ("https://twitter.com/HarvardPSC/status/1722102271792603452", False),
        ("https://twitter.com/cognazor/status/1722598121887117753", True),  # qrt,
        ("https://twitter.com/soldni/status/1724094517970882959", False),
    ]

    for case, label in test_urls:
        tweet = scrape_tweet(case)
        assert (
            tweet.has_refs() == label
        ), f"{case} has_refs? = {tweet.has_refs()} - mismatch with {label}"


def test_problem_tweet_i92():
    # https://github.com/Common-SenseMakers/sensemakers/issues/92
    url = "https://twitter.com/JingyiQiu4/status/1792956482851663941"
    tweet = scrape_tweet(url)
    assert tweet.ref_urls == [
        "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4778120"
    ]


def test_problem_tweet_i31():
    # https://github.com/csensemakers/desci-sense/issues/31
    test_urls = [("https://twitter.com/victorveitch/status/1722300572554969090", True)]

    for case, label in test_urls:
        tweet = scrape_tweet(case)
        assert (
            tweet.has_refs() == label
        ), f"{case} has_refs? = {tweet.has_refs()} - mismatch with {label}"


def test_normalize_single_twitter_url():
    text = "Check out this tweet: https://twitter.com/user/status/1234567890"
    expected = "Check out this tweet: https://x.com/user/status/1234567890"
    assert normalize_tweet_urls_in_text(text) == expected


def test_normalize_multiple_twitter_urls():
    text = "First tweet: https://twitter.com/user1/status/1234567890 and second tweet: https://twitter.com/user2/status/0987654321"
    expected = "First tweet: https://x.com/user1/status/1234567890 and second tweet: https://x.com/user2/status/0987654321"
    assert normalize_tweet_urls_in_text(text) == expected


def test_mixed_urls():
    text = "Tweet: https://twitter.com/user/status/1234567890 and a non-Twitter URL: https://example.com/page"
    expected = "Tweet: https://x.com/user/status/1234567890 and a non-Twitter URL: https://example.com/page"
    assert normalize_tweet_urls_in_text(text) == expected


def test_no_twitter_url():
    text = "This text contains no Twitter URLs, only this: https://example.com/page"
    expected = "This text contains no Twitter URLs, only this: https://example.com/page"
    assert normalize_tweet_urls_in_text(text) == expected


def test_empty_string():
    text = ""
    expected = ""
    assert normalize_tweet_urls_in_text(text) == expected


def test_url_with_http():
    text = "Check out this tweet: http://twitter.com/user/status/1234567890"
    expected = "Check out this tweet: https://x.com/user/status/1234567890"
    assert normalize_tweet_urls_in_text(text) == expected


def test_mixed_case_url():
    text = "Check out this tweet: https://Twitter.com/user/status/1234567890"
    expected = "Check out this tweet: https://x.com/user/status/1234567890"
    assert normalize_tweet_urls_in_text(text) == expected


if __name__ == "__main__":
    post_url = "https://twitter.com/example/status/1234567890"
    tweet = scrape_post(post_url)
