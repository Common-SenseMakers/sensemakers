#!/bin/bash

# Makes a backup of the Firestore data in the specified project, stores
# it in a Cloud Storage bucket, and then downloads it to a local folder.

# Check if the project ID was provided as an input
if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <project-id>"
  exit 1
fi

# Assign the project ID to a variable
PROJECT_ID=$1

# Generate the current date in the specified format
DATE=$(date "+%Y-%m-%d-%H-%M-%S")

# Set the project for the gcloud commands
firebase use $PROJECT_ID
gcloud config set project $PROJECT_ID

# Define the bucket name (adjust this as necessary)
BUCKET_NAME="${PROJECT_ID}"
CLOUD_URL=gs://$BUCKET_NAME/backups/$DATE

# Create the bucket if it doesn't exist (optional step, uncomment if needed)
# gsutil mb -p $PROJECT_ID gs://$BUCKET_NAME/

# Export Firestore data to the bucket with the date as a folder
gcloud firestore export $CLOUD_URL

# Check the status of the export
if [ $? -eq 0 ]; then
  echo "Firestore export successful."
else
  echo "Error in exporting Firestore data."
fi

# import backup to local folder
OUTDIR=./migrations/backups/$PROJECT_ID

mkdir ${OUTDIR}
gsutil -m cp -r $CLOUD_URL $OUTDIR
