# Twitter scraping based on https://github.com/JustAnotherArchivist/snscrape/issues/996#issuecomment-1777981568

from typing import Optional, Union, List
import re
import requests
from datetime import datetime

from ...interface import AppPost, PlatformType
from ...utils import (
    extract_and_expand_urls,
    normalize_url,
    extract_twitter_status_id,
    remove_dups_ordered,
)
from ...schema.post import RefPost, QuoteRefPost

# from ...utils import extract_twitter_status_id


def convert_twitter_time_to_datetime(date_str):
    """
    Convert a date string in Twitter format to a datetime object.

    Args:
    date_str (str): A string representing the date in Twitter format.

    Returns:
    datetime: A datetime object representing the given date and time.
    """
    # Define the format string corresponding to the '2023-11-13T16:15:47.094Z' format
    format_str = "%a %b %d %H:%M:%S %z %Y"

    # Convert the string to a datetime object
    try:
        return datetime.strptime(date_str, format_str)
    except ValueError as e:
        print(f"Error in date conversion: {e}")
        return None


# https://twitter.com/rtk254/status/1750149313399832818
def convert_archive_tweet_to_ref_post(data: dict, user_name: str) -> RefPost:
    """
    Convert a raw twitter post (dict format) from twitter archive to RefPost format
    """
    tweet = data["tweet"]
    author = user_name
    text = tweet["full_text"]
    url = f"https://twitter.com/{user_name}/status/{tweet['id']}"
    created_at = convert_twitter_time_to_datetime(tweet["created_at"])

    # extract external reference urls from post
    ext_ref_urls = [url_data["expanded_url"] for url_data in tweet["entities"]["urls"]]

    post = RefPost(
        author=author,
        content=text,
        url=url,
        created_at=created_at,
        source_network="twitter",
        ref_urls=ext_ref_urls,
    )
    return post


def convert_vxtweet_to_ref_post(tweet: dict) -> RefPost:
    """
    Convert a raw twitter post (dict format) from vxtwitter API to RefPost format
    """
    author = tweet["user_name"]
    text = tweet["text"]
    url = normalize_tweet_url(tweet["tweetURL"])
    date = convert_twitter_time_to_datetime(tweet["date"])

    # if this is a quote tweet, record quoted tweet url
    quoted_url = normalize_tweet_url(tweet["qrtURL"]) if tweet["qrtURL"] else None

    # extract external reference urls from post
    ext_ref_urls, orig_to_normed_map = extract_external_ref_urls(tweet)

    # replace original urls with normalized forms
    content = text
    for orig_url, normed_url in orig_to_normed_map.items():
        if orig_url in content:
            content = text.replace(orig_url, normed_url)

    post = RefPost(
        author=author,
        content=content,
        url=url,
        created_at=date,
        source_network="twitter",
        metadata=tweet,
        ref_urls=ext_ref_urls,
        quoted_url=quoted_url,
    )
    return post


def convert_basic_twitter_post_to_ref_post(basic_post: AppPost) -> RefPost:
    author = basic_post.author
    text = basic_post.content
    url = normalize_tweet_url(basic_post.url)

    # date not currently used
    # date = convert_twitter_time_to_datetime(tweet["date"])

    # qrtURL not currently used
    # if this is a quote tweet, record quoted tweet url

    # extract external reference urls from post
    ext_ref_urls, orig_to_normed_map = extract_external_ref_urls_from_twitter_post(
        url,
        text,
    )

    # replace original urls with normalized forms
    content = text
    for orig_url, normed_url in orig_to_normed_map.items():
        if orig_url in content:
            content = text.replace(orig_url, normed_url)

    post = RefPost(
        author=author,
        content=content,
        url=url,
        source_network="twitter",
        ref_urls=ext_ref_urls,
    )
    return post


def convert_vxtweet_to_quote_ref_post(tweet: dict) -> QuoteRefPost:
    """
    Convert a raw twitter post (dict format) from vxtwitter API to QuoteRefPost format
    """
    ref_post = convert_vxtweet_to_ref_post(tweet)

    # if this is a quote tweet, record quoted tweet
    if tweet["qrt"]:
        quoted_tweet = convert_vxtweet_to_ref_post(tweet["qrt"])
        quoted_url = quoted_tweet.url
        assert (
            quoted_url in ref_post.md_ref_urls()
        ), f"{quoted_url} not in {ref_post.md_ref_urls()}"
    else:
        quoted_tweet = None
        quoted_url = None

    post = QuoteRefPost(
        author=ref_post.author,
        content=ref_post.content,
        url=ref_post.url,
        created_at=ref_post.created_at,
        source_network="twitter",
        metadata=tweet,
        ref_urls=ref_post.md_ref_urls(),
        quoted_url=quoted_url,
        quoted_post=quoted_tweet,
    )
    return post


