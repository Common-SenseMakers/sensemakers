import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

from desci_sense.shared_functions.dataloaders import scrape_post
from desci_sense.shared_functions.dataloaders.twitter.twitter_utils import (
    extract_external_ref_urls,
    scrape_tweet,
    extract_twitter_status_id,
)


def test_multiple_ref_qt():
    tweet_url = "https://x.com/sense_nets/status/1795939373747179683"
    quote_ref_post = scrape_post(tweet_url)
    target_urls_set = set(
        [
            "https://x.com/TechCrunch/status/1795455352042876946",
            "https://x.com/CryptoV1xen/status/1795918889542361110",
            "https://x.com/TechCrunch/status/1795908337977975272",
        ]
    )
    assert set(quote_ref_post.md_ref_urls()) == target_urls_set


def test_qt_with_external_ref():
    tweet_url = "https://x.com/StephensonJones/status/1799035911042482210"
    quote_ref_post = scrape_post(tweet_url)
    target_urls_set = set(
        [
            "https://x.com/biorxiv_neursci/status/1798962015148576815",
            "https://www.biorxiv.org/content/10.1101/2024.06.05.597547v1",
        ]
    )
    assert set(quote_ref_post.md_ref_urls()) == target_urls_set
    assert quote_ref_post.ref_urls == [
        "https://x.com/biorxiv_neursci/status/1798962015148576815"
    ]
    assert quote_ref_post.quoted_post.ref_urls == [
        "https://www.biorxiv.org/content/10.1101/2024.06.05.597547v1"
    ]

    # normalized form - should be updated in tweet text
    assert (
        "https://www.biorxiv.org/content/10.1101/2024.06.05.597547v1"
        in quote_ref_post.quoted_post.content
    )

def test_ordering():
    tweet_url = "https://x.com/EikoFried/status/1798167612175913332"
    quote_ref_post = scrape_post(tweet_url)
    assert quote_ref_post.md_ref_urls() == [
        "https://journals.sagepub.com/doi/10.1177/20451253231198466",
        "https://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E",
    ]
    


if __name__ == "__main__":
    tweet_url = "https://x.com/EikoFried/status/1798167612175913332"
    quote_ref_post = scrape_post(tweet_url)
    tweet_url = "https://x.com/EikoFried/status/1798167612175913332"
    quote_ref_post = scrape_post(tweet_url)
    ref_urls = quote_ref_post.md_ref_urls()
    assert ref_urls == [
        "https://journals.sagepub.com/doi/10.1177/20451253231198466",
        "https://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E",
    ]
    assert ref_urls == [
        "https://journals.sagepub.com/doi/10.1177/20451253231198466",
        "https://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E",
    ]

    # create dict of metadata by order of appearance
