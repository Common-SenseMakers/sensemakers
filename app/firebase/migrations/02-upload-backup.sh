#!/bin/bash

# imports data into a project from a backup stored in a Cloud Storage bucket
# yarn upload-backup <from-project-id> <backup folder name> <to-project-id>

FROM_PROJECT_ID=$1
BACKUP=$2
TO_PROJECT_ID=$3

FROM_CLOUD_URL=gs://$FROM_PROJECT_ID/backups/$BACKUP

firebase use $TO_PROJECT_ID
firebase firestore:delete --all-collections --project $TO_PROJECT_ID

echo "Importing data from backup $FROM_CLOUD_URL into $TO_PROJECT_ID"
gcloud firestore import $FROM_CLOUD_URL --project=$TO_PROJECT_ID

# Verify import was successful
if [ $? -eq 0 ]; then
    echo "Data restored successfully to Firestore."
else
    echo "Failed to restore data to Firestore."
    exit 1
fi
