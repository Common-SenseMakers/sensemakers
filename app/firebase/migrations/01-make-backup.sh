#!/bin/bash

# Makes a backup of the Firestore data in the specified project, stores
# it in a Cloud Storage bucket, and then downloads it to a local folder.
# yarn make-backup <project-id>

# Check if the project ID was provided as an input
if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <project-id>"
  exit 1
fi

# Assign the project ID to a variable
PROJECT_ID=$1
FOLDER_NAME=$2

# Generate the current date in the specified format
DATE=$(date "+%Y-%m-%d-%H-%M-%S")
FOLDER_NAME=${2:-$DATE}

# Set the project for the gcloud commands
firebase use $PROJECT_ID
gcloud config set project $PROJECT_ID

# Define the bucket name (adjust this as necessary)
BUCKET_NAME="${PROJECT_ID}"
CLOUD_URL=gs://$BUCKET_NAME/backups/$FOLDER_NAME

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
