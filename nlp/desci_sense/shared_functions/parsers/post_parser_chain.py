from abc import ABC, abstractmethod
from typing import Dict
from loguru import logger
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

from ..schema.post import RefPost
from ..web_extractors.metadata_extractors import RefMetadata
from ..postprocessing import ParserChainOutput
from ..configs import (
    PostParserChainConfig,
    MultiParserChainConfig,
)
from ..schema.helpers import convert_text_to_ref_post
from ..schema.ontology_base import OntologyBase
from . import create_model


class PostParserChain(ABC):
    def __init__(
        self,
        parser_config: PostParserChainConfig,
        global_config: MultiParserChainConfig,
        ontology: OntologyBase,
    ):
        logger.info(f"Initializing parser chain '{parser_config.name}' ")
        self._parser_config = parser_config
        self._global_config = global_config
        self._ontology = ontology

        # create model from configs
        # join kw args in single dict
        kw_args = {
            **self.parser_config.llm_config.model_dump(),
            **self.global_config.openrouter_api_config.model_dump_all(),
        }
        self._model = create_model(**kw_args)

        # simple chat chain for debug purposes
        self._chat_chain = (
            PromptTemplate.from_template("{chat_input}")
            | self._model
            | StrOutputParser()
        )

    @abstractmethod
    def chain(self):
        pass

    @property
    def parser_config(self) -> PostParserChainConfig:
        return self._parser_config

    @property
    def global_config(self) -> MultiParserChainConfig:
        return self._global_config

    @property
    def model(self):
        return self._model

    @property
    def ontology(self) -> OntologyBase:
        return self._ontology

    @property
    def name(self) -> str:
        return self.parser_config.name

    @property
    def input_key(self) -> str:
        """
        Return the template for init of the chain's
        PromptTemplate.
        """
        return "{" + self.parser_config.name + "_input}"

    @property
    def input_name(self) -> str:
        return self.parser_config.name + "_input"

    def process_text(self, text: str) -> ParserChainOutput:
        post = convert_text_to_ref_post(text)
        return self.process_ref_post(post)

    @abstractmethod
    def process_ref_post(
        self,
        post: RefPost,
    ) -> ParserChainOutput:
        pass

    @abstractmethod
    def instantiate_prompt(
        self,
        post: RefPost,
        md_dict: Dict[str, RefMetadata],
    ) -> str:
        pass

    def chat(self, input: str) -> str:
        res = self._chat_chain.invoke({"chat_input": input})
        return res
