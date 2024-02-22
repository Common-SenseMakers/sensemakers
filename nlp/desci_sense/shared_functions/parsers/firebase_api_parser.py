from confection import Config

from loguru import logger
from typing import List, Dict

from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_core.runnables import RunnableParallel

from ..interface import ParserResult, ParserSupport
from ..init import MAX_SUMMARY_LENGTH
from ..schema.ontology_base import OntologyBase
from ..schema.post import RefPost
from ..schema.helpers import convert_text_to_ref_post
from ..postprocessing import (
    convert_predicted_relations_to_rdf_triplets,
    convert_triplets_to_graph,
    convert_keywords_to_triplets,
)
from ..postprocessing.output_parsers import TagTypeParser, KeywordParser
from ..dataloaders import scrape_post
from ..enum_dict import EnumDict, EnumDictKey
from ..web_extractors.metadata_extractors import (
    MetadataExtractionType,
    RefMetadata,
    extract_metadata_by_type,
    extract_all_metadata_by_type,
)

from ..prompting.jinja.zero_ref_template import zero_ref_template
from ..prompting.jinja.single_ref_template import single_ref_template
from ..prompting.jinja.keywords_extraction_template import keywords_extraction_template
from ..prompting.jinja.multi_ref_template import multi_ref_template


class PromptCase(EnumDictKey):
    ZERO_REF = "ZERO_REF"
    SINGLE_REF = "SINGLE_REF"
    MULTI_REF = "MULTI_REF"


def set_metadata_extraction_type(extract_type: str):
    try:
        metadata_extract_type = MetadataExtractionType(extract_type)
    except ValueError as e:
        logger.warning(f"Unknown extraction type: {e} -> defaulting to NONE...")
        metadata_extract_type = MetadataExtractionType.NONE

    return metadata_extract_type


def create_model(
    model_name: str,
    temperature: float,
    api_base: str,
    api_key: str,
    openapi_referer: str,
):
    model = ChatOpenAI(
        model=model_name,
        temperature=temperature,
        openai_api_key=api_key,
        openai_api_base=api_base,
        # headers={"HTTP-Referer": openapi_referer},
    )
    return model


