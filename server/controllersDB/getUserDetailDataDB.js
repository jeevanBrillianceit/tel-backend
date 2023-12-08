const statusCode = require("http-status-codes");
const sqlConnect = require("../database/connection");
const genericFunc = require("../utility/genericFunctions");
const jsonResponse = require("../utility/jsonResponse");
const {
  dataTypeEnum,
  procedureEnum,
  errorEnum,
} = require("../database/databaseEnums");

const getUserDetailDataDB = () => {
  return {
    getUserDetailDataDB: async (req, res, next) => {
        console.log(req.body)
      const successFn = (result) => {
        jsonResponse.successHandler(res, next, result);
      };
      const errFn = (err, statusCode) => {
        jsonResponse.errorHandler(res, next, err, statusCode);
      };

      if (genericFunc.checkEmptyNull("userId", req.user.id, errFn) == true)
        return;

      const inputObject = [
        genericFunc.inputparams("userId", dataTypeEnum.varChar, req.body.userId),

      ];

      sqlConnect.connectDb(
        req,
        errFn,
        procedureEnum.proc_getuser_detail,
        inputObject,
        errorEnum.proc_getuser_detail,
        async function (result) {
          if (result.length > 0) {
            if (result[0]) {
              let data = result[0];
              if (data[0]?.message === "User Detail Success") {
               const response = {
                  message: data.message,
                  data: result[0],
                };

                successFn(response);
              } else {
                response = {
                  message: data.message,
                };
                errFn(response, statusCode.StatusCodes.UNAUTHORIZED);
              }
            }
          }
        }
      );
    },
  };
};



module.exports = getUserDetailDataDB();
