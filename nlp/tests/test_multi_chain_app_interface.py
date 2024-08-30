import sys
from pathlib import Path

# https://stackoverflow.com/a/63539722/2882125
import nest_asyncio

nest_asyncio.apply()

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))
import os
import pytest
from pydantic import ValidationError, BaseModel
from rdflib import URIRef, Literal, Graph

from utils import (
    create_multi_chain_for_tests,
    create_multi_config_for_tests,
    get_thread_1,
    no_empty_lists,
    create_post_request,
    get_thread_single_quote_post,
    check_uris_in_graph,
    get_short_thread,
    get_thread_w_qt_refs,
    get_long_thread_w_qt_refs,
)

from desci_sense.shared_functions.schema.post import ThreadRefPost, QuoteRefPost
from desci_sense.shared_functions.parsers.multi_chain_parser import MultiChainParser
from desci_sense.shared_functions.configs import (
    OpenrouterAPIConfig,
    WandbConfig,
    LLMConfig,
    MultiRefTaggerChainConfig,
    KeywordPParserChainConfig,
    RefTaggerChainConfig,
    TopicsPParserChainConfig,
    validate_env_var,
    MultiParserChainConfig,
    ParserChainType,
    PostProcessType,
    PostRendererType,
    MetadataExtractionConfig,
)  # Adjust the import as necessary
from desci_sense.shared_functions.dataloaders import (
    scrape_post,
    convert_text_to_ref_post,
)
from desci_sense.shared_functions.preprocessing import ParserInput
from desci_sense.shared_functions.filters import SciFilterClassfication
from desci_sense.shared_functions.init import init_multi_chain_parser_config
from desci_sense.shared_functions.interface import (
    RDFTriplet,
    ZoteroItemTypeDefinition,
)

TEST_POST_TEXT_W_REF = """
I really liked this paper!
https://arxiv.org/abs/2402.04607
"""

TARGET_THREAD_RENDER = """- Author: Eiko Fried
- Content: After careful consideration, the FDA advisory comission voted today 9:2 that MDMA has *not* been shown to be effective for treating PTSD, given massive concerns around validity threats in this literature. They also voted 10:1 that MDMA has *not* shown to be safe. <quoted ref_1>@eturnermd1 #MDMAadcomm VOTE 1/2: Do the available data show that the drug is effective in patients with posttraumatic
stress disorder?
2-Yes
9-No
0-Abstain https://twitter.com/FDAadcomms/status/1798104612635070611/photo/1</quote>
---
📄Many mentioned reasons overlap with those we summarized recently in our review paper: 
<ref_2>

📺 I also summarize them for a lay audience in this YouTube video: 
<ref_3>
- References: 
<ref_1> 
url: https://x.com/FDAadcomms/status/1798104612635070611
item_type: forumPost
title: Twitter post
summary: None
==========
<ref_2> 
url: https://journals.sagepub.com/doi/10.1177/20451253231198466
item_type: journalArticle
title: History repeating: guidelines to address common problems in psychedelic science
summary: None
==========
<ref_3> 
url: https://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E
item_type: videoRecording
title: Psychedelic treatments for mental health problems: promises and pitfalls
summary: In this lecture, I summarize promises and pitfalls of psychedelic treatments for mental health problems. No scientific background knowledge is required to vi...
=========="""


def test_thread_trim():
    multi_config = MultiParserChainConfig(
        parser_configs=[
            MultiRefTaggerChainConfig(
                name="multi_ref_tagger",
                llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
                post_renderer=PostRendererType.THREAD_REF_POST,
            )
        ],
        post_process_type=PostProcessType.COMBINED,
        metadata_extract_config=MetadataExtractionConfig(extraction_method="citoid"),
    )
    mcp = MultiChainParser(multi_config)
    thread = get_thread_1()
    pi = ParserInput(thread_post=thread, max_posts=2)
    res = mcp.process_parser_input(pi)
    assert res.reference_urls == [
        "https://x.com/FDAadcomms/status/1798104612635070611",
        "https://journals.sagepub.com/doi/10.1177/20451253231198466",
        "https://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E",
        "https://x.com/eturnermd1/status/1798046087737180395",
        "https://x.com/FDAadcomms/status/1798107142219796794",
    ]
    assert len(res.multi_reference_tagger) == 5
    assert res.multi_reference_tagger[3:] == [["default"], ["default"]]
    # assert TARGET_THREAD_RENDER in res.debug["multi_reference_tagger"]["prompt"]
    assert no_empty_lists(res.multi_reference_tagger)


