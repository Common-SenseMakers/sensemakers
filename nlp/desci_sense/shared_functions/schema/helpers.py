from .post import RefPost
from ..utils import extract_and_expand_urls


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
