# based on https://github.com/langchain-ai/langchain/blob/master/libs/langchain/langchain/schema/document.py

from __future__ import annotations

import asyncio
from abc import ABC, abstractmethod
from functools import partial
from typing import Any, Literal, Sequence, List, Optional
from datetime import datetime

from langchain.load.serializable import Serializable
from langchain.pydantic_v1 import Field

from ..utils import (
    remove_dups_ordered,
    extract_and_expand_urls,
    extract_external_urls_from_status_tweet,
)

from ..interface import (
    ThreadPostInterface,
    BasicPostInterface,
    SocialPlatformType,
)


class Post(Serializable):
    """Class for storing a piece of text and associated metadata."""

    author: str
    """Post author name."""
    content: str
    """String text."""
    url: str
    """URL of the post."""
    created_at: datetime = Field(default=None)
    """Publishing date for the post."""
    metadata: dict = Field(default_factory=dict)
    """
    Arbitrary metadata about the post content (e.g., source, relationships to other
        documents, etc.).
    """
    source_network: str = Field(default="unkown")
    """Social media network this post is sourced from (e.g., mastodon, twitter)."""
    type: Literal["Post"] = "Post"
    is_reply: bool = Field(default=False)
    """Is this post a reply to another post."""
    is_repost: bool = Field(default=False)
    """Is this post a repost (retweet) of another post."""

    @classmethod
    def is_lc_serializable(cls) -> bool:
        """Return whether this class is serializable."""
        return True


class RefPost(Post):
    """
    Post that contains a reference to at least one other URL external to the post.
    """

    ref_urls: List[str] = Field(default_factory=list)
    """
    List of URLs referenced by the post
    """

    quoted_url: Optional[str]
    """
    URL of post quoted by this post (for platforms that enable quote tweets)
    """

    type: Literal["ReferencePost"] = "ReferencePost"

    def has_refs(self):
        return len(self.md_ref_urls()) > 0

    def md_ref_urls(self) -> List[str]:
        """
        Return list of reference urls for metadata extraction
        ordered by place of appearance and uniqueified.
        """
        return remove_dups_ordered(self.ref_urls)

    @classmethod
    def from_basic_post_interface(
        cls,
        basic_post_interface: BasicPostInterface,
    ):
        # if source network is twitter, use twitter specific preprocessing
        if basic_post_interface.source_network == SocialPlatformType.TWITTER:
            ref_urls = extract_external_urls_from_status_tweet(
                basic_post_interface.url,
                basic_post_interface.content,
            )

        else:
            ref_urls = extract_and_expand_urls(basic_post_interface.content)

        return cls(
            author=basic_post_interface.author.name,
            url=basic_post_interface.url,
            content=basic_post_interface.content,
            ref_urls=ref_urls,
            source_network=basic_post_interface.author.platformId,
        )


class QuoteRefPost(RefPost):
    """
    RefPost that optionally quotes another post (like a quote tweet)
    """

    type: Literal["QuoteRefPost"] = "QuoteRefPost"

    quoted_post: Optional[RefPost]
    """
    Other post that is quoted by this post
    """

    @property
    def has_quote_post(self) -> bool:
        return self.quoted_post is not None

    def md_ref_urls(self, include_quoted_ref_urls: bool = True) -> List[str]:
        """
        Return list of reference urls for metadata extraction, ordered
        by place of appearance.
        If include_quoted_urls == True, include quoted_post.md_ref_urls()
        """
        all_ref_urls = self.ref_urls.copy()
        if self.has_quote_post:
            if include_quoted_ref_urls:
                all_ref_urls += self.quoted_post.md_ref_urls()

        # remove duplicate references
        all_ref_urls = remove_dups_ordered(all_ref_urls)

        return all_ref_urls


class ThreadRefPost(RefPost):
    """
    Thread of multiple posts linked together in a sequence
    """

    type: Literal["ThreadRefPost"] = "ThreadRefPost"

    posts: List[QuoteRefPost]
    """
    Posts included in this thread
    """

    def md_ref_urls(self, include_quoted_ref_urls: bool = True) -> List[str]:
        """
        Return list of reference urls for metadata extraction, ordered
        by place of appearance.
        If include_quoted_urls == True, include quoted_post.md_ref_urls()
        """
        all_ref_urls = []

        for post in self.posts:
            all_ref_urls += post.md_ref_urls(
                include_quoted_ref_urls=include_quoted_ref_urls
            )

        # remove duplicate references
        all_ref_urls = remove_dups_ordered(all_ref_urls)

        return all_ref_urls

    @classmethod
    def from_thread_post_interface(
        cls,
        thread_post_interface: ThreadPostInterface,
    ):
        pass
