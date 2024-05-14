import sys
from pathlib import Path
import nest_asyncio

nest_asyncio.apply()

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

from desci_sense.shared_functions.parsers.firebase_api_parser import (
    FirebaseAPIParser,
    PromptCase,
)
from desci_sense.shared_functions.dataloaders import (
    scrape_post,
    convert_text_to_ref_post,
)


TEST_POST_TEXT_W_REF = """
I really liked this paper!
https://arxiv.org/abs/2402.04607
"""


# def test_init():
#     config = default_init_parser_config()
#     parser = FirebaseAPIParser(config=config)
#     assert parser.md_extract_method.value == "none"


# def test_parse():
#     config = default_init_parser_config()
#     parser = FirebaseAPIParser(config=config)
#     result = parser.process_text_st(TEST_POST_TEXT_W_REF)
#     assert "answer" in result, "result not correctly extracted"


# def test_parse_post():
#     url = "https://mastodon.social/@psmaldino@qoto.org/111405098400404613"
#     config = default_init_parser_config()
#     parser = FirebaseAPIParser(config=config)
#     post = scrape_post(url)
#     result = parser.process_ref_post_st(post)
#     assert "answer" in result, "result not correctly extracted"


# def test_parse_no_ref_tw():
#     url = "https://twitter.com/HarvardPSC/status/1722102271792603452"
#     config = default_init_parser_config()
#     parser = FirebaseAPIParser(config=config)
#     result = parser.process_url(url)
#     labels = parser.prompt_case_dict[PromptCase.ZERO_REF]["labels"]
#     assert set(result["answer"]["multi_tag"]).issubset(labels)


# def test_parse_no_ref_masto():
#     url = "https://mastodon.social/@natematias@social.coop/111410981466531543"
#     config = default_init_parser_config()
#     parser = FirebaseAPIParser(config=config)
#     result = parser.process_url(url)
#     labels = parser.prompt_case_dict[PromptCase.ZERO_REF]["labels"]
#     assert set(result["answer"]["multi_tag"]).issubset(labels)


# def test_parser_result():
#     config = default_init_parser_config()
#     parser = FirebaseAPIParser(config=config)
#     result = parser.process_text(TEST_POST_TEXT_W_REF)
#     result_dict = result.model_dump()
#     result_2 = ParserResult.model_validate(result_dict)
#     assert "semantics" in result_dict
#     assert "semantics" in result_2.model_dump()

# def test_parallel_w_kw_and_topics():
#     url = "https://twitter.com/Elinor_Carmi/status/1768238325020659885"
#     config = default_init_parser_config()
#     config["model"]["model_name"] = "mistralai/mistral-7b-instruct"
#     config["keyword_extraction"]["model"]["model_name"] = "mistralai/mistral-7b-instruct"
#     parser = FirebaseAPIParser(config=config)
#     parser.set_md_extract_method("citoid")
#     post = scrape_post(url)
#     result = parser.process_ref_post_parallel(post)
#     assert "topics" in result
#     assert "semantics" in result
#     assert "keywords" in result


# if __name__ == "__main__":
#     url = "https://twitter.com/Elinor_Carmi/status/1768238325020659885"
#     config = default_init_parser_config()
#     config["model"]["model_name"] = "mistralai/mistral-7b-instruct"
#     config["keyword_extraction"]["model"]["model_name"] = "mistralai/mistral-7b-instruct"
#     parser = FirebaseAPIParser(config=config)
#     parser.set_md_extract_method("citoid")
#     post = scrape_post(url)
#     result = parser.process_ref_post_parallel(post)
