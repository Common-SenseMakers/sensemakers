import json

from firebase_functions import https_fn
from firebase_admin import initialize_app

from loguru import logger

from shared_functions.main import (
    SM_FUNCTION_post_parser_config,
    SM_FUNCTION_post_parser_imp,
)
from env_config import openai_api_key, model

app = initialize_app()


@https_fn.on_request(min_instances=1, memory=2048, timeout_sec=600)
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
        "llm_type": model,
    }

    logger.info(f"Calling SM_FUNCTION_post_parser_imp with config: {config}")

    parser_result = SM_FUNCTION_post_parser_imp(post["content"], parameters, config)
    parser_json = parser_result.model_dump_json()

    return https_fn.Response(
        parser_json,
        status=200,
        headers={"Content-Type": "application/json"},
    )
