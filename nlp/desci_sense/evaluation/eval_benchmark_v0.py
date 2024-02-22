"""Script to run evaluation of label prediction models.

Usage:
  eval_benchmark_v0.py [--config=<config>] [--dataset=<dataset>] [--file=<file>]


Options:
--config=<config>  Optional path to configuration file.
--dataset=<dataset> Optional path to a wandb artifact.
--file=<file> Optional file name e.g. labeled_dataset.table.json indeed it should be a table.json format

"""
from datetime import datetime
import wandb
from pathlib import Path
import json
import pandas as pd
import numpy as np
import sys
from tqdm import tqdm
import docopt
import re
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics import (
    precision_recall_fscore_support,
    accuracy_score,
    confusion_matrix,
)


sys.path.append(str(Path(__file__).parents[2]))

from desci_sense.runner import init_model, load_config


# get a path to a wandb table and populate it in a pd data frame
def get_dataset(table_path):
    raw_data = json.load(table_path.open())

    # put it in a dataframe
    try:
        rows = [
            dict(zip(raw_data["columns"], raw_data["data"][i]))
            for i in range(len(raw_data["data"]))
        ]
    except Exception as e:
        print(f"Exception occurred: {e}")

    df = pd.DataFrame(rows)
    return df


def pred_labels(df):
    model = init_model(config)
    for i in tqdm(range(len(df)), desc="Processing", unit="pred"):
        # print('in iteration',i)
        response = model.process_text(df["Text"][i])
        df["Predicted Label"][i] = response["answer"]["multi_tag"]
        df["Reasoning Steps"][i] = response["answer"]["reasoning"]

        """ print('Predicted Label: ',df['Predicted Label'][i])
    print(tuple(zip(df['Predicted Label'],df['True Label'])))"""


# values are returned as string, we want them as lists
def normalize_df(df):
    # Assuming each label is a single word and there are no spaces in labels
    # This will remove all non-word characters and split the string into words
    if type(df["True Label"][0]) == str:
        df["True Label"] = df["True Label"].apply(
            lambda x: re.sub(r"\W+", " ", x).split()
        )

    # Replace empty list with an empty 'None' in 'Predicted label' TODO
    # df['Predicted Label'] = df['Predicted Label'].apply(lambda x: 'None' if pd.isnull(x) else x)
    # df['Predicted Label'] = df['Predicted Label'].apply(lambda x: re.sub(r'\W+', ' ', x).split())


def binarize(y_pred, y_true):
    # binarize for using skl functions
    # Assume df['True label'] and df['Predicted label'] are your true and predicted labels
    mlb = MultiLabelBinarizer()

    # Binarize the labels
    mlb.fit(y_pred + y_true)

    # binarize true and predicted labels vectors
    y_true = mlb.transform(y_true)

    y_pred = mlb.transform(y_pred)
    print("y_pred: ", y_pred)
    print("y_true: ", y_true)
    return y_pred, y_true, mlb.classes_


# assumes that the values on 'True Label' and 'Predicted Label' are lists
def calculate_scores(y_pred, y_true):
    # calculate scores
    # Calculate precision, recall, f1_score, support
    precision, recall, f1_score, support = precision_recall_fscore_support(
        y_true, y_pred, average=None
    )

    # calculate accuracy
    accuracy = accuracy_score(y_pred=y_pred, y_true=y_true)

    # calculate label confusion chart

    return precision, recall, f1_score, support, accuracy


# def create_evaluation_artifact(df,)

# Create a custom confusion matrix: on the diagonal you see the true positives
# off the diagonal you see the false positives incase the row label was predicted as false negative


def create_custom_confusion_matrix(y_true, y_pred, labels):
    # Initialize an empty matrix
    matrix = np.zeros((len(labels), len(labels)))

    # Calculate confusion matrix for each label
    for i, label_i in enumerate(labels):
        for j, label_j in enumerate(labels):
            if i == j:
                # Diagonal: True Positives for label i
                tp = confusion_matrix(y_true[:, i], y_pred[:, i]).ravel()[3]
                matrix[i, i] = tp
            else:
                # Off-diagonal: i was true (fn for i) but j was predicted (fp for j)
                fn_i = y_true[:, i] & ~y_pred[:, i]
                fp_j = ~y_true[:, j] & y_pred[:, j]
                matrix[i, j] = np.sum(fn_i & fp_j)

    return pd.DataFrame(matrix, index=labels, columns=labels)


