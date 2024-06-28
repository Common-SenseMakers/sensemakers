from loguru import logger

from ..schema.post import RefPost
from ..utils import extract_and_expand_urls

from ..utils import identify_social_media
from .twitter.twitter_utils import scrape_tweet
from .mastodon.mastodon_utils import scrape_mastodon_post


class PostScrapeError(Exception):
    """Exception raised when the post scraping fails,
    such as when the post is not found or has been deleted."""

    def __init__(self, post_url):
        self.post_url = post_url
        self.message = f"Post scraping failed, perhaps it has been deleted: {post_url}"
        super().__init__(self.message)


class UnknownSocialMediaTypeError(Exception):
    """Exception raised when the social media type is unknown."""

    def __init__(self, post_url, message="Unknown social media type"):
        self.post_url = post_url
        self.message = f"Unknown social media type: {post_url}"
        super().__init__(self.message)


def convert_text_to_ref_post(
    text: str, author: str = "default_author", source: str = "default_source"
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
        logger.error(f"Unknown post type: {post_url}")
        raise UnknownSocialMediaTypeError(post_url)

    if result is None:
        raise PostScrapeError(post_url)

    return result
