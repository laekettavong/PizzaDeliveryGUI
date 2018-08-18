/*
* FS-related tasks for login services
*/

// Dependencies
const FsHelper = require('./fs_helper');
const Constants = require('./constants');
const UserContext = require('./fs_users_services').UserContext;
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
        console.log("here", token);
        if(token) {
            UserContext.getContext(token, (err, context) => {
                if(!err && context) {
                    FsHelper.delete(Constants.TOKENS, context.token, (err) => {
                        if(!err){
                            callback(200);
                        } else {
                            callback(500, {Error : 'Token does not exist'});
                        }
                    });
                } else {
                    callback(400, {Error : 'Could not perform operation - invalid token'});
                }
            });
        } else {
            callback(400, {Error : 'Missing token'});
        }
    }

}

module.exports = services;