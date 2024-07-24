import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

from typing import Optional
from rdflib import Graph, URIRef
from confection import Config

# from desci_sense.configs import OPENROUTER_API_BASE, environ

# from desci_sense.shared_functions.init import (
#     ParserInitConfig,
#     MAX_SUMMARY_LENGTH,
#     ParserInitConfigOptional,
# )
from desci_sense.shared_functions.dataloaders import (
    scrape_post,
    convert_text_to_ref_post,
)
from desci_sense.shared_functions.interface import AppThread, ParsePostRequest
from desci_sense.shared_functions.preprocessing import (
    ParserInput,
    convert_thread_interface_to_ref_post,
)
from desci_sense.shared_functions.preprocessing.threads import create_thread_from_posts
from desci_sense.shared_functions.parsers.multi_chain_parser import MultiChainParser
from desci_sense.shared_functions.configs import (
    OpenrouterAPIConfig,
    WandbConfig,
    LLMConfig,
    KeywordPParserChainConfig,
    RefTaggerChainConfig,
    MultiRefTaggerChainConfig,
    TopicsPParserChainConfig,
    validate_env_var,
    MultiParserChainConfig,
    ParserChainType,
)

TEST_THREAD = {
    "author": {
        "id": "2111",
        "name": "Eiko Fried",
        "username": "Eiko Fried",
        "platformId": "twitter",
    },
    "url": "https://x.com/EikoFried/status/1798166869574398271",
    "thread": [
        {
            "content": "After careful consideration, the FDA advisory comission voted today 9:2 that MDMA has *not* been shown to be effective for treating PTSD, given massive concerns around validity threats in this literature. They also voted 10:1 that MDMA has *not* shown to be safe.",
            "url": "https://x.com/EikoFried/status/1798166869574398271",
            "quotedThread": {
                "author": {
                    "id": "2111",
                    "name": "FDAadcomms",
                    "username": "FDAadcomms",
                    "platformId": "twitter",
                },
                "url": "https://x.com/FDAadcomms/status/1798104612635070611",
                "thread": [
                    {
                        "content": "@eturnermd1 #MDMAadcomm VOTE 1/2: Do the available data show that the drug is effective in patients with posttraumatic\nstress disorder?\n2-Yes\n9-No\n0-Abstain https://twitter.com/FDAadcomms/status/1798104612635070611/photo/1",
                        "url": "https://x.com/FDAadcomms/status/1798104612635070611",
                        "quotedThread": None,
                    }
                ],
            },
        },
        {
            "content": "📄Many mentioned reasons overlap with those we summarized recently in our review paper: \nhttps://journals.sagepub.com/doi/10.1177/20451253231198466\n\n📺 I also summarize them for a lay audience in this YouTube video: \nhttps://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E",
            "url": "https://x.com/EikoFried/status/1798167612175913332",
            "quotedThread": None,
        },
        {
            "content": "Some pretty wild things in the meeting honestly, thanks to @eturnermd1 for live tweeting.\n\nEg folks who were paid by the sponsor (big pharma) to speak on behalf of the product to be marketed did *not* have to declare they were being paid.",
            "url": "https://x.com/EikoFried/status/1798170515817013679",
            "quotedThread": None,
        },
        {
            "content": "@eturnermd1 Here is the full thread:",
            "url": "https://x.com/EikoFried/status/1798170610314715569",
            "quotedThread": {
                "author": {
                    "id": "2111",
                    "name": "Erick Turner @eturnermd1.bsky.social",
                    "username": "Erick Turner @eturnermd1.bsky.social",
                    "platformId": "twitter",
                },
                "url": "https://x.com/eturnermd1/status/1798046087737180395",
                "thread": [
                    {
                        "content": 'Next up on the AdComm agenda, when they come back from lunch at the top of hour, is the Open Public Hearing. For reasons mentioned below, don\'t be surprised if the "public" consists more of advocates for approval, and we hear from relatively few with reservations.',
                        "url": "https://x.com/eturnermd1/status/1798046087737180395",
                        "quotedThread": None,
                    }
                ],
            },
        },
        {
            "content": "@eturnermd1 Here the second vote on benefits and risks:",
            "url": "https://x.com/EikoFried/status/1798171316375445681",
            "quotedThread": {
                "author": {
                    "id": "2111",
                    "name": "FDAadcomms",
                    "username": "FDAadcomms",
                    "platformId": "twitter",
                },
                "url": "https://x.com/FDAadcomms/status/1798107142219796794",
                "thread": [
                    {
                        "content": "@eturnermd1 #MDMAadcomm VOTE 2/2: Do the benefits of midomafetamine with FDA’s proposed risk evaluation and mitigation strategy (REMS) outweigh its risks for the treatment of patients with PTSD?\n1-Yes\n10-No\n0-Abstain https://twitter.com/FDAadcomms/status/1798107142219796794/photo/1",
                        "url": "https://x.com/FDAadcomms/status/1798107142219796794",
                        "quotedThread": None,
                    }
                ],
            },
        },
    ],
}


