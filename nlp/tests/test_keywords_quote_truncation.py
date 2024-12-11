import pytest
from typing import Optional, List
import sys
from pathlib import Path
import logging

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))
from desci_sense.shared_functions.dataloaders import scrape_post

from desci_sense.shared_functions.parsers.keyword_pparser import KeywordPostParserChain
from desci_sense.shared_functions.configs import (
    KeywordPParserChainConfig,
    MultiParserChainConfig,
)
from desci_sense.shared_functions.schema.post import QuoteRefPost
from desci_sense.shared_functions.prompting.post_renderers.quote_ref_post_renderer import render_quote_post_content


# Mock the QuoteRefPost object to simulate its behavior
class MockQuoteRefPost:
    def __init__(self, content, quoted_content, quoted_url):
        self.content = content
        self.quoted_post = MockQuotedPost(quoted_content)
        self.quoted_url = quoted_url

    def md_ref_urls(self) -> List[str]:
        return [self.quoted_url]

    @property
    def has_quote_post(self) -> bool:
        return self.quoted_post is not None


class MockQuotedPost:
    def __init__(self, content):
        self.content = content


POST = "https://x.com/ShaRefOh/status/1860883351592190304"


def test_truncation_behavior(caplog):
    caplog.set_level(logging.INFO)
    logger = logging.getLogger(__name__)

    config = KeywordPParserChainConfig(name="test_config", quoted_context_length=50)

    quoted_content = "This is a very long quoted post content that should be truncated to fit the context length."
    main_content = "Here is the main content with a quoted reference:"
    quoted_url = "https://example.com/quoted-post"

    """post = MockQuoteRefPost(
        content=main_content, quoted_content=quoted_content, quoted_url=quoted_url
    )"""
    post = scrape_post(POST)
    logger.info(f"Metadata{post.metadata}")
    logger.info(f"Content: {post.content}")
    logger.info(f"Quoted Content: {post.quoted_post.content}")
    logger.info(f"Quoted Context Length: {config.quoted_context_length}")
    rendered_content = render_quote_post_content(
        post, quoted_context_length=config.quoted_context_length
    )
    logger.info(f"Rendered Content: {rendered_content}")


    # Expected content with the truncated quoted post
    expected_truncated_content = (
        f"Wow, two weeks of working together IRL in SF area were not only fun but as efficient as a month working remotely. <quoted ref_1>We'll be presenting Sensemaking Networks next week</quote>"
    )

    assert (
        rendered_content == expected_truncated_content
    ), f"Truncation failed. Got: {rendered_content}"

    # Test with quoted_context_length set to None
    config = KeywordPParserChainConfig(name="test_config")

    rendered_content = render_quote_post_content(
        post, quoted_context_length=config.quoted_context_length
    )

    # Expected content without truncation
    expected_full_content = (
        f"Wow, two weeks of working together IRL in SF area were not only fun but as efficient as a month working remotely. <quoted ref_1>We'll be presenting Sensemaking Networks next week in Berkeley! Come say hi if you're around and interested in how we can transform science social media into an AI-augmented collective intelligence tool for researchers!</quote>"
    )

    assert (
        rendered_content == expected_full_content
    ), f"Non-truncated rendering failed. Got: {rendered_content}"

if __name__ == "__main__":
    pytest.main([__file__])
