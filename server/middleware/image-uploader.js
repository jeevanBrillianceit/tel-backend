const aws = require("aws-sdk");
const multer = require("multer");
// const multerS3 = require("multer-s3");
const constants = require("../utility/constants");
const multerS3 = require("multer-s3-transform");
const sharp = require("sharp");

const ffmpegStatic = require('ffmpeg-static');

const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegStatic);


// aws.config.update({
//   secretAccessKey: constants.S3_IAM_USER_SECRET,
//   accessKeyId: constants.S3_IAM_USER_KEY,
//   correctClockSkew: true,
// });

// const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" || 
    file.mimetype === "video/mp4"
  ) {
    cb(null, true);
  } else {
    cb(
      {
        message:
          "Invalid file type, supported file types are jpg, png, jpeg, mp4",
        code: 201,
      },
      false
    );
  }
};

const storage = multer.memoryStorage();
const upload = multer({ fileFilter : fileFilter,storage: storage });

// const upload = multer({
//   fileFilter: fileFilter,
//   storage: multerS3({
//     s3: s3,
//     bucket: constants.S3_BUCKET_NAME,
//     acl: "public-read",
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//       metadata: function (req, file, cb) {
//         cb(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, cb) {
//         cb(null, `originals/${file.originalname}`); //use Date.now() for unique file keys
//     },

//     shouldTransform: function (req, file, cb) {
//       if(/^image/i.test(file.mimetype)){
//         cb(null, /^image/i.test(file.mimetype))
//       }
//       else{
//         cb(null,false)
//       }
//     },
//     transforms: [{
//       id: 'original',
//       key: function (req, file, cb) {
//         cb(null, `originals/${Date.now()}/${file.originalname}`)
//       },
//       transform: function (req, file, cb) {
//         if(/^image/i.test(file.mimetype)){
//         cb(null, sharp().jpeg())
//         }
//       }
//     }, {
//       id: 'thumbnail',
//       key: function (req, file, cb) {
//         cb(null, `thumbnails/${Date.now()}/${file.originalname}`)
//       },
//       transform: function (req, file, cb) {
//         cb(null, sharp().resize(100, 100).jpeg())
//       }
//     }]
//   })
// })

  
// const deleteFile = (req, res,next) => {
//   s3.deleteObject({ Bucket: 'bucket-name', Key: 'image.jpg' }, (err, data) => {
//   console.error(err);
//   console.log(data);
// });
// }

module.exports = upload;

