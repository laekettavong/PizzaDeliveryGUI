/*
* FS-related tasks for login services
*/

// Dependencies
const FsHelper = require('./fs_helper');
const Constants = require('./../../constants');
const UserContext = require('./fs_users_services').UserContext;
const Utils = require('./../../utils');
const StringHelper = Utils.StringHelper;



const services = {
    post : (reqData, callback) => {
        callback(404, {Error: Constants.ERROR_NO_POST_SUPPORT});
     },
     get : (reqData, callback) => {
        callback(404, {Error: Constants.ERROR_NO_GET_SUPPORT});
     },
     put : (reqData, callback) => {
        callback(404, {Error: Constants.ERROR_NO_PUT_SUPPORT});
     },
     delete : (reqData, callback) => {
        LogoutServices.logout(reqData, callback);
     }
}

const LogoutServices = class LogoutServices {

   /*
    * Fetches user data as specified by email (userId)
    * 
    * @param {reqData} request data
    *       required field(s): auth token
    *       optional field(s): none
    *    
    * @param {callback}
    * 
    * @return user info match the specified email
    */
    static logout(reqData, callback) {
        let token = StringHelper.isValidString(reqData.headers.token);
        if(token) {
            UserContext.getContext(token, (err, context) => {
                if(!err && context) {
                    FsHelper.delete(Constants.TOKENS, context.token, (err) => {
                        if(!err){
                            callback(200);
                        } else {
                            callback(500, {Error : Constants.ERROR_TOKEN_DOES_NOT_EXIST});
                        }
                    });
                } else {
                    callback(400, {Error : Constants.ERROR_CANNOT_PERFORM_OPERATION});
                }
            });
        } else {
            callback(400, {Error : Constants.ERROR_MISSING_AUTH_TOKEN});
        }
    }
}

module.exports = services;