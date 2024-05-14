from typing import List
import pandas as pd
from loguru import logger

from ..schema.templates import TEMPLATES, LABEL_TEMPLATE_MAP, DEFAULT_PREDICATE_LABEL
from ..shared_functions.schema.post import RefPost
from ..shared_functions.postprocessing import CombinedParserOutput

# placeholder for post in RDF triplet
POST_RDF = "post"

# placeholder for subject when no links available
NO_OBJ_DISP_NAME = "None"


# display name for post for rendering in streamlit
POST_DISPLAY_NAME = "💬 Your post"


def extract_reference_labels(df: pd.DataFrame, ref_urls: List[str]) -> List[List[str]]:
    """
    Returns list of predicates for each reference in `ref_urls`.
    Each row in the data frame is of the form
    subject,predicate,object. Objects must correspond to references in `ref_urls`, or a ValueError is raised.
    """
    # if ref_urls is empty, initialize it with `NO_OBJ_DISP_NAME`
    if not ref_urls:
        ref_urls = [NO_OBJ_DISP_NAME]

    # Validate that all objects are in ref_urls
    if not df["object"].isin(ref_urls).all():
        raise ValueError("All objects must correspond to references in `ref_urls`.")

    # Create a dictionary to hold the results
    result_dict = {url: [] for url in ref_urls}

    # Iterate over each URL in ref_urls
    for url in ref_urls:
        # Filter the DataFrame for rows where the object matches the current URL
        predicates = df[df["object"] == url]["predicate"].tolist()
        result_dict[url] = predicates

    # Convert dictionary to list of lists for the output
    return list(result_dict.values())


def create_triples_from_prediction(prediction):
    # TODO access to prediction attributes should be standardized
    # extract list of referenced links
    post: RefPost = prediction.get("post", None)
    if post:
        ref_links = post.ref_urls
        if len(ref_links) == 0:
            # no references mentioned
            ref_links = [NO_OBJ_DISP_NAME]
    else:
        # the prediction didn't include a post (eg call to `process_text`)
        ref_links = [NO_OBJ_DISP_NAME]

    # extract predicted predicates
    predicted_predicates = prediction["answer"]["multi_tag"]

    # if no predicates were predicted, add the default predicate
    if len(predicted_predicates) == 0:
        predicted_predicates = [DEFAULT_PREDICATE_LABEL]

    # create table of all extracted triples
    rows = []
    for label in predicted_predicates:
        rows += [(POST_RDF, label, link) for link in ref_links]

    return rows


def create_triples_from_combined_result(combined_result_dict: CombinedParserOutput):
    # parse back into model schema
    combined_result = CombinedParserOutput.model_validate(combined_result_dict)

    # extract list of referenced links
    ref_links = combined_result.reference_urls

    # extract predicted predicates
    predicted_labels = combined_result.multi_reference_tagger

    rows = []

    if len(ref_links) == 0:
        # no references mentioned
        assert len(predicted_labels) == 1
        labels = predicted_labels[0]
        rows += [(POST_RDF, label, NO_OBJ_DISP_NAME) for label in labels]

    else:
        assert len(predicted_labels) == len(ref_links)
        for labels, ref_url in zip(predicted_labels, ref_links):
            if len(labels) == 0:
                labels = [DEFAULT_PREDICATE_LABEL]
            rows += [(POST_RDF, label, ref_url) for label in labels]

    return rows


def create_rdf_triple(subject, predicate_type, object):
    pass
