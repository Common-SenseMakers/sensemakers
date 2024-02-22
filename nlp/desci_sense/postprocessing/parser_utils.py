import re


# with GPT-4
def fix_json_string_with_backslashes(json_str):
    """
    Fixes a JSON string by removing unnecessary backslashes while preserving valid escape sequences.
    """
    # Regular expression to find backslashes that are not part of valid escape sequences
    invalid_escape_regex = r'\\(?!["\\/bfnrtu])'

    # Replace invalid escape sequences with their unescaped versions
    fixed_json_str = re.sub(invalid_escape_regex, "", json_str)

    return fixed_json_str
