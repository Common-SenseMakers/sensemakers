from pathlib import Path
from loguru import logger
import wandb
import pandas as pd
import concurrent.futures
from tqdm import tqdm
import sys

ROOT = Path(__file__).parents[1]
sys.path.append(str(ROOT))

from desci_sense.shared_functions.init import init_multi_chain_parser_config
from desci_sense.shared_functions.parsers.multi_chain_parser import MultiChainParser
from desci_sense.evaluation.utils import get_dataset

from desci_sense.shared_functions.dataloaders import (
    scrape_post,
    convert_text_to_ref_post,
)


def process_text(text):
    return convert_text_to_ref_post(text)


if __name__ == "__main__":
    config = init_multi_chain_parser_config(
        llm_type="openai/gpt-3.5-turbo-0125", post_process_type="combined"
    )
    multi_chain_parser = MultiChainParser(config)

    api = wandb.Api()

    # TODO move from testing
    # run = wandb.init(project="testing", job_type="evaluation")

    # get artifact path

    dataset_artifact_id = (
        "common-sense-makers/filter_evaluation/labeled_tweets_no_threads:v1"
    )

    # set artifact as input artifact
    dataset_artifact = api.artifact(dataset_artifact_id)

    # initialize table path
    # add the option to call table_path =  arguments.get('--dataset')

    # download path to table
    a_path = dataset_artifact.download()
    logger.info(f"data downloaded to path {a_path}")

    # get dataset file name

    table_path = Path(f"{a_path}/labeled_data_table_no_threads.table.json")

    # return the pd df from the table
    # remember to remove the head TODO
    df = get_dataset(table_path)

    table_path = Path(f"{a_path}/handles_chart.table.json")

    df_handles = get_dataset(table_path)

    logger.info("Converting data to ref posts...")

    # Assuming df['Text'] is your DataFrame column
    with concurrent.futures.ThreadPoolExecutor() as executor:
        inputs = list(
            tqdm(executor.map(process_text, df["Text"]), total=len(df["Text"]))
        )

    logger.info("Initiating batch processing...")
    results = multi_chain_parser.batch_process_ref_posts(
        inputs, active_list=["topics", "keywords"], batch_size=5
    )

    logger.info("done!")
