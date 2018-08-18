/*
* FS-related tasks for login services
*/

// Dependencies
const FsHelper = require('./fs_helper');
const Constants = require('./constants');
const MenuHelper = require('./menu_helper');
const FsLogoutServices = require('./fs_logout_services')
const UserContext = require('./fs_users_services').UserContext;
const Config = require('./config');
const Utils = require('./utils');
const StringHelper = Utils.StringHelper;
const AuthHelper = Utils.AuthHelper;
const RandomGenerator = Utils.RandomGenerator;


const services = {
    post : (reqData, callback) => {
        LoginServices.login(reqData, callback);
    },
    get : (reqData, callback) => {
        LoginServices.getMenu(reqData, callback);
    },
    put : (reqData, callback) => {
        LoginServices.extendToken(reqData, callback);
    },
    delete : (reqData, callback) => {
        LoginServices.logout(reqData, callback);
    }
}

const LoginServices = class LoginServices {

    /*
    * Logins in the user with given credentials
    * 
    * @param {reqData} request data
    *       required field(s): email, password
    *       optional field(s): none
    * 
    * @param {callback}
    * 
    * @return generates auth token upon authentication
    */
    static login(reqData, callback) {
        let email = StringHelper.isValidEmail(reqData.payload.email);
        let password = StringHelper.isValidString(reqData.payload.password);
        if(email && password){
            // Lookup user that matches the email numbaber
            FsHelper.read(Constants.USERS, email, (err, userData) => {
                if(!err && userData){
                    // Hash the incoming password, and compare it with the password stored in the user object
                    let hashedPassword = AuthHelper.hash(password);
                    // If valid create a new token wiht a random name. Set expiration date 1 hour in the future
                    if(AuthHelper.isAuthenticated(hashedPassword, userData.hashedPassword)) {
                        let tokenId = RandomGenerator.generateString(20);
                        let expires = new Date();
                        expires.setHours(expires.getHours() + Config.tokenDurationHours);
                        let tokenObj = {
                            'email' : email,
                            'token' : tokenId,
                            'expires' : expires.getTime()
                        }
                        FsHelper.create(Constants.TOKENS, tokenId, tokenObj, (err) => {
                            if(!err){
                                callback(200, tokenObj);
                            } else {
                                callback(500, {Error : 'Missing required fields'});
                            }
                        })
                    } else {
                        callback(400, {Error : 'Invalid password'});
                    }
                } else {
                    callback(400, {Error : 'Could not find user'});
                }
            });
        } else {
            callback(400, {Error : 'Missing required fields'});
        }
    }

   /*
    * Fetches the menu of items available for ordering
    * 
    * @param {reqData} request data
    *       required field(s): email, auth token
    *       optional field(s): none
    * 
    * @param {callback}
    * 
    * @return user info match the specified email
    */
    static getMenuOLD(reqData, callback) {
        // Check that the id is valid
        let tokenId = StringHelper.isValidString(reqData.queryString.token);
        if(tokenId){
            FsHelper.read(Constants.TOKENS, tokenId, (err, tokenData) => {
                if(!err && tokenData){
                    //callback(200, tokenData);
                    callback(200, MenuHelper.constructMenu());
                } else {
                    callback(404);
                }
            })
        } else {
            callback(400, {Error : 'Missing required field: tokenId'});
        }
    }

    /*
    * Fetches the menu of items available for ordering
    * 
    * @param {reqData} request data
    *       required field(s): auth token
    *       optional field(s): none
    * 
    * @param {callback}
    * 
    * @return menu items available for ordering
    */
   static getMenu(reqData, callback) {
        let token = StringHelper.isValidString(reqData.headers.token);
        if(token) {
            UserContext.getContext(token, (err, context) => {
                if(!err && context) {
                    FsHelper.read(Constants.TOKENS, context.token, (err, tokenData) => {
                        if(!err && tokenData){
                            callback(200, MenuHelper.constructMenu());
                        } else {
                            callback(400, {Error : 'Could not construct menu'});
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

   /*
    * Extends the auth token expiration date, keeps token alive
    * 
    * @param {reqData} request data
    *       required field(s): auth token
    *       optional field(s): none
    * 
    * @param {callback}
    * 
    * @return
    */
    static extendToken(reqData, callback)  {
        let token = StringHelper.isValidString(reqData.headers.token);
        if(token) {
            UserContext.getContext(token, (err, context) => {
                if(!err && context) {
                    if(context.expires > Date.now()) { 
                        let expires = new Date();
                        expires.setHours(expires.getHours() + Config.tokenDurationHours);

                        let tokenData = {
                                'email' : context.user.email,
                                'token' : context.token,
                                'expires' : expires.getTime()
                            };

                        FsHelper.update(Constants.TOKENS, context.token, tokenData, (err) => {
                            if(!err){
                                callback(200, {Success : 'Auth token expiration date extended'});
                            } else {
                                callback(500, {Error : 'Could not update the token'});
                            }
                        })
                    } else {
                        callback(400, {Error : 'Token has already expired'});
                    }
                } else {
                    callback(400, {Error : 'Could not perform operation - invalid token'});
                }
            });
        } else {
            callback(400, {Error : 'Missing token'});
        }
    }

   /*
    * Logs user out, delegates to FsLogoutServices
    * 
    * @param {reqData} request data
    *       required field(s): auth token
    *       optional field(s): none
    * 
    * @param {callback}
    * 
    * @return
    */
    static logout(reqData, callback) {
        FsLogoutServices.delete(reqData, callback);
    }
}

module.exports = services;