# based on https://github.com/langchain-ai/langchain/blob/master/libs/langchain/langchain/document_loaders/mastodon.py

from typing import Any, Dict, Iterable, List, Optional, Sequence
from mastodon import Mastodon

from ....configs import environ
from .mastodon_utils import convert_post_json_to_ref_post
from ....shared_functions.schema.post import RefPost

import csv
import os
from datetime import datetime, time

class FilterTimeline:
    def __init__(
        self, base_url: str = "https://mastodon.social", access_token: str = None
    ) -> None:
        access_token = (
            access_token if access_token else environ["MASTODON_ACCESS_TOKEN"]
        )

        self.api = Mastodon(api_base_url=base_url, access_token=access_token)

    def filter_timeline(self, mastodon_accounts: Sequence[str], number_toots: Optional[int] = 5, exclude_replies: bool = True, exclude_reposts: bool = True, start_date: datetime = None, end_date:datetime = None) -> List[Dict[str, Any]]:
        results = []
        for account in mastodon_accounts:
            user = self.api.account_lookup(account)
            toots = self.api.account_statuses(
                user["id"],
                only_media=False,
                pinned=False,
                exclude_replies=exclude_replies,
                exclude_reblogs=exclude_reposts,
                limit=number_toots,
            )
            for toot in toots:
                 created_at_datetime = datetime.combine(toot["created_at"].date(), time.min)
                 # Format the 'date' as 'year-day-month
                 # toot['date'] = created_at_datetime.strftime("%Y-%d-%m")
                 if start_date <= created_at_datetime <= end_date:
                     results.append({
                    "id": toot["id"],
                    "content": toot["content"],
                    "created_at": toot["created_at"],
                    "account_id": user["id"],
                    "username": user["username"]
                })
        return results
    
    






