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
            if (result[0] && result[1]) {
              let data = result[0];
              let data1 = result[1];
              let data2 = result[2];

              if (data[0]?.message === "User Detail Success" && data1[0]?.message === "User Challenges Success" &&  data2[0]?.message === "Comment Success") {
                const newarray = await findDuplicates(result[1]);
             
                const newarray2 = await findDuplicates(result[2]);
                // Call the function
                const updatedNestedArray = includeCommentCount(newarray, newarray2);
                 const newResponses = {
                   ...data[0],
                  media : updatedNestedArray
                 }

               const response = {
                  message: data.message,
                  data: newResponses,
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


module.exports = getUserDetailDataDB();
