import os
import asyncio
from openai import AsyncOpenAI

from pathlib import Path
import sys

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

from desci_sense.configs import default_init_parser_config


async def call_language_model(client: AsyncOpenAI, input_text: str) -> None:
    chat_completion = await client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": input_text,
            }
        ],
        model="mistralai/mistral-7b-instruct",
    )

    return chat_completion


async def main(api_key: str) -> None:
    # Initialize the client inside the main function
    client = AsyncOpenAI(
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
    )

    # Define different inputs for parallel calls
    inputs = ["Say this is a test", "How's the weather today?", "Tell me a joke"]

    # Schedule multiple tasks to run concurrently, passing the client as an argument
    tasks = [call_language_model(client, input_text) for input_text in inputs]
    results = await asyncio.gather(*tasks)

    # Process or print the results
    for result in results:
        print(result)


if __name__ == "__main__":
    config = default_init_parser_config()

    client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=config["openai_api"]["openai_api_key"],
    )

    asyncio.run(main(config["openai_api"]["openai_api_key"]))
