from pathlib import Path
from typing import Optional, Dict, List

ROOT = Path(__file__).parents[2]

from jinja2 import Environment, FileSystemLoader
from confection import Config
from loguru import logger

from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate

import desci_sense.configs as configs
from desci_sense.configs import environ

from ..schema.notion_ontology_base import NotionOntologyBase, load_ontology_from_config
from ..shared_functions.schema.post import RefPost
from ..shared_functions.postprocessing.output_parsers import (
    TagTypeParser,
    KeywordParser,
)
from ..dataloaders import convert_text_to_ref_post, scrape_post
from ..shared_functions.prompting.jinja import (
    single_ref_template,
    zero_ref_template,
    multi_ref_template,
)
from ..shared_functions.enum_dict import EnumDict, EnumDictKey
from ..shared_functions.web_extractors.metadata_extractors import (
    MetadataExtractionType,
    RefMetadata,
    extract_metadata_by_type,
    extract_all_metadata_by_type,
)


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


def load_prompt_j2_templates(
    templates_dir: str,
    zero_ref_template_name: str,
    single_ref_template_name: str,
    multi_ref_template_name: str,
):
    # load prompt templates into jinja and return j2 templates for each case

    full_templates_dir = ROOT / templates_dir
    j2_env = Environment(loader=FileSystemLoader(str(full_templates_dir)))

    zero_ref_template = j2_env.get_template(zero_ref_template_name)
    single_ref_template = j2_env.get_template(single_ref_template_name)
    multi_ref_template = j2_env.get_template(multi_ref_template_name)

    return zero_ref_template, single_ref_template, multi_ref_template


def create_model(
    model_name: str, temperature: float, api_key: str, openapi_referer: str
):
    model = ChatOpenAI(
        model=model_name,
        temperature=temperature,
        openai_api_key=api_key,
        openai_api_base=configs.OPENROUTER_API_BASE,
        headers={"HTTP-Referer": openapi_referer},
    )
    return model


