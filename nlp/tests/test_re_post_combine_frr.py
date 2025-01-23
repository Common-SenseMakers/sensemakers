"""
test_re_post_combine_frr.py (pytest version)

A minimal test script showing how to test combine_from_raw_results()
with the "repost" scenario: first post has empty content => triggers is_re_post logic,
converted to pytest style.
"""

import pytest
from typing import Dict
from pprint import pprint
import sys
from pathlib import Path

# If needed, to allow async usage in Jupyter or conflicting loops:
import nest_asyncio
nest_asyncio.apply()

# Adjust if your project layout differs
ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))


from desci_sense.shared_functions.postprocessing import (
    combine_from_raw_results,
    ParserChainOutput,
    Answer,
    SubAnswer,
    RefMetadata,
    CombinedParserOutput,
    OntologyBase,
    ParserChainType,
)
from desci_sense.shared_functions.schema.post import (
    ThreadRefPost,
    QuoteRefPost,
)

# -----------------------------------------
#  Mock Ontology
# -----------------------------------------
class MockOntology(OntologyBase):
    """
    Minimal mock so default_label(no_ref=...) and default_mention_label()
    won't fail. Adjust as needed for your real ontology logic.
    """
    def default_label(self, no_ref: bool = False) -> str:
        return "default"

    def default_mention_label(self) -> str:
        return "mentions"

    def get_concept_by_label(self, label: str):
        """
        In your code, convert_ref_tags_to_rdf_triplets() calls
        ontology.get_concept_by_label(...). We'll mock a minimal concept
        that can be a predicate for demonstration. Adjust as needed.
        """
        class MockConcept:
            uri = f"https://example.org/{label}"
            def can_be_predicate(self):
                return True
            def can_be_object(self):
                return False

        return MockConcept()

# -----------------------------------------
#The pytest test
# -----------------------------------------
@pytest.mark.asyncio
def test_repost_scenario():
    """
    Test that when the first post is empty, it triggers is_re_post logic
    and filters predicted tags to SPECIAL_TAG_SET, while also adding the
    default label.
    """
    # 3a) Create a "quoted" post (normal content, some reference).
    quoted_post = QuoteRefPost(
        author="did:plc:someQuotedAuthor",
        url="https://bsky.app/profile/plato-philosophy/post/3lbsjlmobfk2c",
        content="There is still time #call-for-papers",
        ref_urls=["https://www.example.com"],
        quoted_post=None,
        quoted_url=None,
    )

    # Create the outer post with empty content => triggers is_re_post
    outer_post = QuoteRefPost(
        author="did:plc:xq36vykdkrzknmcxo3jnn5wq",
        url="https://bsky.app/profile/sensenetsbot/post/999999",
        content="",    # empty => triggers repost scenario
        ref_urls=[],   # no direct references
        quoted_post=quoted_post,
        quoted_url=quoted_post.url,
    )

    #  Wrap in ThreadRefPost with one post => .thread_posts() has length 1
    thread = ThreadRefPost(
        author=outer_post.author,
        url=outer_post.url,
        content=outer_post.content,
        ref_urls=outer_post.ref_urls,
        quoted_post=outer_post.quoted_post,
        quoted_url=outer_post.quoted_url,
        posts=[outer_post],
    )

    #  Build raw_results with a single sub-answer
    sub_answer = SubAnswer(
        ref_number=1,
        final_answer=["event", "recommends"],  # "recommends" is not in SPECIAL_TAG_SET
        ref_url="https://www.example.com",
    )
    answer = Answer(sub_answers=[sub_answer])
    parser_output = ParserChainOutput(
        answer=answer,
        pparser_type=ParserChainType.MULTI_REF_TAGGER,
        reasoning={"0": {"steps": "Reasoning steps...", "candidates": []}},
        extra={"model_debug": "Some debug info"},
    )
    raw_results: Dict[str, ParserChainOutput] = {
        "multi_ref": parser_output
    }

    #  Minimal metadata for the single reference
    md_dict = {
        "https://www.example.com": RefMetadata(
            ref_id=123,  # integer
            url="https://www.example.com",
            item_type="webpage",
            citoid_url="http://citoid-service.example.com?q=example",
            ref_source_url=None,
            order=1,
        )
    }

    # Combine
    ontology = MockOntology()
    combined_result: CombinedParserOutput = combine_from_raw_results(
        post=thread,
        raw_results=raw_results,
        md_dict=md_dict,
        ontology=ontology,
        unprocessed_urls=[],
    )

    #  Print final result
    print("\n=== COMBINED PARSER OUTPUT ===")
    pprint(combined_result.dict(), sort_dicts=False)

    # 3h) Check final tags => "quote" + "default" remain, "recommends" removed
    final_tags = combined_result.multi_reference_tagger[0]
    assert "event" in final_tags
    assert "default" in final_tags
    assert "recommends" not in final_tags
