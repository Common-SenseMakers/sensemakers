from typing import List, Optional
from .post_renderer import PostRenderer
from . import render_metadata
from ...web_extractors.metadata_extractors import (
    RefMetadata,
)
from ...schema.post import RefPost, QuoteRefPost
from .templates.quote_ref_post_template import quote_ref_post_template

ZERO_REF_INSTRUCTIONS = """"""

SINGLE_REF_INSTRUCTIONS = """## Reference metadata
The reference will be marked by a special token <ref_1> for convenient identification."""

MULTI_REF_INSTRUCTIONS = """## Reference metadata
Each reference will be marked by <ref_n> for convenient identification, where n is a number denoting the order of appearance in the post. The first reference will be <ref_1>, the second <ref_2>, etc. Additional metadata may also be provided for references, such as the author name, content type, and summary.

### Quote posts
Quote posts are a special kind of reference, where the post quotes another post. In which case, the quoted post content will be enclosed by <quote ref_n> (quote content) </quote>. Note that quote content may itself contain references.
"""


def render_quote_post_content(
    post: QuoteRefPost,
    ordered_refs: Optional[List[str]] = None,
    quoted_context_length: int = None,
) -> str:
    """_summary_

    Args:
        post (QuoteRefPost): _description_
        ordered_urls (Optional[List[str]]): _description_
        quoted_context_length : length to append quoted post as context

    Returns:
        str: _description_
    """

    refs_to_process = post.md_ref_urls()

    if not ordered_refs:
        # if no external ordering provided, use post ref ordering by defualt
        ordered_refs = post.md_ref_urls()

    processed_content = post.content

    if post.quoted_url and post.quoted_url in ordered_refs:
        # add quoted post url to end of quote post content if not present there
        if post.quoted_url not in processed_content:
            processed_content += f" {post.quoted_url}"

        # if quoted post content available, add it
        if post.has_quote_post:
            quoted_post = post.quoted_post

            # get order of appearance for quoted post url (1-indexed)
            quoted_url_idx = ordered_refs.index(post.quoted_url) + 1

            # Truncate the quoted content first
            truncated_content = quoted_post.content[:quoted_context_length]
            # Add enclosing tags after truncation
            rendered_quoted_post = (
                f"<quoted ref_{quoted_url_idx}>{truncated_content}</quote>"
            )

            # replace quoted post url with rendered version truncated to a certain length
            processed_content = processed_content.replace(
                post.quoted_url, rendered_quoted_post
            )
            # remove quoted post url from list to process
            refs_to_process.remove(post.quoted_url)

    # replace other urls with <ref> tokens
    for url in refs_to_process:
        # 1-indexed
        url_idx = ordered_refs.index(url) + 1

        ref_token = f"<ref_{url_idx}>"
        processed_content = processed_content.replace(url, ref_token)

    return processed_content


class QuoteRefPostRenderer(PostRenderer):
    def __init__(self):
        self._j2_template = quote_ref_post_template

    def render_instructions(self, post: RefPost) -> str:
        """

        Returns:
            str: Instructions section for prompt
        """
        num_urls = len(post.md_ref_urls())
        if num_urls == 0:
            return ZERO_REF_INSTRUCTIONS
        elif num_urls == 1:
            return SINGLE_REF_INSTRUCTIONS
        else:
            return MULTI_REF_INSTRUCTIONS

    def render(
        self,
        post: QuoteRefPost,
        metadata_list: List[RefMetadata],
        show_author: bool = True,
        quoted_context_length: int = None,
    ) -> str:
        if show_author:
            author_name = post.author
        else:
            author_name = None

        ordered_refs = post.md_ref_urls()

        # create mapping by url -> metadata
        md_dict = {md.url: md for md in metadata_list}

        rendered_content = render_quote_post_content(
            post,
            quoted_context_length=quoted_context_length,
        )

        # render metadata
        rendered_metadata = None

        ordered_md_list = []
        for url in ordered_refs:
            ordered_md_list.append(md_dict.get(url))

        rendered_metadata = render_metadata(ordered_md_list)

        rendered_post = self._j2_template.render(
            author_name=author_name,
            content=rendered_content,
            rendered_metadata=rendered_metadata,
        )

        return rendered_post
