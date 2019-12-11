# Cloudinary to S3

Download images from Cloudinary and then upload to an existing AWS S3 bucket.

This service works for both uploaded or fetched image.

Since Cloudinary auto backup does not support fetched images, there are some scenarios where you need this. For example, someone stuffed your Cloudinary storage by fetching images from everywhere because of the lack of security settings and you want to back up the images for legal reasons before deleting them from Cloudinary.
