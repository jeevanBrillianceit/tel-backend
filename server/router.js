const express = require('express');
const router = express.Router();
const authenticate = require('../server/middleware/authenticate')

const login = require('../server/controllersDB/loginDB')
const signUp = require('../server/controllersDB/signUpDB')
const challange = require('../server/controllersDB/createChallangeDB')
const dashboard = require('../server/controllersDB/getDashboardDataDB')

router.get('/', function (req, res, next) {
    res.send('SERVER STARTED');
});

router.post('/login', login.loginDB)
router.post('/signUp', signUp.signUpDB)
router.post('/createChallange', authenticate, challange.createChallangeDB)
router.post('/getDashboardData', authenticate, dashboard.getDashboardDataDB)

module.exports = router;