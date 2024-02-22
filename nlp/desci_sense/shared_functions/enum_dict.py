from enum import Enum

# GPT 4 based on https://stackoverflow.com/questions/70146417/python-dictionary-with-enum-as-key


class EnumDictKey(Enum):
    @classmethod
    def is_valid_enum(cls, value):
        if isinstance(value, cls):
            value = value.value
        return value in cls.__members__


class EnumDict(dict):
    def __init__(self, enum_type):
        if not issubclass(enum_type, EnumDictKey):
            raise ValueError("enum_type must be a subclass of EnumDictKey")
        self.enum_type = enum_type
        super().__init__()

    def __setitem__(self, k, v):
        if self.enum_type.is_valid_enum(k):
            super().__setitem__(self.enum_type(k), v)
        else:
            raise KeyError(f"{self.enum_type.__name__} {k} is not valid")

    def __getitem__(self, k):
        if isinstance(k, str):
            k = self.enum_type(k.upper())
        return super().__getitem__(k)
