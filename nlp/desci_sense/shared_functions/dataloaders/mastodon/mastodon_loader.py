# based on https://github.com/langchain-ai/langchain/blob/master/libs/langchain/langchain/document_loaders/mastodon.py

from typing import Any, Dict, Iterable, List, Optional, Sequence
from mastodon import Mastodon
from datetime import datetime, time, date

from ....configs import environ
from .mastodon_utils import convert_post_json_to_ref_post
from ....shared_functions.schema.post import RefPost


class MastodonLoader:
    def __init__(
        self, base_url: str = "https://mastodon.social", access_token: str = None
    ) -> None:
        access_token = (
            access_token if access_token else environ["MASTODON_ACCESS_TOKEN"]
        )

        self.api = Mastodon(api_base_url=base_url, access_token=access_token)

    def load_profile_timeline(
        self,
        mastodon_account: str,
        max_toots: Optional[int] = 5,
        exclude_replies: bool = True,
        exclude_reposts: bool = True,
        start_date: datetime = None,
        end_date: datetime = None,
    ) -> List[RefPost]:
        """_summary_

        Args:
            mastodon_account (str): _description_
            max_toots (Optional[int], optional): _description_. Defaults to 5.
            exclude_replies (bool, optional): _description_. Defaults to True.
            exclude_reposts (datetime, optional): _description_. Defaults to True.
            start_date (datetime, optional): Start date. Datetime object with year-day-month format. Defaults to None.
            end_date (str, optional): End date. Datetime object with year-day-month format. Defaults to None.

        Returns:
            List[RefPost]: _description_
        """
        results = []

        # if not provided, take min/max start/end dates
        if not start_date:
            start_date = datetime(date.min, 1, 1)
        if not end_date:
            end_date = datetime(date.max, 12, 31)

        # get user posts
        user = self.api.account_lookup(mastodon_account)
        toots = self.api.account_statuses(
            user["id"],
            only_media=False,
            pinned=False,
            exclude_replies=exclude_replies,
            exclude_reblogs=exclude_reposts,
            limit=max_toots,
        )

        filtered_posts = []
        # check posts
        for toot in toots:
            created_at_datetime = datetime.combine(
                toot["created_at"].date(),
                time.min,
            )
            if start_date <= created_at_datetime <= end_date:
                filtered_posts.append(toot)
        results.extend(self._format_toots(filtered_posts, user))

        # Mastodon api exclude wasn't working, so verify this here
        if exclude_reposts:
            results = [p for p in results if not p.is_repost]
        if exclude_replies:
            results = [p for p in results if not p.is_reply]

        return results

    def load_profiles(
        self,
        mastodon_accounts: Sequence[str],
        number_toots: Optional[int] = 5,
        exclude_replies: bool = True,
        exclude_reposts: bool = True,
    ) -> List[RefPost]:
        """
        Return list of posts (toots) from selected accts.

        Args:
            mastodon_accounts (Sequence[str]): The list of Mastodon accounts to query.
            number_toots (Optional[int], optional): Max. amount many of toots to pull for each account. Defaults to 5.
            exclude_replies (bool, optional): Whether to exclude reply toots from the load.
                Defaults to False.
            exclude_reposts (bool, optional): Whether to exclude reposts ("retoots") from the load.
                Defaults to True.
        """
        results: List[RefPost] = []
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
            docs = self._format_toots(toots, user)

            # Mastodon api exclude wasn't working, so verify this here
            if exclude_reposts:
                docs = [p for p in docs if not p.is_repost]
            if exclude_replies:
                docs = [p for p in docs if not p.is_reply]

            results.extend(docs)

        return results

    def _format_toots(
        self, toots: List[Dict[str, Any]], user_info: dict
    ) -> Iterable[RefPost]:
        """Format toots into posts."""
        for toot in toots:
            ref_post = convert_post_json_to_ref_post(toot)
            yield ref_post
