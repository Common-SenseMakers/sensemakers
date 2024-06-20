from typing import List
from .helpers import render_metadata
from .ref_post_renderer import RefPostRenderer, PostRenderer
from .quote_ref_post_renderer import QuoteRefPostRenderer
from .thread_ref_post_renderer import ThreadRefPostRenderer
from ...configs import PostRendererType
from ...web_extractors.metadata_extractors import (
    RefMetadata,
)


def post_renderer_factory(post_renderer_type: PostRendererType) -> PostRenderer:
    if post_renderer_type == PostRendererType.REF_POST:
        return RefPostRenderer()
    elif post_renderer_type == PostRendererType.QUOTE_REF_POST:
        return QuoteRefPostRenderer()
    elif post_renderer_type == PostRendererType.THREAD_REF_POST:
        return ThreadRefPostRenderer()
    else:
        # unsupported type, raise exception
        raise ValueError(f"Unsupported PostRendererType: {post_renderer_type}")
