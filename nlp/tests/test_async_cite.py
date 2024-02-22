import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

import asyncio
import time
from aiohttp.client import ClientSession
from desci_sense.shared_functions.web_extractors.citoid import (
    fetch_citation_async,
    fetch_all_citations,
    fetch_citation,
)


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


if __name__ == "__main__":
    url_list = ["https://www.google.com", "https://www.bing.com"] * 3
    print(url_list)
    start = time.time()
    res = asyncio.run(fetch_all_citations(url_list))
    end = time.time()
    print(f"download {len(url_list)} links in {end - start} seconds")

    print(res)
