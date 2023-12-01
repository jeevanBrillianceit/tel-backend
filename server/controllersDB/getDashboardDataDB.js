const statusCode = require("http-status-codes");
const sqlConnect = require("../database/connection");
const genericFunc = require("../utility/genericFunctions");
const jsonResponse = require("../utility/jsonResponse");
const {
  dataTypeEnum,
  procedureEnum,
  errorEnum,
} = require("../database/databaseEnums");
var mysql = require("mysql");
const config = require("../../server/database/configuration");
const Redis = require("ioredis");

const redis = new Redis();

const mysqlPool = mysql.createPool(config);

const getDashboardDataDB = () => {
  return {
    getDashboardDataDB: async (req, res, next) => {
      // const func = require('../utility/genericFunctions');
      // console.log(req.query.page, req.user.id, req.query.pageSize)
      // const page = parseInt(req.query.page) || 1;
      // const pageSize = parseInt(req.query.pageSize) || 7; // Set a default page size

      // const offset = (page - 1) * pageSize;

    

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

      const cachedVideos = await redis.get("videos");

      // if (cachedVideos) {
      //   const parsedResponse = JSON.parse(cachedVideos);

      //   // Parse the 'data' array and nested arrays within each object
      //   parsedResponse.data = parsedResponse.data.map(item => ({
      //     id: item.id,
      //     inner:item.inner,
      //   }));
      //   if (parsedResponse && parsedResponse.data) {
      //  return successFn(parsedResponse)
      //   }
      // }

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
              if (data[0].message === "Success") {
                const newarray = await findDuplicates(result[0]);
               const response = {
                  message: data.message,
                  // 'token': genericFunc.generateTokenLink(data),
                  data: newarray,
                };
      
  const videos = JSON.stringify(response);

  // Store in Redis with an expiration time (e.g., 1 hour)
  redis.set("videos", videos, "EX", 3600);

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

      // var connection = mysql.createConnection(config);
      // connection.connect(function (err) {
      //     if (err) throw errroFunc(err);
      //     connection.query(`CALL ${procedureEnum.proc_get_dashboard_data} (?, ?, ?)`,  [req.user.id,offset, pageSize], async (err, result) => {
      //        if (err) throw errroFunc(err);
      //         // if (err) {
      //         //     errroFunc(err);
      //         //     return;
      //         // }
      //         // res.json({ data: result[0], message: 'Success' });
      //             if (result.length > 0) {
      //         if (result[0]) {
      //             let data = result[0]
      //             if (data[0].message === 'Success') {
      //           const newarray =  await findDuplicates(result[0])
      //                 response = {
      //                     'message': data.message,
      //                     // 'token': genericFunc.generateTokenLink(data),
      //                     'data': newarray
      //                 }
      //                 successFn(response);
      //             } else {
      //                 response = {
      //                     'message': data.message
      //                 }
      //                 errFn(response,statusCode.StatusCodes.UNAUTHORIZED);
      //             }
      //         }
      //     }

      //     });
      // })

      // function errroFunc(err) {
      //     var message = func.errorFunc(err.message || "Err");
      //     errFn(message);
      //     connection.end();
      // }
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

module.exports = getDashboardDataDB();
