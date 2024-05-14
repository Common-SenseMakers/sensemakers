from typing import Dict

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from operator import itemgetter

from .post_parser_chain import PostParserChain
from ..configs import (
    PostParserChainConfig,
    MultiParserChainConfig,
    ParserChainType,
)
from ..schema.post import RefPost
from ..web_extractors.metadata_extractors import (
    RefMetadata,
    get_refs_metadata_portion,
    get_ref_post_metadata_list,
)
from ..postprocessing.output_processors import (
    AllowedTermsParser,
    ALLOWED_TERMS_DELIMITER,
)
from ..postprocessing import ParserChainOutput
from ..postprocessing.output_processors import KeywordParser
from ..schema.ontology_base import OntologyBase
from ..prompting.jinja.single_ref_template import single_ref_template


def _extract_msg_content(input_prompt: ChatPromptTemplate) -> str:
    """
    Utility function to extract the string content of the ChatPromptTemplate module
    """
    message = input_prompt.messages[0].content
    return message


class AllowedTermsPParserChain(PostParserChain):
    def __init__(
        self,
        parser_config: PostParserChainConfig,
        global_config: MultiParserChainConfig,
        ontology: OntologyBase,
    ):
        super().__init__(parser_config, global_config, ontology)

        self.input_template = PromptTemplate.from_template(self.input_key)

        self.parser_chain = self.input_template | self.model | StrOutputParser()

        self._allowed_terms_name = f"{self.input_name}_allowed_terms"
        self._allowed_terms_key = "{" + self._allowed_terms_name + "}"

        # add allowed terms below the parser chain output, so the output parser has access to them
        _merge = ChatPromptTemplate.from_template(
            "{raw_parser_chain_output} \n\n "
            + ALLOWED_TERMS_DELIMITER
            + self._allowed_terms_key
        )

        self._chain = (
            {
                "raw_parser_chain_output": self.parser_chain,
                self._allowed_terms_name: itemgetter(self._allowed_terms_name),
            }
            | _merge
            | _extract_msg_content
            | AllowedTermsParser(parser_chain_type=parser_config.type)
        )

    @property
    def chain(self):
        return self._chain

    @property
    def allowed_terms_name(self) -> str:
        """_summary_

        Returns:
            str: _description_
        """
        return self._allowed_terms_name
