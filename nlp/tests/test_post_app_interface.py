import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))


from pydantic import (
    Field,
    BaseModel,
    validator,
    ConfigDict,
    field_validator,
    field_serializer,
    model_validator,
    ValidationError,
)

from desci_sense.shared_functions.schema.post import (
    RefPost,
    ThreadRefPost,
    QuoteRefPost,
)
from desci_sense.shared_functions.interface import AppThread, ParsePostRequest
from desci_sense.shared_functions.dataloaders import scrape_post
from desci_sense.shared_functions.dataloaders.twitter.twitter_utils import (
    extract_external_ref_urls,
    scrape_tweet,
    extract_twitter_status_id,
)
from desci_sense.shared_functions.preprocessing import (
    convert_thread_interface_to_ref_post,
    convert_app_post_to_ref_post,
    convert_app_post_to_quote_ref_post,
    ParserInput,
    preproc_parser_input,
)

TEST_THREAD_INTERFACE_2 = {
    "url": "https://example.com/post/2",
    "thread": [
        {
            "url": "https://example.com/post/2",
            "content": "This is the first post in the thread.",
        },
        {
            "url": "https://example.com/post/3",
            "content": "This is the second post in the thread.",
        },
    ],
    "author": {
        "platformId": "twitter",
        "id": "author_456",
        "username": "user546",
        "name": "Sarah Gore",
    },
}

TEST_THREAD_INTERFACE_1 = {
    "url": "https://example.com/post/1",
    "thread": [
        {
            "url": "https://example.com/post/1",
            "content": "This is the first post in the thread.",
            "quotedThread": TEST_THREAD_INTERFACE_2,
        },
        {
            "url": "https://example.com/post/2",
            "content": "This is the second post in the thread.",
        },
    ],
    "author": {
        "platformId": "twitter",
        "id": "author_123",
        "username": "user123",
        "name": "John Doe",
    },
}

TEST_OVERLENGTH_THREAD_INTERFACE = {
    "url": "https://example.com/post/2",
    "thread": [
        {
            "url": "https://example.com/post/2",
            "content": "This is the first post in the thread.",
        },
        {
            "url": "https://example.com/post/3",
            "content": ",".join([str(x) for x in range(3000)]),
        },
    ],
    "author": {
        "platformId": "twitter",
        "id": "author_456",
        "username": "user546",
        "name": "Sarah Gore",
    },
}


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


