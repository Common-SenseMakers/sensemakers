from typing import List
import streamlit as st
import pandas as pd
import sys
from pathlib import Path
from datetime import datetime, time

sys.path.append(str(Path(__file__).parents[2]))

from desci_sense.shared_functions.schema.post import RefPost
from desci_sense.shared_functions.dataloaders.mastodon.mastodon_loader import (
    MastodonLoader,
)


def render_posts_to_df(posts: List[RefPost]) -> pd.DataFrame:
    """
    Renders posts as dataframe with columns `author`, `url`, `content`, and `created_at` fields.
    """
    # Create a list of dictionaries, each representing a row in the resulting DataFrame
    data = [
        {
            "author": post.author,
            "content": post.content,
            "url": post.url,
            "created_at": post.created_at,
        }
        for post in posts
    ]

    # Convert the list of dictionaries into a DataFrame
    df = pd.DataFrame(data)

    return df


@st.cache_resource
def get_masto_loader():
    mloader = MastodonLoader()
    return mloader


@st.cache_data
def get_user_posts(_masto_loader, acct_name, start_date, end_date):
    posts = _masto_loader.load_profile_timeline(
        acct_name,
        max_toots=5,
        start_date=start_date,
        end_date=end_date,
        exclude_replies=True,
        exclude_reposts=True,
    )
    return posts


# Streamlit app begins here
def main():
    # get mastodon api connection
    mloader = get_masto_loader()

    st.title("Mastodon Autoposter Queue Demo")

    # User input for Mastodon account
    acct_name = st.text_input(
        "Enter your Mastodon account", value="@ronent@mastodon.social"
    )

    # User input for date range
    start_date = st.date_input("Start date")
    end_date = st.date_input("End date")
    start_datetime = datetime.combine(start_date, time())
    end_datetime = datetime.combine(end_date, time())

    # Button to fetch and display posts
    if st.button("Fetch Posts"):
        if acct_name and start_date and end_date:
            # Fetch posts using the provided function
            posts = get_user_posts(
                mloader,
                acct_name,
                start_datetime,
                end_datetime,
            )

            posts_df = render_posts_to_df(posts)

            if not posts_df.empty:
                st.write("Your posts:")
                st.dataframe(posts_df)
            else:
                st.write("No posts found in the given date range.")
        else:
            st.write("Please enter all required information.")


if __name__ == "__main__":
    main()
