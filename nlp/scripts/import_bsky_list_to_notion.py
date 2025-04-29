#!/usr/bin/env python3
"""
How to use:
must specify the list url to run the code by --list_url<URL string> 
to name the cluster use --cluster_name<str>
Optional: --notion_db_id <UUID> to override what’s in .env.
If you omit --notion_db_id, it’ll use whatever is in NOTION_DB_ID from .env.
"""
import os
import argparse
from dotenv import load_dotenv
from typing import Optional
from notion_client import Client as NClient
from atproto import Client as BClient
from urllib.parse import urlparse


# -----------------------------------------------------------------
# 1) NotionClient class
# -----------------------------------------------------------------
class NotionClient:
    def __init__(self, notion_token: str):
        """Thin wrapper around notion_client.Client."""
        self.client = NClient(auth=notion_token)

    def query_database(self, database_id: str, filter_):
        try:
            response = self.client.databases.query(database_id=database_id, filter=filter_)
            return response
        except Exception as e:
            print(f"Error querying Notion database: {e}")
            return None

    def create_page(self, database_id: str, properties: dict):
        try:
            response = self.client.pages.create(
                parent={"database_id": database_id},
                properties=properties
            )
            return response["id"]
        except Exception as e:
            print(f"Error creating Notion page: {e}")
            return None

    def update_page(self, page_id: str, properties: dict):
        try:
            response = self.client.pages.update(page_id=page_id, properties=properties)
            return response["id"]
        except Exception as e:
            print(f"Error updating Notion page: {e}")
            return None


# -----------------------------------------------------------------
# 2) BskyClient class
# -----------------------------------------------------------------
class BskyClient:
    def __init__(self, login: str, password: str):
        """
        Initialize and authenticate with the Bluesky atproto Client.
        """
        self.client = BClient()
        self.client.login(login=login, password=password)

    def _parse_list_url(self, list_url: str):
        """
        Parses a URL like: https://bsky.app/profile/<handle>/lists/<rkey>
        Returns (handle, rkey).
        Raises ValueError if not matching the expected pattern.
        """
        path = urlparse(list_url).path.strip("/")
        segments = path.split("/")
        if len(segments) != 4 or segments[0] != "profile" or segments[2] != "lists":
            raise ValueError(f"URL not recognized as a valid Bluesky list URL: {list_url}")
        handle = segments[1]
        rkey = segments[3]
        return handle, rkey

    def get_list_uri(self, list_url: str) -> str:
        """
        Given a list URL, returns the at:// URI (e.g. at://did:plc:xxx/app.bsky.graph.list/yyy).
        Unless it is already a at:// URI, then it is id
        """
        if list_url.startswith("at://"):
            return list_url
        else:
            handle, rkey = self._parse_list_url(list_url)
            profile_resp = self.client.app.bsky.actor.get_profile({"actor": handle})
            did = profile_resp.did
            return f"at://{did}/app.bsky.graph.list/{rkey}"

    def get_profile_link_from_handle(self, handle: str) -> str:
        """Returns https://bsky.app/profile/<handle>."""
        return f"https://bsky.app/profile/{handle}"


