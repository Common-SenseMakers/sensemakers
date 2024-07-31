from pathlib import Path
from .shared_functions.configs import MultiParserChainConfig
from .shared_functions.init import init_multi_chain_parser_config
from .shared_functions.parsers.multi_chain_parser import MultiChainParser

# from desci_sense.configs import (
#     ST_OPENROUTER_REFERRER,
#     environ,
#     default_init_parser_config,
# )
# from desci_sense.shared_functions.parsers.firebase_api_parser import FirebaseAPIParser

# from desci_sense.parsers.multi_stage_parser import MultiStageParser


# load_dotenv()


def load_config(config_path: str = None) -> MultiParserChainConfig:
    """
    Create configuration for this run. If config file path is provided, use that.
    Otherwise use a default config.
    If WAND_PROJECT environment key is set, update config with it (used for deployed app).
    """
    if config_path:
        raw_data = Path(config_path).read_text()
        config = MultiParserChainConfig.model_validate_json(raw_data)
    else:
        # use a default config - this is the config loaded in the streamlit demo app
        config = init_multi_chain_parser_config(
            llm_type="mistralai/mixtral-8x7b-instruct:nitro",
            post_process_type="combined",
            post_renderer_type="quote_ref_post",
        )
    return config


def init_model(config: MultiChainParser):
    return MultiChainParser(config)
