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

router.get('/', function (req, res, next) {
    res.send('SERVER STARTED');
});

router.post('/login', login.loginDB)
router.post('/signUp', signUp.signUpDB)
router.post('/createChallange', authenticate,challange.createChallangeDB)
router.post('/getDashboardData', authenticate, dashboard.getDashboardDataDB)
router.post('/upload' ,authenticate, upload.array('files',7) , checkFileSizeBasedOnType, uploadFile.uploadFile)
router.delete('/delete/:id',authenticate, deleteFile.deleteFileDB)


module.exports = router;
