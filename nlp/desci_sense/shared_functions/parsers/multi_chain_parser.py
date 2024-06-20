from loguru import logger
from typing import List, Dict, Union, Optional
from operator import itemgetter
import asyncio

from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel, RunnableConfig
from langchain_core.prompts import ChatPromptTemplate

from .parser_factory import parser_factory
from ..configs import (
    MetadataExtractionType,
    MultiParserChainConfig,
    PostProcessType,
)
from ..interface import (
    ParserResult,
    ParserSupport,
    ParsePostRequest,
)
from ..preprocessing import (
    ParserInput,
    preproc_parser_input,
    PreprocParserInput,
)
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
    ParserChainOutput,
    post_process_chain_output,
    post_process_firebase,
)
from ..filters.research_filter import apply_research_filter
from ..filters import SciFilterClassfication
from ..postprocessing import post_process_chain_output
from ..dataloaders import scrape_post
from ..enum_dict import EnumDict, EnumDictKey
from ..web_extractors.metadata_extractors import (
    RefMetadata,
    extract_metadata_by_type,
    extract_all_metadata_by_type,
    extract_posts_ref_metadata_dict,
    set_metadata_extraction_type,
)

from ..prompting.jinja.zero_ref_template import zero_ref_template
from ..prompting.jinja.single_ref_template import single_ref_template
from ..prompting.jinja.keywords_extraction_template import keywords_extraction_template
from ..prompting.jinja.multi_ref_template import multi_ref_template
from ..prompting.jinja.topics_template import ALLOWED_TOPICS, topics_template
from .parser_utils import BatchCallback


def add_prompts_to_output(
    raw_output: Dict[str, ParserChainOutput],
    prompts_dict: Dict,
):
    # add full prompts for debugging purposes
    for name, output in raw_output.items():
        output.extra["prompt"] = prompts_dict[f"{name}_input"]


