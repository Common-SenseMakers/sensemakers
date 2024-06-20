#evaluation of the academic filter, it takes as a input a dataset and a handle table.
# the handle table holds information about the accounts that published the dataset posts

"""Script to run evaluation of label prediction models.

Usage:
  filter_evaluation.py [--config=<config>] [--dataset=<dataset>] [--dataset_file=<file>] [--handle_file=<file>]


Options:
--config=<config>  Optional path to configuration file.
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
import re
from collections import Counter
import concurrent.futures
from tqdm import tqdm
from sklearn.preprocessing import LabelBinarizer
from sklearn.metrics import (
    precision_recall_fscore_support,
    accuracy_score,
    confusion_matrix
)
import matplotlib.pyplot as plt



sys.path.append(str(Path(__file__).parents[2]))

from desci_sense.evaluation.utils import (
    get_dataset, create_custom_confusion_matrix, posts_to_refPosts, obj_str_to_dict, autopct_format,
    projection_to_list, flatten_list
)
from desci_sense.shared_functions.parsers.multi_chain_parser import MultiChainParser
from desci_sense.shared_functions.init import init_multi_chain_parser_config
from desci_sense.shared_functions.schema.post import RefPost
from desci_sense.shared_functions.dataloaders import (
    scrape_post,
    convert_text_to_ref_post,
)

class Evaluation:
    def __init__(self, config):
        self.config = config

    class CustomLabelBinarizer(LabelBinarizer):
        def fit(self, y, order=None):
            if order is not None:
                self.classes_ = np.array(order)
            else:
                super().fit(y)
            return self

    def check_topic(self, topics):
        item_types_allowlist = [
            "bookSection", "journalArticle", "preprint", "book", "manuscript",
            "thesis", "presentation", "conferencePaper", "report"
        ]
        return int(bool(set(topics).intersection(set(item_types_allowlist))))

    def topic_eval(self, df, tp):
        bool_topics = list(df.apply(lambda row: self.check_topic(row['Ref item types']), axis=1))
        try:
            ratio = sum(bool_topics) / tp
        except Exception as e:
            ratio = 0
            print("Ratio exception:", e)
        return ratio

    def prepare_parser_input(self, df):
        return posts_to_refPosts(df['Text'])

    def pred_labels(self, df,active_list = ["hashtags"] , batch_size=10):
        model = MultiChainParser(self.config)
        inputs = self.prepare_parser_input(df)
        results = model.batch_process_ref_posts(inputs=inputs, active_list=active_list,batch_size=batch_size)
        try:
            df['Predicted Label'] = [x.filter_classification.value for x in results]
            df['Reasoning Steps'] = ["Keywords: " + str(x.debug['topics']['reasoning']) + " Topics: " + str(x.debug['keywords']['reasoning']) for x in results]
            df['Keywords'] = [x.keywords for x in results]
            df['Topics'] = [x.topics for x in results]
            df['Ref item types'] = [x.item_types for x in results]
            df['academic_keyword'] = [x.research_keyword for x in results]
        except Exception as e:
            print("Parser error:", e)
        return inputs, results

    def normalize_df(self, df):
        if isinstance(df["True Label"].iloc[0], list):
            df["True Label"] = df["True Label"].apply(lambda x: x[0])

    def binarize(self, y_pred, y_true):
        lb = self.CustomLabelBinarizer()
        lb.fit(['research', 'not_research'], order=['research', 'not_research'])
        y_true = lb.transform(y_true)
        y_pred = lb.transform(y_pred)
        return y_pred, y_true, lb.classes_

    def calculate_scores(self, y_pred, y_true):
        precision, recall, f1_score, support = precision_recall_fscore_support(y_true, y_pred, average=None)
        accuracy = accuracy_score(y_pred=y_pred, y_true=y_true)
        return precision[0], recall[0], f1_score[0], accuracy

    def calculate_feed_score(self, df, name):
        df1 = df[df["username"] == name]
        y_pred = df1["Predicted Label"]
        y_true = df1["True Label"]
        n = len(y_true)
        try:
            y_pred, y_true, labels = self.binarize(y_pred=y_pred, y_true=y_true)
            precision, recall, f1_score, accuracy = self.calculate_scores(y_pred=y_pred, y_true=y_true)
            try:
                cm = confusion_matrix(y_pred=y_pred, y_true=y_true)
            except:
                print('No entries in feed of:', name)
                tp = 0
            try:
                tp = cm[0, 0]
                fn = cm[1, 0]
            except:
                print("no FNs")
                fn = 0
            try:
                r_topics = self.topic_eval(df=df1, tp=tp)
            except:
                print("No citoids detection")
                r_topics = 0
            return pd.Series([precision, recall, f1_score, accuracy, tp, fn, n, r_topics],
                             index=["precision", "recall", "f1_score", "accuracy", "TP", "FN", "posts count", 'citoid positive ratio'])
        except Exception as e:
            print(f"Exception was raised while calculating feed scores: {e}")
            return pd.Series([0, 0, 0, 0, 0, 0, n, 0], index=["precision", "recall", "f1_score", "accuracy", "TP", "FN", "posts count", 'citoid positive ratio'])

    def weighted_average(self, column_name, df):
        return (df[column_name] * df['posts count']).sum() / df['posts count'].sum()

    def constr_feed_chart(self, df, df_handles):
        df_feed_eval = df_handles[["username", "server", "info"]]
        for column in ["precision", "recall", "f1_score", "accuracy", "posts count"]:
            df_feed_eval[column] = 0
        df_feed_eval[["precision", "recall", "f1_score", "accuracy", 'TP', 'FN', "posts count", 'citoid positive ratio']] = df_feed_eval.apply(
            lambda row: self.calculate_feed_score(df=df, name=row["username"]), axis=1)
        average_row = [self.weighted_average(column_name=x, df=df_feed_eval) for x in ["precision", "recall", "f1_score", "accuracy"]]
        tp = df_feed_eval["TP"].sum()
        r_topics = self.topic_eval(df=df, tp=tp)
        average_row.extend([tp, df_feed_eval["FN"].sum(), df_feed_eval["posts count"].sum(), r_topics])
        new_row = ["Average", "", ""] + average_row 
        new_row = pd.DataFrame([new_row], columns=['username', 'server', 'info', 'precision', 'recall', 'f1_score', 'accuracy', 'TP', 'FN', 'posts count', 'citoid positive ratio'])
        return df_feed_eval._append(new_row, ignore_index=True)
    
    # Zotero Item type analysis
    def count_zotero_types(self,df : pd.DataFrame):
        counts_df = df["Ref item types"].apply(flatten_list).apply(Counter).apply(pd.Series).fillna(0).astype(int)
        total_row = counts_df.sum()
        total_row.name = 'Total'

        return total_row
    def count_research_zotero_types(self, df: pd.DataFrame, allow_list=[
            "bookSection", "journalArticle", "preprint", "book", "manuscript",
            "thesis", "presentation", "conferencePaper", "report"
        ]):
        # Apply the check_topic method to each row and create a boolean mask
        #mask = df['Ref item types'].apply(flatten_list).apply(lambda x: self.check_topic([item for item in x]) == 1)

        # Filter the DataFrame using the mask
        #filtered_df = df[mask]

        project_to_allowlist = projection_to_list(allow_list)
        #This is not good yet TODO, it will count each item only once
        #filtered_df['Ref item types'] = [project_to_allowlist(x) for x in filtered_df["Ref item types"]]
        # Count items in the filtered DataFrame
        #counts_df = filtered_df["Ref item types"].apply(flatten_list).apply(project_to_allowlist).apply(Counter).apply(pd.Series).fillna(0).astype(int)
        counts_df = df["Ref item types"].apply(flatten_list).apply(project_to_allowlist).apply(Counter).apply(pd.Series).fillna(0).astype(int)
        total_row = counts_df.sum()
        #total_row.name = 'Total'
        return total_row


    def build_item_type_pie(self,df:pd.DataFrame):
        total_counts = self.count_zotero_types(df=df)
        # Create a pie chart
        fig1, ax = plt.subplots(figsize=(12, 12))
        ax.pie(total_counts, labels=total_counts.index, autopct=lambda pct: autopct_format(pct, total_counts), startangle=140)
        ax.set_title('Distribution of Item Types')

        #plt.show()

        

        total_counts = self.count_research_zotero_types(df=df)
        # Create a pie chart
        fig2, ax = plt.subplots(figsize=(12, 12))
        ax.pie(total_counts, labels=total_counts.index, autopct=lambda pct: autopct_format(pct, total_counts), startangle=140)
        ax.set_title('Distribution of research item types')

        #plt.show()

        return fig1, fig2

class TwitterEval(Evaluation):
    def __init__(self, config):
        super().__init__(config)
        
    @staticmethod
    def check_quotes(urls):
        quotes = []
        pattern = re.compile(r'^https://twitter\.com/.+/[0-9]+$')
        for url in urls:
            if pattern.match(url):
                quotes.append(url)
        return quotes

    def nested_quotes_citoid(self,post:RefPost,steps = 0, ind = 0):
        multi_chain_parser = MultiChainParser(self.config)
        
        result = multi_chain_parser.process_ref_post(post=post,active_list=["hashtags"])
        print("post urls",result.reference_urls)
        print("Item types: ",result.item_types)
        
        item_types = result.item_types 

        if self.check_topic(result.item_types):
            print("Yay, citoid found topic")
            ind = 1
        else:
            quotes = self.check_quotes(result.reference_urls)
            if quotes:
                print("checking quotes")
                for url in quotes:
                    quote = scrape_post(url)
                    ind, steps, t = self.nested_quotes_citoid(post = quote, steps=steps+1, ind = ind)
                    
            else:
                print("done")
        return ind, steps, item_types

    def nested_quotes_citoid_parallel(self, inputs):
        results = []
        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = {executor.submit(self.nested_quotes_citoid, post): post for post in inputs}
            
            for future in tqdm(concurrent.futures.as_completed(futures), total=len(futures)):
                post = futures[future]
                try:
                    result = future.result()
                    results.append(result)
                except Exception as exc:
                    print(f'Post {post} generated an exception: {exc}')
                    # Append a default value to maintain length consistency
                    results.append((0, 0, ['citoid_error']))
                    
        return results

    def feed_tweet_type_statistics(self, df, name,update_df = 1):
        df1 = df[df["username"] == name]
        inputs = self.prepare_parser_input(df1)
        post_count=len(inputs)
        results = self.nested_quotes_citoid_parallel(inputs)
        if update_df:
            # Ensure 'citoid_research' column exists
            if 'citoid_research' not in df.columns:
                df['citoid_research'] = None

            # Extract the first element of each tuple in results and ensure lengths match
            first_elements = [result[0] for result in results[:post_count]]
            
            # Debugging prints
            print(f"Length of df1: {len(df1)}")
            print(f"Length of inputs: {len(inputs)}")
            print(f"Length of results: {len(results)}")
            print(f"Length of first_elements: {len(first_elements)}")
        
            # Assign these elements to the corresponding rows in df1
            df.loc[df["username"] == name, 'citoid_research'] = first_elements

        citoid_count = 0
        quotes_count = 0
        quoted_citoid_count = 0
        item_type_list = []
        for ind, steps, item_type in results:
            citoid_count = citoid_count +ind
            item_type_list.append(item_type)
            if steps:
                quoted_citoid_count = quoted_citoid_count + ind
                quotes_count = quotes_count + 1
        if post_count:
            quotes_ratio = quotes_count/post_count
            citoid_ratio = quoted_citoid_count/post_count
        else:
            quotes_ratio = -1
            citoid_ratio = -1
        
        return citoid_count, quoted_citoid_count, quotes_count, post_count, quotes_ratio, citoid_ratio, item_type_list

    def build_post_type_chart(self,df_handles:pd.DataFrame,df:pd.DataFrame):
        df_feed_eval = df_handles[["username", "server", "info"]].copy()
        for column in ["citoid_count", "quoted_citoid_count", "quotes_count","post_count","quotes_ratio","citoid_ratio"]:
            df_feed_eval[column] = 0
            df_feed_eval[["citoid_count", "quoted_citoid_count", "quotes_count","post_count","quotes_ratio","citoid_ratio","Ref item types"]] = df_feed_eval.apply(
            lambda row: pd.Series(self.feed_tweet_type_statistics(df=df, name=row["username"])), axis=1)
        #"Total" row
        post_count = df_feed_eval["post_count"].sum()
        quotes_count = df_feed_eval["quotes_count"].sum()
        citoid_count = df_feed_eval["citoid_count"].sum()
        if post_count:
            quotes_ratio = quotes_count/post_count
            citoid_ratio = citoid_count/post_count
        else:
            quotes_ratio = -1
            citoid_ratio = -1
        new_row = ["Summery","","",citoid_count,df_feed_eval["quoted_citoid_count"].sum(),quotes_count,post_count,quotes_ratio,citoid_ratio,[]]
        new_row = pd.DataFrame([new_row], columns=['username', 'server', 'info', "citoid_count", "quoted_citoid_count", "quotes_count","post_count","quotes_ratio","citoid_ratio","Ref item types"])
        return df_feed_eval._append(new_row, ignore_index=True)


                    


    



if __name__ == "__main__":
    #post = scrape_post('https://x.com/rtk254/status/1741841607421263966')
    llm_type="mistralai/mistral-7b-"

    config = init_multi_chain_parser_config(
        llm_type=llm_type,
        post_process_type="combined"
    )
    Eval = TwitterEval(config=config)
    #q = Eval.nested_quotes_citoid(post=post)
    #print(q)
    wandb.login()

    api = wandb.Api()

    #TODO move from testing
    run = wandb.init(project="testing", job_type="evaluation")

    # get artifact path

    dataset_artifact_id = (
            'common-sense-makers/filter_evaluation/prediction_evaluation-20240521132713:v0'
        )

    # set artifact as input artifact
    dataset_artifact = run.use_artifact(dataset_artifact_id)

    # initialize table path
    # add the option to call table_path =  arguments.get('--dataset')

    # download path to table
    a_path = dataset_artifact.download()
    print("The path is",a_path)

    # get dataset file name

    table_path = Path(f"{a_path}/prediction_evaluation.table.json")


    # return the pd df from the table
    #remember to remove the head TODO
    df = get_dataset(table_path)

    dataset_artifact_id = (
            'common-sense-makers/filter_evaluation/labeled_tweets_no_threads:v1'
        )
    # set artifact as input artifact
    dataset_artifact = run.use_artifact(dataset_artifact_id)

    # initialize table path
    # add the option to call table_path =  arguments.get('--dataset')

    # download path to table
    a_path = dataset_artifact.download()

    table_path = Path(f"{a_path}/handles_chart.table.json")

    df_handles = get_dataset(table_path)
    df_eval = Eval.build_post_type_chart(df_handles=df_handles,df=df)
    fig1, fig2 = Eval.build_item_type_pie(df=df_eval)
    wandb.log({"dataset": wandb.Table(dataframe=df)})
    wandb.log({"Quote statistics per feed": wandb.Table(dataframe=df_eval)})
   #print(df['Ref item types'])
    #fig1, fig2 = Eval.build_item_type_pie(df=df)

    wandb.log({"item_type_distribution": wandb.Image(fig1)})

    wandb.log({"research_item_type_distribution": wandb.Image(fig2)})

    #true_df = df[df["True Label"] == 'research']

    #fig1 , fig2 = Eval.build_item_type_pie(true_df)
    #wandb.log({"research_type_distribution": wandb.Image(fig)})
    config = obj_str_to_dict(config)

    run.config.update(config)

    wandb.run.finish()

    

    """inputs = Eval.prepare_parser_input(df)

    results = Eval.nested_quotes_citoid_parallel(inputs)"""
    """count = 0 
    errors = []
    for p in inputs:
        try: 
            ind, steps, item_types = Eval.nested_quotes_citoid(post=p)
            count = count + ind
        except Exception as e:
            errors.append(e)
    print("Count: ", count)
    print("Errors count: ",len(errors))
    print("Errors: ",errors)"""


    
    #inputs, results = Eval.pred_labels(df=df)


    """
    arguments = docopt.docopt(__doc__)

    config_path = arguments.get("--config")
    dataset_path = arguments.get("--dataset")
    dataset_file = arguments.get("--dataset_file")
    handle_file = arguments.get("--handle_file")

    current_datetime = datetime.now()
    time = current_datetime.strftime("%Y%m%d%H%M%S")
    llm_type="mistralai/mistral-7b-"

    config = init_multi_chain_parser_config(
        llm_type=llm_type,
        post_process_type="combined"
    )

    wandb.login()

    api = wandb.Api()
    run = wandb.init(project="testing", job_type="evaluation", name= llm_type+ str(time))

    if dataset_path:
        dataset_artifact_id = dataset_path
    else:
        dataset_artifact_id = 'common-sense-makers/filter_evaluation/labeled_tweets_no_threads:v1'

    dataset_artifact = run.use_artifact(dataset_artifact_id)
    a_path = dataset_artifact.download()

    if dataset_file:
        table_path = Path(f"{a_path}/{dataset_file}")
    else:
        table_path = Path(f"{a_path}/labeled_data_table_no_threads.table.json")

    df = get_dataset(table_path).head(10)

    if handle_file:
        table_path = Path(f"{a_path}/{dataset_file}")
    else:
        table_path = Path(f"{a_path}/handles_chart.table.json")

    df_handles = get_dataset(table_path)
    evaluator = Evaluation(config=config)
    evaluator.pred_labels(df=df)
    evaluator.normalize_df(df)
    y_pred, y_true, labels = evaluator.binarize(y_pred=df["Predicted Label"], y_true=df["True Label"])
    precision, recall, f1_score, accuracy = evaluator.calculate_scores(y_pred=y_pred, y_true=y_true)
    artifact = wandb.Artifact("prediction_evaluation-" + str(time), type="evaluation")
    table = wandb.Table(dataframe=df)
    artifact.add(table, "prediction_evaluation")

    try:
        feed_chart = evaluator.constr_feed_chart(df=df, df_handles=df_handles)
        wandb.log({"Scores per feed": wandb.Table(dataframe=feed_chart)})
    except Exception as e:
        print("An exception was raised building the feed chart:", e)

    try:
        matrix = confusion_matrix(y_true, y_pred)
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
        print("Not enough examples for constructing confusion matrix")

    meta_data = {
        "dataset_size": len(df),
        "precision": pd.Series(precision).mean(),
        "recall": pd.Series(recall).mean(),
        "f1_score": pd.Series(f1_score).mean(),
        "accuracy": accuracy,
    }

    artifact.metadata.update(meta_data)
    trans_config = obj_str_to_dict(config)
    run.config.update(trans_config)
    run.summary.update(meta_data)
    wandb.log_artifact(artifact, aliases=["latest"])
    wandb.run.finish()
"""