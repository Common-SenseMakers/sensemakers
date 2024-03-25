from typing import List
import streamlit as st
import pandas as pd
import sys
from pathlib import Path
from datetime import datetime, time
import asyncio
from st_aggrid import AgGrid, GridUpdateMode

sys.path.append(str(Path(__file__).parents[2]))

from pandas.api.types import (
    is_categorical_dtype,
    is_datetime64_any_dtype,
    is_numeric_dtype,
    is_object_dtype,
)

from desci_sense.shared_functions.postprocessing import StreamlitParserResults
from desci_sense.shared_functions.schema.post import RefPost
from desci_sense.shared_functions.dataloaders.mastodon.mastodon_loader import (
    MastodonLoader,
)
from desci_sense.runner import init_model, load_config


@st.cache_resource
def load_model(config):
    model = init_model(config)
    model.set_md_extract_method("citoid")
    return model


def add_results_to_df(
    df: pd.DataFrame, results: List[StreamlitParserResults]
) -> pd.DataFrame:
    # Ensure the DataFrame and results list have the same length
    if not df.empty and len(df) == len(results):
        # Iterate over the schema of StreamlitParserResults to get all field names
        for field_name in StreamlitParserResults.model_fields.keys():
            if field_name != "debug":
                # For each field, create a new column in df with the values from results
                df[field_name] = [getattr(r, field_name) for r in results]
    else:
        raise ValueError(
            "DataFrame is empty or does not match the number of results provided."
        )

    return df


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
        max_toots=1000,
        start_date=start_date,
        end_date=end_date,
        exclude_replies=True,
        exclude_reposts=True,
    )
    return posts


# Streamlit app begins here
def main():
    # init session state
    if not "posts_df" in st.session_state:
        st.session_state.posts_df = pd.DataFrame()
    if not "posts" in st.session_state:
        st.session_state.posts = list()
    if not "results" in st.session_state:
        st.session_state.results = list()

    # initialize config
    config = load_config()
    with st.spinner("Creating model..."):
        model = load_model(config)

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

    # https://discuss.streamlit.io/t/how-to-refresh-ag-grid-data-after-deleting-selected-row/23755/5
    col_1, col_2 = st.columns(2)

    # Button to fetch and display posts
    fetch_button = col_1.button("Fetch Posts")

    # trick to force ag grid to refresh automatically
    refresh_button = col_2.button(
        "🔄 Refresh Data",
        help="You may need to click to refresh the data in the \
        posts table after running the model",
    )

    if fetch_button:
        if acct_name and start_date and end_date:
            # Fetch posts using the provided function
            posts = get_user_posts(
                mloader,
                acct_name,
                start_datetime,
                end_datetime,
            )
            st.session_state.posts = posts
            st.session_state.posts_df = render_posts_to_df(posts)
        else:
            st.write("Please enter all required information.")

    # if not st.session_state.posts_df.empty:
    st.write("Your posts:")
    AgGrid(
        st.session_state.posts_df,
        update_mode=GridUpdateMode.VALUE_CHANGED or GridUpdateMode.MODEL_CHANGE,
    )
    # else:
    # st.write("No posts found in the given date range.")

    run_model = st.button("Run model")
    if run_model:
        with st.spinner("Running model"):
            st.session_state.results = model.abatch_process_ref_post(
                st.session_state.posts,
                batch_size=8,
            )
            st.session_state.posts_df = add_results_to_df(
                st.session_state.posts_df,
                st.session_state.results,
            )

    if st.session_state.results:
        with st.expander("Full results"):
            st.write([r.model_dump() for r in st.session_state.results])

            # to refresh the dataframe display

            # TODO write debug info
            # AgGrid(st.session_state.posts_df)


if __name__ == "__main__":
    main()
