const express = require('express');
const router = express.Router();
const authenticate = require('../server/middleware/authenticate')
const validation = require('../server/middleware/validation')
const schemas = require('../server/schemas/createChallengeSchema')

const login = require('../server/controllersDB/loginDB')
const signUp = require('../server/controllersDB/signUpDB')
const uploadFile = require('../server/controllersDB/uploadFile')
const upload = require("../server/middleware/image-uploader")
const deleteFile = require('../server/controllersDB/deleteFileDB')
const challange = require('../server/controllersDB/createChallangeDB')
const dashboard = require('../server/controllersDB/getDashboardDataDB')
const checkFileSizeBasedOnType = require("../server/middleware/filesize")
const UploadFile= require('../server/middleware/cloudinary');
const privacyDB = require("../server/controllersDB/createPrivacyDB")
const getPrivacyDB = require("../server/controllersDB/getPrivacyDB");
const uploadVideo = require("../server/controllersDB/apiVideo")

router.get('/', function (req, res, next) {
    res.send('SERVER STARTED');
});

router.post('/login', login.loginDB)
router.post('/signUp', signUp.signUpDB)
router.post('/createChallange', authenticate,challange.createChallangeDB)
router.post('/getDashboardData', authenticate, dashboard.getDashboardDataDB)
// router.post('/upload' , upload.array('files',7) , checkFileSizeBasedOnType, uploadFile.uploadFile)
// router.post('/uploads' , upload.array('files',7) , checkFileSizeBasedOnType ,UploadFile.uploadToCloudinary)
router.post('/privacy',authenticate , privacyDB.privacyDB)
router.get('/privacy',authenticate, getPrivacyDB.getPrivacyDB)
router.delete('/delete/:id',authenticate, deleteFile.deleteFileDB)
router.post('/upload' , upload.array('files',7) , checkFileSizeBasedOnType, uploadVideo.uploadVideo)



module.exports = router;
