import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))
import os
import pytest
from pydantic import ValidationError

from desci_sense.shared_functions.configs import (
    OpenrouterAPIConfig,
    WandbConfig,
    LLMConfig,
    KeywordPParserChainConfig,
    RefTaggerChainConfig,
    TopicsPParserChainConfig,
    validate_env_var,
    MultiParserChainConfig,
    ParserChainType,
)  # Adjust the import as necessary


# Test setup to manipulate environment variables
@pytest.fixture
def setup_env_vars():
    original_env = os.environ.copy()
    yield
    os.environ = original_env


def test_openrouter_api_config_with_env_vars(setup_env_vars):
    """
    Test that OpenrouterAPIConfig correctly loads environment variables
    when values are not explicitly provided.
    """
    os.environ["OPENROUTER_API_KEY"] = "test_api_key"
    os.environ["OPENROUTER_REFERRER"] = "test_referer"
    config = OpenrouterAPIConfig()
    assert config.openrouter_api_key == "test_api_key"
    assert config.openrouter_referer == "test_referer"


def test_openrouter_api_config_with_explicit_values_overriding_env_vars(setup_env_vars):
    """
    Test that explicit values passed to OpenrouterAPIConfig override
    environment variables.
    """
    os.environ["OPENROUTER_API_KEY"] = "env_api_key"
    os.environ["OPENROUTER_REFERRER"] = "env_referer"
    config = OpenrouterAPIConfig(
        openrouter_api_key="explicit_api_key", openrouter_referer="explicit_referer"
    )
    assert config.openrouter_api_key == "explicit_api_key"
    assert config.openrouter_referer == "explicit_referer"


def test_openrouter_api_config_missing_required_env_vars_raises_error(setup_env_vars):
    """
    Test that initialization of OpenrouterAPIConfig without setting
    required environment variables raises a ValidationError.
    """
    os.environ.pop("OPENROUTER_API_KEY")
    os.environ.pop("OPENROUTER_REFERRER")
    # Assuming api_key is required and not provided through env vars or explicitly
    with pytest.raises(ValidationError):
        OpenrouterAPIConfig(openrouter_api_base="https://openrouter.ai/api/v1")


#
def test_wandb_config_env():
    os.environ["WANDB_PROJECT"] = "test_wandb"
    config = WandbConfig()
    assert config.project == "test_wandb"


def test_wandb_config_manual():
    os.environ["WANDB_PROJECT"] = "test_wandb"
    config = WandbConfig(project="test")
    assert config.project == "test"


def test_wandb_config_default():
    os.environ.pop("WANDB_PROJECT")
    config = WandbConfig()
    assert config.project == "st-demo-sandbox"


def test_default_runner_config():
    config: MultiParserChainConfig = MultiParserChainConfig()
    config_dict = config.model_dump()
    assert "batch_size" in config_dict


def test_kw_config():
    kp = KeywordPParserChainConfig(name="test")
    assert kp.name == "test"
    assert kp.type == ParserChainType.KEYWORDS


def test_exclude():
    kp = KeywordPParserChainConfig(
        name="kw_test",
        use_metadata=True,
        llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
    )
    rtc = RefTaggerChainConfig(
        name="rt_test",
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

    model_dict = multi_config.model_dump()

    assert "openrouter_api_key" not in model_dict.get("openrouter_api_config")
    assert "openrouter_referer" not in model_dict.get("openrouter_api_config")

    # reload model from dict
    model_reload = MultiParserChainConfig.model_validate(model_dict)
    assert hasattr(model_reload.openrouter_api_config, "openrouter_api_key")
    assert hasattr(model_reload.openrouter_api_config, "openrouter_referer")


if __name__ == "__main__":
    kp = KeywordPParserChainConfig(
        name="kw_test",
        use_metadata=True,
        llm_config=LLMConfig(llm_type="mistralai/mistral-7b-instruct:free"),
    )
    rtc = RefTaggerChainConfig(
        name="rt_test",
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

    model_dict = multi_config.model_dump()

    assert "openrouter_api_key" not in model_dict.get("openrouter_api_config")
    assert "openrouter_referer" not in model_dict.get("openrouter_api_config")

    # reload model from dict
    model_reload = MultiParserChainConfig.model_validate(model_dict)
    assert hasattr(model_reload.openrouter_api_config, "openrouter_api_key")
    assert hasattr(model_reload.openrouter_api_config, "openrouter_referer")
