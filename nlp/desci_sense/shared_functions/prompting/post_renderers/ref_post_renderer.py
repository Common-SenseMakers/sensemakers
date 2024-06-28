from typing import List
from .post_renderer import PostRenderer
from ...web_extractors.metadata_extractors import (
    RefMetadata,
)
from ...schema.post import RefPost
from .templates.ref_post_template import ref_post_template

ZERO_REF_INSTRUCTIONS = """"""

SINGLE_REF_INSTRUCTIONS = """## Reference metadata
Details about the external reference will be provided alongside the input post under "References"."""

MULTI_REF_INSTRUCTIONS = """## Reference metadata
Each reference will be marked by a number for convenient identification, in order of appearance in the post. The first reference will be number 1, the second 2, etc. Additional metadata may also be provided for references.
"""


class RefPostRenderer(PostRenderer):
    def __init__(self):
        self._j2_template = ref_post_template

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
        post: RefPost,
        metadata_list: List[RefMetadata],
        show_author: bool = True,
    ) -> str:
        if show_author:
            author_name = post.author
        else:
            author_name = None
        rendered_post = self._j2_template.render(
            author_name=author_name,
            content=post.content,
            references_metadata=metadata_list,
        )

        return rendered_post