TEST_THREAD = {
    "author": {
        "id": "2111",
        "name": "Eiko Fried",
        "username": "Eiko Fried",
        "platformId": "twitter",
    },
    "url": "https://x.com/EikoFried/status/1798166869574398271",
    "thread": [
        {
            "content": "After careful consideration, the FDA advisory comission voted today 9:2 that MDMA has *not* been shown to be effective for treating PTSD, given massive concerns around validity threats in this literature. They also voted 10:1 that MDMA has *not* shown to be safe.",
            "url": "https://x.com/EikoFried/status/1798166869574398271",
            "quotedThread": {
                "author": {
                    "id": "2111",
                    "name": "FDAadcomms",
                    "username": "FDAadcomms",
                    "platformId": "twitter",
                },
                "url": "https://x.com/FDAadcomms/status/1798104612635070611",
                "thread": [
                    {
                        "content": "@eturnermd1 #MDMAadcomm VOTE 1/2: Do the available data show that the drug is effective in patients with posttraumatic\nstress disorder?\n2-Yes\n9-No\n0-Abstain https://twitter.com/FDAadcomms/status/1798104612635070611/photo/1",
                        "url": "https://x.com/FDAadcomms/status/1798104612635070611",
                        "quotedThread": None,
                    }
                ],
            },
        },
        {
            "content": "📄Many mentioned reasons overlap with those we summarized recently in our review paper: \nhttps://journals.sagepub.com/doi/10.1177/20451253231198466\n\n📺 I also summarize them for a lay audience in this YouTube video: \nhttps://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E",
            "url": "https://x.com/EikoFried/status/1798167612175913332",
            "quotedThread": None,
        },
        {
            "content": "Some pretty wild things in the meeting honestly, thanks to @eturnermd1 for live tweeting.\n\nEg folks who were paid by the sponsor (big pharma) to speak on behalf of the product to be marketed did *not* have to declare they were being paid.",
            "url": "https://x.com/EikoFried/status/1798170515817013679",
            "quotedThread": None,
        },
        {
            "content": "@eturnermd1 Here is the full thread:",
            "url": "https://x.com/EikoFried/status/1798170610314715569",
            "quotedThread": {
                "author": {
                    "id": "2111",
                    "name": "Erick Turner @eturnermd1.bsky.social",
                    "username": "Erick Turner @eturnermd1.bsky.social",
                    "platformId": "twitter",
                },
                "url": "https://x.com/eturnermd1/status/1798046087737180395",
                "thread": [
                    {
                        "content": 'Next up on the AdComm agenda, when they come back from lunch at the top of hour, is the Open Public Hearing. For reasons mentioned below, don\'t be surprised if the "public" consists more of advocates for approval, and we hear from relatively few with reservations.',
                        "url": "https://x.com/eturnermd1/status/1798046087737180395",
                        "quotedThread": None,
                    }
                ],
            },
        },
        {
            "content": "@eturnermd1 Here the second vote on benefits and risks:",
            "url": "https://x.com/EikoFried/status/1798171316375445681",
            "quotedThread": {
                "author": {
                    "id": "2111",
                    "name": "FDAadcomms",
                    "username": "FDAadcomms",
                    "platformId": "twitter",
                },
                "url": "https://x.com/FDAadcomms/status/1798107142219796794",
                "thread": [
                    {
                        "content": "@eturnermd1 #MDMAadcomm VOTE 2/2: Do the benefits of midomafetamine with FDA’s proposed risk evaluation and mitigation strategy (REMS) outweigh its risks for the treatment of patients with PTSD?\n1-Yes\n10-No\n0-Abstain https://twitter.com/FDAadcomms/status/1798107142219796794/photo/1",
                        "url": "https://x.com/FDAadcomms/status/1798107142219796794",
                        "quotedThread": None,
                    }
                ],
            },
        },
    ],
}

EXAMPLE_REQUEST = {"post": SINGLE_QUOTE_TWEET, "parameters": {}}


def test_thread_interface():
    thread = AppThread.model_validate(TEST_THREAD_INTERFACE_1)
    assert len(thread.thread[0].quotedThread.thread) == 2


def test_thread_interface_conversion():
    thread = AppThread.model_validate(TEST_THREAD_INTERFACE_1)
    thread_ref_post = convert_thread_interface_to_ref_post(thread)
    assert thread_ref_post.posts[0].quoted_url == "https://example.com/post/2"
    assert (
        thread_ref_post.posts[0].quoted_post.url == thread_ref_post.posts[0].quoted_url
    )
    assert len(thread_ref_post.posts) == 2


def test_load_real_thread():
    thread = AppThread.model_validate(TEST_THREAD)
    thread_ref_post = convert_thread_interface_to_ref_post(thread)
    assert thread_ref_post.md_ref_urls() == [
        "https://x.com/FDAadcomms/status/1798104612635070611",
        "https://journals.sagepub.com/doi/10.1177/20451253231198466",
        "https://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E",
        "https://x.com/eturnermd1/status/1798046087737180395",
        "https://x.com/FDAadcomms/status/1798107142219796794",
    ]




if __name__ == "__main__":
    thread = AppThread.model_validate(TEST_OVERLENGTH_THREAD_INTERFACE)
    thread_ref_post = convert_thread_interface_to_ref_post(thread)
    pi = ParserInput(thread_post=thread_ref_post, max_posts=30)
    proc_pi = preproc_parser_input(pi)
