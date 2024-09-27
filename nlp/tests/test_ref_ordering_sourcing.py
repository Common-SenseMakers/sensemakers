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
import rdflib
from rdflib import URIRef, Literal
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
from desci_sense.shared_functions.interface import (
    RDFTriplet,
)
from desci_sense.shared_functions.web_extractors.metadata_extractors import (
    RefMetadata,
    extract_metadata_by_type,
    extract_all_metadata_by_type,
    extract_posts_ref_metadata_dict,
    set_metadata_extraction_type,
    get_ref_post_metadata_list,
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
from desci_sense.shared_functions.postprocessing import (
    add_ref_source_info,
    add_quote_post_ref_links,
)


def test_ref_sourcing_simple():
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

    md_dict = extract_posts_ref_metadata_dict(
        [thread],
        mcp.config.metadata_extract_config.extraction_method,
    )
    md_dict = add_ref_source_info(thread, md_dict)
    assert (
        md_dict[
            "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0305178"
        ].ref_source_url
        == "https://x.com/steve_hanke/status/1828175588051607944"
    )
    assert (
        md_dict["https://x.com/steve_hanke/status/1828175588051607944"].ref_source_url
        == "https://x.com/MetacogniShane/status/1828491803387121797"
    )


def test_ref_sourcing_ordering_long():
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

    md_dict = extract_posts_ref_metadata_dict(
        [thread],
        mcp.config.metadata_extract_config.extraction_method,
    )

    md_dict = add_ref_source_info(thread, md_dict)

    assert (
        md_dict["https://aclanthology.org/2023.ranlp-1.101.pdf"].ref_source_url
        == "https://x.com/LChoshen/status/1794050592685379666"
    )
    assert (
        md_dict["https://aclanthology.org/2024.lrec-main.464.pdf"].ref_source_url
        == "https://x.com/LChoshen/status/1794050592685379666"
    )
    assert (
        md_dict["https://arxiv.org/abs/2311.08886"].ref_source_url
        == "https://x.com/LChoshen/status/1732938491045245101"
    )
    assert (
        md_dict["https://arxiv.org/abs/2311.02265"].ref_source_url
        == "https://x.com/LChoshen/status/1732938491045245101"
    )

    md_list = get_ref_post_metadata_list(thread, md_dict, add_ordering=True)

    # ordering test
    assert [md.url for md in md_list] == [
        "https://arxiv.org/abs/2311.02265",
        "https://arxiv.org/abs/2311.08886",
        "https://x.com/LChoshen/status/1794050592685379666",
        "https://aclanthology.org/2024.lrec-main.464.pdf",
        "https://aclanthology.org/2023.ranlp-1.101.pdf",
    ]
    

    trips = add_quote_post_ref_links(thread.url, md_list, mcp.ontology)
    
    expected = [RDFTriplet(subject=rdflib.term.URIRef('https://x.com/LChoshen/status/1794050592685379666'), predicate=rdflib.term.URIRef('http://purl.org/spar/cito/linksTo'), object=rdflib.term.URIRef('https://aclanthology.org/2024.lrec-main.464.pdf')),
     RDFTriplet(subject=rdflib.term.URIRef('https://x.com/LChoshen/status/1794050592685379666'), predicate=rdflib.term.URIRef('http://purl.org/spar/cito/linksTo'), object=rdflib.term.URIRef('https://aclanthology.org/2023.ranlp-1.101.pdf'))]
    
    assert len(trips) == 2
    for t in expected:
        assert t in trips
    
    
def test_no_refs():
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
    thread = get_short_thread()

    md_dict = extract_posts_ref_metadata_dict(
        [thread],
        mcp.config.metadata_extract_config.extraction_method,
    )

    md_dict = add_ref_source_info(thread, md_dict)

    md_list = get_ref_post_metadata_list(thread, md_dict, add_ordering=True)

    trips = add_quote_post_ref_links(thread.url, md_list, mcp.ontology)
    assert trips == []
    

def test_single_qt():
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

    md_dict = extract_posts_ref_metadata_dict(
        [thread],
        mcp.config.metadata_extract_config.extraction_method,
    )

    md_dict = add_ref_source_info(thread, md_dict)

    md_list = get_ref_post_metadata_list(thread, md_dict, add_ordering=True)

    trips = add_quote_post_ref_links(thread.url, md_list, mcp.ontology)
    
    expected = [RDFTriplet(subject=rdflib.term.URIRef('https://x.com/steve_hanke/status/1828175588051607944'), predicate=rdflib.term.URIRef('http://purl.org/spar/cito/linksTo'), object=rdflib.term.URIRef('https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0305178'))]
    
    assert trips == expected
    

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
    thread = get_thread_w_qt_refs()

    md_dict = extract_posts_ref_metadata_dict(
        [thread],
        mcp.config.metadata_extract_config.extraction_method,
    )

    md_dict = add_ref_source_info(thread, md_dict)

    md_list = get_ref_post_metadata_list(thread, md_dict, add_ordering=True)

    trips = add_quote_post_ref_links(thread.url, md_list, mcp.ontology)
    
    expected = [RDFTriplet(subject=rdflib.term.URIRef('https://x.com/steve_hanke/status/1828175588051607944'), predicate=rdflib.term.URIRef('http://purl.org/spar/cito/linksTo'), object=rdflib.term.URIRef('https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0305178'))]
    
    assert trips == expected
    
