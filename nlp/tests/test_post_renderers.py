import sys
from pathlib import Path

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
from utils import get_thread_1, get_thread_single_post
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


TEST_POST_TEXT_W_REF = """I really liked this paper!
https://arxiv.org/abs/2402.04607
"""

TEST_POST_TEXT_W_NO_REFS = """These 2 papers are highly recommended!
"""

TEST_POST_TEXT_W_2_REFS = """These 2 papers are highly recommended!
https://arxiv.org/abs/2402.04607
https://royalsocietypublishing.org/doi/10.1098/rstb.2022.0267
"""

RENDER_NO_REF_TEST_RESULT = """
- Author: Seeds of Science
- Content: Seeds of Science would like to announce the SoS Research Collective - a first-of-its-kind virtual organization for independent researchers (and academics thinking independently). See the announcement post for more info! 

https://www.theseedsofscience.pub/p/announcing-the-sos-research-collective
- References:
1: https://www.theseedsofscience.pub/p/announcing-the-sos-research-collective
Item type: webpage
Title: Announcing the SoS Research Collective
Summary: + offering paid subscriptions (author: Roger's Bacon)
------------------
"""

TARGET_RENDER_SINGLE_POST_THREAD = """- Author: bioRxiv Neuroscience
- Content: Replay of procedural experience is independent of the hippocampus  <ref_1> #biorxiv_neursci
- References: 
<ref_1> 
url: https://www.biorxiv.org/content/10.1101/2024.06.05.597547v1
item_type: preprint
title: Replay of procedural experience is independent of the hippocampus
summary: Sleep is critical for consolidating all forms of memory1-3, from episodic experience to the development of motor skills4-6. A core feature of the consolidation process is offline replay of neuronal firing patterns that occur during experience7,8. This replay is thought to originate in the hippocampus and trigger the reactivation of ensembles of cortical and subcortical neurons1,3,9-18. However, non-declarative memories do not require the hippocampus for learning or for sleep-dependent consolidat
=========="""

RENDER_TARGET_MULTI_REF = "\n- Author: default_author\n- Content: These 2 papers are highly recommended!\nhttps://arxiv.org/abs/2402.04607\nhttps://royalsocietypublishing.org/doi/10.1098/rstb.2022.0267\n\n- References:\n1: https://arxiv.org/abs/2402.04607\nItem type: preprint\nTitle: Google Scholar is manipulatable\nSummary: Citations are widely considered in scientists' evaluation. As such, scientists may be incentivized to inflate their citation counts. While previous literature has examined self-citations and citation cartels, it remains unclear whether scientists can purchase citations. Here, we compile a dataset of ~1.6 million profiles on Google Scholar to examine instances of citation fraud on the platform. We survey faculty at highly-ranked universities, and confirm that Google Scholar is widely used when ev\n------------------\n2: https://royalsocietypublishing.org/doi/10.1098/rstb.2022.0267\nItem type: journalArticle\nTitle: Reducing global inequality increases local cooperation: a simple model of group selection with a global externality\nSummary: \n------------------\n"

RENDER_TARGET_KW = "- Content: I really liked this paper!\nhttps://arxiv.org/abs/2402.04607\n\n- References:\n1: https://arxiv.org/abs/2402.04607\nItem type: preprint\nTitle: Google Scholar is manipulatable\nSummary: Citations are widely considered in scientists' evaluation. As such, scientists may be incentivized to inflate their citation counts. While previous literature has examined self-citations and citation cartels, it remains unclear whether scientists can purchase citations. Here, we compile a dataset of ~1.6 million profiles on Google Scholar to examine instances of citation fraud on the platform. We survey faculty at highly-ranked universities, and confirm that Google Scholar is widely used when ev\n------------------\n"

RENDER_TARGET_TOPICS = "- Content: I really liked this paper!\nhttps://arxiv.org/abs/2402.04607\n\n- References:\n1: https://arxiv.org/abs/2402.04607\nItem type: preprint\nTitle: Google Scholar is manipulatable\nSummary: Citations are widely considered in scientists' evaluation. As such, scientists may be incentivized to inflate their citation counts. While previous literature has examined self-citations and citation cartels, it remains unclear whether scientists can purchase citations. Here, we compile a dataset of ~1.6 million profiles on Google Scholar to examine instances of citation fraud on the platform. We survey faculty at highly-ranked universities, and confirm that Google Scholar is widely used when ev\n------------------\n"

RENDER_TARGET_SINGLE_REF = """- Author: default_author
- Content: I really liked this paper!
<ref_1>

- References: 
<ref_1> 
url: https://arxiv.org/abs/2402.04607
item_type: preprint
title: Google Scholar is manipulatable
summary: Citations are widely considered in scientists' evaluation. As such, scientists may be incentivized to inflate their citation counts. While previous literature has examined self-citations and citation cartels, it remains unclear whether scientists can purchase citations. Here, we compile a dataset of ~1.6 million profiles on Google Scholar to examine instances of citation fraud on the platform. We survey faculty at highly-ranked universities, and confirm that Google Scholar is widely used when ev"""

