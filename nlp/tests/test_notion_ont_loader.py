import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

import pytest
from enum import Enum

from confection import Config

from desci_sense.configs import environ
from desci_sense.schema.notion_ontology_base import load_ontology_from_config


# def test_load_notion_config_by_id():
#     config_path = ROOT / "tests/etc/configs/notion_test.cfg"
#     config = Config().from_disk(str(config_path))
#     ontology = load_ontology_from_config(config)
#     assert len(ontology.ont_df) == 1


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
