"""Script to load ontology data from Notion and write to JSON ouput.

Usage:
  load_ontology.py [--config=<config> --outdir=<outdir>]
  load_ontology.py (-h | --help)


Options:
  -h --help     Show this screen.
  --config=<config>  Optional path to configuration file.
  --outdir=<outdir>  dir to file to save data to [default: desci_sense/shared_functions/schema/]

"""

import sys
import pandas as pd
from typing import List
from docopt import docopt
from pathlib import Path
from loguru import logger

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

from desci_sense.shared_functions.interface import NotionOntologyConfig
from desci_sense.schema.notion_ontology_base import (
    load_notion_config_json,
    load_ontology_from_config,
)
from desci_sense.shared_functions.schema.ontology_base import (
    write_ontology_to_json,
    write_ontology_to_py,
)


def load_config(config_path):
    if config_path:
        return load_notion_config_json(config_path)
    else:
        return NotionOntologyConfig()


def write_outputs(notion_ontology, out_dir):
    ontology = notion_ontology.ontology_interface
    out_dir_path = Path(out_dir)
    out_dir_path.mkdir(parents=True, exist_ok=True)

    out_path = ROOT / out_dir_path / "ontology.json"
    out_py_path = ROOT / out_dir_path / "ontology.py"

    logger.info(f"Writing output json to {out_path.absolute()}...")
    write_ontology_to_json(ontology, str(out_path))

    logger.info(f"Writing output py to {out_py_path.absolute()}...")
    write_ontology_to_py(ontology, str(out_py_path))


if __name__ == "__main__":
    arguments = docopt(__doc__)

    # get args
    out_dir = Path(arguments.get("--outdir"))
    config_path = arguments.get("--config")

    # initialize config
    config = load_config(config_path)

    notion_ontology = load_ontology_from_config(config)
    ontology = notion_ontology.ontology_interface

    write_outputs(notion_ontology, out_dir)

    logger.info("Done!")
