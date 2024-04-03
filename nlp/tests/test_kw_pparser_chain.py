import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))
import os
import pytest
from pydantic import ValidationError
from desci_sense.shared_functions.parsers.keyword_pparser import KeywordPostParserChain
from desci_sense.shared_functions.runners.configs import (
    OpenrouterAPIConfig,
    WandbConfig,
    KeywordPParserChainConfig,
    validate_env_var,
    MultiParserChainConfig,
    ParserChainType,
)  # Adjust the import as necessary


def test_simple_init():
    kp = KeywordPParserChainConfig(name="test")
    kppc = KeywordPostParserChain(kp)
    assert kppc.parser_config.name == "test"


if __name__ == "__main__":
    kp = KeywordPParserChainConfig(name="test")
    multi_config = MultiParserChainConfig(parsers=[kp])
    kppc = KeywordPostParserChain(kp, multi_config)
