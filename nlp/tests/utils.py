import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

from typing import Optional
from confection import Config
from desci_sense.configs import OPENROUTER_API_BASE, environ
from desci_sense.shared_functions.init import (
    ParserInitConfig,
    MAX_SUMMARY_LENGTH,
    ParserInitConfigOptional,
)
from desci_sense.shared_functions.parsers.multi_chain_parser import MultiChainParser
from desci_sense.shared_functions.runners.configs import (
    OpenrouterAPIConfig,
    WandbConfig,
    LLMConfig,
    KeywordPParserChainConfig,
    RefTaggerChainConfig,
    TopicsPParserChainConfig,
    validate_env_var,
    MultiParserChainConfig,
    ParserChainType,
)

def create_multi_config_for_tests():
    kp = KeywordPParserChainConfig(
        name="kw_test",
        use_metadata=True,
        llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
    )
    rtc = RefTaggerChainConfig(
        name="refs_tag_test",
        use_metadata=True,
        llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
    )
    tpc = TopicsPParserChainConfig(
        name="topic_test",
        use_metadata=True,
        llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
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


def default_init_parser_config():
    params = {
        "wandb_project": environ["WANDB_PROJECT"],
        "openai_api_key": environ["OPENROUTER_API_KEY"],
        "openai_api_base": OPENROUTER_API_BASE,
        "openai_api_referer": environ["OPENROUTER_REFERRER"],
    }
    config = ParserInitConfig(**params)

    full_config = init_multi_stage_parser_config(config)
    return full_config


# default initialization for testing
def init_multi_stage_parser_config(
    config: ParserInitConfig, optional: Optional[ParserInitConfigOptional] = None
):
    defaults = {
        "model_name": "mistralai/mistral-7b-instruct:free",
        "parser_type": "multi_stage",
        "max_summary_length": MAX_SUMMARY_LENGTH,
        "temperature": 0.6,
        "versions": None,
        "wandb_entity": "common-sense-makers",
        "ref_metadata_method": "none",
        "notion_db_id": None,
        "enable_keywords": True,
        "kw_template": "keywords_extraction.j2",
        "kw_ref_metadata_method": "citoid",
        "max_keywords": 6,
        "keyword_extraction_model": "mistralai/mistral-7b-instruct:free",
    }

    if optional is None:
        optional = {}

    config = {**defaults, **config, **optional}

    # logger.info(f"config {{}}", config)

    parser_config = Config(
        {
            "general": {
                "parser_type": config["parser_type"],
                "ref_metadata_method": config["ref_metadata_method"],
                "max_summary_length": config["max_summary_length"],
            },
            "openai_api": {
                "openai_api_base": config["openai_api_base"],
                "openai_api_key": config["openai_api_key"],
                "openai_api_referer": config["openai_api_referer"],
            },
            "model": {
                "model_name": config["model_name"],
                "temperature": config["temperature"],
            },
            "ontology": {
                "versions": config["versions"],
                "notion_db_id": config["notion_db_id"],
            },
            "keyword_extraction": {
                "enabled": config["enable_keywords"],
                "template": config["kw_template"],
                "ref_metadata_method": config["kw_ref_metadata_method"],
                "max_keywords": config["max_keywords"],
                "model": {
                    "model_name": config["keyword_extraction_model"],
                    "temperature": config["temperature"],
                },
            },
            "wandb": {
                "entity": config["wandb_entity"],
                "project": config["wandb_project"],
            },
        }
    )
    return parser_config
