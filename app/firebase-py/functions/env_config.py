import os
from dotenv import load_dotenv
from loguru import logger

# Determine the environment and choose the appropriate .env file
environment = os.getenv(
    "ENVIRONMENT", "development"
)  # Default to 'development' if not set

if environment == "production":
    dotenv_path = os.path.join(os.path.dirname(__file__), ".env.prod")
elif environment == "staging":
    dotenv_path = os.path.join(os.path.dirname(__file__), ".env.staging")
elif environment == "dev":
    dotenv_path = os.path.join(os.path.dirname(__file__), ".env.dev")
else:
    dotenv_path = os.path.join(
        os.path.dirname(__file__), ".env"
    )  # Default to .env for development


# Load the environment variables from the chosen file
logger.debug(f"Loading environment variables from {dotenv_path}...")
load_dotenv(dotenv_path)

openai_api_key = os.environ.get("OPENROUTER_API_KEY")

# default model to be used if no task specific models defined
default_model = os.environ.get("MODEL")

# if there are specific per task models defined, use those
ref_tagger_model = os.environ.get("REF_MODEL", default_model)
kw_model = os.environ.get("KW_MODEL", default_model)
topic_model = os.environ.get("TOPIC_MODEL", default_model)

min_instances = int(os.environ.get("MIN_INSTANCES", 0))

logger.debug(f"ref_tagger_model={ref_tagger_model}")
logger.debug(f"kw_model={kw_model}")
logger.debug(f"topic_model={topic_model}")
