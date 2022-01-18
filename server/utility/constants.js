const dotenv = require('dotenv').config();

module.exports = Object.freeze({
    appName: process.env.APP_NAME,
    JWTokenKey: process.env.ACCESS_TOKEN_SECRET,
    inValidToken: 'Your session has expired. Please login again to continue.',

    //S3 AWS Bucket Credentials
    S3_BUCKET_NAME: 'dutchuppblob',
    S3_IAM_USER_KEY: 'AKIAQ2PNGS2LKUYWBCFK',
    S3_IAM_USER_SECRET: '90LHkofajJXjG8LVXYmDQj6QFrBZ/8XkRs9KGHdn',

    awsBucketLocationProfile: 'https://dutchuppblob.s3.amazonaws.com/',
    blobRouter: '/router/blob/uploadfile',
});