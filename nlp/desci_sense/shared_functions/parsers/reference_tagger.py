from typing import Dict, List
from operator import itemgetter
from langchain_core.runnables import RunnableLambda

from .allowed_terms_pparser import AllowedTermsPParserChain
from ..configs import RefTaggerChainConfig, MultiParserChainConfig
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
from ..configs import ParserChainType


def return_fallback(input):
    return ParserChainOutput(
        answer=[],
        pparser_type=ParserChainType.REFERENCE_TAGGER,
        extra={"errors": "fallback"},
    )


class PromptCase(EnumDictKey):
    ZERO_REF = "ZERO_REF"
    SINGLE_REF = "SINGLE_REF"
    MULTI_REF = "MULTI_REF"


def normalize_references(
    parser_output: ParserChainOutput, ref_urls: List[str]
) -> ParserChainOutput:
    tags: List[str] = parser_output.answer

    # handle zero ref case
    if len(ref_urls) == 0:
        normalized_answer = [tags]
    else:
        # handle case with refs
        # assuming all tags apply to all refs
        normalized_answer = [tags for _ in range(len(ref_urls))]

    # replace answer with normalized answer
    parser_output.answer = normalized_answer

    return parser_output


def post_process_tag_chain(input: dict) -> ParserChainOutput:
    raw_tags_output: ParserChainOutput = input.get("raw_tags_chain")
    ref_urls = input.get("ref_urls")
    output = _post_process_llm_chain(
        raw_tags_output,
        ref_urls,
    )
    return output


def _post_process_llm_chain(
    raw_tags_output: ParserChainOutput,
    ref_urls: List[str],
) -> ParserChainOutput:
    # normalize references
    normalized_output = normalize_references(raw_tags_output, ref_urls)

    return normalized_output


class ReferenceTaggerParserChain(AllowedTermsPParserChain):
    def __init__(
        self,
        parser_config: RefTaggerChainConfig,
        global_config: MultiParserChainConfig,
        ontology: OntologyBase,
    ):
        super().__init__(parser_config, global_config, ontology)

        self.init_prompt_case_dict(ontology)

        self.runnable_fallback = RunnableLambda(return_fallback)

        self.ref_tag_chain = {
            "raw_tags_chain": self._chain,
            "ref_urls": itemgetter("ref_urls"),
        } | RunnableLambda(post_process_tag_chain)

    @property
    def chain(self):
        return self.ref_tag_chain.with_retry().with_fallbacks([self.runnable_fallback])

    def process_ref_post(
        self,
        post: RefPost,
    ) -> ParserChainOutput:
        pass

    def init_prompt_case_dict(self, ontology: OntologyBase):
        # organize information in ontology for quick retrieval by prompter
        prompt_case_dict = EnumDict(PromptCase)

        # configure zero ref case
        prompt_case_dict[PromptCase.ZERO_REF] = {
            "labels": ontology.get_valid_templates(
                subject_type="post", object_type="nan", as_dict=False
            ).label.to_list(),
            "type_templates": ontology.get_valid_templates(
                subject_type="post", object_type="nan"
            ),
        }

        prompt_case_dict[PromptCase.ZERO_REF]["prompt_j2_template"] = zero_ref_template

        # configure single ref case
        prompt_case_dict[PromptCase.SINGLE_REF] = {
            "labels": ontology.get_valid_templates(
                subject_type="post", object_type="ref", as_dict=False
            ).label.to_list(),
            "type_templates": ontology.get_valid_templates(
                subject_type="post", object_type="ref"
            ),
        }

        prompt_case_dict[PromptCase.SINGLE_REF][
            "prompt_j2_template"
        ] = single_ref_template

        # configure multi ref case
        # TODO update to handle relations - meanwhile placeholder based on single refs
        prompt_case_dict[PromptCase.MULTI_REF] = {
            "labels": ontology.get_valid_templates(
                subject_type="post", object_type="ref", as_dict=False
            ).label.to_list(),
            "type_templates": ontology.get_valid_templates(
                subject_type="post", object_type="ref"
            ),
        }

        prompt_case_dict[PromptCase.MULTI_REF][
            "prompt_j2_template"
        ] = multi_ref_template

        self.prompt_case_dict = prompt_case_dict

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

        # check how many external references post mentions
        if len(post.ref_urls) == 0:
            case = PromptCase.ZERO_REF

        else:
            # at least one external reference
            if len(post.ref_urls) == 1:
                case = PromptCase.SINGLE_REF
                # if metadata flag is active, retreive metadata

            else:
                case = PromptCase.MULTI_REF
                # TODO finish

        # create prompts
        prompt = self.create_semantics_prompt_by_case(
            post,
            case,
            metadata_list,
        )

        full_prompt = {
            self.input_name: prompt,
            self.allowed_terms_name: self.prompt_case_dict[case]["labels"],
            "ref_urls": post.ref_urls,
        }

        return full_prompt

    def create_semantics_prompt_by_case(
        self,
        post: RefPost,
        case: PromptCase,
        metadata_list: List[RefMetadata] = None,
    ) -> str:
        """
        Return full prompt for semantics chain, depending on input PromptCase

        Args:
            post (RefPost): input post
            case (PromptCase): input PromptCase
            metadata_list (List[RefMetadata], optional): List of extracted
            references metadata. Defaults to None.

        Returns:
            str: full instantiated prompt
        """
        metadata_list = metadata_list if metadata_list else list()
        references_metadata = get_refs_metadata_portion(metadata_list)
        prompt_j2_template = self.prompt_case_dict[case]["prompt_j2_template"]
        type_templates = self.prompt_case_dict[case]["type_templates"]

        # instantiate prompt with ref post details
        full_prompt = prompt_j2_template.render(
            type_templates=type_templates,
            author_name=post.author,
            content=post.content,
            references_metadata=references_metadata,
        )

        return full_prompt
