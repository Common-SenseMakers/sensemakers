import pytest
import sys
from pathlib import Path
import logging


ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

# https://stackoverflow.com/a/63539722/2882125
import nest_asyncio

nest_asyncio.apply()

from desci_sense.shared_functions.dataloaders import scrape_post
from desci_sense.shared_functions.web_extractors.metadata_extractors import (
    extract_posts_ref_metadata_dict,
    get_ref_post_metadata_list,
    RefMetadata,
)
from desci_sense.shared_functions.prompting.post_renderers import RefPostRenderer
import desci_sense.shared_functions.prompting.post_renderers as postr
from desci_sense.shared_functions.configs import MetadataExtractionType
from desci_sense.shared_functions.dataloaders import (
    scrape_post,
    convert_text_to_ref_post,
)
from test_utils import unidiff_output
from desci_sense.shared_functions.preprocessing.threads import create_thread_from_posts
from desci_sense.shared_functions.parsers.multi_reference_tagger import normalize_labels
from desci_sense.shared_functions.postprocessing import Answer, SubAnswer
from utils import create_multi_chain_for_tests, create_multi_config_for_tests
from desci_sense.shared_functions.parsers.multi_chain_parser import MultiChainParser
from desci_sense.shared_functions.schema.ontology_base import OntologyBase
from desci_sense.shared_functions.configs import (
    OpenrouterAPIConfig,
    WandbConfig,
    LLMConfig,
    KeywordPParserChainConfig,
    RefTaggerChainConfig,
    TopicsPParserChainConfig,
    validate_env_var,
    MetadataExtractionConfig,
    MultiParserChainConfig,
    MultiRefTaggerChainConfig,
    ParserChainType,
    PostProcessType,
    PostRendererType,
)  # Adjust the import as necessary
from desci_sense.shared_functions.dataloaders import (
    scrape_post,
    convert_text_to_ref_post,
)
from desci_sense.shared_functions.parsers.multi_reference_tagger import normalize_labels
from desci_sense.shared_functions.postprocessing import Answer, SubAnswer

def get_thread_1():
    thread_urls = [
        "https://x.com/EikoFried/status/1798166869574398271",
        "https://x.com/EikoFried/status/1798167612175913332",
        "https://x.com/EikoFried/status/1798170515817013679",
        "https://x.com/EikoFried/status/1798170610314715569",
        "https://x.com/EikoFried/status/1798171316375445681",
    ]
    thread_posts = [scrape_post(url) for url in thread_urls]
    thread_post = create_thread_from_posts(thread_posts)
    return thread_post
RENDER_QT_MD_1_TARGET = """- References: 
<ref_1> 
url: https://x.com/biorxiv_neursci/status/1798962015148576815
item_type: forumPost
title: twitter post
summary: None
==========
<ref_2> 
url: https://www.biorxiv.org/content/10.1101/2024.06.05.597547v1
item_type: preprint
title: Replay of procedural experience is independent of the hippocampus
summary: Sleep is critical for consolidating all forms of memory1-3, from episodic experience to the development of motor skills4-6. A core feature of the consolidation process is offline replay of neuronal firing patterns that occur during experience7,8. This replay is thought to originate in the hippocampus and trigger the reactivation of ensembles of cortical and subcortical neurons1,3,9-18. However, non-declarative memories do not require the hippocampus for learning or for sleep-dependent consolidat"""

RENDER_QUOTE_TWEET_2_TARGET = """- Content: New preprint from the lab! 🚨

Replay of procedural experience occurs in the striatum and is independent of the hippocampus.

Heroic effort by @EmmettJThompson & the rest of the team @_JasvinKaur, @_GeorginaMills, @dorrell_will, @ClementineDomi6, @TomNotGeorge 

🧵👇1/13 <quoted ref_1>Replay of procedural experience is independent of the hippocampus  <ref_2> #biorxiv_neursci</quote>"""

RENDER_QUOTE_TWEET_TRCUNCATED_TARGET = """- Content: New preprint from the lab! 🚨

Replay of procedural experience occurs in the striatum and is independent of the hippocampus.

Heroic effort by @EmmettJThompson & the rest of the team @_JasvinKaur, @_GeorginaMills, @dorrell_will, @ClementineDomi6, @TomNotGeorge 

🧵👇1/13 <quoted ref_1>Replay of procedural experience is independent of </quote>"""

