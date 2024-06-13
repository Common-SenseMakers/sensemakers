from .ref_post_renderer import RefPostRenderer, PostRenderer
from .quote_ref_post_renderer import QuoteRefPostRenderer
from ...configs import PostRendererType


def post_renderer_factory(post_renderer_type: PostRendererType) -> PostRenderer:
    if post_renderer_type == PostRendererType.REF_POST:
        return RefPostRenderer()
    elif post_renderer_type == PostRendererType.QUOTE_REF_POST:
        return QuoteRefPostRenderer()
    else:
        # unsupported type, raise exception
        raise ValueError(f"Unsupported PostRendererType: {post_renderer_type}")
