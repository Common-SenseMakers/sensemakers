"""Script to run the streamlit Nanobot app.

Usage:
  st_demo.py [--config=<config>]
  st_demo.py (-h | --help)


Options:
  -h --help     Show this screen. To run through streamlit with arguments, use `streamlit run path/to/script -- --config path/to/config`
  --config=<config>  Optional path to configuration file.

"""

import sys
import streamlit as st
import wandb
import pandas as pd
import shortuuid
from typing import List
from docopt import docopt
from pathlib import Path
from confection import Config

sys.path.append(str(Path(__file__).parents[2]))

from desci_sense.shared_functions.schema.post import RefPost
from desci_sense.shared_functions.web_extractors.metadata_extractors import (
    MetadataExtractionType,
)
from desci_sense.shared_functions.schema.ontology_base import OntologyBase
from desci_sense.shared_functions.dataloaders import scrape_post
from desci_sense.configs import environ
from desci_sense.runner import init_model, load_config
from desci_sense.semantic_publisher import create_triples_from_prediction


# display name for post for rendering in streamlit
SUBJ_DISPLAY_NAME_MAP = {"post": "💬 Your post"}


result = None

if "clicked_run" not in st.session_state:
    st.session_state.clicked_run = False

if "result" not in st.session_state:
    st.session_state.result = {}


def click_run():
    st.session_state.clicked_run = True


def predicate_data_editor(
    df: pd.DataFrame, possible_labels: List[str], ontology: OntologyBase
):
    """Create editable dataframe displaying the prediction results

    Args:
        df (pd.DataFrame): _description_
    """
    label_map = ontology.label_df.loc[possible_labels].to_dict(orient="index")
    # logger.debug(f"Possible labels: {possible_labels}")

    df["subject"] = df["subject"].map(SUBJ_DISPLAY_NAME_MAP)
    df["predicate"] = df["predicate"].apply(lambda x: label_map[x]["display_name"])
    predicate_display_names = ontology.label_df.loc[
        possible_labels
    ].display_name.to_list()

    # Get unique values from the 'object' column
    unique_objs = df["object"].unique()

    edited_df = st.data_editor(
        df,
        column_config={
            "subject": st.column_config.SelectboxColumn(
                "Subject",
                help="The subject of the triplet",
                width="medium",
                options=[list(SUBJ_DISPLAY_NAME_MAP.values())],
                required=True,
            ),
            "predicate": st.column_config.SelectboxColumn(
                "Predicate",
                help="The predicate of the triplet",
                width="medium",
                options=predicate_display_names,
                required=True,
            ),
            "object": st.column_config.SelectboxColumn(
                "Object",
                help="The object of the triplet",
                width="medium",
                options=unique_objs,
                required=True,
            ),
        },
        hide_index=True,
        num_rows="dynamic",
    )

    return edited_df


def log_pred_wandb(
    wandb_run,
    result,
    triplet_df: pd.DataFrame,
    ontology_df: pd.DataFrame,
    human_label: str = "",
    labeler_name: str = "",
):
    # get a unique ID for this prediction
    pred_uid = shortuuid.ShortUUID().random(length=8)

    pred_name = f"pred_{wandb_run.id}_{pred_uid}"
    artifact = wandb.Artifact(pred_name, type="prediction")

    columns = [
        "User",
        "URL",
        "Text",
        "Full Prompt",
        "Reasoning Steps",
        "Final Answer",
        "Predicted Label",
        "True Label",
        "Name of Label Provider",
        "Post Source",
        "Prediction ID",
    ]

    # check if prediction was post or simple text
    if "post" in result:
        post: RefPost = result["post"]
        pred_row = [
            post.author,
            post.url,
            post.content,
            result.get("full_prompt", None),
            result["answer"]["reasoning"],
            result["answer"]["final_answer"],
            result["answer"].get("multi_tag", list()),
            human_label,  # if user supplied a label
            labeler_name,  # name of person who provided label
            post.source_network,
            pred_name,
        ]
    else:
        raise ValueError("Result should have `post` key!")

    data = [pred_row]

    # add data to table
    table = wandb.Table(data=data, columns=columns)
    artifact.add(table, "predictions")

    # add triplet dataframe
    artifact.add(wandb.Table(dataframe=triplet_df), "triplets")

    # add ontology dataframe
    artifact.add(wandb.Table(dataframe=ontology_df), "ontology")

    # log immediately since we don't know when user will close the session
    wandb.log_artifact(artifact)


