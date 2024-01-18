const sqlConnect = require('../database/connection');
const genericFunc = require('../utility/genericFunctions');
const jsonResponse = require('../utility/jsonResponse')
const { dataTypeEnum, procedureEnum, errorEnum } = require('../database/databaseEnums');
const statusCode = require("http-status-codes")

const GoogleSignInDB = () => {
    return {
        GoogleSignInDB: async (req, res, next) => {
            const successFn = (result) => {
                jsonResponse.successHandler(res, next, result)
            }
            const errFn = (err,statusCode) => {
                jsonResponse.errorHandler(res, next, err,statusCode)
            }

            if (
                genericFunc.checkEmptyNull('emailId', req.body.emailId, errFn) == true ||
                genericFunc.checkEmptyNull('authProvider', req.body.authProvider, errFn) == true) return


            const inputObject = [
                genericFunc.inputparams('firstName', dataTypeEnum.varChar, req.body.firstName),
                genericFunc.inputparams('emailId', dataTypeEnum.varChar, req.body.emailId),
                genericFunc.inputparams('authProvider', dataTypeEnum.varChar, req.body.authProvider)
            ]

            sqlConnect.connectDb(req, errFn, procedureEnum.proc_signIn_with_google, inputObject, errorEnum.proc_signIn_with_google, function (result) {
                if (result.length > 0) {
                    if (result[0][0]) {
                        let data = result[0][0]
                        if (data.message === 'Google SignIn Success') {
                            response = {
                                'message': data.message,
                                'token': genericFunc.generateTokenLink(data),
                                'data': data
                            }
                            successFn(response);
                        } else {
                            response = {
                                'message': data.message
                            }
                            errFn(response,statusCode.StatusCodes.BAD_REQUEST);
                        }
                    }
                }
            })
        }
    }
}
module.exports = GoogleSignInDB();