# Log chart of metrics per label
def score_chart_by_label(labels, y_pred, y_true):
    precision, recall, f1_score, support, accuracy = calculate_scores(
        y_pred=y_pred, y_true=y_true
    )
    df = pd.DataFrame(
        {
            "Labels": labels,
            "Precision": precision,
            "Recall": recall,
            "F1 score": f1_score,
            "True label Count": sum(y_true),
        }
    )
    avg_row = pd.DataFrame(
        {
            "Labels": "Average",
            "Precision": pd.Series(precision).mean(),
            "Recall": pd.Series(recall).mean(),
            "F1 score": pd.Series(f1_score).mean(),
            "True label Count": sum(sum(y_true)),
        },
        index=[0],
    )
    df = df._append(avg_row, ignore_index=True)
    return df


if __name__ == "__main__":
    arguments = docopt.docopt(__doc__)

    # initialize config
    config_path = arguments.get("--config")
    dataset_path = arguments.get("--dataset")
    file_name = arguments.get("--file")
    config = load_config(config_path)

    # initialize table path

    wandb.login()

    api = wandb.Api()

    run = wandb.init(project="evaluation_benchmark", job_type="evaluation")

    # get artifact path
    if dataset_path:
        dataset_artifact_id = dataset_path
    else:
        dataset_artifact_id = (
            "common-sense-makers/evaluation_benchmark/dataset_for_eval:latest"
        )

    # set artifact as input artifact
    dataset_artifact = run.use_artifact(dataset_artifact_id)

    # initialize table path
    # add the option to call table_path =  arguments.get('--dataset')

    # download path to table
    a_path = dataset_artifact.download()

    # get file name
    if file_name:
        table_path = Path(f"{a_path}/{file_name}")
    else:
        table_path = Path(f"{a_path}/labeled_data.table.json")

    # return the pd df from the table
    df = get_dataset(table_path)

    pred_labels(df)

    # make sure df can be binarized
    normalize_df(df)

    # return binarized predictions and true labels, as well as labels names
    y_pred, y_true, labels = binarize(
        y_pred=df["Predicted Label"], y_true=df["True Label"]
    )

    # calculate scores
    precision, recall, f1_score, support, accuracy = calculate_scores(
        y_pred=y_pred, y_true=y_true
    )

    # Create the evaluation artifact
    current_datetime = datetime.now()

    # Format the date to a custom alphanumeric format to comply with artifact name
    time = current_datetime.strftime("%Y%m%d%H%M%S")

    artifact = wandb.Artifact("prediction_evaluation-" + str(time), type="evaluation")

    # Create a wandb.Table from the Pandas DataFrame
    table = wandb.Table(dataframe=df)

    # Add the wandb.Table to the artifact
    artifact.add(table, "prediction_evaluation")

    # Log score chart per label
    score_chart = score_chart_by_label(labels=labels, y_pred=y_pred, y_true=y_true)

    print(score_chart)

    wandb.log({"Label Score Chart": wandb.Table(dataframe=score_chart)})

    # Log c
    matrix = create_custom_confusion_matrix(y_true=y_true, y_pred=y_pred, labels=labels)
    wandb.log(
        {
            f"costume_confusion_matrix": wandb.plots.HeatMap(
                matrix_values=matrix, y_labels=labels, x_labels=labels, show_text=True
            )
        }
    )

    # meta data and scores to log
    meta_data = {
        "dataest_size": len(df),
        "precision": pd.Series(precision).mean(),
        "recall": pd.Series(recall).mean(),
        "f1_score": pd.Series(f1_score).mean(),
        "accuracy": accuracy,
    }

    # add the scores as metadata
    artifact.metadata.update(meta_data)

    # model_info is your model metadata
    run.config.update(config)

    # log scores as summary of the run
    # note that the scores are actually calculated in the cells above.
    run.summary.update(meta_data)

    # Log the artifact
    wandb.log_artifact(artifact, aliases=["latest"])

    wandb.run.finish()
