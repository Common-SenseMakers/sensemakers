from typing import List, Optional
from .post_renderer import PostRenderer
from . import render_metadata
from .quote_ref_post_renderer import render_quote_post_content
from ...web_extractors.metadata_extractors import (
    RefMetadata,
)
from ...schema.post import RefPost, QuoteRefPost, ThreadRefPost
from .templates.quote_ref_post_template import quote_ref_post_template

ZERO_REF_INSTRUCTIONS = """"""

SINGLE_REF_INSTRUCTIONS = """## Reference metadata
The reference will be marked by a special token <ref_1> for convenient identification."""

MULTI_REF_INSTRUCTIONS = """## Reference metadata
Each reference will be marked by <ref_n> for convenient identification, where n is a number denoting the order of appearance in the post. The first reference will be <ref_1>, the second <ref_2>, etc. Additional metadata may also be provided for references, such as the author name, content type, and summary.

### Quote posts
Quote posts are a special kind of reference, where the post quotes another post. In which case, the quoted post content will be enclosed by <quote ref_n> (quote content) </quote>. Note that quote content may itself contain references.
"""


def render_thread_content(
    thread: ThreadRefPost,
) -> str:
    thread_posts = thread.posts
    ordered_refs = thread.md_ref_urls()

    rendered = []
    for quote_post in thread_posts:
        rendered.append(
            render_quote_post_content(quote_post, ordered_refs=ordered_refs)
        )

    # add line breaks
    rendered_str = "\n---\n".join(rendered)

    return rendered_str


class ThreadRefPostRenderer(PostRenderer):
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
        thread: ThreadRefPost,
        metadata_list: List[RefMetadata],
        show_author: bool = True,
    ) -> str:
        if show_author:
            author_name = thread.author
        else:
            author_name = None

        ordered_refs = thread.md_ref_urls()

        # create mapping by url -> metadata
        md_dict = {md.url: md for md in metadata_list}

        processed_content = render_thread_content(thread)

        # render metadata
        rendered_metadata = None
        ordered_md_list = []
        for url in ordered_refs:
            ordered_md_list.append(md_dict.get(url))

        rendered_metadata = render_metadata(ordered_md_list)

        rendered_post = self._j2_template.render(
            author_name=author_name,
            content=processed_content,
            rendered_metadata=rendered_metadata,
        )

        return rendered_post