# -----------------------------------------------------------------
# 3) BskyListToNotionConverter class
# -----------------------------------------------------------------
class BskyListToNotionConverter:
    def __init__(
        self,
        notion_client: NotionClient,
        blsky_client: BskyClient,
        notion_db_id: str,
        list_url: str
    ):
        """
        A utility class to import a Bluesky list into a Notion database.

        Notion DB fields assumed (matching types):
          - Name (title)
          - Bluesky (url)
          - did (rich_text)
          - Description (rich_text)
          - Clusters (multi_select)
          - list/starter_name (multi_select)
        """
        self.notion = notion_client
        self.blsky = blsky_client
        self.LIST_URL = list_url
        self.NOTION_DB_ID = notion_db_id

    def _find_page_by_bluesky_url(self, bluesky_url: str) -> Optional[dict]:
        """Look for a page whose 'Bluesky' property (url) equals bluesky_url."""
        if not bluesky_url:
            return None

        filter_ = {
            "property": "Bluesky",
            "url": {
                "equals": bluesky_url
            }
        }
        resp = self.notion.query_database(self.NOTION_DB_ID, filter_)
        if resp and "results" in resp and resp["results"]:
            return resp["results"][0]
        return None

    def _find_page_by_did(self, did: str) -> Optional[dict]:
        """Look for a page whose 'did' property (rich_text) equals did."""
        if not did:
            return None

        filter_ = {
            "property": "did",
            "rich_text": {
                "equals": did
            }
        }
        resp = self.notion.query_database(self.NOTION_DB_ID, filter_)
        if resp and "results" in resp and resp["results"]:
            return resp["results"][0]
        return None

    def _merge_multi_select(self, existing_prop: dict, new_val: str) -> dict:
        """Helper to add new_val to an existing multi_select property if not present."""
        if "multi_select" not in existing_prop:
            existing_prop["multi_select"] = []

        existing_names = [item["name"] for item in existing_prop["multi_select"]]
        if new_val and new_val not in existing_names:
            existing_prop["multi_select"].append({"name": new_val})

        return existing_prop

    # -----------------------------------------------------------------
    # PAGINATION HELPER
    # -----------------------------------------------------------------
    def _fetch_all_list_items(self, at_uri: str):
        """
        Returns (first_response, all_items).

        first_response is the initial get_list call's full response model
        (so you can read .list.name, etc.),
        all_items is a combined list of .items across all pages.
        """
        # 1) First call
        resp = self.blsky.client.app.bsky.graph.get_list({"list": at_uri})
        all_items = resp.items[:]  # copy the first page of items
        cursor = getattr(resp, "cursor", None)  # might be None if no more pages

        # 2) While there's a next page, fetch it
        while cursor:
            next_resp = self.blsky.client.app.bsky.graph.get_list({"list": at_uri, "cursor": cursor})
            all_items.extend(next_resp.items)
            cursor = getattr(next_resp, "cursor", None)

        return resp, all_items

    # -----------------------------------------------------------------
    # MAIN SYNC METHOD (now uses _fetch_all_list_items)
    # -----------------------------------------------------------------
    def sync_list_to_notion(self, cluster_name: Optional[str] = None):
        """
        - Fetch *all pages* of the Bluesky list (including list name).
        - For each profile in the list, create/update a Notion page.
        """
        # 1) Convert user-supplied list URL to at://
        at_uri = self.blsky.get_list_uri(self.LIST_URL)

        # 2) Retrieve *ALL* items from the list (pagination)
        resp_first, all_items = self._fetch_all_list_items(at_uri)
        list_name = resp_first.list.name or "Unnamed List"

        # 3) Iterate over all items from all pages
        for i, item in enumerate(all_items,start=1):
            subj = item.subject
            user_did = subj.did or ""
            display_name = subj.display_name or (subj.handle or "Unknown")
            description = subj.description or ""
            user_handle = subj.handle or "unknown-user"
            bluesky_link = self.blsky.get_profile_link_from_handle(user_handle)

            # Look up by Bluesky URL first
            existing_page = self._find_page_by_bluesky_url(bluesky_link)
            found_by = "Bluesky"

            # If not found, look by DID
            if existing_page is None:
                existing_page = self._find_page_by_did(user_did)
                found_by = "DID"

            if existing_page is None:
                # -------------------------
                # CREATE NEW PAGE
                # -------------------------
                new_props = {
                    "Name": {
                        "title": [
                            {"text": {"content": display_name}}
                        ]
                    },
                    "Bluesky": {
                        "url": bluesky_link
                    },
                    "did": {
                        "rich_text": [
                            {"text": {"content": user_did}}
                        ]
                    },
                    "Description": {
                        "rich_text": [
                            {"text": {"content": description}}
                        ]
                    },
                    "Clusters": {"multi_select": []},
                    "list/starter_name": {"multi_select": []}
                }

                # Add cluster, list name
                if cluster_name:
                    new_props["Clusters"]["multi_select"].append({"name": cluster_name})

                new_props["list/starter_name"]["multi_select"].append({"name": list_name})

                new_page_id = self.notion.create_page(self.NOTION_DB_ID, new_props)
                print(f"[CREATE profile {i} of {len(all_items)}] => ID={new_page_id}, handle={user_handle}, DID={user_did}")
            else:
                # -------------------------
                # UPDATE EXISTING PAGE
                # -------------------------
                page_id = existing_page["id"]
                page_props = existing_page["properties"]

                # Merge Clusters
                if "Clusters" in page_props and page_props["Clusters"]["type"] == "multi_select":
                    merged_clusters = self._merge_multi_select(
                        {"multi_select": page_props["Clusters"]["multi_select"]},
                        cluster_name or ""
                    )
                else:
                    merged_clusters = {
                        "multi_select": [{"name": cluster_name}] if cluster_name else []
                    }

                # Merge list/starter_name
                if "list/starter_name" in page_props and page_props["list/starter_name"]["type"] == "multi_select":
                    merged_list = self._merge_multi_select(
                        {"multi_select": page_props["list/starter_name"]["multi_select"]},
                        list_name
                    )
                else:
                    merged_list = {
                        "multi_select": [{"name": list_name}] if list_name else []
                    }

                update_props = {
                    "Name": {
                        "title": [
                            {"text": {"content": display_name}}
                        ]
                    },
                    "Bluesky": {
                        "url": bluesky_link
                    },
                    "did": {
                        "rich_text": [
                            {"text": {"content": user_did}}
                        ]
                    },
                    "Description": {
                        "rich_text": [
                            {"text": {"content": description}}
                        ]
                    },
                    "Clusters": merged_clusters,
                    "list/starter_name": merged_list
                }

                updated_page_id = self.notion.update_page(page_id, update_props)
                print(f"[UPDATE by {found_by} profile {i} of {len(all_items)}] => ID={updated_page_id}, handle={user_handle}, DID={user_did}")

