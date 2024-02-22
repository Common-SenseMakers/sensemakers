import os
from dotenv import load_dotenv
from loguru import logger
from dataclasses import dataclass

# import pydantic as pyd
from confection import Config
from shared_functions.init import ParserInitConfig, init_multi_stage_parser_config

load_dotenv()

# environment
environ = {
    "OPENROUTER_API_KEY": os.environ.get("OPENROUTER_API_KEY"),
    "OPENROUTER_REFERRER": os.environ.get("OPENROUTER_REFERRER"),
    "WANDB_PROJECT": os.environ.get("WANDB_PROJECT"),
    "MASTODON_ACCESS_TOKEN": os.environ.get("MASTODON_ACCESS_TOKEN"),
    "MASTO_CLIENT_ID": os.environ.get("MASTO_CLIENT_ID"),
    "MASTO_CLIENT_SECRET": os.environ.get("MASTO_CLIENT_SECRET"),
    "NOTION_SENSEBOT_DB": os.environ.get("NOTION_SENSEBOT_DB"),
    "NOTION_SENSEBOT_TOKEN": os.environ.get("NOTION_SENSEBOT_TOKEN"),
    "WANDB_API_KEY": os.environ.get("WANDB_API_KEY"),
}

OPENROUTER_API_BASE = "https://openrouter.ai/api/v1"

# Streamlit App URL
ST_OPENROUTER_REFERRER = "https://sensebot.streamlit.app/"

# project to save data from deployed web app
WEB_APP_WANDB_PROJ = "st-app-multi-v2"

# sandbox project
WANDB_SANDBOX_PROJ = "st-demo-sandbox"

# max number of chars for extracted summaries in URL metadata
MAX_SUMMARY_LEN = 500


def init_config(
    model_name: str = "mistralai/mistral-7b-instruct",
    parser_type: str = "base",
    temperature: float = 0.6,
    template_path: str = "desci_sense/prompting/templates/p4.txt",
    wandb_entity: str = "common-sense-makers",
    wandb_project: str = WANDB_SANDBOX_PROJ,
):
    config = Config(
        {
            "general": {"parser_type": parser_type},
            "model": {"model_name": model_name, "temperature": temperature},
            "prompt": {"template_path": template_path},
            "wandb": {"entity": wandb_entity, "project": wandb_project},
        }
    )
    return config


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


def init_crawler_config():
    pass