class MultiStageParser:
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

        # if no api key passed as arg, default to environment config
        openai_api_key = config["openai_api"].get(
            "openai_api_key", environ["OPENROUTER_API_KEY"]
        )
        openapi_referer = config["openai_api"].get(
            "openai_api_referer", environ["OPENROUTER_REFERRER"]
        )
        openai_api_base = config["openai_api"].get(
            "openai_api_base", configs.OPENROUTER_API_BASE
        )
        #
        # openapi_referer = openapi_referer if openapi_referer else environ["OPENROUTER_REFERRER"]

        # basic prompt template that takes a string as input
        self.prompt_template = PromptTemplate.from_template("{input}")

        # init model
        model_name = (
            "mistralai/mistral-7b-instruct"
            if not "model_name" in config["model"]
            else config["model"]["model_name"]
        )
        logger.info(f"Loading parser model (type={model_name})...")
        self.parser_model = ChatOpenAI(
            model=model_name,
            temperature=self.config["model"]["temperature"],
            openai_api_key=openai_api_key,
            openai_api_base=openai_api_base,
            headers={"HTTP-Referer": openapi_referer},
        )

        # init kw extraction chain
        self.init_keyword_extraction_chain(
            api_key=openai_api_key, openapi_referer=openapi_referer
        )

        # load ontology
        logger.info("Loading ontology...")
        self.ontology = load_ontology_from_config(self.config)

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

    def init_prompt_case_dict(self, ontology: NotionOntologyBase):
        # organize information in ontology for quick retrieval by prompter
        prompt_case_dict = EnumDict(PromptCase)

        # load jinja templates

        (
            zero_ref_template,
            single_ref_template,
            multi_ref_template,
        ) = load_prompt_j2_templates(
            templates_dir=self.config["prompt"]["template_dir"],
            zero_ref_template_name=self.config["prompt"]["zero_ref_template_name"],
            single_ref_template_name=self.config["prompt"]["single_ref_template_name"],
            multi_ref_template_name=self.config["prompt"]["multi_ref_template_name"],
        )

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

    def process_by_case(
        self, post: RefPost, case: PromptCase, metadata_list: List[RefMetadata] = None
    ) -> dict:
        prompt_j2_template = self.prompt_case_dict[case]["prompt_j2_template"]
        type_templates = self.prompt_case_dict[case]["type_templates"]

        # load corresponding chain
        chain = self.prompt_case_dict[case]["chain"]

        # instantiate prompt with ref post details
        full_prompt = prompt_j2_template.render(
            type_templates=type_templates,
            author_name=post.author,
            content=post.content,
            metadata_list=metadata_list,
        )

        # run chain on full prompt
        answer = chain.invoke({"input": full_prompt})

        # TODO make structured output type
        result = {
            "post": post,
            "full_prompt": full_prompt,
            "answer": answer,
            "possible_labels": self.prompt_case_dict[case]["labels"],
        }

        return result

    def init_keyword_extraction_chain(self, api_key, openapi_referer):
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

        # load template
        templates_dir = self.config["prompt"]["template_dir"]
        keyword_template_name = self.config["keyword_extraction"]["template"]
        full_templates_dir = ROOT / templates_dir
        j2_env = Environment(loader=FileSystemLoader(str(full_templates_dir)))
        kw_template = j2_env.get_template(keyword_template_name)

        # init model
        model_name = self.config["keyword_extraction"]["model"]["model_name"]
        logger.info(f"Loading keyword model (type={model_name})...")
        self.kw_model = create_model(
            model_name,
            self.config["keyword_extraction"]["model"]["temperature"],
            api_key,
            openapi_referer,
        )

        # init kw output parser

        self.kw_extraction = {
            "prompt_j2_template": kw_template,
            "chain": self.prompt_template
            | self.kw_model
            | KeywordParser(max_keywords=max_keywords),
            "max_keywords": max_keywords,
        }

        return True

    def extract_post_topics(
        self, post: RefPost, metadata_list: List[RefMetadata] = None
    ) -> dict:
        prompt_j2_template = self.kw_extraction["prompt_j2_template"]

        # load corresponding chain
        chain = self.kw_extraction["chain"]

        # instantiate prompt with ref post details
        full_prompt = prompt_j2_template.render(
            author_name=post.author,
            content=post.content,
            metadata_list=metadata_list,
            max_keywords=self.kw_extraction["max_keywords"],
        )

        # run chain on full prompt
        answer = chain.invoke({"input": full_prompt})

        # TODO make structured output type
        result = {"post": post, "full_prompt": full_prompt, "answer": answer}

        return result

    def extract_post_topics_w_metadata(self, post: RefPost) -> List[str]:
        md_list = extract_all_metadata_by_type(post.ref_urls, self.kw_md_extract_method)

        result = self.extract_post_topics(post, md_list)

        return result

    def process_ref_post(self, post: RefPost):
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
                    post.ref_urls[0], self.md_extract_method
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
        self, text: str, author: str = "default_author", source: str = "default_source"
    ):
        # TODO fix results

        # convert text to RefPost
        post: RefPost = convert_text_to_ref_post(text, author, source)

        result = self.process_ref_post(post)

        return result

    def process_url(self, post_url: str):
        post: RefPost = scrape_post(post_url)
        if not post:
            # TODO fix exception handling to return empty output
            raise IOError(
                f"Could not detect social media type of input URL: {post_url}"
            )

        result = self.process_ref_post(post)

        return result

    def kw_process_post(self, post_url: str):
        # extract post and run kw extraction model
        post: RefPost = scrape_post(post_url)
        if not post:
            # TODO fix exception handling to return empty output
            raise IOError(
                f"Could not detect social media type of input URL: {post_url}"
            )

        result = self.extract_post_topics_w_metadata(post)

        return result
