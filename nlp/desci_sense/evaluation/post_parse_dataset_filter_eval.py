#evaluation of the academic filter, it takes as a input a dataset and a handle table from a prediction artifact.
# the handle table holds information about the accounts that published the dataset posts

"""Script to run evaluation of label prediction models.

Usage:
  filter_evaluation.py  [--dataset=<dataset>] [--dataset_file=<file>] [--handle_file=<file>]


Options:

--dataset=<dataset> Optional path to a wandb artifact.
--dataset_file=<file> Optional dataset file name e.g. labeled_dataset.table.json indeed it should be a table.json format
--handle_file=<file> Optional file name e.g. labeled_dataset.table.json indeed it should be a table.json format

"""
from datetime import datetime
import wandb
from pathlib import Path
import pandas as pd
import numpy as np
import sys
import docopt
from sklearn.preprocessing import LabelBinarizer
from sklearn.metrics import (
    precision_recall_fscore_support,
    accuracy_score,
    confusion_matrix
)


sys.path.append(str(Path(__file__).parents[2]))

from desci_sense.evaluation.utils import get_dataset, create_custom_confusion_matrix, obj_str_to_dict, parse_string_to_dict
from desci_sense.shared_functions.init import init_multi_chain_parser_config

class CustomLabelBinarizer(LabelBinarizer):
    def fit(self, y, order=None):
        if order is not None:
            # Set classes to the provided order
            self.classes_ = np.array(order)
        else:
            # Default behavior
            super().fit(y)
        return self

# A function that returns the ratio of "auto_research" over the total amount
def topic_eval(df,tp):
    bool_topics = list(df.apply(lambda row: check_topic(row['Ref item types']),axis = 1))
    print(sum(bool_topics))
    try:
        ratio = sum(bool_topics)/tp
    except Exception as e:
        ratio = 0
        print("Ratio exception: ",e)
    
    return ratio

# checks if parsed topics are in the allowlist
def check_topic(topics:list):
    item_types_allowlist = [
    "bookSection",
    "journalArticle",
    "preprint",
    "book",
    "manuscript",
    "thesis",
    "presentation",
    "conferencePaper",
    "report",
    ]
    if len(set(topics).intersection(set(item_types_allowlist))) > 0:
        return 1
    else:
        return 0

def binarize(y_pred, y_true):
    # binarize for using skl functions
    # Assume df['True label'] and df['Predicted label'] are your true and predicted labels
    #lb = LabelBinarizer()
    lb = CustomLabelBinarizer()

    # Binarize the labels
    # Note that the binarization is done alphabeticly so in binary classes 'academic' = 0 & 'non-academic' =1.
    lb.fit(['research','not_research'],order=['research','not_research'])

    # binarize true and predicted labels vectors
    y_true = lb.transform(y_true)

    y_pred = lb.transform(y_pred)
    #print("y_pred: ", y_pred)
    #print("y_true: ", y_true)
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

def calculate_feed_score(df,name:str):
   
    df1 = df[df["username"] == name]
   
    y_pred = df1["Predicted Label"]
    y_true= df1["True Label"]
    n = len(y_true)
    try:
        y_pred, y_true, labels = binarize(y_pred=y_pred,y_true=y_true)
        precision, recall, f1_score, accuracy = calculate_scores(y_pred=y_pred,y_true=y_true)
        try:
            cm = confusion_matrix(y_pred=y_pred,y_true=y_true)
        except:
            print('No entries in feed of: ',name)
            tp = 0
        try:
            tp = cm[0,0]
            fn = cm[1,0]
        except:
            print("no FNs ")
            fn = 0
        try:
            r_topics = topic_eval(df=df1,tp=tp)
        except:
            print("No citoids detection")
            r_topics = 0

        
        #print("##########here#########",precision, recall, f1_score, accuracy,n ,labels,tp,fn,r_topics)
        return pd.Series([precision, recall, f1_score, accuracy, tp, fn, n,r_topics], index=["precision", "recall", "f1_score", "accuracy","TP","FN","posts count",'citoid positive ratio'])
    except Exception as e:
        print(f"exception was raised while calculating feed scores: {e}")
        return pd.Series([0, 0, 0, 0,0,0, n,0], index=["precision", "recall", "f1_score", "accuracy","TP","FN","posts count",'citoid positive ratio'])

def weighted_average(column_name:str,df):
    return (df[column_name] * df['posts count']).sum() / df['posts count'].sum()


