from typing import TypedDict, List
from enum import Enum

from loguru import logger

from .parsers.multi_chain_parser import MultiChainParser
from .init import init_multi_chain_parser_config
from .configs import OpenrouterAPIConfig
from .interface import ParserResult


class SM_FUNCTION_post_parser_config(TypedDict, total=True):
    openrouter_api_base: str
    openrouter_api_key: str
    openrouter_referer: int
    llm_type: str

class PLATFORM(Enum):
    Local = 'local'  # local refers to our platform
    Orcid = 'orcid'
    Twitter = 'twitter'
    Nanopub = 'nanopub'

class GenericAuthor(TypedDict):
    platformId: PLATFORM
    id: str
    username: str
    name: str

class GenericPost(TypedDict, total=False):  # total=False makes all keys optional
    url: str
    content: str
    quotedThread: 'GenericThread'  # Use forward reference with a string

class GenericThread(TypedDict, total=False):
    url: str
    thread: List[GenericPost]
    author: GenericAuthor


def SM_FUNCTION_post_parser_imp(
    parserRequest: SM_FUNCTION_post_parser_post_input, parameters, parser_config: SM_FUNCTION_post_parser_config
) -> ParserResult:
    llm_type = parser_config.pop("llm_type")
    open_router_api_config = OpenrouterAPIConfig(**parser_config)
    multi_chain_parser_config = init_multi_chain_parser_config(
        open_router_api_config=open_router_api_config,
        llm_type=llm_type,
    )

    parser = MultiChainParser(multi_chain_parser_config)

    logger.info(f"Running parser on content: {content}...")

    # TODO change this to handle post and not text
    result = parser.process_text(
        content,
        active_list=[  # using new multi reference tagger
            "keywords",
            "multi_refs_tagger",
            "topics",
            "hashtags",
        ],
    )

    logger.info(f"Parser run ended result: {result}...")

    return result
