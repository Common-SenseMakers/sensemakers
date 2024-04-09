import os
from typing import Any, Callable, Set, Union, List
from enum import Enum
from pydantic import (
    AliasChoices,
    AmqpDsn,
    BaseModel,
    Field,
    ImportString,
    PostgresDsn,
    RedisDsn,
    validator,
    ConfigDict,
    field_validator,
)

from pydantic_settings import BaseSettings, SettingsConfigDict

from ..web_extractors.metadata_extractors import MetadataExtractionType


class ParserChainType(str, Enum):
    KEYWORDS = "keywords"
    REFERENCE_TAGGER = "reference_tagger"
    TOPICS = "topics"


def validate_env_var(env_var_name: str, value: Union[str, None]):
    """
    If `value` is not `None`, returns `value`.
    If `value` is `None`, checks if `env_var_name` is defined in the environment
    and returns its value if so. If it isn't defined, raises an error.
    """
    if value is not None:
        return value
    else:
        env_value = os.getenv(env_var_name)
        if env_value is not None:
            return env_value
        else:
            raise ValueError(f"Environment variable '{env_var_name}' is not defined.")


class OpenrouterAPIConfig(BaseSettings):
    api_base: str = Field(
        default="https://openrouter.ai/api/v1",
        description="Base URL for Openrouter API",
    )
    api_key: str | None = Field(
        description="Openrouter API key",
        default=None,
        exclude=True,
    )
    referer: str | None = Field(
        default=None,
        description="Referer for tracking on Openrouter",
        exclude=True,
    )

    @field_validator("api_key")
    def load_api_key_from_env(cls, v):
        return validate_env_var("OPENROUTER_API_KEY", v)

    @field_validator("referer")
    def load_referer_from_env(cls, v):
        return validate_env_var("OPENROUTER_REFERRER", v)


class WandbConfig(BaseSettings):
    entity: str = Field(
        default="common-sense-makers", description="wandb entity to log runs to."
    )
    project: str | None = Field(
        description="wandb project to log runs to",
        default=None,
    )

    @field_validator("project")
    def load_project_from_env(cls, v):
        try:
            return validate_env_var("WANDB_PROJECT", v)
        except Exception:
            # return default if not defined in env or explicitly
            return "st-demo-sandbox"


class MetadataExtractionConfig(BaseSettings):
    extraction_method: MetadataExtractionType = Field(
        default=MetadataExtractionType.CITOID,
        description="Type of URL metadata extraction method to use.",
    )
    max_summary_length: int = Field(
        default=500,
        description="Maximum length of summary to extract -  \
                                          anything beyond will be truncated. Set to -1 to take full length.",
    )


class LLMConfig(BaseSettings, BaseModel):
    llm_type: str = Field(
        default="mistralai/mistral-7b-instruct",
        description="Type of model to be intialized.",
    )
    temperature: str = Field(
        default="0.6",
        description="Temperature paramater to use when sampling model outputs.",
    )


class PostParserChainConfig(BaseSettings):
    name: str
    type: ParserChainType = Field(description="Type of parser chain")
    llm_config: LLMConfig = Field(
        description="Configuration for the LLM used by this parser chain.",
        default_factory=LLMConfig,
    )
    use_metadata: bool = Field(
        default=True,
        description="Whether to use reference metadata in the prompt as context",
    )


class KeywordPParserChainConfig(PostParserChainConfig):
    type: ParserChainType = ParserChainType.KEYWORDS
    max_keywords: int = Field(
        default=6,
        description="Maximum number of keywords to generate",
    )


class RefTaggerChainConfig(PostParserChainConfig):
    type: ParserChainType = ParserChainType.REFERENCE_TAGGER


class TopicsPParserChainConfig(PostParserChainConfig):
    type: ParserChainType = ParserChainType.TOPICS


class MultiParserChainConfig(BaseSettings):
    openrouter_api_config: OpenrouterAPIConfig = Field(
        default_factory=OpenrouterAPIConfig, description="Settings for Openrouter API."
    )
    parser_configs: List[
        Union[
            KeywordPParserChainConfig,
            RefTaggerChainConfig,
            TopicsPParserChainConfig,
        ]
    ] = Field(description="List of parser chain configurations", default_factory=list)
    metadata_extract_config: MetadataExtractionConfig = Field(
        default_factory=MetadataExtractionConfig,
        description="Metadata extraction config for \
                                                          semantic parsing model.",
    )
    wandb_config: WandbConfig = Field(
        default_factory=WandbConfig, description="Wandb config for analytics tracking."
    )
    batch_size: int = Field(
        default=5,
        description="Default batch size for batched requests",
    )
