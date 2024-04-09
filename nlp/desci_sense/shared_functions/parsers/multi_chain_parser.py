from loguru import logger
from typing import List, Dict
from operator import itemgetter
import asyncio

from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel, RunnableConfig
from langchain_core.prompts import ChatPromptTemplate

from .parser_factory import parser_factory
from ..runners.configs import MultiParserChainConfig
from ..interface import ParserResult, ParserSupport
from ..init import MAX_SUMMARY_LENGTH
from ..schema.ontology_base import OntologyBase
from ..schema.post import RefPost
from ..schema.helpers import convert_text_to_ref_post
from ..postprocessing import (
    convert_predicted_relations_to_rdf_triplets,
    convert_triplets_to_graph,
    convert_keywords_to_triplets,
    convert_raw_output_to_st_format,
    convert_raw_outputs_to_st_format,
    CombinedParserOutput,
)
from ..filters.research_filter import apply_research_filter
from ..postprocessing.output_parsers import (
    TagTypeParser,
    KeywordParser,
    AllowedTermsParser,
    ALLOWED_TERMS_DELIMITER,
)
from ..dataloaders import scrape_post
from ..enum_dict import EnumDict, EnumDictKey
from ..web_extractors.metadata_extractors import (
    MetadataExtractionType,
    RefMetadata,
    extract_metadata_by_type,
    extract_all_metadata_by_type,
    extract_posts_ref_metadata_dict,
)

from ..prompting.jinja.zero_ref_template import zero_ref_template
from ..prompting.jinja.single_ref_template import single_ref_template
from ..prompting.jinja.keywords_extraction_template import keywords_extraction_template
from ..prompting.jinja.multi_ref_template import multi_ref_template
from ..prompting.jinja.topics_template import ALLOWED_TOPICS, topics_template


class MultiChainParser:
    def __init__(self, config: MultiParserChainConfig) -> None:
        self.config = config

        self.ontology_base = OntologyBase()

        # initialize the post parsers
        logger.info("Initializing post parsers...")
        self.pparsers = {}
        for pparser_config in config.parser_configs:
            self.pparsers[pparser_config.name] = parser_factory(
                pparser_config, config, self.ontology_base
            )

        # init parallel chain
        self.parallel_chain = self.create_parallel_chain(self.pparsers)

    def create_parallel_chain(self, active_list: List[str] = None) -> RunnableParallel:
        """
        Create RunnableParallel chain from all chains specified by
        `active_list`. If `active_list` is not specified, adds all chains.
        """
        chains_dict = {}
        for pparser_name, pparser in self.pparsers.items():
            if pparser_name in active_list:
                chains_dict[pparser_name] = pparser.chain
        assert (
            len(list(chains_dict.keys())) > 0
        ), "Must specify at least one active chain"
        parallel_chain = RunnableParallel(**chains_dict)

        return parallel_chain

    def get_pparsers(self):
        return list(self.pparsers.values())

    def instantiate_prompts(
        self,
        post: RefPost,
        md_dict: Dict[str, RefMetadata],
        active_list: List[str],
    ) -> List[str]:
        """
        Instantiate prompts for all pparsers specified by `active_list`
        """
        inst_prompts = {}
        for pparser in self.get_pparsers():
            if pparser.name in active_list:
                inst_prompt = pparser.instantiate_prompt(
                    post,
                    md_dict,
                )
                inst_prompts.update(inst_prompt)
        return inst_prompts

    def process_ref_post(
        self,
        post: RefPost,
        active_list: List[str] = None,
        as_triplets: bool = False,
    ):
        md_dict = extract_posts_ref_metadata_dict(
            [post],
            self.config.metadata_extract_config.extraction_method,
        )
        # md_list = [md_dict.get(url) for url in post.ref_urls if md_dict.get(url)]
        # if no filter specified, run all chains
        if active_list is None:
            active_list = list(self.pparsers.keys())
        logger.debug(f"Processing post with parsers: {active_list}")

        logger.debug("Instantiating prompts...")
        inst_prompts = self.instantiate_prompts(post, md_dict, active_list)

        parallel_chain = self.create_parallel_chain(active_list)

        logger.debug("Invoking parallel chain...")
        res = parallel_chain.invoke(inst_prompts)

        # add full prompts for debugging purposes
        for name, output in res.items():
            output.extra["prompt"] = inst_prompts[f"{name}_input"]

        # TODO add option for post processing to triplets format

        return res

    def process_text(
        self,
        text: str,
        active_list: List[str] = None,
        as_triplets: bool = False,
    ):
        ref_post: RefPost = convert_text_to_ref_post(text)
        return self.process_ref_post(ref_post, active_list, as_triplets)

    def batch_process_ref_posts(
        self,
        inputs: List[RefPost],
        batch_size: int = 5,
        active_list: List[str] = None,
    ) -> Dict:
        """Batch process a list of RefPosts.

        Args:
            inputs (List[RefPost]): input RefPosts.
            batch_size (int): maximum number of concurrent calls to make. Defaults to 5.

        Returns:
            List[Dict]: list of processed results
        """
        # extract all posts metadata
        md_dict = extract_posts_ref_metadata_dict(
            inputs,
            self.config.metadata_extract_config.extraction_method,
        )

        if active_list is None:
            active_list = list(self.pparsers.keys())
        logger.debug(f"Processing {len(inputs)} posts with parsers: {active_list}")

        logger.debug("Instantiating prompts...")
        inst_prompts = [
            self.instantiate_prompts(post, md_dict, active_list) for post in inputs
        ]

        # create runnable parallel
        # setup async batch job
        config = RunnableConfig(max_concurrency=batch_size)
        parallel_chain = self.create_parallel_chain(active_list)

        logger.debug("Invoking parallel chain...")

        results = asyncio.run(
            parallel_chain.abatch(
                inst_prompts,
                config=config,
            )
        )

        return results

        # st_outputs = convert_raw_outputs_to_st_format(
        #     inputs,
        #     results,
        #     prompts,
        #     md_dict,
        # )

        # # apply filter
        # for output in st_outputs:
        #     apply_research_filter(output)

        # return st_outputs
