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
const sharp = require('sharp')
const fluentffmpeg = require("fluent-ffmpeg");
const fluentFFmpegFilters = require("fluent-ffmpeg");
const stream = require('stream');
const aws = require("aws-sdk");
const s3 = new aws.S3();
// aws.config.credentials = new aws.SharedIniFileCredentials({
//   profile: 'bit-aws-s3',
// });

aws.config.update({
   secretAccessKey: constants.S3_IAM_USER_SECRET,
   accessKeyId: constants.S3_IAM_USER_KEY,
  correctClockSkew: true,
  region:constants.REGION
});

const uploadFile = async (req, res, next) => {
  const dataArray = [];
  const  processedFiles = []
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
      // for (let index = 0; index < files.length; index++) {
      //   const file = files[index];
      //   if (file.mimetype === "video/mp4") {
      //     let outputPath;
      //     const videoUrl = file.location;
      //     await new Promise((resolve, reject) => {
      //       ffmpeg({ source: videoUrl })
      //         .on("filenames", (filenames) => {
      //           filenames.map((file) => {
      //             outputPath = "thumbnails/" + file;
      //           });
      //         })
      //         .on("end", async () => {
      //           const thumbnailResult = await uploadThumbnailToS3(outputPath);

      //           const videoObj = { 
      //             type : file.mimetype,
      //             thumbnailurl:thumbnailResult.Location, 
      //             originalurl : file.location
      //           } 
      //           dataArray.push(videoObj);
      //           resolve(videoObj)
      //         })
      //         .on("error", (err) =>{
      //           console.error("Error creating thumbnail:", err)
      //           response = {
      //             message: "Error creating thumbnail:" + err,
      //           }
      //           errFn(response, statusCode.StatusCodes.INTERNAL_SERVER_ERROR)
      //          })
      //         .thumbnail(
      //           { filename: `${file.originalname}`, count: 1 },
      //           "thumbnails/"
      //         );
      //     });
      //   } else {
      //     const obj = {};
      //     file.transforms.map((file) => {
      //       obj.type = file.contentType
      //       if (file.id === "thumbnail") {
      //         obj.thumbnailurl = file.location
      //       } else {
      //         obj.originalurl = file.location
      //       }
      //     });
      //     dataArray.push(obj)
      //   }
      // }
      // response = {
      //   message: "Media Uploaded!",
      //   urls: dataArray,
      // };
      // successFn(response)
       console.log(req.files)

      for (const file of req.files) {
        if (file.mimetype.startsWith('image')) {
          const [thumbnail, compressedImage] = await processImage(file.buffer)
           // Upload thumbnail to AWS S3
           const thumbnailKey = `images/thumbnails/${file.originalname}`;
          const thumbnailImage =  await uploadToS3(thumbnailKey, thumbnail, file.mimetype);
          //  processedFiles.push({ thumbnailKey });
     
           // Upload compressed image to AWS S3
           const compressedImageKey = `images/compressed/${file.originalname}`;
           const compressedImageFile = await uploadToS3(compressedImageKey, compressedImage, file.mimetype);
           
         
           const obj = {
            thumbnailurl : thumbnailImage.Location,
            originalurl : compressedImageFile.Location,
            type:file.mimetype,
           }
           
            processedFiles.push(obj); 
    
        } else if (file.mimetype.startsWith('video')) {
    
          const thumbnail = await generateVideoThumbnail(file.buffer);
          const compressedVideo = await compressVideo(file.buffer, file.originalname);
          // Upload video thumbnail and compressed video to AWS S3
          const thumbnailKey = `videos/thumbnails/${file.originalname}`;
          var lastIndex = file.originalname.lastIndexOf(".");
          var newFilename = file.originalname.substring(0, lastIndex);
          //  var originalFilename = `${file.originalname}`;
          //  var newFilename = originalFilename.replace(/\.mp4$/, ".m3u8");
           const compressedVideoKey = `videos/compressed/${newFilename}.m3u8`;

           console.log("fddfdfv",compressedVideo)
     
           const thumbnailVideo = await uploadToS3(thumbnailKey, thumbnail, 'image/png');
          const compressedVideoFile =  await uploadToS3(compressedVideoKey, compressedVideo.m3u8Buffer, 'video/m3u8');
          const compressedVideoFile1 = await Promise.all(compressedVideo.tsBuffers.map(async (file, index) => {
            return uploadToS3(`videos/compressed/${newFilename}${index}.ts`, file, 'ts');
        }));    
          const obj = {
            thumbnailurl : thumbnailVideo.Location,
            originalurl : compressedVideoFile.Location,
            type:file.mimetype,
           }
         
            processedFiles.push(obj); 
        }
      }
       response = {
        message: "Media Uploaded!",
        urls: processedFiles,
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

async function processImage(imageBuffer) {
  const thumbnail = await sharp(imageBuffer)
    .resize(100, 100)
    .toBuffer();

  const compressedImage = await sharp(imageBuffer)
    .jpeg({ progressive: true, force: false,quality: 80 })
    .png({ progressive: true, force: false,quality: 80  })
    .toBuffer();

  return [thumbnail, compressedImage];
}

async function generateVideoThumbnail(videoBuffer) {
  return new Promise((resolve, reject) => {
    const tempFileName = 'temp.mp4';

    fs.writeFileSync(tempFileName, videoBuffer);

    fluentffmpeg(tempFileName)
      .inputOption('-ss 00:00:02')
      .frames(1)
      .toFormat('image2')
      .on('end', () => {
        const thumbnail = fs.readFileSync('output.png');
        fs.unlinkSync(tempFileName);
        fs.unlinkSync('output.png');
        resolve(thumbnail);
      })
      .on('error', (err) => reject(err))
      .output('output.png')
      .run();
  });
}

// async function compressVideo(videoBuffer) {
//   return new Promise((resolve, reject) => {
//     const tempFileName = 'temp.mp4';

//     fs.writeFileSync(tempFileName, videoBuffer);
//     fluentffmpeg(tempFileName)
//     .videoCodec('libx264')
//     .outputOption("-crf 35")
//     .outputFormat('mp4')
//     .on('end', () => {
//       const compressedVideo = fs.readFileSync('output.mp4');
//       fs.unlinkSync(tempFileName);
//       fs.unlinkSync('output.mp4');
//       resolve(compressedVideo);
//     })
//     .on('error', (err) => reject(err))
//     .output('output.mp4')
//     .run();
// });

// }

async function compressVideo(videoBuffer,originalfilename) {
  return new Promise((resolve, reject) => {
    const tempFileName = 'temp.mp4';
      var lastIndex = originalfilename.lastIndexOf(".");
      var filename = originalfilename.substring(0, lastIndex);
    const outputFilePath = `uploads/${filename}.m3u8`;
    const outputOptions = {
      hls_time: 10,
      hls_list_size: 0,
      outputOptions: [
        '-c:v', 'libx264',
        '-crf', '35', // Adjust the CRF value as needed
      ],
    };
    fs.writeFileSync(tempFileName, videoBuffer);
    fluentffmpeg(tempFileName)
    .output(outputFilePath)
    .outputFormat('hls')
    .outputOptions(outputOptions.outputOptions)
    .on('end', () => {
      console.log('FFmpeg conversion finished');

      console.log('FFmpeg conversion finished');
        const m3u8Buffer = fs.readFileSync(outputFilePath);

            // Read all .ts files in the output folder
            const tsBuffers = fs.readdirSync('uploads')
            .filter(file => file.endsWith('.ts'))
            .map(file => {
              const tsFilePath = `uploads/${file}`;
              console.log(`Reading file: ${tsFilePath}`);
              return fs.readFileSync(tsFilePath);
            });

           // Unlink temporary files
           fs.unlinkSync(tempFileName);
           fs.unlinkSync(outputFilePath);
           tsBuffers.forEach((_, index) => fs.unlinkSync(`uploads/${filename}${index}.ts`));
   

        resolve({ m3u8Buffer, tsBuffers });
    })
    .on('error', (err) => {
      console.log("err")
      // Handle errors and unlink the temporary file
      fs.unlinkSync(tempFileName);
      reject(err);
    })
    .run();
});

}

async function uploadToS3(key, file, mimetype) {
  let uploadedData
  const params = {
    Bucket: constants.S3_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: mimetype,
  };

  await new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
       if (err) {
         console.error("Error uploading thumbnail to S3:", err);
       } else {
         console.log("Thumbnail uploaded to S3:", data);
         uploadedData = data
         resolve(data)
       }
     });

   })
  //  console.log("uploaded data ", uploadedData)
 return uploadedData
}



// function calculateTargetBitrate(originalSizeBytes, reductionPercentage, videoBuffer) {
//   return new Promise((resolve, reject) => {
//     const readableStream = new stream.PassThrough();
//     readableStream.end(videoBuffer);

//     fluentffmpeg()
//       .input(readableStream)
//       .ffprobe(0, (err, metadata) => {
//         if (err) {
//           reject(err);
//           return;
//         }

//         const videoDurationSeconds = metadata.format.duration;
//         const originalSizeBits = originalSizeBytes * 8;
//         const targetSizeBits = originalSizeBits * (reductionPercentage / 100);
//         const targetBitrate = targetSizeBits / videoDurationSeconds;

//         resolve(Math.floor(targetBitrate)); // Round to the nearest integer
//       });
//   });
// }

module.exports = {
  uploadFile,
};
