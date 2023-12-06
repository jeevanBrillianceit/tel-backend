const sqlConnect = require('../database/connection');
const genericFunc = require('../utility/genericFunctions');
const jsonResponse = require('../utility/jsonResponse')
const { dataTypeEnum, procedureEnum, errorEnum } = require('../database/databaseEnums');

const signUpDB = () => {
    return {
        signUpDB: async (req, res, next) => {
            const successFn = (result) => {
                jsonResponse.successHandler(res, next, result)
            }
            const errFn = (err) => {
                jsonResponse.errorHandler(res, next, err)
            }

            if (genericFunc.checkEmptyNull('firstName', req.body.firstName, errFn) == true ||
               genericFunc.checkEmptyNull('lastName', req.body.firstName, errFn) == true ||
                genericFunc.checkEmptyNull('emailId', req.body.emailId, errFn) == true ||
                genericFunc.checkEmptyNull('password', req.body.password, errFn) == true ||
                genericFunc.checkEmptyNull('gender', req.body.gender, errFn) == true ||
                genericFunc.checkEmptyNull('contact', req.body.contact, errFn) == true ||
                genericFunc.checkEmptyNull('DOB', req.body.dob, errFn) == true 

                // genericFunc.checkEmptyNull('authProvider', req.body.authProvider, errFn) == true
                ) return


            const inputObject = [
                genericFunc.inputparams('firstName', dataTypeEnum.varChar, req.body.firstName),
                genericFunc.inputparams('lastName', dataTypeEnum.varChar, req.body.lastName),
                genericFunc.inputparams('emailId', dataTypeEnum.varChar, req.body.emailId),
                genericFunc.inputparams('passsword', dataTypeEnum.varChar, genericFunc.encrypt(req.body.password)),
                genericFunc.inputparams('gender', dataTypeEnum.varChar, req.body.gender),
                genericFunc.inputparams('contact', dataTypeEnum.varChar, req.body.contact),
                genericFunc.inputparams('DOB', dataTypeEnum.varChar, req.body.dob),


                // genericFunc.inputparams('authProvider', dataTypeEnum.varChar, req.body.authProvider)
            ]

            sqlConnect.connectDb(req, errFn, procedureEnum.proc_signUp, inputObject, errorEnum.proc_signUp, function (result) {
                let data = result[0][0]
                if (data.message === 'Sign Up Success') {
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
                    errFn(response);
                }
            })
        }
    }
}
module.exports = signUpDB();