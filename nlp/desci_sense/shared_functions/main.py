from typing import TypedDict, List
from enum import Enum

from loguru import logger

from .parsers.multi_chain_parser import MultiChainParser
from .init import init_multi_chain_parser_config
from .configs import OpenrouterAPIConfig
from .interface import ParserResult, ParsePostRequest


class SM_FUNCTION_post_parser_config(TypedDict, total=True):
    openrouter_api_base: str
    openrouter_api_key: str
    openrouter_referer: int
    ref_tagger_llm_type: str
    kw_llm_type: str
    topic_llm_type: str


def SM_FUNCTION_post_parser_imp(
    parserRequest: ParsePostRequest, parser_config: SM_FUNCTION_post_parser_config
) -> ParserResult:
    ref_tagger_llm_type = parser_config.pop("ref_tagger_llm_type")
    kw_llm_type = parser_config.pop("kw_llm_type")
    topic_llm_type = parser_config.pop("topic_llm_type")
    open_router_api_config = OpenrouterAPIConfig(**parser_config)
    multi_chain_parser_config = init_multi_chain_parser_config(
        open_router_api_config=open_router_api_config,
        ref_tagger_llm_type=ref_tagger_llm_type,
        kw_llm_type=kw_llm_type,
        topic_llm_type=topic_llm_type,
    )

    val_parser_request = ParsePostRequest.model_validate(parserRequest)

    parser = MultiChainParser(multi_chain_parser_config)
    logger.info(f"Parser config: {multi_chain_parser_config}")
    logger.info(f"Running parser on content: {val_parser_request}...")

    # TODO change this to handle post and not text
    result = parser.process_parse_request(
        val_parser_request,
        active_list=[  # using new multi reference tagger
            "keywords",
            "multi_refs_tagger",
            "topics",
            "hashtags",
        ],
    )

    logger.info(f"Parser run ended result: {result}...")

    return result
