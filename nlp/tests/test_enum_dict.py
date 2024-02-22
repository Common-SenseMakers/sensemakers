import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

import pytest
from enum import Enum

from desci_sense.shared_functions.enum_dict import EnumDict, EnumDictKey


# ... (EnumDictKey, EnumDict, Color, Size classes here)
class Color(EnumDictKey):
    RED = "RED"
    GREEN = "GREEN"
    BLUE = "BLUE"


class Size(EnumDictKey):
    SMALL = "SMALL"
    MEDIUM = "MEDIUM"
    LARGE = "LARGE"


class PromptCase(EnumDictKey):
    ZERO_REF = "ZERO_REF"
    SINGLE_REF = "SINGLE_REF"
    MULTI_REF = "MULTI_REF"


def test_init_with_valid_enum():
    """Test initialization with a valid EnumDictKey subclass."""
    try:
        color_dict = EnumDict(Color)
        assert isinstance(color_dict, EnumDict)
    except ValueError:
        pytest.fail("EnumDict initialization failed with a valid EnumDictKey subclass.")


def test_init_with_invalid_enum():
    """Test initialization with an invalid type (not a subclass of EnumDictKey)."""
    with pytest.raises(ValueError):
        invalid_dict = EnumDict(Enum)


def test_set_get_item():
    """Test setting and getting items."""
    color_dict = EnumDict(Color)
    color_dict[Color.RED] = 123
    color_dict["GREEN"] = 456
    assert color_dict[Color.RED] == 123
    assert color_dict["GREEN"] == 456


def test_set_invalid_key():
    """Test setting an item with an invalid key."""
    color_dict = EnumDict(Color)
    with pytest.raises(KeyError):
        color_dict["INVALID_COLOR"] = 999


def test_multiple_enum_types():
    """Test that the dictionary works with different EnumDictKey subclasses."""
    color_dict = EnumDict(Color)
    size_dict = EnumDict(Size)

    color_dict[Color.RED] = "red"
    size_dict[Size.SMALL] = "small"

    assert color_dict[Color.RED] == "red"
    assert size_dict[Size.SMALL] == "small"


def test_prompt_case_enum_types():
    prompt_dict = EnumDict(PromptCase)
    prompt_dict[PromptCase.ZERO_REF] = 123
    assert prompt_dict["ZERO_REF"] == 123
