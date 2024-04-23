from typing import Dict, List
from langchain.prompts import PromptTemplate

from .allowed_terms_pparser import AllowedTermsPParserChain
from ..configs import (
    TopicsPParserChainConfig,
    MultiParserChainConfig,
)
from ..schema.post import RefPost
from ..prompting.jinja.zero_ref_template import zero_ref_template
from ..prompting.jinja.single_ref_template import single_ref_template
from ..prompting.jinja.multi_ref_template import multi_ref_template
from ..web_extractors.metadata_extractors import (
    RefMetadata,
    get_refs_metadata_portion,
    get_ref_post_metadata_list,
)
from ..postprocessing import ParserChainOutput
from ..postprocessing.output_processors import KeywordParser
from ..schema.ontology_base import OntologyBase
from ..enum_dict import EnumDict, EnumDictKey
from ..prompting.jinja.topics_template import ALLOWED_TOPICS, topics_template


class PromptCase(EnumDictKey):
    ZERO_REF = "ZERO_REF"
    SINGLE_REF = "SINGLE_REF"
    MULTI_REF = "MULTI_REF"


class TopicsParserChain(AllowedTermsPParserChain):
    def __init__(
        self,
        parser_config: TopicsPParserChainConfig,
        global_config: MultiParserChainConfig,
        ontology: OntologyBase,
    ):
        super().__init__(parser_config, global_config, ontology)

        self.topics_template = topics_template

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
    ) -> str:
        if self.parser_config.use_metadata:
            # get relevant metadata for post references
            metadata_list = get_ref_post_metadata_list(
                post,
                md_dict,
            )
        else:
            # if metadata not enabled - remove all metadata
            metadata_list = []

        # create prompts
        prompt = self.create_topics_prompt(
            post,
            metadata_list,
        )

        full_prompt = {
            self.input_name: prompt,
            self.allowed_terms_name: ALLOWED_TOPICS,
        }

        return full_prompt

    def create_topics_prompt(
        self,
        post: RefPost,
        metadata_list: List[RefMetadata] = None,
    ) -> str:
        """
        Return full prompt for topics chain

        Args:
            post (RefPost): input post
            metadata_list (List[RefMetadata], optional): List of extracted
            references metadata. Defaults to None.

        Returns:
            str: full instantiated prompt
        """
        metadata_list = metadata_list if metadata_list else list()
        references_metadata = get_refs_metadata_portion(metadata_list)

        prompt_j2_template = self.topics_template

        # instantiate prompt with ref post details
        prompt = prompt_j2_template.render(
            author_name=post.author,
            content=post.content,
            references_metadata=references_metadata,
            topics=ALLOWED_TOPICS,
        )

        return prompt
