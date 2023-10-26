const jsonResponse = require("../../server/utility/jsonResponse");
const statusCode = require("http-status-codes");
const uploadThumbnailToS3 = require("../middleware/video-thumbnail-uploader");
const fs = require("fs");
const path = require("path");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
var ffprobe = require("ffprobe-static");
ffmpeg.setFfprobePath(ffprobe.path);
const constants = require("../utility/constants");
const multerS3 = require("multer-s3");

const aws = require("aws-sdk");
const s3 = new aws.S3();
aws.config.credentials = new aws.SharedIniFileCredentials({
  profile: constants.S3_BUCKET_NAME,
});

aws.config.update({
  correctClockSkew: true,
});

const uploadFile = async (req, res, next) => {
  const dataArray = [];
  const successFn = (result) => {
    jsonResponse.successHandler(res, next, result);
  };
  const errFn = (err, statusCode) => {
    jsonResponse.errorHandler(res, next, err, statusCode);
  };

  try {
    const files = req.files;
    if (!files) {
      console.log("Error during file uploading");
    } else {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        if (file.mimetype === "video/mp4") {
          let outputPath;
          const videoUrl = file.location;
          await new Promise((resolve, reject) => {
            ffmpeg({ source: videoUrl })
              .on("filenames", (filenames) => {
                filenames.map((file) => {
                  outputPath = "thumbnails/" + file;
                });
              })
              .on("end", async () => {
                const thumbnailResult = await uploadThumbnailToS3(outputPath);

                const videoObj = { 
                  type : file.mimetype,
                  thumbnailurl:thumbnailResult.Location, 
                  originalurl : file.location
                } 
                dataArray.push(videoObj);
                resolve(videoObj)
              })
              .on("error", (err) =>{
                console.error("Error creating thumbnail:", err)
                response = {
                  message: "Error creating thumbnail:" + err,
                }
                errFn(response, statusCode.StatusCodes.INTERNAL_SERVER_ERROR)
               })
              .thumbnail(
                { filename: `${file.originalname}`, count: 1 },
                "thumbnails/"
              );
          });
        } else {
          const obj = {};
          file.transforms.map((file) => {
            obj.type = file.contentType
            if (file.id === "thumbnail") {
              obj.thumbnailurl = file.location
            } else {
              obj.originalurl = file.location
            }
          });
          dataArray.push(obj)
        }
      }
      response = {
        message: "Media Uploaded!",
        urls: dataArray,
      };
      successFn(response)
    }
  } catch (error) {
    response = {
      message: error,
    };
    errFn(response, statusCode.StatusCodes.UNSUPPORTED_MEDIA_TYPE);
  }
};

module.exports = {
  uploadFile,
};
