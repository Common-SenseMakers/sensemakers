from typing import Dict, List
from operator import itemgetter
from langchain_core.runnables import RunnableLambda

from .post_parser_chain import PostParserChain
from ..configs import (
    HashtagPParserChainConfig,
    MultiParserChainConfig,
    ParserChainType,
)
from ..schema.post import RefPost
from ..postprocessing import ParserChainOutput
from ..postprocessing.output_processors import extract_unique_keywords
from ..web_extractors.metadata_extractors import (
    RefMetadata,
)
from ..schema.ontology_base import OntologyBase


def convert_string_prompt_to_string(string_prompt):
    return string_prompt.to_messages()[0].content


def post_process(hashtags: List[str]) -> ParserChainOutput:
    return ParserChainOutput(
        answer=hashtags,
        pparser_type=ParserChainType.HASHTAGS,
    )


def extract_unique_hashtags_capped(dict):
    return _extract_unique_hashtags_capped(
        dict["input_text"],
        dict["max_hashtags"],
    )


def _extract_unique_hashtags_capped(input_text: str, max_hashtags: int):
    all_hashtags = extract_unique_keywords(input_text)
    return all_hashtags[:max_hashtags]


class HashtagPostParserChain(PostParserChain):
    """
    Post parser chain to extract user created hashtags in posts.
    """

    def __init__(
        self,
        parser_config: HashtagPParserChainConfig,
        global_config: MultiParserChainConfig,
        ontology: OntologyBase,
    ):
        super().__init__(parser_config, global_config, ontology)

        self._chain = (
            {
                "input_text": itemgetter(self.input_name),
                "max_hashtags": itemgetter("max_hashtags"),
            }
            | RunnableLambda(extract_unique_hashtags_capped)
            | post_process
        )

    @property
    def chain(self):
        return self._chain

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
        return {
            self.input_name: post.content,
            "max_hashtags": self.parser_config.max_hashtags,
        }
