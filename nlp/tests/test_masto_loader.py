import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

from langchain.document_loaders import MastodonTootsLoader


from desci_sense.shared_functions.schema.post import RefPost
from desci_sense.shared_functions.dataloaders.mastodon.mastodon_loader import (
    MastodonLoader,
)
from desci_sense.shared_functions.dataloaders.mastodon.mastodon_utils import (
    scrape_mastodon_post,
)


def test_dup_url_i38():
    post_url = "https://mastodon.social/@ronent/111409960080649156"
    post = scrape_mastodon_post(post_url)
    assert post.ref_urls == ["https://csensemakers.com/"]


def test_loader():
    mloader = MastodonLoader()
    accts = ["@ronent@mastodon.social"]
    posts = mloader.load_profiles(
        mastodon_accounts=accts,
        number_toots=5,
        exclude_replies=False,
        exclude_reposts=False,
    )
    assert len(posts) == 5


def test_reply():
    post_url = "https://mastodon.social/@ronent/111409960080649156"
    post = scrape_mastodon_post(post_url)
    assert post.is_reply


def test_not_reply():
    post_url = "https://mastodon.social/@UlrikeHahn@fediscience.org/111732713776994953"
    post = scrape_mastodon_post(post_url)
    assert not post.is_reply


if __name__ == "__main__":
    post_url = "https://mastodon.social/@ronent/111687038322549430"
    post = scrape_mastodon_post(post_url)

    # langchain_loader = MastodonTootsLoader(
    # mastodon_accounts=accts,
    # number_toots=5,  # Default value is 100
    # )

    # documents = langchain_loader.load()
