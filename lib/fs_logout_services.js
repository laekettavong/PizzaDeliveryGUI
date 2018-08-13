/*
* FS-related tasks for login services
*/

// Dependencies
const FsHelper = require('./fs_helper');
const Constants = require('./constants');
const Utils = require('./utils');
const StringHelper = Utils.StringHelper;



const services = {
    post : (reqData, callback) => {
        callback(404, {Error: 'This service does not support POST'});
     },
     get : (reqData, callback) => {
        callback(404, {Error: 'This service does not support GET'});
     },
     put : (reqData, callback) => {
        callback(404, {Error: 'This service does not support PUT'});
     },
     // Required data: tokenId
     // Optional data: none
     delete : (reqData, callback) => {
        LogoutServices.logout(reqData, callback);
     }
}

const LogoutServices = class LogoutServices {
    // Required data: tokenId
    // Optional data: none
    static logout(reqData, callback) {
        let tokenId = StringHelper.isValidString(reqData.queryString.token);
        if(tokenId){
            FsHelper.read(Constants.TOKENS, tokenId, (err, tokenData) => {
                if(!err && tokenData){
                    FsHelper.delete(Constants.TOKENS, tokenId, (err) => {
                        if(!err){
                            callback(200);
                        } else {
                            callback(500, {Error : 'Token does not exist'});
                        }
                    })
                }else {
                    callback(400, {Error : 'Token does not exist'});
                }
            })
        } else {
            callback(400, {Error : 'Missisng required field: tokenId'});
        }
    }
}

module.exports = services;