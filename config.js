const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT || 3000;
const app = express();
const router = require('./server/router')
const dotenv = require('dotenv')
const constants = require('./server/utility/constants')
dotenv.config()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

const whitelist = [
    // 'http://localhost:4200',
    // 'http://localhost:8000'
];

const corsOptions = {
    origin: function (origin, callback) {
        const originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
    },
    credentials: true
};
app.use(cors(corsOptions));
app.use('/router', router);
app.use(express.json());

app.set('port', process.env.PORT || 3000);
app.listen(port, () => console.log(`Express server listening on port ${port}`));


// --------------------UPLOAD FILE----------------------
const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const uploadFile = require('./server/controllersDB/uploadFileDB')
const path = require('path')

var s3 = new aws.S3({
    accessKeyId: constants.S3_IAM_USER_KEY,
    secretAccessKey: constants.S3_IAM_USER_SECRET,
    Bucket: constants.S3_BUCKET_NAME
});

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: constants.S3_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            let extension = path.extname(file.originalname).toLowerCase();
            cb(null, file.fieldname + '-' + Date.now() + extension)
        }
    })
})

app.post(constants.blobRouter, upload.single('myFile'), (req, res, next) => {
    const file = req.file
    if (!file) {
        console.log("Error during file uploading")
    } else {
        uploadFile.uploadFileDB(req, res, next)
    }
})
// ----------------------------------------------------------

module.exports = app