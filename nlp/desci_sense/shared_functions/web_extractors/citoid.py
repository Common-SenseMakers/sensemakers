# using https://en.wikipedia.org/api/rest_v1/#/Citation/getCitation API

from typing import List, Dict, Union, Tuple


from loguru import logger
import asyncio
import aiohttp
from aiohttp.client import ClientSession
import requests
from urllib.parse import quote
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
)
from ..utils import identify_social_media



def citoid_social_media_post(target_url: str, platform_name:str) -> Dict:
    return {
        "itemType": "forumPost",
        "creators": [],
        "tags": [],
        "title": f"{platform_name} post",
        "url": target_url,
    }
def pre_check_target_url(target_url: str) -> Tuple[bool, Dict]:
    """_summary_

    Args:
        target_url (str): target url to check

    Returns:
        bool: True if Citoid call should be skipped. False o.w.
        Dict: if True, citoid structured response to be used instead of Citoid call. None o.w.
    """
    # check social media type
    social_type = identify_social_media(target_url)

    if social_type == "Unknown":
        return False, None
    else:
        return True, citoid_social_media_post(target_url,social_type)


# https://plainenglish.io/blog/send-http-requests-as-fast-as-possible-in-python-304134d46604
async def fetch_citation_async(target_url, session: ClientSession):
    # Fixed part of the API endpoint
    base_url = "https://en.wikipedia.org/api/rest_v1/data/citation/zotero/"

    # URL-encoding the target URL
    logger.debug(f"target_url={target_url}")
    encoded_url = quote(target_url, safe="")

    # Constructing the full URL
    full_url = base_url + encoded_url

    # Headers to be sent with the request
    headers = {"accept": "application/json; charset=utf-8;"}
    async with session.get(full_url, headers=headers) as response:
        result = await response.json()
        try:
            result = result[0]
            return result
        except Exception as e:
            return {"msg": f"Error: Unable to fetch data. Error: {e}"}


def validate_metadata(metadata):
    try:
        if "msg" in metadata and metadata["msg"].startswith("Error:"):
            logger.error(f"Error in metadata extraction: {metadata}")
            raise Exception("Error in response!")
    except Exception as e:
        logger.error(f"[exception caught] Error in metadata extraction: {e}")
        raise Exception("[exception caught] Error in response!")


def before_retry(retry_state):
    """Function to execute before each retry."""
    logger.warning(f"Retry attempt {retry_state.attempt_number}")


def return_default_value(retry_state):
    logger.error("Max retries exceeded. Returning default value.")
    return {
        "error": f"Failed to fetch data after {retry_state.attempt_number} attempts."
    }


@retry(
    stop=stop_after_attempt(5),  # Stop after 5 attempts
    wait=wait_exponential(multiplier=1, max=10),  # Exponential backoff strategy
    retry_error_callback=return_default_value,  # Callback to provide default return value
    reraise=False,  # Do not re-raise the exception after final attempt
    before=before_retry,  # Execute before_retry function before each attempt
)
async def fetch_citation_async_retry(target_url, session: ClientSession):
    skip_citoid, response = pre_check_target_url(target_url)
    if skip_citoid:
        logger.debug(f"skipping citoid for {target_url}")
        return response

    # Fixed part of the API endpoint
    base_url = "https://en.wikipedia.org/api/rest_v1/data/citation/zotero/"

    # URL-encoding the target URL
    logger.debug(f"target_url={target_url}")
    encoded_url = quote(target_url, safe="")

    # Constructing the full URL
    full_url = base_url + encoded_url

    # Headers to be sent with the request
    headers = {"accept": "application/json; charset=utf-8;"}
    async with session.get(full_url, headers=headers) as response:
        result = await response.json()
        result = result[0]
        validate_metadata(result)
        return result


async def fetch_all_citations(urls: list):
    my_conn = aiohttp.TCPConnector(limit=10)
    async with aiohttp.ClientSession(connector=my_conn) as session:
        tasks = []
        for url in urls:
            task = asyncio.ensure_future(
                fetch_citation_async_retry(target_url=url, session=session)
            )
            tasks.append(task)
        results = await asyncio.gather(
            *tasks, return_exceptions=True
        )  # the await must be nest inside of the session

    return results


@retry(
    stop=stop_after_attempt(5),  # Stop after 5 attempts
    wait=wait_exponential(multiplier=1, max=10),  # Exponential backoff strategy
    retry_error_callback=return_default_value,  # Callback to provide default return value
    reraise=False,  # Do not re-raise the exception after final attempt
    before=before_retry,  # Execute before_retry function before each attempt
)
def fetch_citation(target_url):
    skip_citoid, response = pre_check_target_url(target_url)
    if skip_citoid:
        logger.debug(f"skipping citoid for {target_url}")
        return response
    logger.debug(f"fetching citoid data for: {target_url}")

    # Fixed part of the API endpoint
    base_url = "https://en.wikipedia.org/api/rest_v1/data/citation/zotero/"

    # URL-encoding the target URL
    encoded_url = quote(target_url, safe="")

    # Constructing the full URL
    full_url = base_url + encoded_url

    # Headers to be sent with the request
    headers = {"accept": "application/json; charset=utf-8;"}

    # Sending a GET request to the API
    response = requests.get(full_url, headers=headers)

    # Checking if the request was successful
    if response.status_code == 200:
        # return JSON response
        response = response.json()[0]

        # validate that there were no errors
        validate_metadata(response)

        # remember the target url as the original_url
        response["original_url"] = target_url

        return response
    else:
        raise aiohttp.ClientError(
            f"Failed to retreive citoid metadata for url {target_url}. Response: {response}"
        )


def fetch_citations(urls) -> List:
    """
    Return Citoid metadata for each URL in list
    """
    return [fetch_citation(url) for url in urls]
