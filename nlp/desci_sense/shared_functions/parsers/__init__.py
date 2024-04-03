from abc import ABC, abstractmethod
from typing import Dict

from ..schema.post import RefPost
from ..web_extractors.metadata_extractors import RefMetadata
from ..postprocessing import ParserChainOutput
from ..runners.configs import PostParserChainConfig, MultiParserChainConfig
from ..schema.helpers import convert_text_to_ref_post


class PostParserChain(ABC):
    def __init__(
        self,
        parser_config: PostParserChainConfig,
        global_config: MultiParserChainConfig,
    ):
        self._parser_config = parser_config
        self._global_config = global_config

    @abstractmethod
    def get_chain(self):
        pass

    @property
    def parser_config(self) -> PostParserChainConfig:
        return self._parser_config

    @property
    def global_config(self) -> MultiParserChainConfig:
        return self._global_config

    @property
    def input_name(self) -> str:
        """
        Return the template for init of the chain's
        PromptTemplate.
        """
        return "{" + self.parser_config.name + "}_input"

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