# def test_batch():
#     multi_config = MultiParserChainConfig(
#         parser_configs=[
#             MultiRefTaggerChainConfig(
#                 name="multi_ref_tagger",
#                 llm_config=LLMConfig(llm_type="google/gemma-7b-it"),
#                 post_renderer=PostRendererType.THREAD_REF_POST,
#             )
#         ],
#         post_process_type=PostProcessType.COMBINED,
#         metadata_extract_config=MetadataExtractionConfig(extraction_method="citoid"),
#     )
#     mcp = MultiChainParser(multi_config)
#     thread = get_thread_1()
#     pi_1 = ParserInput(thread_post=thread, max_posts=1)
#     pi_2 = ParserInput(thread_post=thread, max_posts=3)
#     pi_3 = ParserInput(thread_post=thread, max_posts=4)
#     batch = [pi_1, pi_2, pi_3]
#     res = mcp.batch_process_parser_inputs(batch)
#     assert len(res[0].debug["multi_reference_tagger"]["reasoning"]) == 1
#     assert len(res[1].debug["multi_reference_tagger"]["reasoning"]) == 3
#     assert len(res[2].debug["multi_reference_tagger"]["reasoning"]) == 4
#     for result in res:
#         assert no_empty_lists(result.multi_reference_tagger)


def test_citoid_unprocessed_urls():
    """
    Tests that if a long thread contains a citoid url that gets trimmed out we we still
    classify this as CITOID detected research
    """
    thread = get_thread_1()
    pi_1 = ParserInput(thread_post=thread, max_posts=1)
    multi_config = MultiParserChainConfig(
        parser_configs=[
            MultiRefTaggerChainConfig(
                name="multi_ref_tagger",
                llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
                post_renderer=PostRendererType.THREAD_REF_POST,
            )
        ],
        post_process_type=PostProcessType.COMBINED,
        metadata_extract_config=MetadataExtractionConfig(extraction_method="citoid"),
    )
    mcp = MultiChainParser(multi_config)
    res = mcp.process_parser_input(pi_1)
    assert res.filter_classification == SciFilterClassfication.CITOID_DETECTED_RESEARCH


def test_app_config():
    multi_config = init_multi_chain_parser_config(
        ref_tagger_llm_type="mistralai/mistral-7b-instruct:free",
        kw_llm_type="mistralai/mistral-7b-instruct:free",
        topic_llm_type="mistralai/mistral-7b-instruct:free",
        post_process_type="firebase",
    )
    mcp = MultiChainParser(multi_config)
    thread = get_thread_1()
    pi = ParserInput(thread_post=thread, max_posts=30)
    res = mcp.process_parser_input(pi)
    expected_uris = [
        "https://x.com/FDAadcomms/status/1798104612635070611",
        "https://journals.sagepub.com/doi/10.1177/20451253231198466",
        "https://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E",
        "https://x.com/eturnermd1/status/1798046087737180395",
        "https://x.com/FDAadcomms/status/1798107142219796794",
    ]
    check_uris_in_graph(res.semantics, expected_uris)
    # check ordering
    for i, url in enumerate(expected_uris):
        assert res.support.refs_meta[url].order == i + 1
        assert res.support.refs_meta[url].url == url


def test_ordering_sourcing_pp_short():
    multi_config = init_multi_chain_parser_config(
        # ref_tagger_llm_type="mistralai/mistral-7b-instruct",
        # kw_llm_type="mistralai/mistral-7b-instruct",
        # topic_llm_type="mistralai/mistral-7b-instruct",
        ref_tagger_llm_type="mistralai/mistral-7b-instruct:free",
        kw_llm_type="mistralai/mistral-7b-instruct:free",
        topic_llm_type="mistralai/mistral-7b-instruct:free",
        post_process_type="firebase",
    )
    mcp = MultiChainParser(multi_config)
    thread = get_thread_w_qt_refs()
    pi = ParserInput(thread_post=thread, max_posts=30)
    res = mcp.process_parser_input(pi)
    sorted_refs = sorted(res.support.refs_meta.values(), key=lambda x: x.order)
    assert [md.url for md in sorted_refs] == [
        "https://x.com/steve_hanke/status/1828175588051607944",
        "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0305178",
    ]