RENDER_QUOTE_TWEET_1_TARGET = """- Content: New preprint from the lab! 🚨

Replay of procedural experience occurs in the striatum and is independent of the hippocampus.

Heroic effort by @EmmettJThompson & the rest of the team @_JasvinKaur, @_GeorginaMills, @dorrell_will, @ClementineDomi6, @TomNotGeorge 

🧵👇1/13 <quoted ref_1>Replay of procedural experience is independent of the hippocampus  <ref_2> #biorxiv_neursci</quote>"""

RENDER_QT_MD_1_TARGET = """- References: 
<ref_1> 
url: https://x.com/biorxiv_neursci/status/1798962015148576815
item_type: forumPost
title: Twitter post
summary: None
==========
<ref_2> 
url: https://www.biorxiv.org/content/10.1101/2024.06.05.597547v1
item_type: preprint
title: Replay of procedural experience is independent of the hippocampus
summary: Sleep is critical for consolidating all forms of memory1-3, from episodic experience to the development of motor skills4-6. A core feature of the consolidation process is offline replay of neuronal firing patterns that occur during experience7,8. This replay is thought to originate in the hippocampus and trigger the reactivation of ensembles of cortical and subcortical neurons1,3,9-18. However, non-declarative memories do not require the hippocampus for learning or for sleep-dependent consolidat"""


THREAD_TEST_1_TARGET = """# Input post text:

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
@eturnermd1 Here is the full thread: <quoted ref_4>Next up on the AdComm agenda, when they come back from lunch at the top of hour, is the Open Public Hearing. For reasons mentioned below, don't be surprised if the "public" consists more of advocates for approval, and we hear from relatively few with reservations.</quote>
---
@eturnermd1 Here the second vote on benefits and risks: <quoted ref_5>@eturnermd1 #MDMAadcomm VOTE 2/2: Do the benefits of midomafetamine with FDA’s proposed risk evaluation and mitigation strategy (REMS) outweigh its risks for the treatment of patients with PTSD?
1-Yes
10-No
0-Abstain https://twitter.com/FDAadcomms/status/1798107142219796794/photo/1</quote>
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
==========
<ref_4> 
url: https://x.com/eturnermd1/status/1798046087737180395
item_type: forumPost
title: Twitter post
summary: None
==========
<ref_5> 
url: https://x.com/FDAadcomms/status/1798107142219796794
item_type: forumPost
title: Twitter post
summary: None
=========="""


def test_ref_render_1():
    tweet_url = "https://x.com/science_seeds/status/1752087818099159338"
    quote_ref_post = scrape_post(tweet_url)
    md_dict = extract_posts_ref_metadata_dict([quote_ref_post])
    md_list = get_ref_post_metadata_list(quote_ref_post, md_dict)
    ref_post_renderer = RefPostRenderer()
    rendered = ref_post_renderer.render(quote_ref_post, md_list)
    assert rendered == RENDER_NO_REF_TEST_RESULT


def test_ref_render_no_refs():
    ref_post = convert_text_to_ref_post(TEST_POST_TEXT_W_NO_REFS)
    md_dict = extract_posts_ref_metadata_dict([ref_post])
    md_list = get_ref_post_metadata_list(ref_post, md_dict)
    ref_post_renderer = RefPostRenderer()
    rendered = ref_post_renderer.render(ref_post, md_list)
    target = "\n- Author: default_author\n- Content: These 2 papers are highly recommended!\n"
    assert rendered == target


def test_ref_render_single_ref():
    ref_post = convert_text_to_ref_post(TEST_POST_TEXT_W_REF)
    md_dict = extract_posts_ref_metadata_dict([ref_post])
    md_list = get_ref_post_metadata_list(ref_post, md_dict)
    ref_post_renderer = RefPostRenderer()
    rendered = ref_post_renderer.render(ref_post, md_list)
    target = "\n- Author: default_author\n- Content: I really liked this paper!\nhttps://arxiv.org/abs/2402.04607\n\n- References:\n1: https://arxiv.org/abs/2402.04607\nItem type: preprint\nTitle: Google Scholar is manipulatable\nSummary: Citations are widely considered in scientists' evaluation. As such, scientists may be incentivized to inflate their citation counts. While previous literature has examined self-citations and citation cartels, it remains unclear whether scientists can purchase citations. Here, we compile a dataset of ~1.6 million profiles on Google Scholar to examine instances of citation fraud on the platform. We survey faculty at highly-ranked universities, and confirm that Google Scholar is widely used when ev\n------------------\n"
    assert rendered == target


def test_ref_render_multi_ref():
    ref_post = convert_text_to_ref_post(TEST_POST_TEXT_W_2_REFS)
    md_dict = extract_posts_ref_metadata_dict([ref_post])
    md_list = get_ref_post_metadata_list(ref_post, md_dict)
    ref_post_renderer = RefPostRenderer()
    rendered = ref_post_renderer.render(ref_post, md_list)
    target = RENDER_TARGET_MULTI_REF
    assert rendered == target


