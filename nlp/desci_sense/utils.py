import re
from enum import Enum
import html2text
from urllib.parse import urlparse


def extract_twitter_status_id(url):
    pattern = r"twitter\.com\/\w+\/status\/(\d+)"
    match = re.search(pattern, url)
    if match:
        return match.group(1)
    else:
        return None


def convert_html_to_plain_text(html_content):
    converter = html2text.HTML2Text()
    converter.ignore_links = True
    plain_text = converter.handle(html_content)
    return plain_text.strip()


def convert_masto_to_canonical_format(url):
    """
    Converts a Mastodon post URL into a canonical format.

    Args:
        url (str): The Mastodon post URL to be converted.

    Returns:
        str: The canonical format of the Mastodon post URL, or None if the input URL is invalid.

    Example:
        >>> input_url = "https://fosstodon.org/@marcc/111404131751876120"
        >>> convert_to_canonical_format(input_url)
        'https://mastodon.social/@marcc@fosstodon.org/111404131751876120'

    The canonical format is constructed as follows:
    - Extracts the instance URL, username, and status ID from the input URL.
    - Constructs a new URL in the format: https://mastodon.social/@username@instance_url/status_id

    Note:
        - used chatgpt to generate
        - threre are non mastodon urls that might match this pattern
    """
    # Define the regex pattern to extract relevant parts
    pattern = re.compile(r"https://([^/]+)/@([^/]+)/(\d+)")

    # Use the pattern to find matches in the URL
    match = pattern.match(url)

    if match:
        instance_url = match.group(1)
        username = match.group(2)
        status_id = match.group(3)

        # Construct the canonical format
        canonical_url = (
            f"https://mastodon.social/@{username}@{instance_url}/{status_id}"
        )
        return canonical_url
    else:
        return None


def identify_social_media(url):
    """
    Identify whether a given URL is from Twitter or Mastodon.

    Parameters:
        url (str): The URL to be identified.

    Returns:
        str: The identified social media platform ('Twitter', 'Mastodon'), or 'Unknown' if not identified.
    """
    twitter_domains = ["twitter.com", "t.co", "x.com"]
    # mastodon_domains = ["mastodon.social", "examplemastodoninstance.com"]  # Add Mastodon instance domains as needed

    parsed_url = urlparse(url)
    domain = parsed_url.netloc.lower()

    if any(twitter_domain in domain for twitter_domain in twitter_domains):
        return "twitter"

    else:
        converted_masto = convert_masto_to_canonical_format(url)
        if converted_masto:
            return "mastodon"
        else:
            return "Unknown"
