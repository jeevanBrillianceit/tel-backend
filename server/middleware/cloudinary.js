require('dotenv').config();
const cloudinary = require('cloudinary').v2
const sharp = require('sharp')
const fluentffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const jsonResponse = require("../../server/utility/jsonResponse");
const statusCode = require("http-status-codes");

cloudinary.config({ 
  cloud_name: 'dofklw6ib', 
  api_key: '132368475822983', 
  api_secret: 'jBDquF1Bx1ZZ_bjia3Dd3vu8U_4' 
});


const uploadToCloudinary = async (req,res,next) =>{
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
  
        for (const file of req.files) {
          if (file.mimetype.startsWith('image')) {
            const [thumbnail, compressedImage] = await processImage(file.buffer)
             // Upload thumbnail to AWS S3
             const thumbnailKey = `images/thumbnails/${file.originalname}`;
            const thumbnailImage =  await uploadToCloud(thumbnail);
            //  processedFiles.push({ thumbnailKey });
       
             // Upload compressed image to AWS S3
             const compressedImageKey = `images/compressed/${file.originalname}`;
             const compressedImageFile = await uploadToCloud(compressedImage);
             
           
             const obj = {
              thumbnailurl : thumbnailImage.secure_url,
              originalurl : compressedImageFile.secure_url,
              type:file.mimetype
             }
            //   console.log("aaaa", thumbnailImage , compressedImageFile)
              processedFiles.push(obj); 
      
          } else if (file.mimetype.startsWith('video')) {
      
            const thumbnail = await generateVideoThumbnail(file.buffer);
            const compressedVideo = await compressVideo(file.buffer);
             // Upload video thumbnail and compressed video to AWS S3
             const thumbnailKey = `videos/thumbnails/${file.originalname}`;
             const compressedVideoKey = `videos/compressed/${file.originalname}`;
       
             const thumbnailVideo = await uploadToCloud(thumbnail);
            const compressedVideoFile =  await uploadToCloud(compressedVideo);
            
      
            const obj = {
              thumbnailurl : thumbnailVideo.secure_url,
              originalurl : compressedVideoFile.secure_url,
              type:file.mimetype
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

    

}


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
  
  async function compressVideo(videoBuffer) {
    return new Promise((resolve, reject) => {
      const tempFileName = 'temp.mp4';
  
      fs.writeFileSync(tempFileName, videoBuffer);
      fluentffmpeg(tempFileName)
      .videoCodec('libx264')
      .outputOption("-crf 35")
      .outputFormat('mp4')
      .on('end', () => {
        const compressedVideo = fs.readFileSync('output.mp4');
        fs.unlinkSync(tempFileName);
        fs.unlinkSync('output.mp4');
        resolve(compressedVideo);
      })
      .on('error', (err) => reject(err))
      .output('output.mp4')
      .run();
  });
  
  }
  
  async function uploadToCloud(resp) {
    let uploadedData
  
    await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
                    { resource_type: 'auto' },
                    (error, result) => {
                      if (error) {
                    console.log(error)

                        // return res.status(500).json({ error: 'Error uploading to Cloudinary' });
                      }
                
                      // Cloudinary response contains the public URL of the uploaded file
                    //   const imageUrl = result.secure_url;
                
                    //   // You can do further processing or send the URL as a response
                    //   res.json({ imageUrl: imageUrl });
        
                    uploadedData = result
                    resolve(result)
                    }
                  ).end(resp);
        
  
     })
    //  console.log("uploaded data ", uploadedData)
   return uploadedData
  }

module.exports = {
    uploadToCloudinary
};
  