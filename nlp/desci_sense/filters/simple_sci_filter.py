from typing import List
from loguru import logger

from ..shared_functions.schema.post import RefPost
from ..shared_functions.web_extractors.citoid import fetch_citation


def filter_url_by_type(url: str, accepted_types: List[str]):
    cite_data = fetch_citation(url)
    logger.debug(f"cite data for {url}: {cite_data}")
    item_type = cite_data.get("itemType", None)
    if item_type in accepted_types:
        return True
    else:
        return False


class SimpleCitoidSciFilter:
    """
    Simple filter for detecting posts about scientific research based on the Citoid API (https://www.mediawiki.org/wiki/Citoid)
    """

    def __init__(self) -> None:
        pass

    @property
    def accepted_citoid_item_types(self):
        """
        list of types that we automatically pass, based on https://www.zotero.org/support/kb/item_types_and_fields
        """
        return [
            "bookSection",
            "journalArticle",
            "preprint",
            "book",
            "manuscript",
            "thesis",
            "presentation",
            "conferencePaper",
            "report",
            "videoRecording",
            "audioRecording",
            "blogPost",
            "podcast",
        ]

    def filter(self, post: RefPost) -> bool:
        """
        Return True if post passed filter, False o.w.
        """

        # if the post doesn't mention any references we filter it
        if not post.has_refs():
            return False

        # if it has references, we run citoid on each
        # TODO lots of optimizations here to make this work faster
        for url in post.ref_urls:
            # pass post as soon as we find one URL passing the filter
            if filter_url_by_type(url, self.accepted_citoid_item_types):
                return True

        return False

    def filter_posts(self, posts: List[RefPost]):
        passed = []
        for p in posts:
            res = self.filter(p)
            logger.debug(f"Post: {p} | passed filter: {res}")
            if res:
                passed.append(p)
        return passed
        # return [p for p in posts if self.filter(p)]
