#evaluation of the research filter

"""Script to run evaluation of label prediction models.

Usage:
  filter_evaluation.py [--config=<config>] [--dataset=<dataset>] [--file=<file>]


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
from sklearn.preprocessing import LabelBinarizer
from sklearn.metrics import (
    precision_recall_fscore_support,
    accuracy_score,
    confusion_matrix
)


sys.path.append(str(Path(__file__).parents[2]))

from desci_sense.runner import init_model, load_config
from desci_sense.shared_functions.schema.post import RefPost
from desci_sense.evaluation.utils import get_dataset, create_custom_confusion_matrix

#processing keywords
def process_keywords(result, model):
    post = result['post']
    model.set_kw_md_extract_method("citoid")

    kw_result = model.extract_post_topics_w_metadata(post)
    result["kw_reasoning"] = kw_result["answer"]["reasoning"]
    result["academic_kw"] = kw_result["answer"]["academic_kw"]
    result["raw_kw_output"] = kw_result["answer"]["raw_text"]
    return result

#function for predicting labels
def pred_labels(df):
    model = init_model(config)
    columns_list = df.columns.tolist()
    #print("C list is: ",columns_list)
    if "Predicted Label" not in columns_list:
        df["Predicted Label"] = ''

    if "Reasoning Steps" not in columns_list:
        df["Reasoning Steps"] = ''

    
    for i in tqdm(range(len(df)), desc="Processing", unit="pred"):
        print("urls: ",df['urls'][i])
        refpost = {
            'post': RefPost(
                    author='default_author',
                    content= df['Text'][i], 
                    url='', 
                    source_network='default_source', 
                    ref_urls=df['urls'][i]
                    )
                }

        #response = model.process_text_st(df["Text"][i])
        try:
            response = process_keywords(result=refpost,model=model)
            df.loc[i, "Predicted Label"] = response["academic_kw"]
            df.loc[i, "Reasoning Steps"] = response["raw_kw_output"]
            print('Predicted Label is: ',df['Predicted Label'][i])
        except Exception as e:
            df.loc[i, "Predicted Label"] = 'parser error'
            df.loc[i, "Reasoning Steps"] = str(e)
            print('Predicted Label is: ',df['Predicted Label'][i])
            print(e)
            


#make sure that the dataframe conforms with the binary classification format
def normalize_df(df):
    # Assuming each label is a single word and there are no spaces in labels
    # This will remove all non-word characters and split the string into words
    if type(df["True Label"][0]) == list:
        df["True Label"] = df["True Label"].apply(lambda x: x[0])

def binarize(y_pred, y_true):
    # binarize for using skl functions
    # Assume df['True label'] and df['Predicted label'] are your true and predicted labels
    lb = LabelBinarizer()

    # Binarize the labels
    # Note that the binarization is done alphabeticly so in binary classes 'academic' = 0 & 'non-academic' =1.
    lb.fit(pd.concat([y_pred, y_true]).unique())

    # binarize true and predicted labels vectors
    y_true = lb.transform(y_true)

    y_pred = lb.transform(y_pred)
    print("y_pred: ", y_pred)
    print("y_true: ", y_true)
    return y_pred, y_true, lb.classes_

def calculate_scores(y_pred, y_true):
    # calculate scores
    # Calculate precision, recall, f1_score, support
    precision, recall, f1_score, support = precision_recall_fscore_support(
        y_true, y_pred, average=None
    )

    # calculate accuracy
    accuracy = accuracy_score(y_pred=y_pred, y_true=y_true)

    # calculate label confusion chart

    return precision[0], recall[0], f1_score[0], accuracy 


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

    run = wandb.init(project="filter_evaluation", job_type="evaluation")

    # get artifact path
    if dataset_path:
        dataset_artifact_id = dataset_path
        print(dataset_artifact_id)
    else:
        dataset_artifact_id = (
            
            'common-sense-makers/evaluation/toot_sci__labeling:v1'
        )

    # set artifact as input artifact
    dataset_artifact = run.use_artifact(dataset_artifact_id)

    # initialize table path
    # add the option to call table_path =  arguments.get('--dataset')

    # download path to table
    a_path = dataset_artifact.download()
    print("The path is",a_path)

    # get file name
    if file_name:
        table_path = Path(f"{a_path}/{file_name}")
    else:
        table_path = Path(f"{a_path}/labeled_data_table.table.json")

    # return the pd df from the table
    #remember to remove the head TODO
    df = get_dataset(table_path)

    pred_labels(df)
    
    # make sure df can be binarized
    normalize_df(df)
    # return binarized predictions and true labels, as well as labels names
    y_pred, y_true, labels = binarize(
        y_pred=df["Predicted Label"], y_true=df["True Label"]
    )

    # calculate scores: Note that we assumes that the 'academic' label is the firs in the label list
    # TODO in the score function, return scores of the index of the 'academic' label so not to assume it is the first.
    precision, recall, f1_score, accuracy = calculate_scores(
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

    # Log cm
    # Generate the confusion matrix
    try:
        matrix = confusion_matrix(y_true, y_pred)
    except:
        matrix = create_custom_confusion_matrix(y_true=y_true, y_pred=y_pred, labels=labels)

    #log the matrix
    wandb.log(
        {
            f"confusion_matrix": wandb.plots.HeatMap(
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