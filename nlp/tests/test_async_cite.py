import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

# https://stackoverflow.com/a/63539722/2882125
import nest_asyncio
nest_asyncio.apply()

import asyncio
import time
from aiohttp.client import ClientSession
from desci_sense.shared_functions.web_extractors.citoid import (
    fetch_citation_async,
    fetch_all_citations,
    fetch_citation,
)
from desci_sense.shared_functions.web_extractors.metadata_extractors import extract_urls_citoid_metadata


def test_fetch_speed():
    # teting that async citoid fetch is faster than serial fetch
    # run async
    url_list = ["https://www.google.com", "https://www.bing.com"] * 3
    start = time.time()
    asyncio.run(fetch_all_citations(url_list))
    end = time.time()
    async_time = end - start

    # run serially
    start = time.time()
    for url in url_list:
        fetch_citation(url)
    end = time.time()
    serial_time = end - start

    assert async_time < serial_time

def test_mult_url():
    url_list = ["https://www.google.com", "https://www.bing.com"]
    res = extract_urls_citoid_metadata(
        url_list,
        max_summary_length=500,
    )
    assert len(res) == 2

    
if __name__ == "__main__":
    url_list = ["https://www.google.com", "https://www.bing.com"]
    res = extract_urls_citoid_metadata(
        url_list,
        max_summary_length=500,
    )
    # url_list = ["https://www.google.com", "https://www.bing.com"]
    # print(url_list)
    # start = time.time()
    # res = asyncio.run(fetch_all_citations(url_list))
    # end = time.time()
    # print(f"download {len(url_list)} links in {end - start} seconds")

    # print(res)
