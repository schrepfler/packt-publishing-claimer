Code is based on mtuanp/packtpubbot but aim of this "fork" is mostly that it should run on Google Cloud.

Create a project on the Cloud Projects page + Enable billing + Enable the API + Install and initialize the Cloud SDK.

Install Google Cloud Functions
```sh
gcloud components install beta
```

Clone this repository

Create Cloud Storage Bucket
```sh
gsutil mb -p [PROJECT_ID] gs://[BUCKET_NAME]
```

Let's say PROJECT_ID=packt-publishing-claimer and BUCKET_NAME=packt-publishing-claimer-storage

Some setup for the proect required, you will probably need to create a bucket named packt-publishing-claimer-storage
```sh
> gcloud config set project packt-publishing-claimer
```

Describe your function
```sh
> gcloud beta functions describe claimBook
```

Read logs from the function
```sh
> gcloud beta functions logs read  claimBook
```

Create config.json file based on config.json.example

Deploying your function
```sh
> gcloud beta functions deploy claimBook --stage-bucket packt-publishing-claimer-storage --trigger-topic claim_book
```

Triggering your function
```sh
> gcloud beta functions call claimBook --data '{}'
```
