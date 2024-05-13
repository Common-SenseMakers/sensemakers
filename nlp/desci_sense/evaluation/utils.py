import json
import pandas as pd
import numpy as np
import concurrent.futures
from tqdm import tqdm
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.metrics import (
    precision_recall_fscore_support,
    accuracy_score,
    confusion_matrix
)

from desci_sense.shared_functions.init import init_multi_chain_parser_config
from desci_sense.shared_functions.parsers.multi_chain_parser import MultiChainParser

from desci_sense.shared_functions.dataloaders import (
    scrape_post,
    convert_text_to_ref_post,
)



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

def process_text(text):
    return convert_text_to_ref_post(text)

def posts_to_refPosts(posts:list):
    
    
    with concurrent.futures.ThreadPoolExecutor() as executor:
        refPosts = list(tqdm(executor.map(process_text, posts), total=len(posts)))
    return refPosts

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