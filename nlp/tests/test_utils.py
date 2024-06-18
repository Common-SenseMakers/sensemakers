import sys
import pytest
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

from desci_sense.shared_functions.utils import (
    identify_social_media,
    find_last_occurence_of_any,
)
from desci_sense.shared_functions.dataloaders import scrape_post
from desci_sense.shared_functions.dataloaders.twitter.twitter_utils import (
    extract_external_ref_urls,
    scrape_tweet,
    extract_twitter_status_id,
)


from desci_sense.shared_functions.utils import (
    remove_dups_ordered,
)  # Replace 'your_module' with the actual module name


def test_remove_dups_ordered():
    # Test case 1: Regular case with duplicates
    assert remove_dups_ordered([5, 4, 2, 5, 2, 4]) == [5, 4, 2]

    # Test case 2: All unique elements
    assert remove_dups_ordered([1, 2, 3, 4, 5]) == [1, 2, 3, 4, 5]

    # Test case 3: No elements
    assert remove_dups_ordered([]) == []

    # Test case 4: All elements are the same
    assert remove_dups_ordered([1, 1, 1, 1, 1]) == [1]

    # Test case 5: Mixed elements with multiple duplicates
    assert remove_dups_ordered([1, 2, 3, 2, 1, 4, 5, 3]) == [1, 2, 3, 4, 5]

    # Test case 6: Single element
    assert remove_dups_ordered([1]) == [1]

    # Test case 7: Duplicates at the end
    assert remove_dups_ordered([1, 2, 3, 1, 2, 3]) == [1, 2, 3]

    # Test case 8: Large list with random elements
    assert remove_dups_ordered([5, 3, 9, 1, 2, 8, 5, 9, 3, 2]) == [5, 3, 9, 1, 2, 8]


def test_identify_twitter():
    assert identify_social_media("https://twitter.com") == "twitter"
    assert identify_social_media("https://www.twitter.com") == "twitter"
    assert (
        identify_social_media("https://twitter.com/someuser/status/12345") == "twitter"
    )
    assert identify_social_media("http://t.co") == "twitter"
    assert identify_social_media("http://www.t.co/somepath") == "twitter"
    assert identify_social_media("https://x.com") == "twitter"
    assert (
        identify_social_media("https://x.com/sense_nets/status/1795939373747179683")
        == "twitter"
    )


def test_identify_unknown():
    assert identify_social_media("http://www.expert.com") == "Unknown"
    assert identify_social_media("https://facebook.com") == "Unknown"
    assert identify_social_media("http://www.linkedin.com") == "Unknown"
    assert identify_social_media("https://example.com") == "Unknown"
    assert identify_social_media("http://some.random.site") == "Unknown"
    assert identify_social_media("https://notwitter.t.com") == "Unknown"


def test_edge_cases():
    assert identify_social_media("http://") == "Unknown"
    assert identify_social_media("not a url") == "Unknown"
    assert identify_social_media("") == "Unknown"
    assert identify_social_media(None) == "Unknown"


def test_find_last_occurence_of_any():
    input_text = (
        "This is a test string with multiple words. Let's find the last occurrence."
    )
    strings_to_find = ["test", "words", "occurrence", "find"]
    assert find_last_occurence_of_any(input_text, strings_to_find) == "occurrence"

    input_text = "apple banana cherry date"
    strings_to_find = ["banana", "cherry", "apple"]
    assert find_last_occurence_of_any(input_text, strings_to_find) == "cherry"

    input_text = "apple banana cherry date"
    strings_to_find = ["banana", "apple"]
    assert find_last_occurence_of_any(input_text, strings_to_find) == "banana"

    input_text = "apple banana cherry date"
    strings_to_find = ["fig", "grape", "melon"]
    assert find_last_occurence_of_any(input_text, strings_to_find) == None

    input_text = ""
    strings_to_find = ["apple", "banana", "cherry"]
    assert find_last_occurence_of_any(input_text, strings_to_find) == None

    input_text = "repeated words repeated words"
    strings_to_find = ["words", "repeated"]
    assert find_last_occurence_of_any(input_text, strings_to_find) == "words"


if __name__ == "__main__":
    pytest.main()
