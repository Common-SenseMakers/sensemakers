from ..schema.templates import TEMPLATES, LABEL_TEMPLATE_MAP, DEFAULT_PREDICATE_LABEL
from ..shared_functions.schema.post import RefPost


# placeholder for post in RDF triplet
POST_RDF = "post"

# placeholder for subject when no links available
NO_SUBJ_DISP_NAME = "None"


# display name for post for rendering in streamlit
POST_DISPLAY_NAME = "💬 Your post"


def create_triples_from_prediction(prediction):
    # TODO access to prediction attributes should be standardized
    # extract list of referenced links
    post: RefPost = prediction.get("post", None)
    if post:
        ref_links = post.ref_urls
        if len(ref_links) == 0:
            # no references mentioned
            ref_links = [NO_SUBJ_DISP_NAME]
    else:
        # the prediction didn't include a post (eg call to `process_text`)
        ref_links = [NO_SUBJ_DISP_NAME]

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


def create_rdf_triple(subject, predicate_type, object):
    pass
