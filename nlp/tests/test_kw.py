import sys
from pathlib import Path
from confection import Config

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

from desci_sense.runner import load_config
from desci_sense.parsers.multi_stage_parser import MultiStageParser

# def test_parse_masto():
#     config_path = ROOT / "tests/etc/configs/notion_dev.cfg"
#     config = Config().from_disk(str(config_path))
#     url = "https://mastodon.social/@psmaldino@qoto.org/111405098400404613"
#     parser = MultiStageParser(config=config)
#     result = parser.kw_process_post(url)
#     assert "valid_keywords" in result["answer"]


# def test_parse_no_ref_masto():
#     config_path = ROOT / "tests/etc/configs/notion_dev.cfg"
#     config = Config().from_disk(str(config_path))
#     url = "https://mastodon.social/@natematias@social.coop/111410981466531543"
#     parser = MultiStageParser(config=config)
#     result = parser.kw_process_post(url)
#     assert "valid_keywords" in result["answer"]


# def test_parse_masto_no_citoid():
#     config_path = ROOT / "tests/etc/configs/notion_dev.cfg"
#     config = Config().from_disk(str(config_path))
#     config["keyword_extraction"]["ref_metadata_method"] = "none"
#     url = "https://mastodon.social/@psmaldino@qoto.org/111405098400404613"
#     parser = MultiStageParser(config=config)
#     result = parser.kw_process_post(url)
#     assert "valid_keywords" in result["answer"]


if __name__ == "__main__":
    config_path = ROOT / "tests/etc/configs/notion_dev.cfg"
    config = load_config()
    config["keyword_extraction"]["model"][
        "model_name"
    ] = "mistralai/mistral-7b-instruct"
    url = "https://mastodon.social/@natematias@social.coop/111410981466531543"
    parser = MultiStageParser(config=config)
    result = parser.kw_process_post(url)
    print(result["answer"])
