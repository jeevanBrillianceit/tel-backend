const sqlConnect = require('../database/connection');
const genericFunc = require('../utility/genericFunctions');
const jsonResponse = require('../utility/jsonResponse')
const { dataTypeEnum, procedureEnum, errorEnum } = require('../database/databaseEnums');

const createChallangeDB = () => {
    return {
        createChallangeDB: async (req, res, next) => {
            const successFn = (result) => {
                jsonResponse.successHandler(res, next, result)
            }
            const errFn = (err) => {
                jsonResponse.errorHandler(res, next, err)
            }

            if (genericFunc.checkEmptyNull('userId', req.user.id, errFn) == true ||
                genericFunc.checkEmptyNull('title', req.body.title, errFn) == true ||
                genericFunc.checkEmptyNull('description', req.body.description, errFn) == true ||
                genericFunc.checkEmptyNull('url', req.body.url, errFn) == true ||
                genericFunc.checkEmptyNull('latitude', req.body.latitude, errFn) == true ||
                genericFunc.checkEmptyNull('longitude', req.body.latitude, errFn) == true) return


            const inputObject = [
                genericFunc.inputparams('userId', dataTypeEnum.varChar, req.user.id),
                genericFunc.inputparams('title', dataTypeEnum.varChar, req.body.title),
                genericFunc.inputparams('description', dataTypeEnum.varChar, req.body.description),
                genericFunc.inputparams('url', dataTypeEnum.varChar, req.body.url),
                genericFunc.inputparams('latitude', dataTypeEnum.varChar, req.body.latitude),
                genericFunc.inputparams('longitude', dataTypeEnum.varChar, req.body.longitude)
            ]

            sqlConnect.connectDb(req, errFn, procedureEnum.proc_create_challange, inputObject, errorEnum.proc_create_challange, function (result) {
                if (result.length > 0) {
                    if (result[0]) {
                        let data = result[0]
                        if (data[0].message === 'Challange Created') {
                            response = {
                                'message': data.message,
                                // 'token': genericFunc.generateTokenLink(data),
                                'data': data
                            }
                            successFn(response);
                        } else {
                            response = {
                                'message': data[0].message
                            }
                            errFn(response);
                        }
                    }
                }
            })
        }
    }
}
module.exports = createChallangeDB();