const statusCode = require("http-status-codes");
const sqlConnect = require("../database/connection");
const genericFunc = require("../utility/genericFunctions");
const jsonResponse = require("../utility/jsonResponse");
const {
  dataTypeEnum,
  procedureEnum,
  errorEnum,
} = require("../database/databaseEnums");

const getDashboardDataDB = () => {
  return {
    getDashboardDataDB: async (req, res, next) => {
      const successFn = (result) => {
        jsonResponse.successHandler(res, next, result);
      };
      const errFn = (err, statusCode) => {
        jsonResponse.errorHandler(res, next, err, statusCode);
      };

      if (genericFunc.checkEmptyNull("userId", req.user.id, errFn) == true)
        return;

      const inputObject = [
        genericFunc.inputparams("userId", dataTypeEnum.varChar, req.user.id),
      ];

      sqlConnect.connectDb(
        req,
        errFn,
        procedureEnum.proc_get_dashboard_data,
        inputObject,
        errorEnum.proc_get_dashboard_data,
        async function (result) {
          if (result.length > 0) {
            if (result[0]) {
              let data = result[0];
              let data2 = result[1];
              if (data[0].message === "Success" && data2[0].message === "Success") {
               const newarray = await findDuplicates(result[0]);
               const newarray2 = await findDuplicates(result[1]);
             // Call the function
             const updatedNestedArray = includeCommentCount(newarray, newarray2);

             // Output the updated nestedArray
               const response = {
                  message: data.message,
                  data: updatedNestedArray,
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

const findDuplicates = async (data) => {
  const output = {};
  data.forEach((obj) => {
    const key = obj.challenge_id;
    if (!output[key]) {
      output[key] = [];
    }
    const convertedObj =
      obj.constructor.name === "RowDataPacket" ? { ...obj } : obj;
    output[key].push(convertedObj);
  });

  const resultArrays = Object.values(output).map((arr, id) => ({
    id,
    inner: arr,
  }));

  return resultArrays.reverse();
};


// Function to include comment_count from array2 into nestedArray
function includeCommentCount(nestedArray, array2) {
  return nestedArray.map(outerObj => ({
    ...outerObj,
    inner: outerObj.inner.map(innerObj => {
      const matchingObject = array2.find(obj =>  obj.id === outerObj.id && obj.inner.some(i => i.challenge_id === innerObj.challenge_id));
      return matchingObject ? { ...innerObj, comment_count: matchingObject.inner.find(i => i.challenge_id === innerObj.challenge_id).comments_count } : innerObj;
    }),
  }));
}


module.exports = getDashboardDataDB();
