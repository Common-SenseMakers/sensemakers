# DeSci Sensemaking Networks

This is the development environment for the semantic parsers used by Sensemaker.
Code inside the `desci_sense/shared` folder will be the one used by the `/app` to parse and annotate the social media posts.

## Installation

Code is being developed on Ubuntu 22.04 with Python 3.11

- Create a new environment (here we’re using Anaconda as package manager):
  ```
  conda create -n ENV_NAME python=3.11
  ```
- Activate the environment
- From repo root, install requirements:
  ```
  pip install -r requirements.txt
  ```
- Copy the .env.sample file as .env and fill in the required values

## Generating the ontology

Generate the ontology using the `load_ontology` script. From `nlp` folder run: 

```
python scripts/load_ontology.py --config=path/to/config
```

## Streamlit Demo

### Local Usage

- From repo root, run:
  ```
  streamlit run desci_sense/demos/st_demo.py
  ```
