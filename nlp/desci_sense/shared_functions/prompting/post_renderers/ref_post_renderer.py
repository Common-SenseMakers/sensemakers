from typing import List
from .post_renderer import PostRenderer
from ...web_extractors.metadata_extractors import (
    RefMetadata,
)
from ...schema.post import RefPost
from .templates.ref_post_template import ref_post_template


class RefPostRenderer(PostRenderer):
    def __init__(self):
        self._j2_template = ref_post_template

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
