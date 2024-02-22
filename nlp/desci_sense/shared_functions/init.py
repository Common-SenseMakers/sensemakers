from typing import List, TypedDict, Any, Optional

from confection import Config
from loguru import logger

MAX_SUMMARY_LENGTH = 500


class ParserInitConfig(TypedDict, total=True):
    wandb_project: str
    zero_ref_template_name: Any
    single_ref_template_name: Any
    multi_ref_template_name: Any
    openai_api_key: str
    openai_api_base: str
    openai_api_referer: str


class ParserInitConfigOptional(TypedDict, total=False):
    # Optional parameters
    model_name: str
    parser_type: str
    temperature: float
    versions: List[str]
    template_dir: str
    zero_ref_template: str
    single_ref_template: str
    multi_ref_template: str
    wandb_entity: str
    ref_metadata_method: str
    notion_db_id: str
    enable_keywords: bool
    kw_template: str
    kw_ref_metadata_method: str
    max_keywords: int
    keyword_extraction_model: str


def init_multi_stage_parser_config(
    config: ParserInitConfig, optional: Optional[ParserInitConfigOptional] = None
):
    defaults = {
        "model_name": "mistralai/mistral-7b-instruct",
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
        "keyword_extraction_model": "mistralai/mistral-7b-instruct",
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
