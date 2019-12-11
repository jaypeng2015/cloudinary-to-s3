# Cloudinary to S3

Download images from Cloudinary and then upload to an existing AWS S3 bucket.

This service works for both uploaded or fetched image.

Since Cloudinary auto backup does not support fetched images, there are some scenarios where you need this. For example, someone stuffed your Cloudinary storage by fetching images from everywhere because of the lack of security settings and you want to back up the images for legal reasons before deleting them from Cloudinary.

## Quick Start

### Ask for Cloudinary Tech Support

This service uses [Cloudinary admin api](https://cloudinary.com/documentation/admin_api#using_sdks_with_the_admin_api) to get the image list.

The default api rate limit is 5,000 per day, if that is not enough, please ask Cloudinary to bump the limit up to 10,000 per hour.

### Create an S3 bucket in AWS account

Assume you have required knowledge to do this. Keep the bucket private.

### Deploy this service to AWS

Assume you have required knowledge for AWS and serverless framework.

Update the required environment variables and then run `npx sls deploy`.

### Start the process

Go to AWS console, choose `Step Functions` to find the state machine and simply start an execution.

Watch the state machine running or AFK until the job is done.
