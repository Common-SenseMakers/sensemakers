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
    trim_str_with_urls,
    trim_str_with_urls_by_sep,
    trim_parts,
    trim_parts_to_length,
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


def test_trim_str_with_urls():
    assert (
        trim_str_with_urls(
            "testing https://x.com/FDAadcomms/status/1798107142219796794", 10
        )
        == "testing https://x.com/FDAadcomms/status/1798107142219796794"
    )
    assert trim_str_with_urls("testing not a valid url", 10) == "testing no"
    assert trim_str_with_urls("short text", 20) == "short text"
    assert (
        trim_str_with_urls("cutoff here example.com/test", 18) == "cutoff here exampl"
    )
    assert (
        trim_str_with_urls("cutoff here https://example.com/test", 19)
        == "cutoff here https://example.com/test"
    )
    assert (
        trim_str_with_urls("cutoff here https://example.com/test and more text", 40)
        == "cutoff here https://example.com/test and"
    )
    assert (
        trim_str_with_urls(
            "multiple urls http://example.com/one https://example.com/two", 25
        )
        == "multiple urls http://example.com/one"
    )
    assert (
        trim_str_with_urls(
            "multiple urls http://example.com/one https://example.com/two", 45
        )
        == "multiple urls http://example.com/one https://example.com/two"
    )
    assert (
        trim_str_with_urls("cutoff pre-url https://example.com/test", 15)
        == "cutoff pre-url "
    )
    assert trim_str_with_urls("", 10) == ""
    assert trim_str_with_urls("no urls in this text", 5) == "no ur"


def test_trim_str_with_urls_by_sep():
    assert trim_str_with_urls_by_sep("123<SEP>456789", 4, "<SEP>") == (
        ["123", "4"],
        True,
    )
    assert trim_str_with_urls_by_sep("testing<SEP>not a valid url", 10, "<SEP>") == (
        ["testing", "not"],
        True,
    )
    assert trim_str_with_urls_by_sep("short<SEP>text", 20, "<SEP>") == (
        ["short", "text"],
        False,
    )
    assert trim_str_with_urls_by_sep(
        "cutoff<SEP>here<SEP>https://example.com/test", 18, "<SEP>"
    ) == (["cutoff", "here", "https://example.com/test"], False)
    assert trim_str_with_urls_by_sep(
        "cutoff<SEP>here<SEP>https://example.com/test", 19, "<SEP>"
    ) == (["cutoff", "here", "https://example.com/test"], False)
    assert trim_str_with_urls_by_sep(
        "cutoff<SEP>here<SEP>https://example.com/test<SEP>and more text", 40, "<SEP>"
    ) == (["cutoff", "here", "https://example.com/test", "and mo"], True)
    assert trim_str_with_urls_by_sep(
        "multiple<SEP>urls<SEP>http://example.com/one<SEP>https://example.com/two",
        25,
        "<SEP>",
    ) == (["multiple", "urls", "http://example.com/one"], True)
    assert trim_str_with_urls_by_sep(
        "multiple<SEP>urls<SEP>http://example.com/one<SEP>https://example.com/two",
        45,
        "<SEP>",
    ) == (
        ["multiple", "urls", "http://example.com/one", "https://example.com/two"],
        False,
    )
    assert trim_str_with_urls_by_sep(
        "cutoff<SEP>mid-url<SEP>https://example.com/test", 17, "<SEP>"
    ) == (["cutoff", "mid-url", "https://example.com/test"], False)
    assert trim_str_with_urls_by_sep(
        "cutoff<SEP>mid-url<SEP>https://example.com/test", 18, "<SEP>"
    ) == (["cutoff", "mid-url", "https://example.com/test"], False)
    assert trim_str_with_urls_by_sep("", 10, "<SEP>") == ([""], False)
    assert trim_str_with_urls_by_sep("no urls<SEP>in this text", 5, "<SEP>") == (
        ["no ur"],
        True,
    )


def test_trim_parts():
    assert trim_parts(["123", "456789"], 4) == (["123", "4"], True)
    assert trim_parts(["testing", "not a valid url"], 10) == (["testing", "not"], True)
    assert trim_parts(["short", "text"], 20) == (["short", "text"], False)
    assert trim_parts(["cutoff", "here", "https://example.com/test"], 18) == (
        ["cutoff", "here", "https://example.com/test"],
        False,
    )
    assert trim_parts(["cutoff", "here", "https://example.com/test"], 19) == (
        ["cutoff", "here", "https://example.com/test"],
        False,
    )
    assert trim_parts(
        ["cutoff", "here", "https://example.com/test", "and more text"], 40
    ) == (["cutoff", "here", "https://example.com/test", "and mo"], True)
    assert trim_parts(
        ["multiple", "urls", "http://example.com/one", "https://example.com/two"], 25
    ) == (["multiple", "urls", "http://example.com/one"], True)
    assert trim_parts(
        ["multiple", "urls", "http://example.com/one", "https://example.com/two"], 45
    ) == (
        ["multiple", "urls", "http://example.com/one", "https://example.com/two"],
        False,
    )
    assert trim_parts(["cutoff", "mid-url", "https://example.com/test"], 17) == (
        ["cutoff", "mid-url", "https://example.com/test"],
        False,
    )
    assert trim_parts(["cutoff", "mid-url", "https://example.com/test"], 18) == (
        ["cutoff", "mid-url", "https://example.com/test"],
        False,
    )
    assert trim_parts([""], 10) == ([""], False)
    assert trim_parts(["no urls", "in this text"], 5) == (["no ur"], True)


def test_trim_parts_to_length():
    assert trim_parts_to_length([1, 2, 3], 3) == [1, 2]
    assert trim_parts_to_length([1, 2, 3], 4) == [1, 2, 1]
    assert trim_parts_to_length([5, 1, 1], 6) == [5, 1]
    assert trim_parts_to_length([5, 1, 1], 5) == [5]
    assert trim_parts_to_length([5, 1, 1], 7) == [5, 1, 1]
    assert trim_parts_to_length([1, 1, 1, 1, 1], 3) == [1, 1, 1]
    assert trim_parts_to_length([1, 1, 1, 1, 1], 0) == []
    assert trim_parts_to_length([1, 2, 3], 6) == [1, 2, 3]
    assert trim_parts_to_length([1, 2, 3], 1) == [1]
    assert trim_parts_to_length([3, 2, 1], 5) == [3, 2]


if __name__ == "__main__":
    sep_strs, trimmed = trim_str_with_urls_by_sep(
        "cutoff<SEP>here<SEP>https://example.com/test", 18, "<SEP>"
    )
