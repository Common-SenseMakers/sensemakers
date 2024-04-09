from abc import ABC, abstractmethod
from typing import Dict
from loguru import logger
from langchain_openai import ChatOpenAI

from ..schema.post import RefPost
from ..web_extractors.metadata_extractors import RefMetadata
from ..postprocessing import ParserChainOutput
from ..runners.configs import (
    PostParserChainConfig,
    MultiParserChainConfig,
)
from ..schema.helpers import convert_text_to_ref_post
from ..schema.ontology_base import OntologyBase


def create_model(
    llm_type: str,
    temperature: float,
    api_base: str,
    api_key: str,
    referer: str = None,
):
    model = ChatOpenAI(
        model=llm_type,
        temperature=temperature,
        openai_api_key=api_key,
        openai_api_base=api_base,
    )
    return model
