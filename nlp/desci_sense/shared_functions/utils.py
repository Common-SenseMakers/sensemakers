import re
import requests
from typing import List, Optional, Tuple
from jinja2 import Environment, BaseLoader
from enum import Enum
import json
from jsoncomment import JsonComment
import html2text
from loguru import logger
from urllib.parse import urlparse

from url_normalize import url_normalize


def extract_twitter_status_id(url):
    """
    Extract the status ID from Twitter or x.com post URLs.

    Parameters:
    url (str): The URL of the Twitter or x.com post.

    Returns:
    str: The extracted status ID or None if not found.
    """
    pattern = r"(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)"
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

    # Remove 'www.' prefix if present
    try:
        if domain.startswith("www."):
            domain = domain[4:]
    except Exception:
        # for invalid urls
        return "Unknown"

    if domain in twitter_domains:
        return "twitter"

    else:
        converted_masto = convert_masto_to_canonical_format(url)
        if converted_masto:
            return "mastodon"
        else:
            return "Unknown"


def unshorten_url(url):
    try:
        response = requests.head(url, allow_redirects=True, timeout=10)
        return response.url
    except requests.RequestException:
        logger.warning(f"[unshorten_url] RequestException for url {url}")
        # return original url in case of errors
        return url


# based on ChatGPT and https://stackoverflow.com/a/6041965
def extract_urls(text):
    """takes a string text as input and uses the regular expression pattern to find all
    occurrences of URLs in the text. returns a list of all non-overlapping matches of the regular expression pattern in the string.
    """
    url_regex = r"((http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-]))"
    # Loose match urls
    # url_regex = r"\b(?:https?://)?(?:www\.)?([a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6})(:[0-9]{1,5})?(/[\w\-./?%&=]*)?"

    res = re.findall(url_regex, text)
    final_res = [r[0] for r in res]
    return final_res


def normalize_url(url):
    """
    Process url to convert it to canonical format.

    Includes:
    - URL unshortening
    -Normalization (using https://pypi.org/project/url-normalize/)


    """
    res = unshorten_url(url)
    res = url_normalize(res)

    return res


def extract_and_expand_urls(text, return_orig_urls: bool = False):
    """_summary_

    Args:
        text (_type_): _description_
    """
    # original unmodified urls
    orig_urls = extract_urls(text)

    # unshortened and normalized urls
    expanded_urls = [normalize_url(url) for url in orig_urls]

    if return_orig_urls:
        return expanded_urls, orig_urls
    else:
        return expanded_urls


def extract_external_urls_from_status_tweet(
    tweet_url: str, tweet_content: str
) -> List[str]:
    """
    Extract list of non-internal URLs referenced by `tweet_content`.
    In this context, internal URLs are URLs of media items associated with the tweet, such as images or videos.
    Internal URLs share the same ID as the referencing tweet.
    Shortened URLs are expanded to long form.
    """
    tweet_id = extract_twitter_status_id(tweet_url)
    external = []
    urls = extract_and_expand_urls(tweet_content)

    for url in urls:
        # extract twitter id from url if the url is a twitter post
        url_twitter_id = extract_twitter_status_id(url)
        if url_twitter_id:  # check if a twitter url
            if (
                url_twitter_id != tweet_id
            ):  # check if url does not share same status id with parsed tweet
                external.append(url)
        else:
            # not twitter url, add
            external.append(url)

    return remove_dups_ordered(external)


