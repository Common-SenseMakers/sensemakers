import requests
import re


from datetime import datetime
from urllib.parse import urlparse

from ...shared_functions.schema.post import RefPost
from ...utils import convert_html_to_plain_text

from ...shared_functions.utils import extract_and_expand_urls, normalize_url


def convert_mastodon_time_to_datetime(date_str):
    """
    Convert a date string in ISO 8601 format to a datetime object.

    Args:
    date_str (str): A string representing the date in ISO 8601 format.

    Returns:
    datetime: A datetime object representing the given date and time.
    """
    # Define the format string corresponding to the '2023-11-13T16:15:47.094Z' format
    format_str = "%Y-%m-%dT%H:%M:%S.%fZ"

    # Convert the string to a datetime object
    try:
        return datetime.strptime(date_str, format_str)
    except ValueError as e:
        print(f"Error in date conversion: {e}")
        return None


def extract_external_masto_ref_urls(post: dict, add_qrt_url: bool = True):
    """
    Extract list of URLs referenced by this post (in the post text body).
    Shortened URLs are expanded to long form.
    """
    urls = extract_and_expand_urls(post["plain_content"])

    # extract URL from mastodon post card
    if post["card"]:
        if post["card"]["url"]:
            urls += [post["card"]["url"]]

    # normalize urls
    urls = [normalize_url(u) for u in urls]

    # remove dups
    urls = list(set(urls))

    return urls


def extract_instance_and_status(url):
    # Define the regex pattern to extract instance and status ID
    pattern = re.compile(r"https://([^/]+)/@([^/]+)/(\d+)")

    # Use the pattern to find matches in the URL
    match = pattern.match(url)

    if match:
        instance_url = "https://" + match.group(1)
        status_id = match.group(3)
        return instance_url, status_id
    else:
        return None, None


def convert_post_json_to_ref_post(post_json: dict) -> RefPost:
    """_summary_

    Args:
        post_json (dict): _description_

    Returns:
        RefPost: _description_
    """
    author = post_json["account"]["display_name"]

    # convert post content html to plaintext
    text = convert_html_to_plain_text(post_json["content"])
    post_json["plain_content"] = text
    url = post_json["url"]
    created_at = convert_mastodon_time_to_datetime(post_json["created_at"])

    # extract external reference urls from post
    ext_ref_urls = extract_external_masto_ref_urls(post_json)

    post = RefPost(
        author=author,
        content=text,
        url=url,
        created_at=created_at,
        source_network="mastodon",
        metadata=post_json,
        ref_urls=ext_ref_urls,
    )

    return post


# based on chat gpt
def get_mastodon_post_by_instance(
    instance_url, status_id, access_token=None
) -> RefPost:
    """
    Get a single Mastodon post given its status ID.

    Parameters:
        instance_url (str): The URL of the Mastodon instance (e.g., "https://mastodon.social").
        status_id (int): The ID of the Mastodon post.
        access_token (str, optional): An optional access token if the post is on a private account.

    Returns:
        RefPost: The Mastodon post in RefPost format.
    """
    endpoint = f"{instance_url}/api/v1/statuses/{status_id}"
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}

    response = requests.get(endpoint, headers=headers)

    if response.status_code == 200:
        raw_post = response.json()
        post = convert_post_json_to_ref_post(raw_post)
        return post
    else:
        print(f"Failed to get Mastodon post. Status code: {response.status_code}")
        return None


def scrape_mastodon_post(post_url: str) -> RefPost:
    # get instance url and status ID
    instance_url, status_id = extract_instance_and_status(post_url)

    post = get_mastodon_post_by_instance(instance_url, status_id)

    return post
