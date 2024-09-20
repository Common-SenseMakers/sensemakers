force show askOrcid modal## Install and login to Google Cloud

- Install gsutil cli

Login to Google Cloud with

```
gcloud auth login
```

## Make a backup

To make a backup of the current DB of a given project use

```
yarn make-backup {projectId}
```

This will store the backup on the cloud storage, and also on the local /migrations/backupts/{projectId} folder

## Run emulator with the backup data

To run the Firebase functions emulators use with the data in the DB equal to one backup, use

```
yarn emuluate-prod ./migrations/backups/{projectId}/{Backup folder}
```

The frontend needs to be run with

```
yarn start-clone
```

## Upload backup to a given deployment

If you want to delete all the data on a given deployment and replace it with a backup, you can 

- make the backup.
- make sure the target project has access to the source project
- run the data upload script


1) make the backup and confirm that the backup data is stored on Google Cloud Storage

https://console.cloud.google.com/storage/browser/{projectId}?hl=en&project={projectId}

Find the folder name inside of the {projectId}/backups subfolder.

2) The target project service account

```
service-${projectNumber}@gcp-sa-firestore.iam.gserviceaccount.com
```

Should have `Storage Admin` role on the source project. 

For example if you want to copy a `sensenets-prod` backup into `sensenets-staging`:

- Go to https://console.cloud.google.com/iam-admin/iam?project=sensenets-prod
- Enable  the checkbox [ ]Include Google-provided role grant
- See if you can find `service-999821808505@gcp-sa-firestore.iam.gserviceaccount.com` and if it has `Storage Admin` role
- If not, grant that role.

Then you can run

```
yarn upload-backup {fromProjectId} {folderName} {toProjectId}

```

Or in this example

```
yarn upload-backup sensenets-prod 2024-09-20-15-52-39 sensenets-staging
```