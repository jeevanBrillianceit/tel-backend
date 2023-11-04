const statusCode = require('http-status-codes')
const sqlConnect = require('../database/connection');
const genericFunc = require('../utility/genericFunctions');
const jsonResponse = require('../utility/jsonResponse')
const { dataTypeEnum, procedureEnum, errorEnum } = require('../database/databaseEnums');

const getDashboardDataDB = () => {
    return {
        getDashboardDataDB: async (req, res, next) => {
            const successFn = (result) => {
                jsonResponse.successHandler(res, next, result)
            }
            const errFn = (err,statusCode) => {
                jsonResponse.errorHandler(res, next, err,statusCode)
            }

            if (genericFunc.checkEmptyNull('userId', req.user.id, errFn) == true) return


            const inputObject = [
                genericFunc.inputparams('userId', dataTypeEnum.varChar, req.user.id)
            ]

            sqlConnect.connectDb(req, errFn, procedureEnum.proc_get_dashboard_data, inputObject, errorEnum.proc_get_dashboard_data, async function (result) {
                if (result.length > 0) {
                    if (result[0]) {
                        let data = result[0]                     
                        if (data[0].message === 'Success') {
                      const newarray =  await findDuplicates(result[0])
                            response = {
                                'message': data.message,
                                // 'token': genericFunc.generateTokenLink(data),
                                'data': newarray
                            }
                            successFn(response);
                        } else {
                            response = {
                                'message': data.message
                            }
                            errFn(response,statusCode.StatusCodes.UNAUTHORIZED);
                        }
                    }
                }
            })
        }
    }
}

const findDuplicates = async (data) => {
    const output = {};
  
    data.forEach(obj => {
      const key = obj.challenge_id;
      if (!output[key]) {
        output[key] = [];
      }
      const convertedObj = obj.constructor.name === 'RowDataPacket' ? { ...obj } : obj;
    output[key].push(convertedObj);
  });
   
  
    const resultArrays = Object.values(output).map((arr, id) => ({
        id,
        inner: arr
      }));
 
    return resultArrays.reverse();
  }
module.exports = getDashboardDataDB();