def init_wandb_run(model_config):
    wandb.login(key=environ["WANDB_API_KEY"])
    wandb_run = wandb.init(
        job_type="demo",
        project=model_config["wandb"]["project"],
        config=model_config,
        entity=model_config["wandb"]["entity"],
    )

    return wandb_run


def print_post(post: RefPost):
    sm_type = post.source_network
    assert sm_type in ["twitter", "mastodon"]
    st.divider()

    section_title = "### 🗨️ Extracted Post"

    if sm_type == "mastodon":
        sm_type_string = "🦣 Mastodon"
    else:
        # assuming Twitter
        sm_type_string = "🐦 Twitter"

    author_str = "👤 **Author:** :gray[{}]".format(post.author)
    post_text = "📝 **Post text:** :gray[{}]".format(post.content)
    post_url = "🔗 **Post URL:** `{}`".format(post.url)
    source_sm = f"🔉 **Source Social Media:** {sm_type_string}"
    st.markdown(
        f"{section_title} \n {author_str} \n\n  {post_text} \n\n  {post_url} \n\n {source_sm}"
    )
    st.divider()


def st_scrape_post(post_url):
    """
    Scrape Twitter or Mastodon post
    """
    post = scrape_post(post_url)

    if not post:
        st.error(
            "Could not detect post social media type. Please try another URL.", icon="🚨"
        )
        st.stop()
    else:
        st.success("Scraped post successfully!")

    return post


def process_text(text, model):
    # parse text
    with st.spinner("Parsing text..."):
        result = model.process_text_st(text, author="unknown", source="raw_text_input")
        # st.write(result["answer"])
        return result


def process_post(post: RefPost, model):
    # check whether masto or twitter and parse accordingly
    sm_type = post.source_network
    assert sm_type in ["twitter", "mastodon"]

    with st.spinner(f"Parsing {sm_type} post..."):
        result = model.process_ref_post_st(post)
        # st.write(result["answer"])
        return result


def process_keywords(result, model):
    post = result.get("post")
    model.set_kw_md_extract_method("citoid")
    with st.spinner(f"Extracting keywords..."):
        kw_result = model.extract_post_topics_w_metadata(post)
        result["keywords"] = kw_result["answer"].get("valid_keywords")
        result["kw_prompt"] = kw_result["full_prompt"]
        return result


@st.cache_resource
def load_model(config):
    model = init_model(config)
    return model