# -----------------------------------------------------------------
# 4) Main script logic
# -----------------------------------------------------------------
def main():
    load_dotenv()  # Load .env variables

    # Read from .env
    bsky_handle = os.getenv("BSKY_HANDLE", "")
    bsky_password = os.getenv("BSKY_APP_PASSWORD", "")
    notion_token = os.getenv("NOTION_TOKEN", "")
    default_db_id = os.getenv("NOTION_DB_ID", "")

    # Parse command line
    parser = argparse.ArgumentParser(description="Import a Bluesky list into Notion DB.")
    parser.add_argument("--list_url", required=True, help="Bluesky list URL, e.g. https://bsky.app/profile/handle/lists/rkey")
    parser.add_argument("--notion_db_id", default=default_db_id, help="Notion database ID (optional override)")
    parser.add_argument("--cluster_name", default=None, help="Optional cluster label to add in multi-select field")
    args = parser.parse_args()

    # Validate necessary env
    if not bsky_handle or not bsky_password:
        print("ERROR: BSKY_HANDLE or BSKY_APP_PASSWORD is not set. Check your .env.")
        return
    if not notion_token:
        print("ERROR: NOTION_TOKEN is not set. Check your .env.")
        return
    if not args.notion_db_id:
        print("ERROR: No notion_db_id provided (nor in .env). Provide via --notion_db_id or in .env.")
        return

    # Initialize clients
    bsky_client = BskyClient(bsky_handle, bsky_password)
    notion_client = NotionClient(notion_token)

    # Create converter
    converter = BskyListToNotionConverter(
        notion_client=notion_client,
        blsky_client=bsky_client,
        notion_db_id=args.notion_db_id,
        list_url=args.list_url
    )

    # Do the sync
    converter.sync_list_to_notion(cluster_name=args.cluster_name)


if __name__ == "__main__":
    main()
