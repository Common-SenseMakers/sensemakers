import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))
import os
import pytest
from pydantic import ValidationError
from desci_sense.shared_functions.parsers.keyword_pparser import KeywordPostParserChain
from desci_sense.shared_functions.schema.ontology_base import OntologyBase
from desci_sense.shared_functions.configs import (
    OpenrouterAPIConfig,
    WandbConfig,
    KeywordPParserChainConfig,
    validate_env_var,
    MultiParserChainConfig,
    ParserChainType,
)  # Adjust the import as necessary


def test_simple_init():
    kp = KeywordPParserChainConfig(name="test")
    ontology = OntologyBase()
    multi_config = MultiParserChainConfig(parser_configs=[kp])
    kppc = KeywordPostParserChain(kp, multi_config, ontology)
    assert kppc.parser_config.name == "test"


def test_kw_parser_init():
    ontology = OntologyBase()
    kp = KeywordPParserChainConfig(name="test")
    multi_config = MultiParserChainConfig(parser_configs=[kp])
    kppc = KeywordPostParserChain(kp, multi_config, ontology)
    assert kppc.ontology.ontology_interface.keyword_predicate.name == "hasKeyword"


if __name__ == "__main__":
    ontology = OntologyBase()
    kp = KeywordPParserChainConfig(name="test")
    multi_config = MultiParserChainConfig(parsers=[kp])
    kppc = KeywordPostParserChain(kp, multi_config, ontology)
    assert kppc.ontology.ontology_interface.keyword_predicate.name == "hasKeyword"
