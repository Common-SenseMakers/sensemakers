import json
import inspect
import ast
import re
import pandas as pd
import numpy as np
from collections import Counter
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


# Convert iteratable objects into json, used for config files so we can easily use the metadata
def obj_to_dict(obj):
    if isinstance(obj, dict):
        return {k: obj_to_dict(v) for k, v in obj.items()}
    elif hasattr(obj, "__dict__"):
        return {k: obj_to_dict(v) for k, v in obj.__dict__.items() if not k.startswith('_')}
    elif isinstance(obj, list):
        return [obj_to_dict(i) for i in obj]
    elif isinstance(obj, tuple):
        return tuple(obj_to_dict(i) for i in obj)
    elif isinstance(obj, set):
        return {obj_to_dict(i) for i in obj}
    else:
        return obj

def parse_string_to_dict(s):
    """Parses a string representation of a dictionary or object."""
    try:
        return ast.literal_eval(s)
    except Exception:
        pass
    
    # Custom parsing logic for object-like strings
    result = {}
    # Split by spaces, but keep quoted strings together
    parts = re.findall(r'(\w+)=\'(.*?)\'|(\w+)=([^\s]+)', s)
    
    for part in parts:
        if part[0]:
            key, value = part[0], part[1]
        else:
            key, value = part[2], part[3]
        
        # Attempt to parse the value further
        try:
            value = ast.literal_eval(value)
        except Exception:
            if isinstance(value, str) and '=' in value:
                value = parse_string_to_dict(value)
        
        result[key] = value
    
    return result if result else s
def list_to_dict(lst):
    """Converts a list into a dictionary using indices as keys."""
    return {str(i): obj_str_to_dict(item) for i, item in enumerate(lst)}

def obj_str_to_dict(obj):
    if isinstance(obj, dict):
        return {k: obj_str_to_dict(v) for k, v in obj.items()}
    elif hasattr(obj, "__dict__"):
        return {k: obj_str_to_dict(v) for k, v in obj.__dict__.items() if not k.startswith('_')}
    elif isinstance(obj, list):
        return list_to_dict(obj)
    elif isinstance(obj, tuple):
        return tuple(obj_str_to_dict(i) for i in obj)
    elif isinstance(obj, set):
        return {obj_str_to_dict(i) for i in obj}
    elif isinstance(obj, str):
        return parse_string_to_dict(obj)
    else:
        return obj


def obj_to_json(obj):
    return json.dumps(obj_to_dict(obj), indent=4)
 
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



def autopct_format(pct, total_counts):
    total = sum(total_counts)
    count = int(round(pct * total / 100.0))
    return f'{pct:.1f}% ({count})'

def projection_to_list(list2):
    def project_to_list(list1):
        #return list(set(list1) & set(list2))
        return [item for item in list1 if item in list2]
    return project_to_list

def flatten_list(lis:list):
    return [item for sublist in lis for item in sublist]

