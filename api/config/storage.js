const {format} = require('util');
const multer = require('multer');
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const upload = multer({
    storage: multer.memoryStorage(),
  });
const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

exports.upload = upload;
exports.bucket = bucket;
exports.format = format;