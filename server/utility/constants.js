const dotenv = require('dotenv').config();

module.exports = Object.freeze({
    appName: process.env.APP_NAME,
    JWTokenKey: process.env.ACCESS_TOKEN_SECRET,
    inValidToken: 'Your session has expired. Please login again to continue.',
    authenticationFailed:'Authentication Failed',

   // S3 AWS Bucket Credentials
    S3_BUCKET_NAME:'dutchuppblob',
    S3_IAM_USER_KEY:'AKIAQ2PNGS2LK5VNOOGC',
    S3_IAM_USER_SECRET:'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',

    // S3_BUCKET_NAME:'bit-aws-s3',
    // S3_IAM_USER_KEY:'AKIAU63JYZTQGARRM2MV',
    // S3_IAM_USER_SECRET: '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',
    // REGION:'ap-south-1',
  

    awsBucketLocationProfile: 'https://dutchuppblob.s3.amazonaws.com/',
    blobRouter: '/router/blob/uploadfile',
});