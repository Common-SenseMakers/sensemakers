import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

import pytest
from enum import Enum


from desci_sense.schema.notion_ontology_base import (
    load_ontology_from_config,
    load_notion_config_json,
)


def test_load_notion_config_by_id():
    config_path = ROOT / "tests/etc/configs/notion_test_config.json"
    config = load_notion_config_json(str(config_path))
    ontology = load_ontology_from_config(config)
    assert len(ontology.ont_df) == 1

def test_no_non_breaking_space():
    config_path = ROOT / "tests/etc/configs/notion_test_prod_config.json"
    config = load_notion_config_json(str(config_path))
    ontology = load_ontology_from_config(config)
    data = ontology.ontology_interface.dict()
    def check_for_non_breaking_space(value):
        if isinstance(value, str):
            assert '\xa0' not in value, f"Non-breaking space found in: {value}"
        elif isinstance(value, list):
            for item in value:
                check_for_non_breaking_space(item)
        elif isinstance(value, dict):
            for key, item in value.items():
                check_for_non_breaking_space(item)
    check_for_non_breaking_space(data)
    
def test_space_in_display_names():
    config_path = ROOT / "tests/etc/configs/notion_test_prod_config.json"
    config = load_notion_config_json(str(config_path))
    ontology = load_ontology_from_config(config)
    data = ontology.ontology_interface.dict()
    
    # test space chars in display name
    for predicate in data['semantic_predicates']:
        display_name = predicate.get('display_name', '')
        assert ' ' in display_name, f"'{display_name}' does not contain a space character."
                
# def test_load_notion_config_by_id_w_name():
#     config_path = ROOT / "etc/configs/notion_dev.cfg"
#     config = Config().from_disk(str(config_path))
#     ontology = load_ontology_from_config(config)
#     assert ontology.name == "SenseNets Dev Ontology"

# def test_load_notion_config_default():
#     # no notion db id provided in file - should load default
#     config_path = ROOT / "tests/etc/configs/notion_test_default.cfg"
#     config = Config().from_disk(str(config_path))
#     ontology = load_ontology_from_config(config)
#     assert ontology.db_id == environ["NOTION_SENSEBOT_DB"]


if __name__ == "__main__":
    config_path = ROOT / "tests/etc/configs/notion_test_prod_config.json"
    config = load_notion_config_json(str(config_path))
    ontology = load_ontology_from_config(config)
    data = ontology.ontology_interface.dict()
    for predicate in data['semantic_predicates']:
        display_name = predicate.get('display_name', '')
        if ' ' in display_name:
            print(f"'{display_name}' contains a space character.")
        else:
            print(f"'{display_name}' does not contain a space character.")
    # assert len(ontology.ont_df) == 1
