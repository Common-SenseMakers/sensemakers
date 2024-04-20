# based on https://github.com/langchain-ai/langchain/blob/master/libs/langchain/langchain/document_loaders/mastodon.py

from typing import Any, Dict, Iterable, List, Optional, Sequence
from mastodon import Mastodon
from datetime import datetime, time

from desci_sense.configs import environ
from .mastodon_utils import convert_post_json_to_ref_post
from ...shared_functions.schema.post import RefPost


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
        start_date: str = None,
        end_date: str = None,
    ) -> List[RefPost]:
        """_summary_

        Args:
            mastodon_account (str): _description_
            max_toots (Optional[int], optional): _description_. Defaults to 5.
            exclude_replies (bool, optional): _description_. Defaults to True.
            exclude_reposts (bool, optional): _description_. Defaults to True.
            start_date (str, optional): _description_. Defaults to None.
            end_date (str, optional): _description_. Defaults to None.

        Returns:
            List[RefPost]: _description_
        """
        results = []

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

        # check posts
        for toot in toots:
            created_at_datetime = datetime.combine(
                toot["created_at"].date(),
                time.min,
            )
            # Format the 'date' as 'year-day-month
            # toot['date'] = created_at_datetime.strftime("%Y-%d-%m")
            if start_date <= created_at_datetime <= end_date:
                results.append(
                    {
                        "id": toot["id"],
                        "content": toot["content"],
                        "created_at": toot["created_at"],
                        "account_id": user["id"],
                        "username": user["username"],
                    }
                )
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
            results.extend(docs)
        return results

    def _format_toots(
        self, toots: List[Dict[str, Any]], user_info: dict
    ) -> Iterable[RefPost]:
        """Format toots into posts."""
        for toot in toots:
            ref_post = convert_post_json_to_ref_post(toot)
            yield ref_post
