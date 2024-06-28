from typing import List, Optional
from pydantic import BaseModel, Field
import datetime

class Author(BaseModel):
    id: str = Field(description="Internal platform ID for author")
    name: str = Field(description="Author display name")
    username: str = Field(description="Platform username of author")
    platformId: str


class AppPost(BaseModel):
    content: str = Field(description="Post content")
    url: str = Field(description="Post url")
    quotedThread: Optional['AppThread'] = Field(
        description="Quoted thread",
        default=None,
    )

class AppThread(BaseModel):
    author: Author
    url: str = Field(description="Thread url (url of first post)")
    thread: List[AppPost] = Field(description="List of posts quoted in this thread")


# Input array
array = [{'author': 'Eiko Fried',
  'content': 'After careful consideration, the FDA advisory comission voted today 9:2 that MDMA has *not* been shown to be effective for treating PTSD, given massive concerns around validity threats in this literature. They also voted 10:1 that MDMA has *not* shown to be safe.',
  'url': 'https://x.com/EikoFried/status/1798166869574398271',
  'created_at': datetime.datetime(2024, 6, 5, 1, 36, 4, tzinfo=datetime.timezone.utc),
  'source_network': 'twitter',
  'type': 'QuoteRefPost',
  'is_reply': False,
  'is_repost': False,
  'ref_urls': ['https://x.com/FDAadcomms/status/1798104612635070611'],
  'quoted_url': 'https://x.com/FDAadcomms/status/1798104612635070611',
  'quoted_post': {'author': 'FDAadcomms',
   'content': '@eturnermd1 #MDMAadcomm VOTE 1/2: Do the available data show that the drug is effective in patients with posttraumatic\nstress disorder?\n2-Yes\n9-No\n0-Abstain https://twitter.com/FDAadcomms/status/1798104612635070611/photo/1',
   'url': 'https://x.com/FDAadcomms/status/1798104612635070611',
   'created_at': datetime.datetime(2024, 6, 4, 21, 28, 41, tzinfo=datetime.timezone.utc),
   'source_network': 'twitter',
   'type': 'ReferencePost',
   'is_reply': False,
   'is_repost': False,
   'ref_urls': [],
   'quoted_url': None}},
 {'author': 'Eiko Fried',
  'content': '📄Many mentioned reasons overlap with those we summarized recently in our review paper: \nhttps://journals.sagepub.com/doi/10.1177/20451253231198466\n\n📺 I also summarize them for a lay audience in this YouTube video: \nhttps://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E',
  'url': 'https://x.com/EikoFried/status/1798167612175913332',
  'created_at': datetime.datetime(2024, 6, 5, 1, 39, 1, tzinfo=datetime.timezone.utc),
  'source_network': 'twitter',
  'type': 'QuoteRefPost',
  'is_reply': False,
  'is_repost': False,
  'ref_urls': ['https://journals.sagepub.com/doi/10.1177/20451253231198466',
   'https://www.youtube.com/watch?feature=youtu.be&si=kjMtNR1Hwe7NZ8as&v=WknlkmJee4E'],
  'quoted_url': None,
  'quoted_post': None},
 {'author': 'Eiko Fried',
  'content': 'Some pretty wild things in the meeting honestly, thanks to @eturnermd1 for live tweeting.\n\nEg folks who were paid by the sponsor (big pharma) to speak on behalf of the product to be marketed did *not* have to declare they were being paid.',
  'url': 'https://x.com/EikoFried/status/1798170515817013679',
  'created_at': datetime.datetime(2024, 6, 5, 1, 50, 34, tzinfo=datetime.timezone.utc),
  'source_network': 'twitter',
  'type': 'QuoteRefPost',
  'is_reply': False,
  'is_repost': False,
  'ref_urls': [],
  'quoted_url': None,
  'quoted_post': None},
 {'author': 'Eiko Fried',
  'content': '@eturnermd1 Here is the full thread:',
  'url': 'https://x.com/EikoFried/status/1798170610314715569',
  'created_at': datetime.datetime(2024, 6, 5, 1, 50, 56, tzinfo=datetime.timezone.utc),
  'source_network': 'twitter',
  'type': 'QuoteRefPost',
  'is_reply': False,
  'is_repost': False,
  'ref_urls': ['https://x.com/eturnermd1/status/1798046087737180395'],
  'quoted_url': 'https://x.com/eturnermd1/status/1798046087737180395',
  'quoted_post': {'author': 'Erick Turner @eturnermd1.bsky.social',
   'content': 'Next up on the AdComm agenda, when they come back from lunch at the top of hour, is the Open Public Hearing. For reasons mentioned below, don\'t be surprised if the "public" consists more of advocates for approval, and we hear from relatively few with reservations.',
   'url': 'https://x.com/eturnermd1/status/1798046087737180395',
   'created_at': datetime.datetime(2024, 6, 4, 17, 36, 8, tzinfo=datetime.timezone.utc),
   'source_network': 'twitter',
   'type': 'ReferencePost',
   'is_reply': False,
   'is_repost': False,
   'ref_urls': [],
   'quoted_url': 'https://x.com/i/status/1797349211849245178'}},
 {'author': 'Eiko Fried',
  'content': '@eturnermd1 Here the second vote on benefits and risks:',
  'url': 'https://x.com/EikoFried/status/1798171316375445681',
  'created_at': datetime.datetime(2024, 6, 5, 1, 53, 44, tzinfo=datetime.timezone.utc),
  'source_network': 'twitter',
  'type': 'QuoteRefPost',
  'is_reply': False,
  'is_repost': False,
  'ref_urls': ['https://x.com/FDAadcomms/status/1798107142219796794'],
  'quoted_url': 'https://x.com/FDAadcomms/status/1798107142219796794',
  'quoted_post': {'author': 'FDAadcomms',
   'content': '@eturnermd1 #MDMAadcomm VOTE 2/2: Do the benefits of midomafetamine with FDA’s proposed risk evaluation and mitigation strategy (REMS) outweigh its risks for the treatment of patients with PTSD?\n1-Yes\n10-No\n0-Abstain https://twitter.com/FDAadcomms/status/1798107142219796794/photo/1',
   'url': 'https://x.com/FDAadcomms/status/1798107142219796794',
   'created_at': datetime.datetime(2024, 6, 4, 21, 38, 44, tzinfo=datetime.timezone.utc),
   'source_network': 'twitter',
   'type': 'ReferencePost',
   'is_reply': False,
   'is_repost': False,
   'ref_urls': [],
   'quoted_url': None}}]

# Create a function to build the AppThread structure
def build_app_thread(array):
    # First, create the quoted threads as AppPost instances
    quoted_posts = {}
    for post in array:
        if post['quoted_post']:
            quoted_posts[post['quoted_post']['url']] = AppPost(
                content=post['quoted_post']['content'],
                url=post['quoted_post']['url'],
                quotedThread=None
            )

    # Create the main posts as AppPost instances
    main_posts = []
    for post in array:
        quoted_thread = None
        if post['quoted_url']:
            quoted_thread = AppThread(
                author=Author(name=post['quoted_post']['author'],
                              username=post['quoted_post']['author'],
                              id="2111",
                              platformId="twitter"),
                url=post['quoted_url'],
                thread=[quoted_posts[post['quoted_url']]]
            )
        main_post = AppPost(
            content=post['content'],
            url=post['url'],
            quotedThread=quoted_thread
        )
        main_posts.append(main_post)

    # Create the main thread
    main_thread = AppThread(
        author=Author(name=array[0]['author'],
                      username=array[0]['author'],
                      id="2111",
                      platformId="twitter"),
        url=array[0]['url'],
        thread=main_posts
    )

    return main_thread

# Convert the array to AppThread format
app_thread = build_app_thread(array)
