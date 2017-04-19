Create a project on the Cloud Projects page + Enable billing + Enable the API + Install and initialize the Cloud SDK.

Install Google Cloud Functions
> gcloud components install beta

Clone this repository

Create Cloud Storage Bucket
> gsutil mb -p [PROJECT_ID] gs://[BUCKET_NAME]

Let's say PROJECT_ID=packt-publishing-claimer and BUCKET_NAME=packt-publishing-claimer-storage

Some setup for the proect required, you will probably need to create a bucket named packt-publishing-claimer-storage
> gcloud config set project packt-publishing-claimer

Describe your function
> gcloud beta functions describe claimBook

Read logs from the function
> gcloud beta functions logs read  claimBook

Deploying your function
> gcloud beta functions deploy claimBook --stage-bucket packt-publishing-claimer-storage --trigger-topic claim_book

Triggering your function
> gcloud beta functions call claimBook --data '{"username": "the_username", "password": "the_password"}'

Need to test it, reports logged in with invalid credentials.
