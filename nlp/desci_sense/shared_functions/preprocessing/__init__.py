from typing import Optional, List, Dict, TypedDict, Union, Any

# important to use this and not pydantic BaseModel https://medium.com/codex/migrating-to-pydantic-v2-5a4b864621c3
from langchain.pydantic_v1 import Field, BaseModel

from ..interface import ParsePostRequest, ThreadInterface
from ..schema.post import ThreadRefPost, RefPost, QuoteRefPost
from ..utils import (
    remove_dups_ordered,
    find_last_occurence_of_any,
    extract_and_expand_urls,
    extract_external_urls_from_status_tweet,
)
from .threads import create_thread_from_posts, trim_thread


# class StreamlitParseRequest(BaseModel):
#     """
#     Format of request made by streamlit demo to parser.
#     """

#     post: QuoteRefPost


class ParserInput(BaseModel):
    """
    Format of input for processing by parser.
    """

    thread_post: ThreadRefPost = Field(description="Target thread to parse")
    max_posts: Optional[int] = Field(
        description="Maximum number of posts in the thread to process.",
        default=10,
    )


# def convert_st_request_to_parser_input(
#     st_request: StreamlitParseRequest,
# ) -> ParserInput:
#     """
#     Convert StreamlitParseRequest to ParserInput
#     """
#     thread = create_thread_from_posts([st_request.post])
#     return thread


def convert_thread_interface_to_ref_post(
    thread_interface: ThreadInterface,
) -> ThreadRefPost:
    """_summary_

    Args:
        thread_interface (ThreadPostInterface): _description_

    Returns:
        ThreadRefPost: _description_
    """

    thread_posts_content = thread_interface.content.split("\n---\n")

    # create dict of quote posts keyed by url
    converted_quoted_posts = [
        RefPost.from_basic_post_interface(post) for post in thread_interface.quotedPosts
    ]
    quote_post_dict = {p.url: p for p in converted_quoted_posts}

    # for collecting all ref urls in thread
    all_ref_urls = []

    # create QuoteRefPosts from each post in thread
    quote_ref_posts = []

    for post_content in thread_posts_content:
        quoted_post_url = find_last_occurence_of_any(
            post_content, quote_post_dict.keys()
        )
        quoted_post = quote_post_dict.get(quoted_post_url, None)

        # TODO should be replaced with tweet url when we have it!
        url = thread_interface.url

        ref_urls = extract_external_urls_from_status_tweet(url, post_content)

        quote_ref_post = QuoteRefPost(
            author=thread_interface.author.name,
            url=url,
            content=post_content,
            ref_urls=ref_urls,
            quoted_post=quoted_post,
        )
        quote_ref_posts.append(quote_ref_post)

        all_ref_urls += ref_urls

    thread_ref_post = ThreadRefPost(
        author=thread_interface.author.name,
        url=thread_interface.url,
        content=thread_interface.content,
        source_network=thread_interface.author.platformId,
        ref_urls=all_ref_urls,
        posts=quote_ref_posts,
    )
    return thread_ref_post


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

    preprocessed_input = PreprocParserInput(
        post_to_parse=new_thread,
        unparsed_urls=excluded_urls,
    )

    return preprocessed_input


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
