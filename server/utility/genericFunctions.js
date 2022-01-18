(function () {
    'use strict'
    const jwt = require('jsonwebtoken');
    const crypto = require('crypto');
    const constants = require('./constants');
    const jsonResponse = require('../utility/jsonResponse');

    var generics = () => {

        return {
            errorFunc: function (data) {
                return {
                    "message": data
                };
            },

            checkEmptyNull: function (object, data, errfun) {
                if (data === undefined || data === "") {
                    var message;
                    message = this.errorFunc(object + " is missing");
                    errfun(message);
                    return true
                }
                return false
            },

            generateTokenLink: function (data) {
                var token = jwt.sign({ data }, process.env.ACCESS_TOKEN_SECRET, {
                    expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME
                });
                return token
            },

            inputparams: function (paramName, dataType, value) {
                return {
                    "node": paramName,
                    "dataType": dataType,
                    "value": value
                }
            },

            encrypt: function (pwd) {
                return (crypto.createHash('sha256').update(pwd).digest('base64'));
            },
        }
    };
    module.exports = generics();
})();