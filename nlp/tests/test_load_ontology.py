import sys
from pathlib import Path
from unittest.mock import patch, MagicMock
import pytest

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

# Adjust the import path according to the project structure
from scripts.load_ontology import load_config, write_outputs
from desci_sense.schema.notion_ontology_base import load_ontology_from_config


# Test loading default configuration
def test_load_default_config():
    with patch(
        "scripts.load_ontology.load_notion_config_json"
    ) as mock_load_config, patch(
        "scripts.load_ontology.NotionOntologyConfig"
    ) as mock_default_config:
        load_config(None)
        mock_default_config.assert_called_once()
        mock_load_config.assert_not_called()


# Test loading custom configuration
def test_load_custom_config():
    with patch("scripts.load_ontology.load_notion_config_json") as mock_load_config:
        custom_config_path = "custom_config.json"
        load_config(custom_config_path)
        mock_load_config.assert_called_once_with(custom_config_path)


@pytest.fixture
def mock_file_ops():
    with patch("pathlib.Path.mkdir") as mock_mkdir, patch(
        "scripts.load_ontology.write_ontology_to_json"
    ) as mock_write_json, patch(
        "scripts.load_ontology.write_ontology_to_py"
    ) as mock_write_py:
        yield mock_mkdir, mock_write_json, mock_write_py


def test_write_outputs(mock_file_ops):
    mock_mkdir, mock_write_json, mock_write_py = mock_file_ops
    mock_ontology = MagicMock()
    mock_ontology.ontology_interface = MagicMock()

    out_dir = "test_output"

    write_outputs(mock_ontology, out_dir)

    mock_mkdir.assert_called_once_with(parents=True, exist_ok=True)
    mock_write_json.assert_called_once()
    mock_write_py.assert_called_once()
    assert mock_write_json.call_args[0][1].endswith("test_output/ontology.json")
    assert mock_write_py.call_args[0][1].endswith("test_output/ontology.py")


def test_load_content():
    custom_config_path = ROOT / "tests/etc/configs/notion_test_config.json"
    config = load_config(custom_config_path)
    notion_ontology = load_ontology_from_config(config)
    ontology = notion_ontology.ontology_interface
    assert ontology.semantic_predicates[0].name == "test_ann"


if __name__ == "__main__":
    custom_config_path = "etc/configs/notion_test_config.json"
    config = load_config(custom_config_path)
    notion_ontology = load_ontology_from_config(config)
    ontology = notion_ontology.ontology_interface
