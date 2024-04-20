from typing import TypedDict, Any

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


def SM_FUNCTION_post_parser_imp(
    content, parameters, parser_config: SM_FUNCTION_post_parser_config
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
    result = parser.process_text(content)

    logger.info(f"Parser run ended result: {result}...")

    return result
