const sqlConnect = require('../database/connection');
const genericFunc = require('../utility/genericFunctions');
const jsonResponse = require('../utility/jsonResponse')
const { dataTypeEnum, procedureEnum, errorEnum } = require('../database/databaseEnums');
const constants = require('../utility/constants')

const uploadFileDB = () => {
    return {
        uploadFileDB: async (req, res, next) => {
            const successFn = (result) => {
                jsonResponse.successHandler(res, next, result)
            }
            const errFn = (err) => {
                jsonResponse.errorHandler(res, next, err)
            }

            // if (genericFunc.checkEmptyNull('userId', req.user.id, errFn) == true) return
            const inputObject = [
                genericFunc.inputparams('userId', dataTypeEnum.varChar, 1)
            ]

            sqlConnect.connectDb(req, errFn, procedureEnum.proc_get_dashboard_data, inputObject, errorEnum.proc_get_dashboard_data, function (result) {
                if (result.length > 0) {
                    if (result[0][0]) {
                        let data = result[0][0]
                        if (data.message === 'Success') {
                            response = {
                                'message': data.message,
                                "fileName": constants.awsBucketLocationProfile + req.file.key
                            }
                            successFn(response);
                        } else {
                            response = {
                                'message': data.message
                            }
                            errFn(response);
                        }
                    }
                }
            })
        }
    }
}
module.exports = uploadFileDB();