def test_ref_renderer_in_parser():
    ref_post = convert_text_to_ref_post(TEST_POST_TEXT_W_2_REFS)
    md_dict = extract_posts_ref_metadata_dict([ref_post])
    multi_config = MultiParserChainConfig(
        parser_configs=[
            MultiRefTaggerChainConfig(
                name="multi_ref_tagger",
                llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
            )
        ],
        metadata_extract_config=MetadataExtractionConfig(extraction_method="citoid"),
    )
    mcp = MultiChainParser(multi_config)
    prompt = mcp.instantiate_prompts(ref_post, md_dict)
    assert RENDER_TARGET_MULTI_REF in prompt["multi_ref_tagger_input"]
    assert (
        postr.ref_post_renderer.MULTI_REF_INSTRUCTIONS
        in prompt["multi_ref_tagger_input"]
    )


def test_kw_ref_post_render():
    multi_config = MultiParserChainConfig(
        parser_configs=[
            KeywordPParserChainConfig(
                name="keywords",
                llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
            )
        ],
        metadata_extract_config=MetadataExtractionConfig(extraction_method="citoid"),
    )
    mcp = MultiChainParser(multi_config)
    ref_post = convert_text_to_ref_post(TEST_POST_TEXT_W_REF)
    md_dict = extract_posts_ref_metadata_dict([ref_post])
    prompt = mcp.instantiate_prompts(ref_post, md_dict)
    kw_prompt = prompt["keywords_input"]
    assert RENDER_TARGET_KW in kw_prompt
    assert "- Author:" not in kw_prompt


def test_topics_ref_post_render():
    multi_config = MultiParserChainConfig(
        parser_configs=[
            TopicsPParserChainConfig(
                name="topics",
                llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
            )
        ],
        metadata_extract_config=MetadataExtractionConfig(extraction_method="citoid"),
    )
    mcp = MultiChainParser(multi_config)
    ref_post = convert_text_to_ref_post(TEST_POST_TEXT_W_REF)
    md_dict = extract_posts_ref_metadata_dict([ref_post])
    prompt = mcp.instantiate_prompts(ref_post, md_dict)
    topics_prompt = prompt["topics_input"]
    assert RENDER_TARGET_TOPICS in topics_prompt
    assert "- Author:" not in topics_prompt


def test_quote_post_render_single_ref():
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
    ref_post = convert_text_to_ref_post(TEST_POST_TEXT_W_REF)
    md_dict = extract_posts_ref_metadata_dict([ref_post])
    prompt = mcp.instantiate_prompts(ref_post, md_dict)
    prompt_str = prompt["multi_ref_tagger_input"]
    assert RENDER_TARGET_SINGLE_REF in prompt_str
    assert postr.quote_ref_post_renderer.SINGLE_REF_INSTRUCTIONS in prompt_str


def test_quote_post_render_multi_ref():
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
    assert RENDER_QUOTE_TWEET_1_TARGET in prompt_str
    assert RENDER_QT_MD_1_TARGET in prompt_str
    assert postr.quote_ref_post_renderer.MULTI_REF_INSTRUCTIONS in prompt_str


def test_single_ref_post_instruction():
    multi_config = MultiParserChainConfig(
        parser_configs=[
            MultiRefTaggerChainConfig(
                name="multi_ref_tagger",
                llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
                post_renderer=PostRendererType.REF_POST,
            )
        ],
        metadata_extract_config=MetadataExtractionConfig(extraction_method="citoid"),
    )
    mcp = MultiChainParser(multi_config)
    ref_post = convert_text_to_ref_post(TEST_POST_TEXT_W_REF)
    md_dict = extract_posts_ref_metadata_dict([ref_post])
    prompt = mcp.instantiate_prompts(ref_post, md_dict)
    prompt_str = prompt["multi_ref_tagger_input"]
    assert postr.ref_post_renderer.SINGLE_REF_INSTRUCTIONS in prompt_str


def test_multi_ref_post_instruction():
    multi_config = MultiParserChainConfig(
        parser_configs=[
            MultiRefTaggerChainConfig(
                name="multi_ref_tagger",
                llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
                post_renderer=PostRendererType.REF_POST,
            )
        ],
        metadata_extract_config=MetadataExtractionConfig(extraction_method="citoid"),
    )
    mcp = MultiChainParser(multi_config)
    ref_post = convert_text_to_ref_post(TEST_POST_TEXT_W_2_REFS)
    md_dict = extract_posts_ref_metadata_dict([ref_post])
    prompt = mcp.instantiate_prompts(ref_post, md_dict)
    prompt_str = prompt["multi_ref_tagger_input"]
    assert postr.ref_post_renderer.MULTI_REF_INSTRUCTIONS in prompt_str


def test_thread_render_1():
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
    assert THREAD_TEST_1_TARGET in prompt_str


def test_thread_render_single_post():
    thread_post = get_thread_single_post()
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
    assert TARGET_RENDER_SINGLE_POST_THREAD in prompt_str


if __name__ == "__main__":
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
    assert RENDER_QUOTE_TWEET_1_TARGET in prompt_str
    assert RENDER_QT_MD_1_TARGET in prompt_str
    assert postr.quote_ref_post_renderer.MULTI_REF_INSTRUCTIONS in prompt_str
