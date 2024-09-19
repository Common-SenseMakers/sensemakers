## Install and login to Google Cloud

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