THREAD_QUOTE_TEST_TARGET = """- Content: After careful consideration, the FDA advisory comission voted today 9:2 that MDMA has *not* been shown to be effective for treating PTSD, given massive concerns around validity threats in this literature. They also voted 10:1 that MDMA has *not* shown to be safe. <quoted ref_1>@eturnermd1 #MDMAadcomm VOTE 1/2: Do the available</quote>
---
📄Many mentioned reasons overlap with those we summarized recently in our review paper: 
<ref_2>

📺 I also summarize them for a lay audience in this YouTube video: 
<ref_3>
---
Some pretty wild things in the meeting honestly, thanks to @eturnermd1 for live tweeting.

Eg folks who were paid by the sponsor (big pharma) to speak on behalf of the product to be marketed did *not* have to declare they were being paid.
---
@eturnermd1 Here is the full thread:
---
@eturnermd1 Here the second vote on benefits and risks: <quoted ref_4>@eturnermd1 #MDMAadcomm VOTE 2/2: Do the benefits </quote>
- References: 
<ref_1> 
url: https://x.com/FDAadcomms/status/1798104612635070611
item_type: forumPost
title: twitter post
summary: None
==========
<ref_2> 
url: https://journals.sagepub.com/doi/10.1177/20451253231198466
item_type: journalArticle
title: History repeating: guidelines to address common problems in psychedelic science
summary: Research in the last decade has expressed considerable optimism about the clinical potential of psychedelics for the treatment of mental disorders. This optimism is reflected in an increase in research papers, investments by pharmaceutical companies, patents, media coverage, as well as political and legislative changes. However, psychedelic science is facing serious challenges that threaten the validity of core findings and raise doubt regarding clinical efficacy and safety. In this paper, we in
==========
<ref_3> 
url: https://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E
item_type: videoRecording
title: Psychedelic treatments for mental health problems: promises and pitfalls
summary: In this lecture, I summarize promises and pitfalls of psychedelic treatments for mental health problems. No scientific background knowledge is required to vi...
==========
<ref_4> 
url: https://x.com/FDAadcomms/status/1798107142219796794
item_type: forumPost
title: twitter post
summary: None
=========="""

THREAD_TEST_TARGET = """
# Input post text:

- Author: Eiko Fried
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
---
Some pretty wild things in the meeting honestly, thanks to @eturnermd1 for live tweeting.

Eg folks who were paid by the sponsor (big pharma) to speak on behalf of the product to be marketed did *not* have to declare they were being paid.
---
@eturnermd1 Here is the full thread:
---
@eturnermd1 Here the second vote on benefits and risks: <quoted ref_4>@eturnermd1 #MDMAadcomm VOTE 2/2: Do the benefits of midomafetamine with FDA’s proposed risk evaluation and mitigation strategy (REMS) outweigh its risks for the treatment of patients with PTSD?
1-Yes
10-No
0-Abstain https://twitter.com/FDAadcomms/status/1798107142219796794/photo/1</quote>
- References: 
<ref_1> 
url: https://x.com/FDAadcomms/status/1798104612635070611
item_type: forumPost
title: twitter post
summary: None
==========
<ref_2> 
url: https://journals.sagepub.com/doi/10.1177/20451253231198466
item_type: journalArticle
title: History repeating: guidelines to address common problems in psychedelic science
summary: Research in the last decade has expressed considerable optimism about the clinical potential of psychedelics for the treatment of mental disorders. This optimism is reflected in an increase in research papers, investments by pharmaceutical companies, patents, media coverage, as well as political and legislative changes. However, psychedelic science is facing serious challenges that threaten the validity of core findings and raise doubt regarding clinical efficacy and safety. In this paper, we in
==========
<ref_3> 
url: https://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E
item_type: videoRecording
title: Psychedelic treatments for mental health problems: promises and pitfalls
summary: In this lecture, I summarize promises and pitfalls of psychedelic treatments for mental health problems. No scientific background knowledge is required to vi...
==========
<ref_4> 
url: https://x.com/FDAadcomms/status/1798107142219796794
item_type: forumPost
title: twitter post
summary: None
==========
"""