class FirebaseAPIParser:
    def __init__(self, config: Config) -> None:
        self.config = config

        # get method for extracting metadata of references
        self.set_md_extract_method(
            config["general"].get(
                "ref_metadata_method", MetadataExtractionType.NONE.value
            )
        )

        # enable/disable keyword extraction mode
        kw_config = config.get("keyword_extraction", False)
        if kw_config:
            kw_enabled = kw_config.get("enabled", False)
        else:
            kw_enabled = False
        self.set_keyword_extraction_mode(kw_enabled)

        # basic prompt template that takes a string as input
        self.prompt_template = PromptTemplate.from_template("{input}")

        # init model
        model_name = (
            "mistralai/mistral-7b-instruct"
            if "model_name" not in config["model"]
            else config["model"]["model_name"]
        )
        logger.info(f"Loading parser model (type={model_name})...")

        # TODO replace this with new config serialize to not print api key
        # logger.info("self.config {}", self.config)

        self.parser_model = ChatOpenAI(
            model=model_name,
            temperature=self.config["model"]["temperature"],
            openai_api_key=self.config["openai_api"]["openai_api_key"],
            openai_api_base=self.config["openai_api"]["openai_api_base"],
            # headers={"HTTP-Referer": self.config["openai_api"]["openai_api_referer"]},
        )

        # init kw extraction chain
        self.init_keyword_extraction_chain()

        # load ontology
        logger.info("Loading ontology...")
        self.ontology = OntologyBase()

        # organize information in ontology for quick retrieval by prompter
        self.init_prompt_case_dict(self.ontology)

        # collect all allowed labels
        self.all_labels = []
        for case_dict in self.prompt_case_dict.values():
            self.all_labels += case_dict["labels"]

        # collect all allowed type templates
        self.all_labels = []
        for case_dict in self.prompt_case_dict.values():
            self.all_labels += case_dict["labels"]

    def set_keyword_extraction_mode(self, enabled: bool):
        self.kw_mode_enabled = enabled

    def set_md_extract_method(self, md_extract_method: str):
        logger.info(f"Setting metadata extraction method to {md_extract_method}...")
        self.md_extract_method = set_metadata_extraction_type(md_extract_method)

    def set_kw_md_extract_method(self, md_extract_method: str):
        logger.info(
            f"Setting keywords metadata extraction method to {md_extract_method}..."
        )
        self.kw_md_extract_method = set_metadata_extraction_type(md_extract_method)

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
        prompt_case_dict[PromptCase.ZERO_REF]["output_parser"] = TagTypeParser(
            allowed_tags=prompt_case_dict[PromptCase.ZERO_REF]["labels"]
        )
        prompt_case_dict[PromptCase.ZERO_REF]["chain"] = (
            self.prompt_template
            | self.parser_model
            | prompt_case_dict[PromptCase.ZERO_REF]["output_parser"]
        )
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
        prompt_case_dict[PromptCase.SINGLE_REF]["output_parser"] = TagTypeParser(
            allowed_tags=prompt_case_dict[PromptCase.SINGLE_REF]["labels"]
        )
        prompt_case_dict[PromptCase.SINGLE_REF]["chain"] = (
            self.prompt_template
            | self.parser_model
            | prompt_case_dict[PromptCase.SINGLE_REF]["output_parser"]
        )
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
        prompt_case_dict[PromptCase.MULTI_REF]["output_parser"] = TagTypeParser(
            allowed_tags=prompt_case_dict[PromptCase.SINGLE_REF]["labels"]
        )
        prompt_case_dict[PromptCase.MULTI_REF]["chain"] = (
            self.prompt_template
            | self.parser_model
            | prompt_case_dict[PromptCase.MULTI_REF]["output_parser"]
        )
        prompt_case_dict[PromptCase.MULTI_REF][
            "prompt_j2_template"
        ] = multi_ref_template

        self.prompt_case_dict = prompt_case_dict

    @property
    def all_allowed_tags(self) -> List[str]:
        all_tags = []
        for case_dict in self.prompt_case_dict.values():
            all_tags += case_dict["labels"]

    @property
    def all_allowed_template_types(self) -> List[dict]:
        all_template_types = []
        for case_dict in self.prompt_case_dict.values():
            all_template_types += case_dict["type_templates"]

    @property
    def max_summary_length(self):
        return self.config["general"].get(
            "max_summary_length",
            MAX_SUMMARY_LENGTH,
        )

    def get_support_data(
        self,
        metadata_list: List[RefMetadata],
    ) -> ParserSupport:
        ontology = self.ontology.ontology_interface
        md_dict = {}  # Initialize an empty dictionary

        for m in metadata_list:
            if hasattr(m, "url"):
                md_dict[m.url] = m

        return ParserSupport(ontology=ontology, refs_meta=md_dict)

    def post_process_result(
        self,
        semantics: Dict,
        keywords: Dict = None,
    ) -> ParserResult:
        """convert parser output result into format
        required by app interface."""

        # get metadata
        metadata_list: List[RefMetadata] = semantics.get("md_list", list())

        # convert model outputs to triplets
        triplets = convert_predicted_relations_to_rdf_triplets(
            semantics,
            self.ontology,
        )

        # convert triplets to graph
        graph = convert_triplets_to_graph(triplets)

        # add keywords to graph
        if keywords:
            kw_triplets = convert_keywords_to_triplets(keywords)
            for t in kw_triplets:
                graph.add(t.to_tuple())

        # gather support info
        parser_support: ParserSupport = self.get_support_data(metadata_list)

        return ParserResult(semantics=graph, support=parser_support)

    def get_refs_metadata_portion(self, metadata_list: List[RefMetadata]):
        """
        Processes the metadata list to append to the prompt
        """
        if len(metadata_list) > 0:
            result_lines = ["## Reference Metadata:"]
            for i, ref in enumerate(metadata_list):
                if hasattr(ref, "to_str"):
                    result_lines.append(ref.to_str())
                if i < len(metadata_list) - 1:  # Check if it's not the last element
                    result_lines.append("---------------")
            result_string = "\n".join(result_lines)
            return result_string
        return ""

    def create_kw_prompt(
        self,
        post: RefPost,
        metadata_list: List[RefMetadata] = None,
    ) -> str:
        """
        Return full prompt for keyword chain

        Args:
            post (RefPost): input post
            metadata_list (List[RefMetadata], optional): List of extracted
            references metadata. Defaults to None.

        Returns:
            str: full instantiated prompt
        """

        references_metadata = self.get_refs_metadata_portion(metadata_list)
        prompt_j2_template = self.kw_extraction["prompt_j2_template"]

        # instantiate prompt with ref post details
        full_prompt = prompt_j2_template.render(
            author_name=post.author,
            content=post.content,
            references_metadata=references_metadata,
            max_keywords=self.kw_extraction["max_keywords"],
        )

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
        references_metadata = self.get_refs_metadata_portion(metadata_list)
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

    def process_by_case(
        self,
        post: RefPost,
        case: PromptCase,
        metadata_list: List[RefMetadata] = None,
    ) -> dict:
        # get full prompt
        full_prompt = self.create_semantics_prompt_by_case(
            post,
            case,
            metadata_list,
        )

        # load corresponding chain
        chain = self.prompt_case_dict[case]["chain"]

        # run chain on full prompt
        answer = chain.invoke({"input": full_prompt})

        # TODO make structured output type
        result = {
            "post": post,
            "full_prompt": full_prompt,
            "answer": answer,
            "possible_labels": self.prompt_case_dict[case]["labels"],
            "md_list": metadata_list,
        }

        return result

    def init_keyword_extraction_chain(self):
        # setup chain for topic extraction
        if not self.kw_mode_enabled:
            self.kw_extraction = {}
            return False

        max_keywords = self.config["keyword_extraction"].get("max_keywords")

        # get method for extracting metadata of references
        self.set_kw_md_extract_method(
            self.config["keyword_extraction"].get(
                "ref_metadata_method", MetadataExtractionType.NONE.value
            )
        )

        # setup prompt template
        self.kw_prompt_template = PromptTemplate.from_template("{kw_input}")

        # load template
        kw_template = keywords_extraction_template

        # init model
        model = self.config["keyword_extraction"]["model"]
        name = model["model_name"]
        logger.info(f"Loading keyword model (type={name})...")
        self.kw_model = create_model(
            name,
            model["temperature"],
            self.config["openai_api"]["openai_api_base"],
            self.config["openai_api"]["openai_api_key"],
            self.config["openai_api"]["openai_api_referer"],
        )

        # init kw output parser

        self.kw_extraction = {
            "prompt_j2_template": kw_template,
            "chain": self.kw_prompt_template
            | self.kw_model
            | KeywordParser(max_keywords=max_keywords),
            "max_keywords": max_keywords,
        }

        return True

    def extract_post_topics(
        self, post: RefPost, metadata_list: List[RefMetadata] = None
    ) -> dict:
        # instantiate prompt with ref post details
        full_prompt = self.create_kw_prompt(
            post,
            metadata_list,
        )

        # load corresponding chain
        chain = self.kw_extraction["chain"]

        # run chain on full prompt
        answer = chain.invoke({"kw_input": full_prompt})

        # TODO make structured output type
        result = {"post": post, "full_prompt": full_prompt, "answer": answer}

        return result

    def process_text_parallel(
        self,
        text: str,
        author: str = "default_author",
        source: str = "default_source",
    ) -> ParserResult:
        """
        Process input text and return results in format required by the
        API interface.

        Runs keyword extraction in parallel chain if enabled in config
        """
        # convert text to RefPost
        post: RefPost = convert_text_to_ref_post(text, author, source)

        combined_result = self.process_ref_post_parallel(post)

        final_result = self.post_process_result(**combined_result)

        return final_result

    def process_ref_post_parallel(self, post: RefPost):
        assert self.kw_mode_enabled
        md_list = []

        # check how many external references post mentions
        if len(post.ref_urls) == 0:
            case = PromptCase.ZERO_REF

        else:
            # at least one external reference
            if len(post.ref_urls) == 1:
                case = PromptCase.SINGLE_REF
                # if metadata flag is active, retreive metadata
                md_list = extract_metadata_by_type(
                    post.ref_urls[0],
                    self.md_extract_method,
                    self.config["general"]["max_summary_length"],
                )

            else:
                case = PromptCase.MULTI_REF
                # TODO finish
                # md_list = extract_metadata_by_type(post.ref_urls[0], self.md_extract_method)

        # run filters if specified TODO

        # create prompts
        full_semantics_prompt = self.create_semantics_prompt_by_case(
            post,
            case,
            md_list,
        )

        full_kw_prompt = self.create_kw_prompt(post, md_list)

        # create parallel chain
        kw_chain = self.kw_extraction.get("chain")
        semantics_chain = self.prompt_case_dict[case]["chain"]

        map_chain = RunnableParallel(semantics=semantics_chain, keywords=kw_chain)

        combined_result = map_chain.invoke(
            {
                "kw_input": full_kw_prompt,
                "input": full_semantics_prompt,
            }
        )

        # TODO hacky, find a cleaner way to pass this info
        semantics_answer = combined_result.get("semantics")
        kw_answer = combined_result.get("keywords")

        combined_result["keywords"] = {
            "post": post,
            "full_prompt": full_kw_prompt,
            "answer": kw_answer,
        }

        combined_result["semantics"] = {
            "post": post,
            "full_prompt": full_semantics_prompt,
            "answer": semantics_answer,
            "possible_labels": self.prompt_case_dict[case]["labels"],
            "md_list": md_list,
        }

        # logger.info(
        #     f"combined_result[semantics]: {combined_result['semantics']['full_prompt']}"
        # )

        # logger.info(
        #     f"combined_result[keywords]: {combined_result['keywords']['full_prompt']}"
        # )

        return combined_result

    def extract_post_topics_w_metadata(self, post: RefPost) -> List[str]:
        md_list = extract_all_metadata_by_type(
            post.ref_urls, self.kw_md_extract_method, self.max_summary_length
        )

        result = self.extract_post_topics(post, md_list)

        return result

    def process_ref_post(self, post: RefPost) -> ParserResult:
        """
        Process input post and return results in the format required by
        the API interface.
        """
        result: Dict = self.process_ref_post_st(post)

        # post processing
        full_result: ParserResult = self.post_process_result(
            result,
        )

        # TODO keywords. maybe async call?

        return full_result

    def process_ref_post_st(self, post: RefPost) -> dict:
        """
        TODO
        """
        md_list = []

        # check how many external references post mentions
        if len(post.ref_urls) == 0:
            case = PromptCase.ZERO_REF

        else:
            # at least one external reference
            if len(post.ref_urls) == 1:
                case = PromptCase.SINGLE_REF
                # if metadata flag is active, retreive metadata
                md_list = extract_metadata_by_type(
                    post.ref_urls[0],
                    self.md_extract_method,
                    self.config["general"]["max_summary_length"],
                )

            else:
                case = PromptCase.MULTI_REF
                # TODO finish
                # md_list = extract_metadata_by_type(post.ref_urls[0], self.md_extract_method)

        # run filters if specified TODO

        # process post
        result = self.process_by_case(post, case, md_list)

        return result

    def process_text(
        self,
        text: str,
        author: str = "default_author",
        source: str = "default_source",
    ) -> ParserResult:
        """
        Process input text and return results in format required by the
        API interface.
        """
        # convert text to RefPost
        post: RefPost = convert_text_to_ref_post(text, author, source)

        result = self.process_ref_post(post)

        return result

    def process_text_st(
        self,
        text: str,
        author: str = "default_author",
        source: str = "default_source",
    ) -> ParserResult:
        """
        Process text for format required by streamlit demo
        """
        # TODO fix results

        # convert text to RefPost
        post: RefPost = convert_text_to_ref_post(text, author, source)

        result = self.process_ref_post_st(post)

        return result

    def process_url(self, post_url: str):
        post: RefPost = scrape_post(post_url)
        if not post:
            # TODO fix exception handling to return empty output
            raise IOError(
                f"Could not detect social media type of input URL: {post_url}"
            )

        result = self.process_ref_post_st(post)

        return result