def render_to_py_dict(obj_dict, obj_name: str = "object", out_path: str = "output.py"):
    template_str = """{{ obj_name }} = {
    {% for key, value in obj_dict.items() -%}
    '{{ key }}': {{ value|to_py }},
    {% endfor -%}
    }"""

    def to_py_filter(value):
        """Custom Jinja2 filter to convert Python objects to string representations, including nested dictionaries."""
        if isinstance(value, str):
            return '"' + value.replace('"', '\\"') + '"'
        elif value is None:
            return "None"
        elif isinstance(value, list):
            return "[" + ", ".join(to_py_filter(v) for v in value) + "]"
        elif isinstance(value, dict):
            # Handle nested dictionaries
            dict_items = ", ".join(
                f"'{k}': {to_py_filter(v)}" for k, v in value.items()
            )
            return "{" + dict_items + "}"
        elif isinstance(value, (int, float)):
            return str(value)
        else:
            raise TypeError(f"Unsupported type: {type(value)}")

    env = Environment(loader=BaseLoader())
    env.filters["to_py"] = to_py_filter

    template = env.from_string(template_str)
    rendered_content = template.render(
        obj_dict=obj_dict,
        obj_name=obj_name,
    )

    with open(out_path, "w") as file:
        file.write(rendered_content)


def flatten(nested_lists):
    return [item for row in nested_lists for item in row]


def clean_comments(input_string):
    # Remove Python-style comments (anything after a '#' on the same line)
    clean_string = "\n".join(
        [line.split("#")[0].rstrip() for line in input_string.split("\n")]
    )
    return clean_string


def _find_json_object(input_string):
    # find json substring within input string (GPT)
    input_string = clean_comments(input_string)  # clean # style comments
    input_string = input_string.replace("\\_", "_")
    input_string = input_string.replace("\\[", "[")
    input_string = input_string.replace("\\]", "]")  # remove escaping for underscore

    # to handle generated JSONs with comments, trailing commas
    jsonc = JsonComment()

    start = input_string.find("{")
    if start == -1:
        return (
            "[System error]: " + input_string
        )  # No JSON object found, return string for dbug purposes

    # Stack to match curly braces
    stack = []
    for i in range(start, len(input_string)):
        if input_string[i] == "{":
            stack.append(i)
        elif input_string[i] == "}":
            if stack:
                stack.pop()
                if not stack:  # All open braces have been closed
                    end = i + 1
                    try:
                        # Try to parse the substring as JSON
                        parsed_json = jsonc.loads(input_string[start:end])
                        return input_string[
                            start:end
                        ]  # Return the valid JSON substring
                    except json.JSONDecodeError:
                        continue  # The substring is not a valid JSON, continue searching

    return (
        "[System error]: " + input_string
    )  # No valid JSON object found, return string for dbug purposes


def find_json_object(input_msg):
    return _find_json_object(input_msg.content)


def remove_dups_ordered(input_list: list):
    """
    Remove duplicate occurrences of elements while preserving the
    first occurrence of each element in the original list order.
    eg, `remove_dups([5,4,2,5,2,4]) -> [5,4,2]`
    """
    seen = set()
    result = []
    for item in input_list:
        if item not in seen:
            seen.add(item)
            result.append(item)

    return result


def find_last_occurence_of_any(input: str, strings: List[str]) -> Optional[str]:
    """
    Returns element of `strings` that appears last in `input`, or None
    if none of the elements in `strings` appears in `input`
    """
    last_occurrence = None
    last_index = -1

    for s in strings:
        index = input.rfind(s)
        if index > last_index:
            last_index = index
            last_occurrence = s

    return last_occurrence


def trim_str_with_urls(txt: str, max_length: int) -> str:
    """
    Takes input string `txt` which may contain any number of urls. Trims `txt`
    to `max_length` chars while preserving any urls if the cutoff happens in
    the middle of a url.
    E.g., trim_str_with_urls("testing https://x.com/FDAadcomms/status/1798107142219796794", 10) = "testing https://x.com/FDAadcomms/status/1798107142219796794"
    trim_str_with_urls("testing not a valid url", 10) = 'testing no'

    """
    # Regular expression to match URLs
    url_pattern = re.compile(r"https?://[^\s]+")

    # Find all URLs in the text
    urls = list(url_pattern.finditer(txt))

    # If the text is shorter than or equal to the max_length, return it as is
    if len(txt) <= max_length:
        return txt

    # Determine if the cut-off point is within a URL
    for url in urls:
        url_start, url_end = url.span()
        if url_start < max_length < url_end:
            # If the cut-off point is within a URL, return the text up to the end of that URL
            return txt[:url_end]

    # If the cut-off point is not within any URL, return the text up to max_length
    return txt[:max_length]


