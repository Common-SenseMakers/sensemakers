import sys
from pathlib import Path
from datetime import datetime, time

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

from desci_sense.shared_functions.schema.post import RefPost
from desci_sense.shared_functions.dataloaders.mastodon.mastodon_loader import (
    MastodonLoader,
)
from desci_sense.shared_functions.dataloaders.mastodon.mastodon_utils import (
    scrape_mastodon_post,
)


def test_timeline_loader():
    start_date = datetime(2024, 1, 20)
    end_date = datetime(2024, 2, 2)
    mloader = MastodonLoader()
    acct = "@ronent@mastodon.social"
    posts = mloader.load_profile_timeline(
        acct,
        max_toots=5,
        start_date=start_date,
        end_date=end_date,
    )
    assert len(posts) == 1
    assert set(posts[0].ref_urls) == set(
        [
            "https://twitter.com/deliprao/status/1750732070014337101",
            "https://arxiv.org/abs/2401.13782",
        ]
    )


def test_timeline_loader_2():
    start_date = datetime(2024, 1, 27)
    end_date = datetime(2024, 2, 2)
    mloader = MastodonLoader()
    acct = "@ronent@mastodon.social"
    posts = mloader.load_profile_timeline(
        acct,
        max_toots=5,
        start_date=start_date,
        end_date=end_date,
    )
    assert len(posts) == 0


def test_repost():
    start_date = datetime(2024, 3, 1)
    end_date = datetime(2024, 3, 15)
    mloader = MastodonLoader()
    acct = "@ronent@mastodon.social"
    posts = mloader.load_profile_timeline(
        acct,
        max_toots=10,
        start_date=start_date,
        end_date=end_date,
        exclude_reposts=False,
        exclude_replies=True,
    )
    assert all([post.is_repost for post in posts])
    assert len(posts) == 2


def test_reply_filter():
    start_date = datetime(2024, 1, 1)
    end_date = datetime(2024, 1, 4)
    mloader = MastodonLoader()
    acct = "@ronent@mastodon.social"
    posts = mloader.load_profile_timeline(
        acct,
        max_toots=30,
        start_date=start_date,
        end_date=end_date,
        exclude_reposts=False,
        exclude_replies=True,
    )
    assert len(posts) == 1
    assert posts[0].url == "https://mastodon.social/@ronent/111687038322549430"
    
def test_pagination():
    # user has lots of posts so pagination needed to fetch them all
    start_date = datetime(2024, 3, 1)
    end_date = datetime(2024, 3, 10)
    mloader = MastodonLoader()
    acct = "@cwebber@octodon.social"
    posts = mloader.load_profile_timeline(
        acct,
        max_toots=30,
        start_date=start_date,
        end_date=end_date,
        exclude_replies=True,
        exclude_reposts=True,
    )
    assert len(posts) > 0


if __name__ == "__main__":
    start_date = datetime(2024, 3, 1)
    end_date = datetime(2024, 3, 10)
    mloader = MastodonLoader()
    acct = "@cwebber@octodon.social"
    posts = mloader.load_profile_timeline(
        acct,
        max_toots=30,
        start_date=start_date,
        end_date=end_date,
        exclude_replies=True,
        exclude_reposts=True,
    )
