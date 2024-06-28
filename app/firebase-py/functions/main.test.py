import json
from shared_functions.main import (
    SM_FUNCTION_post_parser_imp,
    SM_FUNCTION_post_parser_config,
)
from env_config import openai_api_key

# content = 'This is definititely an announcement of https://www.alink.com and I dont agree with https://anotherlink.io'
author_data = {
    "platformId": "Twitter",
    "id": "12345",
    "username": "johndoe",
    "name": "John Doe",
}

post_data = {
    "content": "This is an interesting paper https://arxiv.org/abs/2312.05230 but I disagree with its sequel https://arxiv.org/abs/2401.14000  #user-hashtag"
}

thread_data = {"thread": [post_data], "author": author_data}

parameters = {}

parser_request = {"post": thread_data, "parameters": parameters}

config: SM_FUNCTION_post_parser_config = {
    "openrouter_api_key": openai_api_key,
    "openrouter_api_base": "https://openrouter.ai/api/v1",
    "openrouter_referer": "https://127.0.0.1:3000/",
    "llm_type": "openai/gpt-3.5-turbo",
}

result = SM_FUNCTION_post_parser_imp(parser_request, config)

serialized = result.model_dump_json()

json_obj = json.loads(serialized)
print(f"semantics: {json_obj['semantics']}")

with open("last_output.json", "wb") as file:
    file.write(serialized.encode("utf-8"))
