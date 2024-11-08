# Cheatsheet

If you are running 02-upload-backup.sh and the target project does not has access to the source project you must

Go to the IAM panel of the source project
https://console.cloud.google.com/iam-admin/iam?authuser=0&project=sensenets-dataset

Create a new access to the account
service-PROJECT_NUMBER@gcp-sa-firestore.iam.gserviceaccount.com

Where the project number can be found on the firebase console project settings

Then grant the three roles
- Owner (maybe not needed)
- Datastore Owner 
- Datastore Import Export Admin