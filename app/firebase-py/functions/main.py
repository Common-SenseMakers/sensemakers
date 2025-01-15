import json

from firebase_functions import https_fn
from firebase_admin import initialize_app

from loguru import logger

from shared_functions.interface import ParsePostRequest
from shared_functions.main import (
    SM_FUNCTION_post_parser_config,
    SM_FUNCTION_post_parser_imp,
)
from env_config import (
    openai_api_key,
    ref_tagger_model,
    topic_model,
    kw_model,
)

app = initialize_app()


@https_fn.on_request(min_instances=0, max_instances=100, memory=2048, timeout_sec=3600, concurrency=190)
def SM_FUNCTION_post_parser(request):
    """
    Wrapper on SM_FUNCTION_post_parser_imp
    """
    request_json = request.get_json()
    post = request_json["post"]
    parameters = request_json["parameters"]

    # we will handle credentials from here and also crendentials rotation if needed
    # input is going to be an array of posts to parse

    config: SM_FUNCTION_post_parser_config = {
        "openrouter_api_key": openai_api_key,
        "openrouter_api_base": "https://openrouter.ai/api/v1",
        "openrouter_referer": "https://127.0.0.1:3000/",
        "ref_tagger_llm_type": ref_tagger_model,
        "kw_llm_type": kw_model,
        "topic_llm_type": topic_model,
    }

    logger.info(f"Calling SM_FUNCTION_post_parser_imp with config: {config}")

    request: ParsePostRequest = {
        "post": post,
        "parameters": parameters,
    }

    parser_result = SM_FUNCTION_post_parser_imp(request, config)
    parser_json = parser_result.model_dump_json()

    return https_fn.Response(
        parser_json,
        status=200,
        headers={"Content-Type": "application/json"},
    )