def trim_str_with_urls_by_sep(
    txt: str,
    max_length: int,
    sep: str,
) -> Tuple[List[str], bool]:
    """
    Takes an input string `txt` which may contain any number of urls, and also
    optionally contains any number of special separator strings `sep`.
    Returns a list of strings `sep_strs: List[str]` containing the substrings of
    `txt` separated by the `sep` occurences (without including the separators).
    The returned result `sep_strs`
    should be uphold `len("".join(sep_strs))<= max_length + M` (for cases where the cutoff
    occurs in the middle of a URL).
    Eg, `trim_str_with_urls_by_sep("123<SEP>456789",4,"<SEP>") ==["123", "4"]`
    Also returns `trimmed` that is `True` if input was trimmed and `False` o.w
    """
    # Split the input string by the separator
    parts = txt.split(sep)
    sep_strs = []
    current_length = 0
    trimmed = False

    for i, part in enumerate(parts):
        # Calculate the potential length if this part is added
        potential_length = current_length + len(part)

        # Check if adding this part would exceed the max_length
        if potential_length > max_length:
            # Trim the part to fit within the remaining length
            trimmed_part = trim_str_with_urls(part, max_length - current_length)
            sep_strs.append(trimmed_part)

            # check if last part was trimmed or we still have parts left
            if trimmed_part != part or (i + 1) < len(parts):
                trimmed = True
            break
        else:
            sep_strs.append(part)
            current_length += len(part)

    return sep_strs, trimmed


def trim_parts(parts: List, max_chars: int) -> Tuple[List[str], bool]:
    """
    Takes a list of string parts and trims them such that the total length of the
    concatenated parts does not exceed the specified maximum number of characters.
    Preserves URLs by ensuring they are not cut off mid-way.

    Args:
        parts (List[str]): List of string parts to trim.
        max_chars (int): Maximum number of characters to trim to.

    Returns:
        Tuple[List[str], bool]: A tuple where the first element is the list of trimmed parts,
        and the second element is a boolean indicating whether the input was trimmed (True) or not (False).
    """
    sep = "<<<SEP>>>"
    joined_parts = sep.join(parts)
    res = trim_str_with_urls_by_sep(
        joined_parts,
        max_length=max_chars,
        sep=sep,
    )
    return res


def trim_parts_to_length(part_lengths: List[int], max_length: int) -> List[int]:
    """Given a list of part lengths and max_length,
    return a new list of trimmed part lengths `trimmed_part_lengths`
    such that `sum(trimmed_part_lengths) <= max_length` while preserving
    as much of `part_lengths` as possible.
    E.g., `trim_parts_to_length([1,2,3], 3) == [1,2])`
    `trim_parts_to_length([1,2,3], 4) == [1,2,1])`
    """
    trimmed_part_lengths = []
    current_length = 0

    for length in part_lengths:
        if current_length + length <= max_length:
            trimmed_part_lengths.append(length)
            current_length += length
        else:
            remaining_length = max_length - current_length
            if remaining_length > 0:
                trimmed_part_lengths.append(remaining_length)
            break

    return trimmed_part_lengths


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


def normalize_tweet_urls_in_text(text: str) -> str:
    """
    Normalize all occurrences of Twitter URLs to uniform format (using x.com).

    Args:
        text (str): Input string.

    Returns:
        str: String after normalization.
    """
    extracted_urls, orig_urls = extract_and_expand_urls(
        text,
        return_orig_urls=True,
    )
    normalized_urls = [normalize_tweet_url(url) for url in extracted_urls]

    # Replace all occurrences of orig_urls in text with normalized_urls
    for orig_url, normalized_url in zip(orig_urls, normalized_urls):
        text = text.replace(orig_url, normalized_url)

    return text
