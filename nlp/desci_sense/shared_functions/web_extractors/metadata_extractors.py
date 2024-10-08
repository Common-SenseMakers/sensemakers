from typing import List, Dict
import asyncio
from loguru import logger

from ..configs import MetadataExtractionType

from ..interface import RefMetadata

from .citoid import fetch_citation, fetch_all_citations
from ..schema.post import RefPost
from ..utils import flatten, remove_dups_ordered


def set_metadata_extraction_type(extract_type: str):
    try:
        metadata_extract_type = MetadataExtractionType(extract_type)
    except ValueError as e:
        logger.warning(f"Unknown extraction type: {e} -> defaulting to NONE...")
        metadata_extract_type = MetadataExtractionType.NONE

    return metadata_extract_type


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
    for i, (url, metadata) in enumerate(zip(target_urls, metadata_list)):
        metadata["original_url"] = url
        summary = metadata.get("abstractNote", "")
        results.append(
            RefMetadata(
                **{
                    "ref_id": i + 1,
                    "citoid_url": metadata.get("url", None),
                    "url": metadata.get("original_url", None),
                    "item_type": metadata.get("itemType", None),
                    "title": metadata.get("title", ""),
                    "summary": get_trunc_str(summary, max_summary_length),
                    "debug": {"error": metadata.get("error")},
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
    return normalized if len(normalized) > 0 else []


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
        return extract_citoid_metadata(target_url, max_summary_length)
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
        return extract_citoid_metadata(target_urls[0], max_summary_length)
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
    urls_to_process = target_urls.copy()

    # add urls to dict
    for md in md_list:
        res_dict[md.url] = md
        try:
            # remove from target urls after processing
            urls_to_process.remove(md.url)
        except Exception:
            pass

    # process remaining URLs
    for url in urls_to_process:
        res_dict[url] = None

    return res_dict


def extract_posts_ref_metadata_dict(
    posts: List[RefPost],
    md_type: MetadataExtractionType = MetadataExtractionType.CITOID,
    extra_urls: List[List[str]] = None,
) -> Dict[str, RefMetadata]:
    """
    Extract all reference urls from posts and fetch metadata for them.
    Return dict of metadata keyed by url.
    """
    all_ref_urls = list(set(flatten([p.md_ref_urls() for p in posts])))

    # add extra urls if supplied
    if extra_urls is None:
        extra_urls = [[] for _ in posts]
    all_ref_urls += remove_dups_ordered(flatten(extra_urls))

    md_dict = extract_all_metadata_to_dict(
        all_ref_urls, md_type, max_summary_length=500
    )
    return md_dict


def get_refs_metadata_portion(metadata_list: List[RefMetadata]) -> str:
    """
    Processes the metadata list to append to the prompt
    """
    if len(metadata_list) > 0:
        result_lines = ["## Reference Metadata:"]
        for i, ref in enumerate(metadata_list):
            if hasattr(ref, "to_str"):
                result_lines.append(ref.to_str())
            if i < len(metadata_list) - 1:  # Check if it's not the last element
                result_lines.append("---------------")
        result_string = "\n".join(result_lines)
        return result_string
    return ""


def get_ref_post_metadata_list(
    post: RefPost,
    md_dict: Dict[str, RefMetadata],
    extra_urls: List[str] = None,
    add_ordering: bool = True,
) -> List[RefMetadata]:
    """
    Returns list of the post's reference metadata.
    If extra urls are provided, they are also counted as part of the post ref
    urls (for example extra_urls could include unprocessed urls due to max length
    limits).
    If `add_ordering`, add reference ordering info to each metadata item.
    """
    all_ref_urls = post.md_ref_urls()

    # add extra urls if supplied
    extra_urls = [] if extra_urls is None else extra_urls
    all_ref_urls += remove_dups_ordered(extra_urls)

    md_list = []
    for i, ref in enumerate(all_ref_urls):
        if ref in md_dict:
            md = md_dict.get(ref)
            if md:
                if add_ordering:
                    # add ordering info (1-indexed)
                    md.order = i + 1
                md_list.append(md)

    # sort if ordering added
    if add_ordering:
        md_list = sorted(md_list, key=lambda x: x.order)

    return md_list