def test_quote_post_render_multi_ref(caplog):
    caplog.set_level(logging.INFO)
    logger = logging.getLogger(__name__)
    tweet_url = "https://x.com/StephensonJones/status/1799035911042482210"
    quote_ref_post = scrape_post(tweet_url)
    multi_config = MultiParserChainConfig(
        parser_configs=[
            MultiRefTaggerChainConfig(
                name="multi_ref_tagger",
                llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
                post_renderer=PostRendererType.QUOTE_REF_POST,
            )
        ],
        metadata_extract_config=MetadataExtractionConfig(extraction_method="citoid"),
    )
    mcp = MultiChainParser(multi_config)
    md_dict = extract_posts_ref_metadata_dict([quote_ref_post])
    prompt = mcp.instantiate_prompts(quote_ref_post, md_dict)
    prompt_str = prompt["multi_ref_tagger_input"]
    #logger.info(f"Prompt is: {prompt_str}")
    assert RENDER_QUOTE_TWEET_2_TARGET in prompt_str
    assert RENDER_QT_MD_1_TARGET in prompt_str
    assert postr.quote_ref_post_renderer.MULTI_REF_INSTRUCTIONS in prompt_str

def test_quote_post_truncation():
    tweet_url = "https://x.com/StephensonJones/status/1799035911042482210"
    quote_ref_post = scrape_post(tweet_url)

    # Configure the Keyword Parser

    multi_config = MultiParserChainConfig(
        parser_configs=[
            KeywordPParserChainConfig(
                name="keyword_parser",
                llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
                quoted_context_length=50,
                post_renderer=PostRendererType.THREAD_REF_POST,
            )
        ],
        metadata_extract_config=MetadataExtractionConfig(extraction_method="citoid"),
    )

    mcp = MultiChainParser(multi_config)
    md_dict = extract_posts_ref_metadata_dict([quote_ref_post])
    prompt = mcp.instantiate_prompts(quote_ref_post, md_dict)
    prompt_str = prompt["keyword_parser_input"]

    # Expected truncated result
    expected_truncated = (
        RENDER_QUOTE_TWEET_TRCUNCATED_TARGET
    )

    # Assertion for truncation
    assert expected_truncated in prompt_str, f"Truncation failed. Got: {prompt_str}"

def test_thread_quote_post_truncation():
    thread = get_thread_1()
    # Configure the Keyword Parser

    multi_config = MultiParserChainConfig(
        parser_configs=[
            KeywordPParserChainConfig(
                name="keyword_parser",
                llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
                quoted_context_length=50,
                post_renderer=PostRendererType.THREAD_REF_POST,
            )
        ],
        metadata_extract_config=MetadataExtractionConfig(extraction_method="citoid"),
    )

    mcp = MultiChainParser(multi_config)
    md_dict = extract_posts_ref_metadata_dict([thread])
    prompt = mcp.instantiate_prompts(thread, md_dict)
    prompt_str = prompt["keyword_parser_input"]

    # Expected truncated result
    expected_truncated = (
        THREAD_QUOTE_TEST_TARGET
    )

    # Assertion for truncation
    assert expected_truncated in prompt_str, f"Truncation failed. Got: {prompt_str}"

def test_thread_render_MuliRef():
    thread_post = get_thread_1()
    multi_config = MultiParserChainConfig(
        parser_configs=[
            MultiRefTaggerChainConfig(
                name="multi_ref_tagger",
                llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
                post_renderer=PostRendererType.THREAD_REF_POST,
            )
        ],
        metadata_extract_config=MetadataExtractionConfig(extraction_method="citoid"),
    )
    mcp = MultiChainParser(multi_config)
    md_dict = extract_posts_ref_metadata_dict([thread_post])
    prompt = mcp.instantiate_prompts(thread_post, md_dict)
    prompt_str = prompt["multi_ref_tagger_input"]
    assert THREAD_TEST_TARGET in prompt_str, f"Prompt failed. Got: {prompt_str}"


if __name__ == "__main__":
    pytest.main([__file__])
