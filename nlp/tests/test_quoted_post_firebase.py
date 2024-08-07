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
from desci_sense.shared_functions.interface import (RDFTriplet, QuotedPostDefinition,)
from desci_sense.shared_functions.preprocessing import ParserInput
from desci_sense.shared_functions.filters import SciFilterClassfication

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


def test_thread_quoted_url():
    thread = get_thread_1()
    pi_1 = ParserInput(thread_post=thread, max_posts=30)
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
    assert res.quoted_post_url == thread.quoted_url
    assert thread.quoted_url == 'https://x.com/FDAadcomms/status/1798104612635070611'
    

def test_firebase_quoted_post_pp():
    thread = get_thread_1()
    pi_1 = ParserInput(thread_post=thread, max_posts=30)
    multi_config = MultiParserChainConfig(
        parser_configs=[
            MultiRefTaggerChainConfig(
                name="multi_ref_tagger",
                llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
                post_renderer=PostRendererType.THREAD_REF_POST,
            )
        ],
        post_process_type=PostProcessType.FIREBASE,
        metadata_extract_config=MetadataExtractionConfig(extraction_method="citoid"),
    )
    mcp = MultiChainParser(multi_config)
    res = mcp.process_parser_input(pi_1)
    expected = RDFTriplet(
            predicate=URIRef(QuotedPostDefinition().uri),
            object=URIRef("https://x.com/FDAadcomms/status/1798104612635070611"),
        )
    assert (expected.subject, expected.predicate, expected.object) in res.semantics
    

# "mistralai/mixtral-8x7b-instruct"
# "mistralai/mistral-7b-instruct:free"
# "google/gemma-7b-it"
if __name__ == "__main__":
    thread = get_thread_1()
    pi_1 = ParserInput(thread_post=thread, max_posts=30)
    multi_config = MultiParserChainConfig(
        parser_configs=[
            MultiRefTaggerChainConfig(
                name="multi_ref_tagger",
                llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
                post_renderer=PostRendererType.THREAD_REF_POST,
            )
        ],
        post_process_type=PostProcessType.FIREBASE,
        metadata_extract_config=MetadataExtractionConfig(extraction_method="citoid"),
    )
    mcp = MultiChainParser(multi_config)
    res = mcp.process_parser_input(pi_1)

    
    

