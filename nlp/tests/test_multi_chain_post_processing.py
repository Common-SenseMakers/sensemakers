import sys
from pathlib import Path

# https://stackoverflow.com/a/63539722/2882125
import nest_asyncio

nest_asyncio.apply()

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))
import os
import pytest
from pydantic import ValidationError
from rdflib import URIRef, Literal, Graph
from utils import create_multi_chain_for_tests, create_multi_config_for_tests
from desci_sense.shared_functions.parsers.multi_chain_parser import MultiChainParser
from desci_sense.shared_functions.filters import SciFilterClassfication
from desci_sense.shared_functions.configs import (
    OpenrouterAPIConfig,
    WandbConfig,
    LLMConfig,
    KeywordPParserChainConfig,
    RefTaggerChainConfig,
    TopicsPParserChainConfig,
    validate_env_var,
    MultiParserChainConfig,
    ParserChainType,
    PostProcessType,
)  # Adjust the import as necessary
from desci_sense.shared_functions.postprocessing import (
    convert_item_types_to_rdf_triplets,
)
from desci_sense.shared_functions.dataloaders import (
    scrape_post,
    convert_text_to_ref_post,
)
from desci_sense.shared_functions.interface import (
    RDFTriplet,
    ZoteroItemTypeDefinition,
)

TEST_POST_TEXT_W_REF = """
I really liked this paper!
https://arxiv.org/abs/2402.04607
"""

TEST_POST_TEXT_W_2_REF = """
I really liked these two papers!
https://arxiv.org/abs/2402.04607

https://arxiv.org/abs/2401.14000
"""


def test_combined_pp():
    multi_config = create_multi_config_for_tests()
    multi_config.post_process_type = PostProcessType.COMBINED
    mcp = MultiChainParser(multi_config)
    res = mcp.process_text(TEST_POST_TEXT_W_REF)
    assert res.item_types == ["preprint"]
    assert len(res.keywords) > 0
    assert len(res.metadata_list) == 1
    assert res.filter_classification == SciFilterClassfication.CITOID_DETECTED_RESEARCH
    assert res.metadata_list[0].order == 1
    

def test_combined_2_pp():
    multi_config = create_multi_config_for_tests()
    multi_config.post_process_type = PostProcessType.COMBINED
    mcp = MultiChainParser(multi_config)
    res = mcp.process_text(TEST_POST_TEXT_W_2_REF)
    assert res.item_types == ["preprint", "conferencePaper"]
    assert len(res.keywords) > 0
    assert len(res.metadata_list) == 2
    assert res.filter_classification == SciFilterClassfication.CITOID_DETECTED_RESEARCH
    assert res.metadata_list[0].order == 1
    assert res.metadata_list[0].url == "https://arxiv.org/abs/2402.04607"
    assert res.metadata_list[1].order == 2
    assert res.metadata_list[1].url == "https://arxiv.org/abs/2401.14000"

def test_firebase_pp():
    multi_config = create_multi_config_for_tests()
    multi_config.post_process_type = PostProcessType.FIREBASE
    mcp = MultiChainParser(multi_config)
    res = mcp.process_text(TEST_POST_TEXT_W_REF)
    len(res.support.refs_meta) == 1
    assert res.filter_classification == SciFilterClassfication.CITOID_DETECTED_RESEARCH
    # check item types
    expected = [
        RDFTriplet(
            subject=URIRef("https://arxiv.org/abs/2402.04607"),
            predicate=URIRef(ZoteroItemTypeDefinition().uri),
            object=Literal("preprint"),
        ),
    ]
    for triplet in expected:
        assert (triplet.subject, triplet.predicate, triplet.object) in res.semantics


def test_multi_chain_batch_pp_simple():
    # get a few posts for input
    urls = [
        "https://mastodon.social/@psmaldino@qoto.org/111405098400404613",
        "https://mastodon.social/@UlrikeHahn@fediscience.org/111732713776994953",
        "https://mastodon.social/@ronent/111687038322549430",
    ]
    posts = [scrape_post(url) for url in urls]
    multi_chain_parser = create_multi_chain_for_tests()
    multi_chain_parser.config.post_process_type == PostProcessType.NONE
    res = multi_chain_parser.batch_process_ref_posts(posts)

    assert len(res) == 3


def test_multi_chain_batch_pp_combined():
    # get a few posts for input
    urls = [
        "https://mastodon.social/@psmaldino@qoto.org/111405098400404613",
        "https://mastodon.social/@UlrikeHahn@fediscience.org/111732713776994953",
        "https://mastodon.social/@ronent/111687038322549430",
    ]
    posts = [scrape_post(url) for url in urls]
    multi_config = create_multi_config_for_tests(llm_type="google/gemma-7b-it:free")
    multi_chain_parser = MultiChainParser(multi_config)
    multi_chain_parser.config.post_process_type = PostProcessType.COMBINED
    res = multi_chain_parser.batch_process_ref_posts(posts)

    out_0 = res[0]
    assert (
        out_0.metadata_list[0].url
        == "https://royalsocietypublishing.org/doi/10.1098/rstb.2022.0267"
    )
    assert len(out_0.metadata_list) == 1
    assert out_0.metadata_list[0].order == 1

    out_1 = res[1]
    assert len(out_1.metadata_list) == 1
    assert (
        out_1.metadata_list[0].url
        == "https://write.as/ulrikehahn/some-thoughts-on-social-media-for-science"
    )
    assert out_1.metadata_list[0].order == 1

    out_2 = res[2]
    assert len(out_2.metadata_list) == 2
    
    # ordering not preserved yet for masto so don't test that yet
    assert set(out_2.reference_urls) == set(
        [
            "https://paragraph.xyz/@sense-nets/sense-nets-intro",
            "https://paragraph.xyz/@sense-nets/2-project-plan",
        ]
    )
    
    


