# using https://en.wikipedia.org/api/rest_v1/#/Citation/getCitation API

from typing import List

from loguru import logger
import asyncio
import aiohttp
from aiohttp.client import ClientSession

import requests
from urllib.parse import quote


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


async def fetch_all_citations(urls: list):
    my_conn = aiohttp.TCPConnector(limit=10)
    async with aiohttp.ClientSession(connector=my_conn) as session:
        tasks = []
        for url in urls:
            task = asyncio.ensure_future(
                fetch_citation_async(target_url=url, session=session)
            )
            tasks.append(task)
        results = await asyncio.gather(
            *tasks, return_exceptions=True
        )  # the await must be nest inside of the session

    return results


def fetch_citation(target_url):
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

        # remember the target url as the original_url
        response["original_url"] = target_url

        return response
    else:
        formatted_err_msg = {
            "msg": f"Error: Unable to fetch data. Status code: {response.status_code}"
        }
        return formatted_err_msg


def fetch_citations(urls) -> List:
    """
    Return Citoid metadata for each URL in list
    """
    return [fetch_citation(url) for url in urls]
