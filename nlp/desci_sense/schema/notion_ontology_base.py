from typing import List, Dict
import pandas as pd
import json
from notion_client import Client
from pydantic import Field


from ..configs import environ
from ..shared_functions.interface import NotionOntologyConfig
from ..shared_functions.schema.ontology_base import (
    OntologyInterface,
    get_llm_predicate_defs_from_df,
)


def load_ontology_from_config(config: NotionOntologyConfig):
    # use keys if passed in config or otherwise take from environment settings.
    if not config.notion_api_token:
        config.notion_api_token = environ["NOTION_SENSEBOT_TOKEN"]
    if not config.db_id:
        config.db_id = environ["NOTION_SENSEBOT_DB"]

    # create ontology from config
    ontology = NotionOntologyBase(config)

    return ontology


def load_notion_config_json(config_json_path: str):
    with open(config_json_path) as f:
        file_contents = f.read()

    config = NotionOntologyConfig.model_validate_json(file_contents)
    return config


def create_df_from_notion_db(raw_notion_db) -> pd.DataFrame:
    """Load raw notion db representing ontology into a Dataframe"""
    data = []
    for row in raw_notion_db:
        data_row = {
            "name": row["properties"]["name"]["title"][0]["plain_text"]
            if row["properties"]["name"]["title"]
            else None,
            "display_name": row["properties"]["display_name"]["rich_text"][0][
                "plain_text"
            ]
            if row["properties"]["display_name"]["rich_text"]
            else None,
            "uri": row["properties"]["URI"]["formula"]["string"]
            if row["properties"]["URI"].get("formula")
            else None,
            "label": row["properties"]["label"]["rich_text"][0]["plain_text"]
            if row["properties"]["label"]["rich_text"]
            else None,
            "prompt": row["properties"]["prompt"]["rich_text"][0]["plain_text"]
            if row["properties"]["prompt"]["rich_text"]
            else None,
            "notes": row["properties"]["notes"]["rich_text"][0]["plain_text"]
            if row["properties"]["notes"]["rich_text"]
            else None,
            "valid_subject_types": [
                item["name"]
                for item in row["properties"]["valid_subject_types"]["multi_select"]
            ],
            "valid_object_types": [
                item["name"]
                for item in row["properties"]["valid_object_types"]["multi_select"]
            ],
            "versions": [
                tag["name"] for tag in row["properties"]["versions"]["multi_select"]
            ],
        }
        data.append(data_row)

    # Create a DataFrame
    df = pd.DataFrame(data)

    # Set 'name' as the index of the DataFrame
    df.set_index("name", inplace=True, drop=False)

    return df


def filter_ontology_by_version(
    ont_df: pd.DataFrame, allowed_versions: List[str] = None
) -> pd.DataFrame:
    """Takes ontology df `ont_df` and list of allowed versions `allowed_versions`, and returns a filtered ontology df
    including only templates for which at least one of the versions in `versions` is in `allowed_versions`.
    """
    # If allowed_versions is None or empty, return the original DataFrame
    if not allowed_versions:
        return ont_df

    # Filter the DataFrame based on the versions column
    filtered_df = ont_df[
        ont_df["versions"].apply(
            lambda versions: any(version in allowed_versions for version in versions)
        )
    ]

    return filtered_df


# Fetch the database information
def get_notion_db_name(notion_client, database_id: str) -> str:
    db_info = notion_client.databases.retrieve(database_id)

    # Extract the database name from the title property
    db_name = (
        db_info["title"][0]["plain_text"] if db_info["title"] else "Unnamed Database"
    )

    return db_name


class NotionOntologyBase:
    def __init__(self, config: NotionOntologyConfig) -> None:
        self.config = config

        # use keys if passed as args or otherwise take from environment settings.
        sensebot_key = (
            config.notion_api_token
            if config.notion_api_token
            else environ["NOTION_SENSEBOT_TOKEN"]
        )
        self.db_id = config.db_id if config.db_id else environ["NOTION_SENSEBOT_DB"]

        # create Notion client
        notion = Client(auth=sensebot_key)

        # fetch db name
        self.name = get_notion_db_name(notion, self.db_id)

        # Fetch the database
        results = notion.databases.query(self.db_id)["results"]

        # Process the results into a format suitable for DataFrame
        ont_df = create_df_from_notion_db(results)

        # filter by chosen versions
        self.ont_df = filter_ontology_by_version(
            ont_df, allowed_versions=config.versions
        )

        # create OntologyInterface object
        semantic_predicates = get_llm_predicate_defs_from_df(self.ont_df)
        self.ontology_interface = OntologyInterface(
            semantic_predicates=semantic_predicates,
            ontology_config=self.config,
        )

        # set dict versions with alternate keys for fast lookup
        self._label_map = self.ont_df.set_index("label")
        self._display_map = self.ont_df.set_index("display_name")
        self._template_type_map = self.ont_df

    @property
    def label_df(self):
        return self._label_map

    @property
    def display_name_df(self):
        return self._display_map

    @property
    def template_type_df(self):
        return self._template_type_map

    def get_valid_templates(
        self, subject_type: str, object_type: str, as_dict: bool = True
    ) -> List[Dict]:
        """
        Given `subject_type` and `object_type`, return list of templates where `subject_type` is in template['valid_subject_types'] and
        `object_type` is in template['valid_object_types'].
        Templates are the rows of the Notion ontology table provided on initialization.
        """
        # Filter the dataframe based on the subject_type and object_type
        valid_templates = self.ont_df[
            self.ont_df["valid_subject_types"].apply(
                lambda types: subject_type in types
            )
            & self.ont_df["valid_object_types"].apply(
                lambda types: object_type in types
            )
        ]

        res = valid_templates

        if as_dict:
            # Convert the filtered DataFrame to a list of dictionaries
            res = valid_templates.to_dict(orient="records")

        return res

    def get_all_labels(self) -> List[str]:
        return self.ont_df.label.to_list()

    def get_all_display_names(self) -> List[str]:
        return self.ont_df.display_name.to_list()


def write_ontology_to_json(ontology: NotionOntologyBase, outpath: str):
    # Convert the dataframe to a dictionary in the specified format
    df = ontology.ont_df
    records = df.to_dict(orient="records")
    json_records = {r["name"]: r for r in records}
    json_final = {
        "ontology": json_records,
        "notion_config": ontology.config.model_dump(),
    }

    # Convert the dictionary to JSON format
    json_data = json.dumps(json_final, indent=4, ensure_ascii=False)

    # Save the JSON data to a file
    with open(outpath, "w") as file:
        file.write(json_data)