def test_convert_item_types_to_rdf_triplets_single_entry():
    item_types = ["preprint"]
    reference_urls = ["https://arxiv.org/abs/2402.04607"]
    result = convert_item_types_to_rdf_triplets(item_types, reference_urls)

    expected = [
        RDFTriplet(
            subject=URIRef("https://arxiv.org/abs/2402.04607"),
            predicate=URIRef(ZoteroItemTypeDefinition().uri),
            object=Literal("preprint"),
        )
    ]

    assert len(result) == len(expected)
    for res, exp in zip(result, expected):
        assert res.subject == exp.subject
        assert res.predicate == exp.predicate
        assert res.object == exp.object


def test_convert_item_types_to_rdf_triplets_multiple_entries():
    item_types = ["journalArticle", "book"]
    reference_urls = ["https://example.com/article1", "https://example.com/book1"]
    result = convert_item_types_to_rdf_triplets(item_types, reference_urls)

    expected = [
        RDFTriplet(
            subject=URIRef("https://example.com/article1"),
            predicate=URIRef(ZoteroItemTypeDefinition().uri),
            object=Literal("journalArticle"),
        ),
        RDFTriplet(
            subject=URIRef("https://example.com/book1"),
            predicate=URIRef(ZoteroItemTypeDefinition().uri),
            object=Literal("book"),
        ),
    ]

    assert len(result) == len(expected)
    for res, exp in zip(result, expected):
        assert res.subject == exp.subject
        assert res.predicate == exp.predicate
        assert res.object == exp.object


def test_convert_item_types_to_rdf_triplets_empty():
    item_types = []
    reference_urls = []
    result = convert_item_types_to_rdf_triplets(item_types, reference_urls)
    assert result == []


def test_convert_item_types_to_rdf_triplets_mismatched_lengths():
    item_types = ["preprint", "book"]
    reference_urls = ["https://arxiv.org/abs/2402.04607"]

    with pytest.raises(AssertionError):
        convert_item_types_to_rdf_triplets(item_types, reference_urls)

def test_short_post_no_ref_i146():
    multi_config = create_multi_config_for_tests()
    multi_config.post_process_type = PostProcessType.FIREBASE
    mcp = MultiChainParser(multi_config)
    res = mcp.process_text("yup")
    assert URIRef('https://sense-nets.xyz/mySemanticPost') in res.semantics.all_nodes()
    

if __name__ == "__main__":
    # get a few posts for input
    urls = [
        "https://mastodon.social/@psmaldino@qoto.org/111405098400404613",
        "https://mastodon.social/@UlrikeHahn@fediscience.org/111732713776994953",
        "https://mastodon.social/@ronent/111687038322549430",
    ]
    post = scrape_post(urls[2])
#     posts = [scrape_post(url) for url in urls]
#     multi_config = create_multi_config_for_tests(llm_type="google/gemma-7b-it:free")
#     multi_chain_parser = MultiChainParser(multi_config)
#     multi_chain_parser.config.post_process_type = PostProcessType.COMBINED
#     res = multi_chain_parser.batch_process_ref_posts(posts)

#     out_0 = res[0]
#     assert (
#         out_0.metadata_list[0].url
#         == "https://royalsocietypublishing.org/doi/10.1098/rstb.2022.0267"
#     )
#     assert len(out_0.metadata_list) == 1
#     assert out_0.metadata_list[0].order == 1

#     out_1 = res[1]
#     assert len(out_1.metadata_list) == 1
#     assert (
#         out_1.metadata_list[0].url
#         == "https://write.as/ulrikehahn/some-thoughts-on-social-media-for-science"
#     )
#     assert out_1.metadata_list[0].order == 1

#     out_2 = res[2]
#     assert len(out_2.metadata_list) == 2
#     assert set(out_2.reference_urls) == set(
#         [
#             "https://paragraph.xyz/@sense-nets/sense-nets-intro",
#             "https://paragraph.xyz/@sense-nets/2-project-plan",
#         ]
#     )
    
#     sorted_refs = sorted(
#     out_2.metadata_list,
#     key=lambda x: x.order,
# )
#     assert sorted_refs[0].url == "https://paragraph.xyz/@sense-nets/sense-nets-intro"
#     assert sorted_refs[1].url == "https://paragraph.xyz/@sense-nets/2-project-plan"
