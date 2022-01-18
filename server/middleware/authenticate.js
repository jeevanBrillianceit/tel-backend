const jwt = require('jsonwebtoken');
const constants = require('../utility/constants')
const jsonResponse = require('../utility/jsonResponse')

const authenticate = (req, res, next) => {
    try {
        // const token = req.headers.authorization.split('')[1]
        const token = req.headers.token
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        req.user = decode.data
        next()
        
    } catch (error) {
        const response = {
            'message': constants.inValidToken 
        }
        jsonResponse.errorHandler(res, next, response)
    }
}

module.exports = authenticate