def test_ordering_sourcing_pp_long():
    multi_config = init_multi_chain_parser_config(
        # ref_tagger_llm_type="mistralai/mistral-7b-instruct",
        # kw_llm_type="mistralai/mistral-7b-instruct",
        # topic_llm_type="mistralai/mistral-7b-instruct",
        ref_tagger_llm_type="mistralai/mistral-7b-instruct:free",
        kw_llm_type="mistralai/mistral-7b-instruct:free",
        topic_llm_type="mistralai/mistral-7b-instruct:free",
        post_process_type="firebase",
    )
    mcp = MultiChainParser(multi_config)
    thread = get_long_thread_w_qt_refs()
    pi = ParserInput(thread_post=thread, max_posts=30)
    res = mcp.process_parser_input(pi)
    sorted_refs = sorted(res.support.refs_meta.values(), key=lambda x: x.order)
    assert [md.url for md in sorted_refs] == [
        "https://arxiv.org/abs/2311.02265",
        "https://arxiv.org/abs/2311.08886",
        "https://x.com/LChoshen/status/1794050592685379666",
        "https://aclanthology.org/2024.lrec-main.464.pdf",
        "https://aclanthology.org/2023.ranlp-1.101.pdf",
    ]
    assert (
        res.support.refs_meta[
            "https://aclanthology.org/2024.lrec-main.464.pdf"
        ].ref_source_url
        == "https://x.com/LChoshen/status/1794050592685379666"
    )
    assert (
        res.support.refs_meta[
            "https://aclanthology.org/2023.ranlp-1.101.pdf"
        ].ref_source_url
        == "https://x.com/LChoshen/status/1794050592685379666"
    )


# "mistralai/mixtral-8x7b-instruct"
# "mistralai/mistral-7b-instruct:free"
# "google/gemma-7b-it"
if __name__ == "__main__":
    multi_config = init_multi_chain_parser_config(
        # ref_tagger_llm_type="mistralai/mistral-7b-instruct",
        # kw_llm_type="mistralai/mistral-7b-instruct",
        # topic_llm_type="mistralai/mistral-7b-instruct",
        ref_tagger_llm_type="mistralai/mistral-7b-instruct:free",
        kw_llm_type="mistralai/mistral-7b-instruct:free",
        topic_llm_type="mistralai/mistral-7b-instruct:free",
        post_process_type="firebase",
    )
    mcp = MultiChainParser(multi_config)
    thread = get_long_thread_w_qt_refs()
    pi = ParserInput(thread_post=thread, max_posts=30)
    res = mcp.process_parser_input(pi)
    sorted_refs = sorted(res.support.refs_meta.values(), key=lambda x: x.order)
    assert [md.url for md in sorted_refs] == [
        "https://arxiv.org/abs/2311.02265",
        "https://arxiv.org/abs/2311.08886",
        "https://x.com/LChoshen/status/1794050592685379666",
        "https://aclanthology.org/2024.lrec-main.464.pdf",
        "https://aclanthology.org/2023.ranlp-1.101.pdf",
    ]
    
    expected = [
        RDFTriplet(
            subject=URIRef("https://x.com/LChoshen/status/1794050592685379666"),
            predicate=URIRef(mcp.ontology_base.get_concept_by_label(mcp.ontology_base.default_mention_label()).uri),
            object=URIRef("https://aclanthology.org/2024.lrec-main.464.pdf"),
        ),
        RDFTriplet(
            subject=URIRef("https://x.com/LChoshen/status/1794050592685379666"),
            predicate=URIRef(mcp.ontology_base.get_concept_by_label(mcp.ontology_base.default_mention_label()).uri),
            object=URIRef("https://aclanthology.org/2023.ranlp-1.101.pdf"),
        ),
    ]
    
    
    
    