def no_empty_lists(list_of_lists):
    """
    Verifies that the input list of lists contains no empty lists.

    Parameters:
    list_of_lists (list of lists): The input list of lists to be verified.

    Returns:
    bool: True if no empty lists are found, False otherwise.
    """
    return all(len(sublist) > 0 for sublist in list_of_lists)


def create_sample_thread():
    app_thread = AppThread.model_validate(TEST_THREAD)
    return app_thread


def create_post_request():
    thread = create_sample_thread()
    return ParsePostRequest(post=thread)


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


def get_thread_single_post():
    thread_posts = [
        scrape_post("https://x.com/biorxiv_neursci/status/1798962015148576815")
    ]
    thread_post = create_thread_from_posts(thread_posts)
    return thread_post


def get_thread_single_quote_post():
    thread_posts = [scrape_post("https://x.com/rtk254/status/1813272072400859611")]
    thread_post = create_thread_from_posts(thread_posts)
    return thread_post


def create_multi_config_for_tests(llm_type: str = "open-orca/mistral-7b-openorca"):
    kp = KeywordPParserChainConfig(
        name="kw_test",
        use_metadata=True,
        llm_config=LLMConfig(llm_type=llm_type),
    )
    rtc = MultiRefTaggerChainConfig(
        name="multi_refs_tag_test",
        use_metadata=True,
        llm_config=LLMConfig(llm_type=llm_type),
    )
    tpc = TopicsPParserChainConfig(
        name="topic_test",
        use_metadata=True,
        llm_config=LLMConfig(llm_type=llm_type),
    )
    multi_config = MultiParserChainConfig(
        parser_configs=[
            rtc,
            tpc,
            kp,
        ]
    )
    return multi_config


def create_multi_chain_for_tests():
    multi_config = create_multi_config_for_tests()
    return MultiChainParser(multi_config)


def check_uris_in_graph(graph: Graph, uris: list):
    """
    Test to assert the presence of a list of URIs in the given RDFLib graph.

    :param graph: The RDFLib graph to test.
    :param uris: A list of URIs (as strings) to check for presence in the graph.
    :raises AssertionError: If any URI is not found in the graph.
    """
    for uri in uris:
        uri_ref = URIRef(uri)
        if (
            (uri_ref, None, None) not in graph
            and (None, uri_ref, None) not in graph
            and (None, None, uri_ref) not in graph
        ):
            raise AssertionError(f"URI {uri} not found in the graph")


# def default_init_parser_config():
#     params = {
#         "wandb_project": environ["WANDB_PROJECT"],
#         "openai_api_key": environ["OPENROUTER_API_KEY"],
#         "openai_api_base": OPENROUTER_API_BASE,
#         "openai_api_referer": environ["OPENROUTER_REFERRER"],
#     }
#     config = ParserInitConfig(**params)

#     full_config = init_multi_stage_parser_config(config)
#     return full_config


# # default initialization for testing
# def init_multi_stage_parser_config(
#     config: ParserInitConfig, optional: Optional[ParserInitConfigOptional] = None
# ):
#     defaults = {
#         "model_name": "mistralai/mistral-7b-instruct:free",
#         "parser_type": "multi_stage",
#         "max_summary_length": MAX_SUMMARY_LENGTH,
#         "temperature": 0.6,
#         "versions": None,
#         "wandb_entity": "common-sense-makers",
#         "ref_metadata_method": "none",
#         "notion_db_id": None,
#         "enable_keywords": True,
#         "kw_template": "keywords_extraction.j2",
#         "kw_ref_metadata_method": "citoid",
#         "max_keywords": 6,
#         "keyword_extraction_model": "mistralai/mistral-7b-instruct:free",
#     }

#     if optional is None:
#         optional = {}

#     config = {**defaults, **config, **optional}

#     # logger.info(f"config {{}}", config)

#     parser_config = Config(
#         {
#             "general": {
#                 "parser_type": config["parser_type"],
#                 "ref_metadata_method": config["ref_metadata_method"],
#                 "max_summary_length": config["max_summary_length"],
#             },
#             "openai_api": {
#                 "openai_api_base": config["openai_api_base"],
#                 "openai_api_key": config["openai_api_key"],
#                 "openai_api_referer": config["openai_api_referer"],
#             },
#             "model": {
#                 "model_name": config["model_name"],
#                 "temperature": config["temperature"],
#             },
#             "ontology": {
#                 "versions": config["versions"],
#                 "notion_db_id": config["notion_db_id"],
#             },
#             "keyword_extraction": {
#                 "enabled": config["enable_keywords"],
#                 "template": config["kw_template"],
#                 "ref_metadata_method": config["kw_ref_metadata_method"],
#                 "max_keywords": config["max_keywords"],
#                 "model": {
#                     "model_name": config["keyword_extraction_model"],
#                     "temperature": config["temperature"],
#                 },
#             },
#             "wandb": {
#                 "entity": config["wandb_entity"],
#                 "project": config["wandb_project"],
#             },
#         }
#     )
#     return parser_config
