import os
from typing import Union, List
from enum import Enum
from pydantic import (
    BaseModel,
    Field,
    field_validator,
)

from pydantic_settings import BaseSettings


class PostProcessType(str, Enum):
    """
    Types of post processing of MultiChainParser outputs
    """

    NONE = "none"  # leave raw output dict unmodified
    COMBINED = "combined"  # for streamlit apps
    FIREBASE = "firebase"  # for firebase app


class ParserChainType(str, Enum):
    KEYWORDS = "keywords"
    REFERENCE_TAGGER = "reference_tagger"
    TOPICS = "topics"
    HASHTAGS = "hashtags"
    MULTI_REF_TAGGER = "multi_reference_tagger"


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
    openrouter_api_base: str = Field(
        default="https://openrouter.ai/api/v1",
        description="Base URL for Openrouter API",
    )
    openrouter_api_key: Union[str, None] = Field(
        description="Openrouter API key",
        default=None,
        exclude=True,
    )
    openrouter_referer: Union[str, None] = Field(
        default=None,
        description="Referer for tracking on Openrouter",
        exclude=True,
    )

    @field_validator("openrouter_api_key")
    def load_api_key_from_env(cls, v):
        return validate_env_var("OPENROUTER_API_KEY", v)

    @field_validator("openrouter_referer")
    def load_referer_from_env(cls, v):
        return validate_env_var("OPENROUTER_REFERRER", v)

    def model_dump_all(self):
        # special method to dump including excluded attrs
        model_dict = self.model_dump()
        model_dict["openrouter_referer"] = self.openrouter_referer
        model_dict["openrouter_api_key"] = self.openrouter_api_key
        return model_dict


class WandbConfig(BaseSettings):
    entity: str = Field(
        default="common-sense-makers", description="wandb entity to log runs to."
    )
    project: Union[str, None] = Field(
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


class MetadataExtractionType(str, Enum):
    NONE = "none"
    CITOID = "citoid"


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


class HashtagPParserChainConfig(PostParserChainConfig):
    type: ParserChainType = ParserChainType.HASHTAGS
    use_metadata: bool = False
    max_hashtags: int = Field(
        default=20,
        description="Maximum number of hashtags to parse",
    )


class RefTaggerChainConfig(PostParserChainConfig):
    type: ParserChainType = ParserChainType.REFERENCE_TAGGER
    is_ref: bool = True  # dummy var, just used for pydnatic type resolution


class MultiRefTaggerChainConfig(PostParserChainConfig):
    type: ParserChainType = ParserChainType.MULTI_REF_TAGGER
    is_multi_ref: bool = True  # dummy var, just used for pydnatic type resolution


class TopicsPParserChainConfig(PostParserChainConfig):
    type: ParserChainType = ParserChainType.TOPICS
    is_topic: bool = True  # dummy var, just used for pydnatic type resolution


class MultiParserChainConfig(BaseSettings):
    openrouter_api_config: OpenrouterAPIConfig = Field(
        default_factory=OpenrouterAPIConfig, description="Settings for Openrouter API."
    )
    parser_configs: List[
        Union[
            KeywordPParserChainConfig,
            RefTaggerChainConfig,
            TopicsPParserChainConfig,
            HashtagPParserChainConfig,
            MultiRefTaggerChainConfig,
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
        description="Default batch size for batched requests. Only used for batched requests.",
    )
    post_process_type: PostProcessType = Field(
        description="Type of post-processing to apply to parser chain results",
        default=PostProcessType.NONE,
    )
