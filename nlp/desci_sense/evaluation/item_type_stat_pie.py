from datetime import datetime
import wandb
from pathlib import Path
import pandas as pd
import numpy as np
import sys

sys.path.append(str(Path(__file__).parents[2]))

from desci_sense.evaluation.Evaluation_benchmark import TwitterEval
from desci_sense.evaluation.utils import obj_str_to_dict, get_dataset

if __name__ == "__main__":
    
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

    dataset_run = dataset_artifact.logged_by()

    config = dataset_run.config

    Eval = TwitterEval(config=config)


    
    fig1, fig2 = Eval.build_item_type_pie(df=df)

    wandb.log({"item_type_distribution": wandb.Image(fig1)})

    wandb.log({"allowlist_item_type_distribution": wandb.Image(fig2)})

    true_df = df[df["True Label"] == 'research']

    fig1 , fig2 = Eval.build_item_type_pie(true_df)
    wandb.log({"research_type_distribution": wandb.Image(fig1)})
    config = obj_str_to_dict(config)

    run.config.update(config)

    wandb.run.finish()