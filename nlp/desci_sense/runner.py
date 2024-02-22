from confection import Config

from desci_sense.configs import (
    ST_OPENROUTER_REFERRER,
    environ,
    default_init_parser_config,
)
from desci_sense.shared_functions.parsers.firebase_api_parser import FirebaseAPIParser

# from desci_sense.parsers.multi_stage_parser import MultiStageParser


# load_dotenv()


def load_config(config_path: str = None) -> Config:
    """
    Create configuration for this run. If config file path is provided, use that.
    Otherwise use a default config.
    If WAND_PROJECT environment key is set, update config with it (used for deployed app).
    """
    if config_path:
        config = Config().from_disk(config_path)
    else:
        # use a default config - this is the config loaded in the streamlit demo app
        config = default_init_parser_config()
        config["model"]["model_name"] = "mistralai/mistral-7b-instruct"
        if "WANDB_PROJECT" in environ:
            wandb_proj = environ["WANDB_PROJECT"]
            config["wandb"]["project"] = wandb_proj

    return config


def init_model(config: Config):
    # if fail to get from environment config, default to streamlit referrer
    # openrouter_referrer = environ["OPENROUTER_REFERRER"] | ST_OPENROUTER_REFERRER
    # api_key = environ["OPENROUTER_API_KEY"]

    # create parser
    # if config["general"]["parser_type"] == "base":
    #     parser = BaseParser(config=config, api_key=api_key, openapi_referer=openrouter_referrer)
    if config["general"]["parser_type"] == "multi_stage":
        parser = FirebaseAPIParser(config=config)
    else:
        raise ValueError(f"Unknown parser type: {config['parser_type']}")

    return parser
