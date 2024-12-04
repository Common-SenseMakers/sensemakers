import pytest
from typing import Optional, List
import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))
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





def test_truncation_behavior():
    config = KeywordPParserChainConfig(name="test_config", quoted_context_length=50)

    quoted_content = "This is a very long quoted post content that should be truncated to fit the context length."
    main_content = "Here is the main content with a quoted reference:"
    quoted_url = "https://example.com/quoted-post"

    post = MockQuoteRefPost(
        content=main_content, quoted_content=quoted_content, quoted_url=quoted_url
    )

    rendered_content = render_quote_post_content(
        post, quoted_context_length=config.quoted_context_length
    )

    # Expected content with the truncated quoted post
    expected_truncated_content = (
        f"Here is the main content with a quoted reference: <quoted ref_1>This is a very long quoted post content that shoul</quoted>"
    )

    assert (
        rendered_content == expected_truncated_content
    ), f"Truncation failed. Got: {rendered_content}"

if __name__ == "__main__":
    pytest.main([__file__])
