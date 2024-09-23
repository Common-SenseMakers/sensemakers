from typing import Optional, List, Dict, TypedDict, Union, Any
from loguru import logger

# important to use this and not pydantic BaseModel https://medium.com/codex/migrating-to-pydantic-v2-5a4b864621c3
from langchain.pydantic_v1 import Field, BaseModel

from ..interface import (
    ParsePostRequest,
    AppThread,
    PlatformType,
    AppPost,
    Author,
    MAX_CHARS_PER_POST,
    MAX_POSTS_PER_REQUEST,
)
from ..schema.post import ThreadRefPost, RefPost, QuoteRefPost
from ..utils import (
    remove_dups_ordered,
    find_last_occurence_of_any,
    extract_and_expand_urls,
    extract_external_urls_from_status_tweet,
    trim_parts,
    trim_parts_to_length,
    trim_str_with_urls,
)
from .threads import (
    concat_post_content,
    trim_thread,
    create_thread_from_posts,
)


# class StreamlitParseRequest(BaseModel):
#     """
#     Format of request made by streamlit demo to parser.
#     """

#     post: QuoteRefPost


def convert_app_post_to_ref_post(
    app_post: AppPost,
    author: Author,
) -> RefPost:
    """_summary_

    Args:
        app_post (AppPost): _description_
        source_network (SocialPlatformType): _description_

    Returns:
        RefPost: _description_
    """
    source_network = author.platformId

    # if source network is twitter, use twitter specific preprocessing
    if source_network == PlatformType.TWITTER:
        ref_urls = extract_external_urls_from_status_tweet(
            app_post.url,
            app_post.content,
        )

    else:
        ref_urls = extract_and_expand_urls(app_post.content)

    return RefPost(
        author=author.name,
        url=app_post.url,
        content=app_post.content,
        ref_urls=ref_urls,
        source_network=source_network,
    )


def convert_app_post_to_quote_ref_post(
    app_post: AppPost,
    author: Author,
) -> QuoteRefPost:
    """_summary_

    Args:
        app_post (AppPost): _description_

    Returns:
        QuoteRefPost: _description_
    """
    ref_post = convert_app_post_to_ref_post(app_post, author)

    quoted_post = None
    quoted_url = None
    content = ref_post.content

    # handle case where post has quoted thread
    if app_post.quotedThread:
        quoted_thread = app_post.quotedThread.thread
        quoted_author = app_post.quotedThread.author
        assert len(quoted_thread) > 0

        # currently we only take first post and ignore the rest
        quoted_post = convert_app_post_to_ref_post(
            quoted_thread[0],
            quoted_author,
        )
        quoted_url = quoted_post.url

        # add quoted post url to end of quoting post content + ref_urls
        if quoted_url not in content:
            content = ref_post.content + " " + quoted_url

        if quoted_url not in ref_post.ref_urls:
            ref_post.ref_urls.append(quoted_url)

    quote_ref_post = QuoteRefPost(
        author=ref_post.author,
        url=ref_post.url,
        ref_urls=ref_post.ref_urls,
        content=content,
        source_network=ref_post.source_network,
        quoted_post=quoted_post,
        quoted_url=quoted_url,
    )

    return quote_ref_post


def convert_thread_interface_to_ref_post(
    thread_interface: AppThread,
) -> ThreadRefPost:
    """_summary_

    Args:
        thread_interface (ThreadPostInterface): _description_

    Returns:
        ThreadRefPost: _description_
    """
    assert len(thread_interface.thread) > 0

    posts = []
    for post in thread_interface.thread:
        quote_ref_post = convert_app_post_to_quote_ref_post(
            post, thread_interface.author
        )
        posts.append(quote_ref_post)

    thread_ref_post = create_thread_from_posts(posts)

    return thread_ref_post


def trim_post_by_length(quote_ref_post: QuoteRefPost, max_chars: int) -> QuoteRefPost:
    """
    Trims post to max chars length. Both post content and
    quoted post content count towards limit. Post content is prioritized
    and only then quoted post content.

    Args:
        quote_ref_post (QuoteRefPost): _description_
        max_chars (int): _description_

    Returns:
        QuoteRefPost: _description_
    """
    trimmed_post_content = trim_str_with_urls(
        quote_ref_post.content,
        max_chars,
    )
    remaining_length = max_chars - len(trimmed_post_content)

    new_ref_urls = extract_and_expand_urls(trimmed_post_content)

    trimmed_quote_ref_post = quote_ref_post.copy(deep=True)
    trimmed_quote_ref_post.content = trimmed_post_content
    trimmed_quote_ref_post.ref_urls = new_ref_urls

    # if there is still remaining_length, take quoted post content
    if quote_ref_post.quoted_post:
        trimmed_quoted_content = trim_str_with_urls(
            quote_ref_post.quoted_post.content,
            remaining_length,
        )
        new_quoted_urls = extract_and_expand_urls(trimmed_quoted_content)
        trimmed_quote_ref_post.quoted_post.content = trimmed_quoted_content
        trimmed_quote_ref_post.quoted_post.ref_urls = new_quoted_urls

    return trimmed_quote_ref_post


