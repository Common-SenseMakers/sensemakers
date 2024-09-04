#!/bin/bash

# imports data into a project from a backup stored in a Cloud Storage bucket

PROJECT_ID=$1
BACKUP=$2
CLOUD_URL=gs://$PROJECT_ID/backups/$BACKUP

firebase firestore:delete --all-collections --project $PROJECT_ID

echo "Importing data from backup $CLOUD_URL"
gcloud firestore import $CLOUD_URL --project=$PROJECT_ID

# Verify import was successful
if [ $? -eq 0 ]; then
    echo "Data restored successfully to Firestore."
else
    echo "Failed to restore data to Firestore."
    exit 1
fi