class MultiChainParser:
    def __init__(self, config: MultiParserChainConfig) -> None:
        self.config = config
        logger.info(
            f"Initializing MultiChainParser. PostProcessType={config.post_process_type.value}"
        )

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

    @property
    def ontology(self) -> OntologyBase:
        return self.ontology_base

    def set_md_extract_method(self, md_extract_method: str):
        logger.info(f"Setting metadata extraction method to {md_extract_method}...")
        self.config.metadata_extract_config.extraction_method = (
            set_metadata_extraction_type(md_extract_method)
        )

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

    # def preprocess_interface_input(self, input_request: ParsePostRequest):
    # pass

    # def preprocess_st_input(self, input_request: ParsePostRequest):

    def instantiate_prompts(
        self,
        post: RefPost,
        md_dict: Dict[str, RefMetadata],
        active_list: List[str] = None,
    ) -> List[str]:
        """
        Instantiate prompts for all pparsers specified by `active_list`
        """

        if active_list is None:
            active_list = list(self.pparsers.keys())

        inst_prompts = {}
        for pparser in self.get_pparsers():
            if pparser.name in active_list:
                inst_prompt = pparser.instantiate_prompt(
                    post,
                    md_dict,
                )
                inst_prompts.update(inst_prompt)
        return inst_prompts

    def apply_sci_filter(
        self,
        combined_results: CombinedParserOutput,
    ) -> CombinedParserOutput:
        result = apply_research_filter(combined_results)
        combined_results.filter_classification = result
        return combined_results

    def post_process_raw_results(
        self,
        post: RefPost,
        inst_prompt_dict: Dict[str, str],
        raw_results: Dict[str, ParserChainOutput],
        md_dict: Dict[str, RefMetadata],
        ontology: OntologyBase,
        post_process_type: PostProcessType,
        unprocessed_urls: Optional[List[str]] = None,
    ) -> Union[Dict[str, ParserChainOutput], CombinedParserOutput, ParserResult]:
        # add full prompts for debugging purposes
        add_prompts_to_output(raw_results, inst_prompt_dict)

        # post processing to specified format
        if post_process_type == PostProcessType.NONE:
            return raw_results

        # convert raw outputs to combined format
        combined_res = post_process_chain_output(
            post,
            raw_results,
            md_dict,
            ontology,
            PostProcessType.COMBINED,
            unprocessed_urls,
        )

        # apply science filter
        combined_res.filter_classification = apply_research_filter(combined_res)
        post_processed_res = combined_res

        if post_process_type == PostProcessType.FIREBASE:
            post_processed_res = post_process_firebase(
                combined_res,
                ontology,
            )

        return post_processed_res

    def preproc_parser_input(self, parser_input: ParserInput) -> PreprocParserInput:
        return preproc_parser_input(parser_input)

    def process_parser_input(
        self,
        parser_input: ParserInput,
        active_list: List[str] = None,
    ):
        preproc_input = self.preproc_parser_input(parser_input)
        post = preproc_input.post_to_parse
        res = self.process_ref_post(
            post,
            active_list=active_list,
            unprocessed_urls=preproc_input.unparsed_urls,
        )
        return res

    def batch_process_parser_inputs(
        self,
        inputs: List[ParserInput],
        batch_size: int = 5,
        active_list: List[str] = None,
    ):
        preproc_inputs = [self.preproc_parser_input(p) for p in inputs]
        posts_batch, batch_unprocessed_urls = zip(*[
            (p.post_to_parse, p.unparsed_urls) for p in preproc_inputs
        ])
        res = self.batch_process_ref_posts(
            posts_batch,
            batch_size,
            active_list,
            batch_unprocessed_urls,
        )

        return res

    def process_ref_post(
        self,
        post: RefPost,
        active_list: List[str] = None,
        unprocessed_urls: List[str] = None,
    ):
        if unprocessed_urls is None:
            unprocessed_urls = []

        md_dict = extract_posts_ref_metadata_dict(
            [post],
            self.config.metadata_extract_config.extraction_method,
        )
        # if no filter specified, run all chains
        if active_list is None:
            active_list = list(self.pparsers.keys())
        logger.debug(f"Processing post with parsers: {active_list}")

        logger.debug("Instantiating prompts...")
        inst_prompts = self.instantiate_prompts(post, md_dict, active_list)

        parallel_chain = self.create_parallel_chain(active_list)

        logger.debug("Invoking parallel chain...")
        res = parallel_chain.invoke(inst_prompts)

        post_processed_res = self.post_process_raw_results(
            post,
            inst_prompts,
            res,
            md_dict,
            self.ontology,
            self.config.post_process_type,
            unprocessed_urls,
        )

        return post_processed_res

    def process_text(self, text: str, active_list: List[str] = None):
        ref_post: RefPost = convert_text_to_ref_post(text)
        return self.process_ref_post(ref_post, active_list)

    def batch_process_ref_posts(
        self,
        inputs: List[RefPost],
        batch_size: int = 5,
        active_list: List[str] = None,
        batch_unprocessed_urls: List[List[str]] = None,
    ) -> Dict:
        """Batch process a list of RefPosts.

        Args:
            inputs (List[RefPost]): input RefPosts.
            batch_size (int): maximum number of concurrent calls to make. Defaults to 5.

        Returns:
            List[Dict]: list of processed results
        """
        if batch_unprocessed_urls is None:
            batch_unprocessed_urls = [[] for _ in len(inputs)]
            
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
        total_iterations = len(inputs) * len(
            active_list
        )  # number of parsers * total inputs
        cb = BatchCallback(total_iterations)  # init callback
        config = RunnableConfig(max_concurrency=batch_size, callbacks=[cb])
        parallel_chain = self.create_parallel_chain(active_list)

        logger.debug("Invoking parallel chain...")

        results = asyncio.run(
            parallel_chain.abatch(
                inst_prompts,
                config=config,
            )
        )
        cb.progress_bar.close()

        # post processing results
        logger.debug(f"Post processing {len(results)} results...")
        post_processed_results = []
        for post, result, prompts_dict, unproc_urls in zip(
            inputs,
            results,
            inst_prompts,
            batch_unprocessed_urls,
        ):
            post_processed_res = self.post_process_raw_results(
                post,
                prompts_dict,
                result,
                md_dict,
                self.ontology,
                self.config.post_process_type,
                unproc_urls,
            )
            post_processed_results.append(post_processed_res)

        logger.debug("Done!")

        return post_processed_results