def trim_thread_by_length(thread: ThreadRefPost, max_chars: int) -> ThreadRefPost:
    """
    Trim thread to max chars by removing posts from the end
    and possibly part of the last post

    Returns:
        ThreadRefPost: _description_
    """
    if thread.char_length() <= max_chars:
        return thread

    # trim thread
    thread_part_lengths = [p.char_length() for p in thread.posts]
    trimmed_part_lengths = trim_parts_to_length(thread_part_lengths, max_chars)
    is_trimmed = trimmed_part_lengths != thread_part_lengths
    assert is_trimmed  # should have returned above if not

    assert len(trimmed_part_lengths) <= len(thread_part_lengths)

    trimmed_index = len(trimmed_part_lengths) - 1
    last_trimmed_part_length = trimmed_part_lengths[trimmed_index]
    post_to_trim = thread.posts[trimmed_index]

    trimmed_quote_ref_post = trim_post_by_length(
        post_to_trim,
        last_trimmed_part_length,
    )

    # trim extra posts
    trimmed_thread = trim_thread(thread, max_posts=len(trimmed_part_lengths))

    # replace last post with trimmed post
    trimmed_thread.posts[trimmed_index] = trimmed_quote_ref_post

    warn_msg = f"""Max length of {max_chars} exceeded! Trimmed thread 
    from {thread.char_length()} to {trimmed_thread.char_length()}"""
    logger.warning(warn_msg)

    return trimmed_thread


class ParserInput(BaseModel):
    """
    ThreadRefPost does not include validation
    """
    class Config:
        arbitrary_types_allowed = True

    """
    Format of input for processing by parser.
    """

    thread_post: ThreadRefPost = Field(description="Target thread to parse")
    max_posts: Optional[int] = Field(
        description="Maximum number of posts in the thread to process.",
        default=MAX_POSTS_PER_REQUEST,
    )

    @property
    def max_chars(self) -> int:
        """
        Returns maximum number of chars to process. Note that actual posts
        might be longer than `MAX_CHARS_PER_POST` depending on the platform,
        eg Mastodon (500) and Twitter Premium (25k)
        """
        return self.max_posts * MAX_CHARS_PER_POST


def convert_parse_request_to_parser_input(
    parse_request: ParsePostRequest,
) -> ParserInput:
    """_summary_

    Args:
        parse_request (ParsePostRequest): _description_

    Returns:
        ParserInput: _description_
    """
    thread = convert_thread_interface_to_ref_post(parse_request.post)
    parser_input = ParserInput(
        thread_post=thread,
        max_posts=MAX_POSTS_PER_REQUEST,
    )
    return parser_input


class PreprocParserInput(BaseModel):
    """
     ThreadRefPost does not include validation
    """
    class Config:
        arbitrary_types_allowed = True
    
    post_to_parse: ThreadRefPost = Field(
        description="Post in input format for parser after preprocessing"
    )
    unparsed_urls: List[str] = Field(
        description="URLs that will not be parsed (eg exceeded thread length limit)"
    )


def preproc_parser_input(parser_input: ParserInput) -> PreprocParserInput:
    """_summary_

    Args:
        parser_input (ParserInput): _description_

    Returns:
        PreprocParserInput: _description_
    """
    orig_thread = parser_input.thread_post
    new_thread = trim_thread_by_length(orig_thread, parser_input.max_chars)
    included_urls = new_thread.md_ref_urls()

    # get reference urls from trimmed posts
    excluded_urls = []
    num_posts_after_trim = len(new_thread.posts)

    # (num_posts_after_trim - 1) to handle urls possibly trimmed from trimmed post
    excluded_posts = orig_thread.posts[(num_posts_after_trim - 1) :]
    for p in excluded_posts:
        potential_excluded_urls = p.md_ref_urls()
        excluded_urls += [
            url for url in potential_excluded_urls if url not in included_urls
        ]

    # remove dups
    excluded_urls = remove_dups_ordered(excluded_urls)

    assert set(included_urls + excluded_urls) == set(orig_thread.md_ref_urls())

    preprocessed_input = PreprocParserInput(
        post_to_parse=new_thread,
        unparsed_urls=excluded_urls,
    )

    return preprocessed_input
