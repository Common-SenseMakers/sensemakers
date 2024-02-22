from loguru import logger

from ..shared_functions.schema.post import RefPost
from ..shared_functions.utils import extract_and_expand_urls

from ..utils import identify_social_media
from .twitter.twitter_utils import scrape_tweet
from .mastodon.mastodon_utils import scrape_mastodon_post


def convert_text_to_ref_post(
    text: str, author: str = "deafult_author", source: str = "default_source"
) -> RefPost:
    """
    Converts raw text to a RefPost.
    """

    urls = extract_and_expand_urls(text)

    post = RefPost(
        author=author, content=text, url="", source_network=source, ref_urls=urls
    )

    return post


def scrape_post(post_url):
    """
    Scrape Twitter or Mastodon post
    """
    # check social media type
    social_type = identify_social_media(post_url)

    if social_type == "twitter":
        result = scrape_tweet(post_url)

    elif social_type == "mastodon":
        result = scrape_mastodon_post(post_url)

    else:
        logger.warn(f"Unknown post type: {post_url}")
        result = None

    return result
