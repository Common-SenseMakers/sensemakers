#!/bin/bash

# Check if the project ID was provided as an input
if [ "$#" -ne 2 ]; then
  echo "Usage: $0 <project-id> Usage: $1 <backup folder name>"
  exit 1
fi

# Assign the project ID to a variable
PROJECT_ID=$1
BACKUP=$2
OUTDIR=./backups/$PROJECT_ID
CLOUD_URL=gs://$PROJECT_ID/backups/$BACKUP

echo ""

mkdir ${OUTDIR}
gsutil -m cp -r $CLOUD_URL $OUTDIR

# Check the status of the export
if [ $? -eq 0 ]; then
  echo "Firestore export successful."
else
  echo "Error in exporting Firestore data."
fi