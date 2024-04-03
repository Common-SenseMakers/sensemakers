from typing import Dict
from langchain.prompts import PromptTemplate

from . import PostParserChain
from ..runners.configs import KeywordPParserChainConfig, MultiParserChainConfig
from ..schema.post import RefPost
from ..web_extractors.metadata_extractors import RefMetadata
from ..postprocessing import ParserChainOutput


class KeywordPostParserChain(PostParserChain):
    def __init__(
        self,
        parser_config: KeywordPParserChainConfig,
        global_config: MultiParserChainConfig,
    ):
        super().__init__(parser_config, global_config)

        self.kw_prompt_template = PromptTemplate.from_template(self.input_name)

        # self._chain = self.kw_prompt_template
        #     | self.kw_model
        #     | KeywordParser(max_keywords=max_keywords)

    def get_chain(self):
        pass

    def process_ref_post(
        self,
        post: RefPost,
    ) -> ParserChainOutput:
        pass

    def instantiate_prompt(
        self,
        post: RefPost,
        md_dict: Dict[str, RefMetadata],
    ) -> str:
        pass
