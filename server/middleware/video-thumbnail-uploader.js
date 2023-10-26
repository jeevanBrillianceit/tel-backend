const aws = require("aws-sdk");
const constants = require("../utility/constants");
const fs = require("fs");

aws.config.update({
  maxRetries: 3,
  httpOptions: {timeout: 30000, connectTimeout: 5000},
  correctClockSkew: true,
  secretAccessKey: constants.S3_IAM_USER_SECRET,
  accessKeyId: constants.S3_IAM_USER_KEY,
});
const s3 = new aws.S3();


const uploadThumbnailToS3 = async (thumbnailPath) => {
  let uploadedData
  const thumbnailData = fs.createReadStream(thumbnailPath)
  
  const params = {
    Bucket: constants.S3_BUCKET_NAME,
    Key:  `${thumbnailData.path}`,
    Body: thumbnailData,
    ContentType: "mp4",
    ACL: "public-read",
  };
  await new Promise((resolve, reject) => {
 s3.upload(params, (err, data) => {
    if (err) {
      console.error("Error uploading thumbnail to S3:", err);
    } else {
      console.log("Thumbnail uploaded to S3:", data);

      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
      uploadedData = data
       resolve(data);
    }
  });
})
return uploadedData
};

module.exports = uploadThumbnailToS3;
