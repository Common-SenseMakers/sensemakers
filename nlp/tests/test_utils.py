import sys
import pytest
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

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


if __name__ == "__main__":
    pytest.main()