def scrape_tweet(tweet_id: Union[str, int]) -> QuoteRefPost:
    response = requests.get(url=f"https://api.vxtwitter.com/Twitter/status/{tweet_id}")
    if not response.ok:
        print("Couldn't get tweet.")
        return
    try:
        data = response.json()
        post: QuoteRefPost = convert_vxtweet_to_quote_ref_post(data)
        return post
    except requests.JSONDecodeError:
        print("Couldn't decode response.")
        return


def extract_status_id(url):
    """
    takes a Twitter post URL as input, uses a regular expression pattern to find the status_id, and returns it as a string.
    If no match is found, it returns None.

    """
    pattern = r"twitter\.com\/\w+\/status\/(\d+)"
    match = re.search(pattern, url)
    if match:
        return match.group(1)
    else:
        return None


def normalize_tweet_url(url):
    """
    Normalize Twitter post URLs to use the x.com domain.

    Parameters:
    url (str): The original Twitter URL.

    Returns:
    str: The normalized URL with x.com domain.
    """
    if "twitter.com" in url:
        return url.replace("twitter.com", "x.com")
    else:
        return url


# TODO combine with method below
def extract_external_ref_urls(tweet: dict, add_qrt_url: bool = True):
    """
    Extract list of non-internal URLs referenced by this tweet (in the tweet text body).
    In this context, internal URLs are URLs of media items associated with the tweet, such as images or videos.
    Internal URLs share the same ID as the referencing tweet.
    Shortened URLs are expanded to long form.
    Quote Retweets (QRTs) are treated by default as an external URL. (disable by setting `add_qrt_url`=False)
    """
    expanded_urls, orig_urls = extract_and_expand_urls(
        tweet["text"], return_orig_urls=True
    )

    orig_to_normed_map = {
        orig_url: exp_url for (orig_url, exp_url) in zip(orig_urls, expanded_urls)
    }

    normed_urls = [normalize_tweet_url(url) for url in expanded_urls]

    # add qrt url if this was a qrt
    if add_qrt_url:
        quote_tweet = tweet.get("qrt", None)
        if quote_tweet:
            qrt_url = normalize_tweet_url(quote_tweet["tweetURL"])
            normed_urls += [qrt_url]

    # remove duplicate urls
    expanded_urls = remove_dups_ordered(normed_urls)

    external = []
    for url in expanded_urls:
        twitter_id = extract_twitter_status_id(url)
        if twitter_id:  # check if a twitter url
            if (
                twitter_id != tweet["tweetID"]
            ):  # check if url shares same status id with parsed tweet
                external.append(url)
        else:
            # not twitter url, add
            external.append(url)

    return remove_dups_ordered(external), orig_to_normed_map


def extract_external_ref_urls_from_twitter_post(
    post_url: str,
    post_content: str,
):
    """
    Extract list of non-internal URLs referenced by `post_content`.
    In this context, internal URLs are URLs of media items associated with the tweet, such as images or videos.
    Internal URLs share the same ID as the referencing tweet URL `post_url`.
    Shortened URLs are expanded to long form.
    """
    expanded_urls, orig_urls = extract_and_expand_urls(
        post_content, return_orig_urls=True
    )

    orig_to_normed_map = {
        orig_url: exp_url for (orig_url, exp_url) in zip(orig_urls, expanded_urls)
    }

    normed_urls = [normalize_tweet_url(url) for url in expanded_urls]

    # remove duplicate urls
    expanded_urls = remove_dups_ordered(normed_urls)

    external = []

    post_twitter_id = extract_twitter_status_id(post_url)

    for url in expanded_urls:
        twitter_id = extract_twitter_status_id(url)
        if twitter_id:  # check if a twitter url
            if (
                twitter_id != post_twitter_id
            ):  # check if url shares same status id with parsed tweet
                external.append(url)
        else:
            # not twitter url, add
            external.append(url)

    return remove_dups_ordered(external), orig_to_normed_map
