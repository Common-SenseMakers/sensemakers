import json
from shared_functions.main import (
    SM_FUNCTION_post_parser_imp,
    SM_FUNCTION_post_parser_config,
)
from env_config import (
    openai_api_key,
    ref_tagger_model,
    topic_model,
    kw_model,
)

# content = 'This is definititely an announcement of https://www.alink.com and I dont agree with https://anotherlink.io'
# author_data = {
#     "platformId": "Twitter",
#     "id": "12345",
#     "username": "johndoe",
#     "name": "John Doe",
# }

# post_data = {
#     "content": "This is an interesting paper https://arxiv.org/abs/2312.05230 but I disagree with its sequel https://arxiv.org/abs/2401.14000  #user-hashtag"
# }

# thread_data = {"thread": [post_data], "author": author_data}

thread_data = {
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

thread_data_2 = {
    "author": {
        "id": "2111",
        "name": "Eiko Fried",
        "username": "Eiko Fried",
        "platformId": "twitter",
    },
    "url": "https://x.com/EikoFried/status/1798166869574398271",
    "thread": [
        {
            "content": "Yup",
            "url": "https://x.com/EikoFried/status/1798166869574398271",
        },
    ],
}
parameters = {}

parser_request = {"post": thread_data, "parameters": parameters}

config: SM_FUNCTION_post_parser_config = {
    "openrouter_api_key": openai_api_key,
    "openrouter_api_base": "https://openrouter.ai/api/v1",
    "openrouter_referer": "https://127.0.0.1:3000/",
    "ref_tagger_llm_type": ref_tagger_model,
    "kw_llm_type": kw_model,
    "topic_llm_type": topic_model,
}

result = SM_FUNCTION_post_parser_imp(parser_request, config)

serialized = result.model_dump_json()

json_obj = json.loads(serialized)
print(f"semantics: {json_obj['semantics']}")

with open("last_output.json", "wb") as file:
    file.write(serialized.encode("utf-8"))
