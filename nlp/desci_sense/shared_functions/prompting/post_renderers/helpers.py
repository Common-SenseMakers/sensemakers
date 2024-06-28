from typing import List
from ...web_extractors.metadata_extractors import (
    RefMetadata,
)


def render_metadata(md_list: List[RefMetadata]) -> str:
    metadata_str = ""
    for i, metadata in enumerate(md_list):
        metadata_str += f"<ref_{i+1}> \n{metadata.to_str()}\n==========\n"
    return metadata_str
