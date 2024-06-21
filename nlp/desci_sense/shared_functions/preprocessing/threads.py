from typing import List
from ..schema.post import QuoteRefPost, ThreadRefPost
from ..interface import AppThread, AppPost, Author

POST_SEPARATOR = "\n---\n"


def concat_post_content(posts: List[AppPost]) -> str:
    return POST_SEPARATOR.join([p.content for p in posts])


def create_thread_from_posts(posts: List[QuoteRefPost]):
    assert len(posts) > 0

    # gather all urls from thread posts
    all_ref_urls = []
    for post in posts:
        all_ref_urls += post.md_ref_urls()

    author = posts[0].author
    content = concat_post_content(posts)
    thread_post = ThreadRefPost(
        author=author,
        content=content,
        url=posts[0].url,
        source_network=posts[0].source_network,
        ref_urls=all_ref_urls,
        posts=posts,
    )
    return thread_post


def trim_thread(thread: ThreadRefPost, max_posts: int) -> ThreadRefPost:
    """
    Trims a thread to a specified maximum number of posts.

    This function takes a thread of posts and limits it to a specified maximum number of posts.
    It creates a new thread containing only the first `max_posts` from the original thread.

    Args:
        thread (ThreadRefPost): The original thread of posts to be trimmed.
        max_posts (int): The maximum number of posts to include in the trimmed thread.

    Returns:
        ThreadRefPost: A new thread containing only the first `max_posts` posts from the original thread.
    """
    included_posts = thread.posts[:max_posts]
    new_thread = create_thread_from_posts(included_posts)
    return new_thread
