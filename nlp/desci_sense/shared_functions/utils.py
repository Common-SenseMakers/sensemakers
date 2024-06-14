import re
import requests
from jinja2 import Environment, BaseLoader
from enum import Enum
import json
from jsoncomment import JsonComment
import html2text
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
        response = requests.head(url, allow_redirects=True)
        return response.url
    except requests.RequestException as e:
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
