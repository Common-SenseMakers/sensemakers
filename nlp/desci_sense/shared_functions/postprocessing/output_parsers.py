import re
from typing import List, Tuple

from langchain.schema import BaseOutputParser


def detect_academic_kw(keywords: List[str]) -> Tuple[str, List[str]]:
    """if special keyword 'academic' is in `keywords`,
    return 'academic' and updated list without the `academic` element. If 'not-academic' is in the list return 'not-academic' and the updated list without the `not-academic` element. In all other cases return 'not-detected' and the list unchanged.
    """
    lower_keywords = [kw.lower().rstrip() for kw in keywords]
    if "academic" in lower_keywords:
        # Find the original keyword to remove
        original_keyword = keywords[lower_keywords.index("academic")]
        keywords.remove(original_keyword)
        return "academic", keywords
    elif "not-academic" in lower_keywords:
        # Find the original keyword to remove
        original_keyword = keywords[lower_keywords.index("not-academic")]
        keywords.remove(original_keyword)
        return "not-academic", keywords
    else:
        return "not-detected", keywords


# GPT4
def extract_unique_keywords(input_str: str) -> List[str]:
    """
    Extracts from input text all unique keywords denoted by `#`.
    For example, for `input_str = "#AI, #Web3, #AI"` the output would be
    ["AI", "Web3"].
    """
    # Split the input string by space to get individual words
    words = input_str.split()

    # Extract words that start with '#' and remove the '#' prefix
    # Use a set to ensure uniqueness and strip punctuation from each keyword
    keywords = {
        word.strip("#").rstrip(":,. ") for word in words if word.startswith("#")
    }
    return list(keywords)


def convert_string_to_list(input_string):
    """
    convert a string representing a list of names into a list of the names.
    """
    names_list = [name.strip() for name in input_string.split(",") if name.strip()]
    return names_list


def extract_tags(input_text: str, tags: List[str]) -> List[str]:
    """
    Given an input text and a list of tags, return a list of all tags appearing in the text
    in the order of their occurrence, accounting for tags that may be substrings of other words.
    * note this may lead to some unintended hallucination edge cases *
    Args:
    input_text (str): The text in which to search for tags.
    tags (List[str]): The list of tags to search for in the text.

    Returns:
    List[str]: A list of tags found in the input text, in the order of their occurrence.
    """
    pattern = "|".join(map(re.escape, tags))
    found_tags = re.findall(pattern, input_text.lower())

    # make sure tags are unique
    unique_found_tags = list(set(found_tags))

    return unique_found_tags


class TagTypeParser(BaseOutputParser):
    """Parse the output of an LLM call to a dict ."""

    allowed_tags: List[str]

    @property
    def valid_tags(self):
        return self.allowed_tags

    def parse(self, text: str):
        """Parse the output of an LLM call."""
        # Define the regular expressions for the three sections
        reasoning_steps_pattern = r"Reasoning Steps:(.*?)Candidate Tags:"
        candidate_tags_pattern = r"Candidate Tags:(.*?)Final Answer:"
        final_answer_pattern = r"Final Answer:(.*)"

        # Extract content using regular expressions with error handling
        try:
            reasoning_steps = (
                re.search(reasoning_steps_pattern, text, re.DOTALL).group(1).strip()
            )
        except AttributeError:
            reasoning_steps = "[System error: failed to extract reasoning steps since the generated output was in an invalid format]"

        try:
            candidate_tags = (
                re.search(candidate_tags_pattern, text, re.DOTALL).group(1).strip()
            )
        except AttributeError:
            candidate_tags = "[System error: failed to extract candidate tags since the generated output was in an invalid format.]"

        try:
            final_answer = (
                re.search(final_answer_pattern, text, re.DOTALL).group(1).strip()
            )
        except AttributeError:
            final_answer = "<error>"

        final_reasoning = (
            "[Reasoning Steps]\n\n"
            + reasoning_steps.strip()
            + "\n\n[Candidate Tags]\n\n"
            + candidate_tags.strip()
        )

        # force final answer to conform to closed set of tags
        multi_tags = extract_tags(final_answer, self.valid_tags)

        # if we only want to choose single tag - take first
        single_tag = multi_tags[:1]

        # Combine into a tuple
        extracted_content = {
            "reasoning": final_reasoning,
            "final_answer": final_answer,
            "single_tag": single_tag,
            "multi_tag": multi_tags,
        }
        # print("Extracted Content Tuple:", extracted_content)
        return extracted_content


class KeywordParser(BaseOutputParser):
    """Parse the output of an LLM call to a dict ."""

    max_keywords: int = -1

    def parse(self, text: str):
        """Parse the output of an LLM call."""
        # Define the regular expressions for the three sections
        reasoning_steps_pattern = r"Reasoning Steps:(.*?)Candidate Keywords:"
        candidate_tags_pattern = r"Candidate Keywords:(.*?)Final Answer:"
        final_answer_pattern = r"Final Answer:(.*)"

        # Extract content using regular expressions with error handling
        try:
            reasoning_steps = (
                re.search(reasoning_steps_pattern, text, re.DOTALL).group(1).strip()
            )
        except AttributeError:
            reasoning_steps = "[System error: failed to extract reasoning steps since the generated output was in an invalid format]"

        try:
            candidate_tags = (
                re.search(candidate_tags_pattern, text, re.DOTALL).group(1).strip()
            )
        except AttributeError:
            candidate_tags = "[System error: failed to extract candidate keywords since the generated output was in an invalid format.]"

        try:
            final_answer = (
                re.search(final_answer_pattern, text, re.DOTALL).group(1).strip()
            )
        except AttributeError:
            final_answer = "<error>"

        final_reasoning = (
            "[Reasoning Steps]\n\n"
            + reasoning_steps.strip()
            + "\n\n[Candidate Keywords]\n\n"
            + candidate_tags.strip()
        )

        # extract unique keywords
        valid_keywords = extract_unique_keywords(final_answer)

        # filter special academic flag keyword
        academic_indicator_kw, updated_kws = detect_academic_kw(valid_keywords)

        # take only top keywords (if -1 take all)
        max_k = self.max_keywords if self.max_keywords > 0 else len(updated_kws)
        top_k_valid = updated_kws[:max_k]

        # Combine into a tuple
        extracted_content = {
            "reasoning": final_reasoning,
            "final_answer": final_answer,
            "valid_keywords": top_k_valid,
            "academic_kw": academic_indicator_kw,
            "raw_text": text,
        }

        return extracted_content
