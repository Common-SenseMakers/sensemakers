import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

from desci_sense.shared_functions.schema.post import (
    RefPost,
    ThreadRefPost,
    QuoteRefPost,
)
from desci_sense.shared_functions.interface import ThreadInterface, ParsePostRequest
from desci_sense.shared_functions.dataloaders import scrape_post
from desci_sense.shared_functions.dataloaders.twitter.twitter_utils import (
    extract_external_ref_urls,
    scrape_tweet,
    extract_twitter_status_id,
)
from desci_sense.shared_functions.preprocessing import (
    convert_thread_interface_to_ref_post,
)

SINGLE_QUOTE_TWEET = {
    "url": "https://x.com/nnnn/status/180089896680621",
    "content": "The Brazilian Congress will consider a bill to protect Brazilian creators &amp; defend its diverse cultural heritage by preventing unauthorized use of creative works to train AI. Vital that @laerciosergipe’s amendment that would reverse this be defeated.\n@RicardoJuchem @claudiopozas https://twitter.com/arteesetica/status/1800630415780192665",
    "author": {
        "id": "246",
        "name": "nttt",
        "username": "nnnn",
        "platformId": "twitter",
    },
    "quotedPosts": [
        {
            "url": "https://x.com/Arte/status/198966806216849",
            "content": "BRASIL 🇧🇷 Se votará un proyecto de ley para regular el uso de la IA. En la audiencia pública previa se exigió transparencia, trazabilidad, respeto a los derechos de autor, REGULACIÓN y se hizo hincapié en la pérdida de empleos a partir de la irrupción de esta tecnología. https://twitter.com/ArteEsEtica/status/1800630415780192665/photo/1 https://twitter.com/claudiopozas/status/1800563300822057219",
            "author": {
                "id": "162746500",
                "name": "ARTE es ÉTICA",
                "username": "Arte",
                "platformId": "twitter",
            },
        }
    ],
}


MULTI_QUOTE_THREAD = {
    "url": "https://x.com/JohnDoe/status/1798166864398271",
    "content": "After careful consideration, the FDA advisory commission voted today 9:2 that MDMA has *not* been shown to be effective for treating PTSD, given massive concerns around validity threats in this literature. They also voted 10:1 that MDMA has *not* shown to be safe. https://twitter.com/FDAadcomms/status/1798104612635070611\n---\n📄Many mentioned reasons overlap with those we summarized recently in our review paper: \nhttps://journals.sagepub.com/doi/10.1177/20451253231198466\n\n📺 I also summarize them for a lay audience in this YouTube video: \nhttps://youtu.be/WknlkmJee4E?si=kjMtNR1Hwe7NZ8as\n---\nSome pretty wild things in the meeting honestly, thanks to @JaneSmith for live tweeting.\n\nEg folks who were paid by the sponsor (big pharma) to speak on behalf of the product to be marketed did *not* have to declare they were being paid.\n---\n@JaneSmith Here is the full thread: https://twitter.com/JaneSmith/status/1798046087737180395\n---\n@JaneSmith Here the second vote on benefits and risks: https://twitter.com/FDAadcomms/status/1798107142219796794",
    "author": {
        "id": "16861042",
        "name": "John Doe",
        "username": "JohnDoe",
        "platformId": "twitter",
    },
    "quotedPosts": [
        {
            "url": "https://twitter.com/FDAadcomms/status/1798104612635070611",
            "content": "@JaneSmith #MDMAadcomm VOTE 1/2: Do the available data show that the drug is effective in patients with posttraumatic\nstress disorder?\n2-Yes\n9-No\n0-Abstain https://twitter.com/FDAadcomms/status/1798104612635070611/photo/1",
            "author": {
                "id": "148067168202752",
                "name": "FDAadcomms",
                "username": "FDAadcomms",
                "platformId": "twitter",
            },
        },
        {
            "url": "https://twitter.com/JaneSmith/status/1798046087737180395",
            "content": 'Next up on the AdComm agenda, when they come back from lunch at the top of hour, is the Open Public Hearing. For reasons mentioned below, don\'t be surprised if the "public" consists more of advocates for approval, and we hear from relatively few with reservations. https://twitter.com/JaneSmith/status/1797349211849245178',
            "author": {
                "id": "42893834",
                "name": "Jane Smith",
                "username": "JaneSmith",
                "platformId": "twitter",
            },
        },
        {
            "url": "https://twitter.com/FDAadcomms/status/1798107142219796794",
            "content": "@JaneSmith #MDMAadcomm VOTE 2/2: Do the benefits of midomafetamine with FDA’s proposed risk evaluation and mitigation strategy (REMS) outweigh its risks for the treatment of patients with PTSD?\n1-Yes\n10-No\n0-Abstain https://twitter.com/FDAadcomms/status/1798107142219796794/photo/1",
            "author": {
                "id": "1480844662752",
                "name": "FDAadcomms",
                "username": "FDAadcomms",
                "platformId": "twitter",
            },
        },
    ],
}

EXAMPLE_REQUEST = {"post": SINGLE_QUOTE_TWEET, "parameters": {}}


def test_parse_single_post_request():
    ref = ParsePostRequest.model_validate(EXAMPLE_REQUEST)
    assert ref.model_dump() == EXAMPLE_REQUEST


def test_basic_post_interface_on_quoted_post():
    ref = ThreadInterface.model_validate(MULTI_QUOTE_THREAD)
    ref_post = RefPost.from_basic_post_interface(ref.quotedPosts[1])
    assert ref_post.ref_urls == [
        "https://twitter.com/JaneSmith/status/1797349211849245178"
    ]


if __name__ == "__main__":
    thread_interface = ThreadInterface.model_validate(MULTI_QUOTE_THREAD)
    thread_ref_post = convert_thread_interface_to_ref_post(thread_interface)
