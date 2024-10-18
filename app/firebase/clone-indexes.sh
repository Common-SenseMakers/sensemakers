#!/bin/bash

# clones the indexes configuration of a project to the indexes.json file

# Check if the project ID was provided as an input
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <project-id>"
  exit 1
fi

# Assign the project ID to a variable
PROJECT_ID=$1

# Set the project for the gcloud commands
firebase use $PROJECT_ID
firebase firestore:indexes > firestore.indexes.json