if __name__ == "__main__":
    arguments = docopt(__doc__, version="Nanopub Streamlit App 0.1")

    # initialize config
    config_path = arguments.get("--config")
    config = load_config(config_path)

    with st.spinner("Creating model..."):
        model = load_model(config)
        ontology = model.ontology

    # add set of possible predicate labels available in this run
    config["ontology"]["tags"] = ontology.get_all_labels()

    st.title("LLM Nanopublishing assistant demo")

    # container structure for layout
    pre_amble_section = st.container()
    input_section = st.container()
    nanobot_section = st.container()
    bottom_section = st.container()

    # label description section
    labels_descriptions = [
        f"{d['display_name']}: {d['prompt']}"
        for d in ontology.template_type_df.to_dict(orient="records")
    ]
    labels_text = "\n\n".join(labels_descriptions)

    with pre_amble_section:
        st.markdown(
            """The bot will categorize a post as one or a few of the following types:"""
        )
        with st.expander("Label types"):
            st.markdown(labels_text)

            st.markdown(
                """👷In the future, more types will be added, this is just a hacky demo!"""
            )

        with st.expander("✂️📋 Sample post URLs to copy & paste"):
            st.markdown("Twitter:")
            st.code(
                """
                        https://twitter.com/TaniaLombrozo/status/1722709702667026865
                        """,
                language="markdown",
            )

            st.markdown("Mastodon:")
            st.code(
                """
                        https://mastodon.social/@yoginho@spore.social/111335863558977253
                        """,
                language="markdown",
            )

    with bottom_section:
        st.divider()
        st.markdown("""💻 Code repo: https://github.com/csensemakers/desci-sense""")

    with input_section:
        post_url = st.text_input("Enter Twitter/Mastodon post URL:", "")
        user_text = st.text_area("Or write text here directly instead")
        if not (post_url or user_text):
            st.warning(
                "Please input a Twitter/Mastodon URL or your own free-form text."
            )
            st.stop()
        if post_url:
            st.success("Post URL provided.")
        if user_text:
            st.success("Free-form text provided")
            target_text = user_text

        if post_url:
            post = st_scrape_post(post_url)
            print_post(post)
            target_text = post.content

        st.markdown("### Target text to parse:")
        st.text(target_text)
        st.divider()

    selected = None
    with nanobot_section:
        st.markdown("## 🤖 Nanobot")
        col1, col2 = st.columns(2)

        with col1:
            st.markdown("### Semantic parsing")
            # let users select metadata extraction method type (or None)
            md_values = [x.value for x in MetadataExtractionType]
            metadata_type = st.radio(
                "Select metadata extraction method:", options=md_values
            )
            if "ref_metadata_method" in model.config["general"]:
                model.set_md_extract_method(metadata_type)

        with col2:
            st.markdown("### Keyword extraction")
            enable_keywords = st.checkbox(label="Extract keywords?")

        start_run_btn = st.button("Run!", on_click=click_run)
        if start_run_btn:
            if post_url:
                result = process_post(post, model)
                st.session_state.result = result
            else:
                # free text option
                result = process_text(target_text, model)
                st.session_state.result = result

            if enable_keywords:
                # extract keywords
                result = process_keywords(st.session_state.result, model)
                st.session_state.result = result
            with st.expander("Full output result"):
                st.write(result)

        if st.session_state.clicked_run:
            if "keywords" in st.session_state.result:
                selected = st.multiselect(
                    "Predicted keywords",
                    st.session_state.result["keywords"],
                    st.session_state.result["keywords"],
                    disabled=True,
                )

            if "answer" in st.session_state.result:
                selected = st.multiselect(
                    "Predicted tags",
                    st.session_state.result["possible_labels"],
                    st.session_state.result["answer"]["multi_tag"],
                    disabled=True,
                )
            else:
                selected = []

            # display editable table of predicted triplets
            rows = create_triples_from_prediction(st.session_state.result)

            # create dataframe from rows
            df = pd.DataFrame(rows, columns=["subject", "predicate", "object"])

            # form to edit prediction and submit results for logging purposes
            with st.form("log_form"):
                st.markdown(
                    "Are these actually the right triplets? Choose the relations you think fit best by editing/adding/removing triplets (or leave the predicted options), and then click 'Log Results'!"
                )

                edited_df = predicate_data_editor(
                    df, st.session_state.result["possible_labels"], ontology
                )

                labeler_name = st.text_input(
                    "Optionally add your name or other identifier.", ""
                )
                log_results_btn = st.form_submit_button("Log results")
                st.markdown(
                    """👆 By clicking this you will be sharing the data with our team for research purposes. 
                    By data we mean the input data, the bot predictions, and the name field as well as any labels you optionally provided. Thanks! """
                )

                if log_results_btn:
                    # log results
                    # get labels selected by human
                    selected_human = list(edited_df.predicate.unique())

                    # convert from predicate display names to labels
                    converted_to_labels = [
                        ontology.display_name_df.loc[x]["label"]
                        for x in selected_human
                        if x in ontology.display_name_df.index
                    ]

                    with st.spinner("Logging result..."):
                        # log results to wandb DB
                        pred = list(st.session_state.result["answer"]["multi_tag"])
                        wandb_run = init_wandb_run(model.config)
                        log_pred_wandb(
                            wandb_run,
                            st.session_state.result,
                            edited_df,
                            ontology.ont_df,
                            converted_to_labels,
                            labeler_name,
                        )
                        wandb_run.finish()
                    st.success("Logged results!")
                    st.session_state.clicked_run = False
                    st.session_state.result = {}
