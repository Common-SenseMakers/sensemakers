import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))
import os
import pytest
from pydantic import ValidationError

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
)  # Adjust the import as necessary
from desci_sense.shared_functions.dataloaders import (
    scrape_post,
    convert_text_to_ref_post,
)
from desci_sense.shared_functions.utils import _find_json_object
from desci_sense.shared_functions.parsers.multi_reference_tagger import normalize_labels
from desci_sense.shared_functions.postprocessing import Answer, SubAnswer


def test_parse_1():
    json_strs = [
        """```json
    {
    "sub_answers": [
        {
        "reasoning_steps": "The post mentions the recommendation of two papers, indicating a positive sentiment towards them.",
        "candidate_tags": {
            "<dg-observation>": "The post is articulating a positive observation about the recommended papers.",
            "<reading>": "The author is likely looking forward to reading the recommended papers in the future.",
            "<missing-ref>": "There is no explicit link provided to the papers mentioned.",
        },
        "final_answer": ["<dg-observation>", "<reading>", "<missing-ref>"]
        }
    ]
    }
    ```""",
        """```json
{
  "sub_answers": [
    {
      "reasoning_steps": "The post mentions the recommendation of two papers, indicating a positive sentiment towards them.",
      "candidate_tags": {
        "<dg-observation>": "The post is articulating a positive observation about the recommended papers.",
        "<reading>": "The author is likely looking forward to reading the recommended papers in the future.",
        "<missing-ref>": "There is no explicit link provided to the papers mentioned.",
      },
      "final_answer": ["<dg-observation>", "<reading>", "<missing-ref>"]
    }
  ]
}
```""",
    ]
    all_parsed = [_find_json_object(json_str) for json_str in json_strs]

    assert all(["[System error]" not in p for p in all_parsed])
