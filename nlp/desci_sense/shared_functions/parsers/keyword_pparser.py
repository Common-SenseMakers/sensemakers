from typing import Dict
from langchain.prompts import PromptTemplate
from langchain_core.runnables import RunnableLambda

from .post_parser_chain import PostParserChain
from ..configs import KeywordPParserChainConfig, MultiParserChainConfig
from ..schema.post import RefPost
from ..web_extractors.metadata_extractors import (
    RefMetadata,
    get_refs_metadata_portion,
    get_ref_post_metadata_list,
)
from ..postprocessing import ParserChainOutput
from ..postprocessing.output_processors import KeywordParser
from ..schema.ontology_base import OntologyBase
from ..prompting.jinja.keywords_extraction_template import keywords_extraction_template
from ..configs import ParserChainType


def return_fallback(input):
    return ParserChainOutput(
        answer=[],
        pparser_type=ParserChainType.KEYWORDS,
        extra={"errors": "fallback"},
    )


class KeywordPostParserChain(PostParserChain):
    def __init__(
        self,
        parser_config: KeywordPParserChainConfig,
        global_config: MultiParserChainConfig,
        ontology: OntologyBase,
    ):
        super().__init__(parser_config, global_config, ontology)

        self.input_template = PromptTemplate.from_template(self.input_key)
        self.runnable_fallback = RunnableLambda(return_fallback)

        self.prompt_template = keywords_extraction_template

        self._chain = (
            self.input_template
            | self.model
            | KeywordParser(max_keywords=parser_config.max_keywords)
        )

    @property
    def chain(self):
        return self._chain.with_retry(stop_after_attempt=5).with_fallbacks(
            [self.runnable_fallback]
        )

    def process_ref_post(
        self,
        post: RefPost,
    ) -> ParserChainOutput:
        pass

    def instantiate_prompt(
        self,
        post: RefPost,
        md_dict: Dict[str, RefMetadata],
    ) -> dict:
        if self.parser_config.use_metadata:
            # get relevant metadata for post references
            metadata_list = get_ref_post_metadata_list(
                post,
                md_dict,
            )
        else:
            # if metadata not enabled - remove all metadata
            metadata_list = []

        # render post with metadata for prompt
        rendered_post = self.post_renderer.render(
            post,
            metadata_list,
            show_author=False,
        )

        # instantiate prompt with ref post details
        full_prompt = self.prompt_template.render(
            rendered_post=rendered_post,
            max_keywords=self.parser_config.max_keywords,
        )

        return {self.input_name: full_prompt}
