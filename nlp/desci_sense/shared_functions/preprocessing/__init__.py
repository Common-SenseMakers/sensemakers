from typing import Optional, List, Dict, TypedDict, Union, Any

# important to use this and not pydantic BaseModel https://medium.com/codex/migrating-to-pydantic-v2-5a4b864621c3
from langchain.pydantic_v1 import Field, BaseModel

from ..interface import (
    ParsePostRequest,
    AppThread,
    SocialPlatformType,
    AppPost,
    Author,
    MAX_CHARS_PER_POST,
)
from ..schema.post import ThreadRefPost, RefPost, QuoteRefPost
from ..utils import (
    remove_dups_ordered,
    find_last_occurence_of_any,
    extract_and_expand_urls,
    extract_external_urls_from_status_tweet,
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
    if source_network == SocialPlatformType.TWITTER:
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


class ParserInput(BaseModel):
    """
    Format of input for processing by parser.
    """

    thread_post: ThreadRefPost = Field(description="Target thread to parse")
    max_posts: Optional[int] = Field(
        description="Maximum number of posts in the thread to process.",
        default=10,
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
    parser_input = ParserInput(thread_post=thread)
    return parser_input


# def convert_st_request_to_parser_input(
#     st_request: StreamlitParseRequest,
# ) -> ParserInput:
#     """
#     Convert StreamlitParseRequest to ParserInput
#     """
#     thread = create_thread_from_posts([st_request.post])
#     return thread


# def convert_thread_interface_to_ref_post(
#     thread_interface: AppThread,
# ) -> ThreadRefPost:
#     """_summary_

#     Args:
#         thread_interface (ThreadPostInterface): _description_

#     Returns:
#         ThreadRefPost: _description_
#     """

#     thread_posts_content = thread_interface.content.split("\n---\n")

#     # create dict of quote posts keyed by url
#     converted_quoted_posts = [
#         RefPost.from_basic_post_interface(post) for post in thread_interface.quotedPosts
#     ]
#     quote_post_dict = {p.url: p for p in converted_quoted_posts}

#     # for collecting all ref urls in thread
#     all_ref_urls = []

#     # create QuoteRefPosts from each post in thread
#     quote_ref_posts = []

#     for post_content in thread_posts_content:
#         quoted_post_url = find_last_occurence_of_any(
#             post_content, quote_post_dict.keys()
#         )
#         quoted_post = quote_post_dict.get(quoted_post_url, None)

#         # TODO should be replaced with tweet url when we have it!
#         url = thread_interface.url

#         ref_urls = extract_external_urls_from_status_tweet(url, post_content)

#         quote_ref_post = QuoteRefPost(
#             author=thread_interface.author.name,
#             url=url,
#             content=post_content,
#             ref_urls=ref_urls,
#             quoted_post=quoted_post,
#         )
#         quote_ref_posts.append(quote_ref_post)

#         all_ref_urls += ref_urls

#     thread_ref_post = ThreadRefPost(
#         author=thread_interface.author.name,
#         url=thread_interface.url,
#         content=thread_interface.content,
#         source_network=thread_interface.author.platformId,
#         ref_urls=all_ref_urls,
#         posts=quote_ref_posts,
#     )
#     return thread_ref_post


class PreprocParserInput(BaseModel):
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
    new_thread = trim_thread(orig_thread, parser_input.max_posts)

    # get reference urls from trimmed posts
    excluded_urls = []
    excluded_posts = orig_thread.posts[parser_input.max_posts :]
    for p in excluded_posts:
        excluded_urls += p.md_ref_urls()

    # remove dups
    excluded_urls = remove_dups_ordered(excluded_urls)

    preprocessed_input = PreprocParserInput(
        post_to_parse=new_thread,
        unparsed_urls=excluded_urls,
    )

    return preprocessed_input


# def validate_parser_input(parser_input: ParserInput) -> ParserInput:
#     orig_thread = parser_input.thread_post


# def preproc_parse_post_request(
#     parse_request: ParsePostRequest,
#     max_posts: int = 10,
# ) -> PreprocParsePostRequest:
#     """
#     Prepare an app post request for input to the parser.
#     Includes trimming long threads while preserving all reference urls.

#     Args:
#         parse_request (ParsePostRequest): input request from app
#         max_posts (int): max number of posts in thread to parse

#     Returns:
#         PreprocParsePostRequest: Prepared input for parser
#     """

# trim thread to `max_post` length
