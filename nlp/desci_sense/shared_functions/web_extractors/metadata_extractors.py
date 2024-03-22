from typing import List, Dict
from enum import Enum
import asyncio

from ..interface import RefMetadata

from .citoid import fetch_citation, fetch_all_citations
from ...shared_functions.schema.post import RefPost
from ..utils import flatten


class MetadataExtractionType(str, Enum):
    NONE = "none"
    CITOID = "citoid"


def get_trunc_str(input_str: str, max_len: int) -> str:
    """
    Get truncated string of up to length max_len, unless max_len
    < 0 in which case return full length string.
    """
    max_len = max_len if max_len > 0 else len(input_str)
    return input_str[:max_len]


def normalize_citoid_metadata(
    target_urls: List[str],
    metadata_list: List[dict],
    max_summary_length,
):
    assert len(target_urls) == len(metadata_list)
    results = []
    for url, metadata in zip(target_urls, metadata_list):
        metadata["original_url"] = url
        summary = metadata.get("abstractNote", "")

        skip = False
        if "msg" in metadata and metadata["msg"].startswith("Error:"):
            skip = True

        if not skip:
            results.append(
                RefMetadata(
                    **{
                        "citoid_url": metadata.get("url", None),
                        "url": metadata.get("original_url", None),
                        "item_type": metadata.get("itemType", None),
                        "title": metadata.get("title", ""),
                        "summary": get_trunc_str(summary, max_summary_length),
                    }
                )
            )
    return results


def extract_citoid_metadata(target_url, max_summary_length):
    """
    TODO:
    """
    citoid_metadata = [fetch_citation(target_url)]
    # TODO: This check is still valid when there is an error fetching the URL
    assert len(citoid_metadata) == 1
    normalized = normalize_citoid_metadata(
        [target_url], citoid_metadata, max_summary_length
    )
    return normalized[0] if len(normalized) > 0 else []


def extract_metadata_by_type(
    target_url, md_type: MetadataExtractionType, max_summary_length
) -> List[RefMetadata]:
    """_summary_

    Args:
        target_url (_type_): _description_
        md_type (MetadataExtractionType): _description_

    Returns:
        List[RefMetadata]: _description_
    """
    if md_type == MetadataExtractionType.NONE:
        return []
    if md_type == MetadataExtractionType.CITOID:
        return [extract_citoid_metadata(target_url, max_summary_length)]
    else:
        raise ValueError(f"Unsupported extraaction type:{md_type.value}")


def extract_urls_citoid_metadata(
    target_urls: List[str],
    max_summary_length: int,
):
    """_summary_

    Args:
        target_urls (List[str]): _description_
    """
    if len(target_urls) == 0:
        return []
    if len(target_urls) == 1:
        return [extract_citoid_metadata(target_urls[0], max_summary_length)]
    else:
        # use parallel call
        metadatas_raw = asyncio.run(fetch_all_citations(target_urls))
        return normalize_citoid_metadata(target_urls, metadatas_raw, max_summary_length)


def extract_all_metadata_by_type(
    target_urls, md_type: MetadataExtractionType, max_summary_length: int
) -> List[RefMetadata]:
    """_summary_

    Args:
        target_url (_type_): _description_
        md_type (MetadataExtractionType): _description_

    Returns:
        List[RefMetadata]: _description_
    """
    if md_type == MetadataExtractionType.NONE:
        return []
    if md_type == MetadataExtractionType.CITOID:
        return extract_urls_citoid_metadata(target_urls, max_summary_length)
    else:
        raise ValueError(f"Unsupported extraction type:{md_type.value}")


def extract_all_metadata_to_dict(
    target_urls,
    md_type: MetadataExtractionType,
    max_summary_length: int,
) -> Dict[str, RefMetadata]:
    md_list = extract_all_metadata_by_type(
        target_urls,
        md_type,
        max_summary_length,
    )
    res_dict = {}

    # add urls to dict
    for md in md_list:
        res_dict[md.url] = md
        try:
            # remove from target urls after processing
            target_urls.remove(md.url)
        except Exception:
            pass

    # process remaining URLs
    for url in target_urls:
        res_dict[url] = None

    return res_dict


def extract_posts_ref_metadata_dict(
    posts: List[RefPost], md_type: MetadataExtractionType
) -> Dict[str, RefMetadata]:
    """
    Extract all reference urls from posts and fetch metadata for them.
    Return dict of metadata keyed by url.
    """
    all_ref_urls = list(set(flatten([p.ref_urls for p in posts])))
    md_dict = extract_all_metadata_to_dict(
        all_ref_urls, md_type, max_summary_length=500
    )
    return md_dict