def constr_feed_chart(df,df_handles):
    # init the table to scores per feed
    # Extract usernames and server names into separate columns TODO create an artifact that holds this file
    #df_handles['username'] = df_handles['accts'].apply(lambda x: x.split('@')[1])
    #df_handles['server'] = df_handles['accts'].apply(lambda x: x.split('@')[2])
    df_feed_eval = df_handles[["username","server","info"]]
    for column in ["precision", "recall", "f1_score", "accuracy","posts count"]:
        df_feed_eval[column] = 0
    # calculate scores per each dataframe reduced to a handle
    print("Calculating df_feed_eval")
    df_feed_eval[["precision","recall","f1_score","accuracy",'TP','FN',"posts count",'citoid positive ratio']] = df_feed_eval.apply(lambda row:  calculate_feed_score(df=df,name=row["username"]),axis=1)
    average_row = [weighted_average(column_name = x,df = df_feed_eval) for x in ["precision", "recall", "f1_score", "accuracy"]]
    tp = df_feed_eval["TP"].sum()
    r_topics = topic_eval(df=df,tp=tp)
    average_row.extend([tp,df_feed_eval["FN"].sum(),df_feed_eval["posts count"].sum(),r_topics])

    new_row = ["Average","",""] + average_row


    new_row = pd.DataFrame([new_row],columns=['username', 'server', 'info', 'precision', 'recall', 'f1_score', 'accuracy', 'TP', 'FN', 'posts count','citoid positive ratio'])
    print(new_row)

    return df_feed_eval._append(new_row, ignore_index=True)


if __name__ == "__main__":
    arguments = docopt.docopt(__doc__)

    # initialize config
    dataset_path = arguments.get("--dataset")
    dataset_file = arguments.get("--dataset_file")
    handle_file = arguments.get("--handle_file")

   

    # initialize table path

    wandb.login()

    api = wandb.Api()

    #TODO move from testing
    run = wandb.init(project="testing", job_type="evaluation")

    # get handees artifact path
   
    handle_artifact_id = (
        'common-sense-makers/filter_evaluation/labeled_tweets_no_threads:v1'
    )

    # set artifact as input artifact
    handle_artifact = run.use_artifact(handle_artifact_id)

    # initialize table path
    # add the option to call table_path =  arguments.get('--dataset')

    # download path to table
    a_path = handle_artifact.download()
    print("The path is",a_path)



   

     # get handle file name
    if handle_file:
        table_path = Path(f"{a_path}/{dataset_file}")
    else:
        table_path = Path(f"{a_path}/handles_chart.table.json")
    
    df_handles = get_dataset(table_path)

    if dataset_path:
        dataset_artifact_id = dataset_path
        
    else:
        dataset_artifact_id = (
            'common-sense-makers/filter_evaluation/prediction_evaluation-20240520143247:v0'
        )
    dataset_artifact = run.use_artifact(dataset_artifact_id)

    a_path = dataset_artifact.download()
   
     # get handle file name
    if dataset_file:
        table_path = Path(f"{a_path}/{dataset_file}")
    else:
        table_path = Path(f"{a_path}/prediction_evaluation.table.json")

    dataset_run = dataset_artifact.logged_by()

    config = dataset_run.config

    config = obj_str_to_dict(config)
    print(config)

    #remember to remove the head TODO
    df = get_dataset(table_path)
    #print(df.columns)
   
    
    
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

    # Load profile list table
    # Load the CSV file
    

    # Evaluation metrics per feed
    try:
        feed_chart = constr_feed_chart(df=df,df_handles=df_handles)
        wandb.log({"Scores per feed": wandb.Table(dataframe=feed_chart)})

    except Exception as e:
        print("An exception was raised building the feed chart: ",e)

    
    # Log cm
    # Generate the confusion matrix
    try:
            try:
                matrix = confusion_matrix(y_true, y_pred)
            except:
                matrix = create_custom_confusion_matrix(y_true=y_true, y_pred=y_pred, labels=labels)

            #log the matrix
            labels_with_info = [f"(True) {label}" for label in labels]
            predicted_labels_with_info = [f"(Pred) {label}" for label in labels]

            wandb.log({
                "confusion_matrix": wandb.plots.HeatMap(
                    matrix_values=matrix, 
                    y_labels=labels_with_info, 
                    x_labels=predicted_labels_with_info, 
                    show_text=True
                )
            })
    except:
        print(" Not enough examples for constructing confusion matrix")

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
    #wandb.log_artifact(artifact, aliases=["latest"])

    wandb.run.finish()