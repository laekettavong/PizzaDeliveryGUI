/*
* FS-related tasks for users services
*/

// Dependencies
const Constants = require('./../../constants');
const DataModel = require('./../../data_model');
const FsHelper = require('./fs_helper');
const Utils = require('./../../utils');
const Person = DataModel.Person;
const StringHelper = Utils.StringHelper;
const AuthHelper = Utils.AuthHelper;
const TokenHelper = Utils.TokenHelper


const services = {
    post : (reqData, callback) => {
        UserServices.createUser(reqData, callback);
    },
    get : (reqData, callback) => {
        UserServices.getUser(reqData, callback);
    },
    put : (reqData, callback) => {
        UserServices.updateUser(reqData, callback);
    },
    delete : (reqData, callback) => {
        UserServices.deleteUser(reqData, callback);
    }
}

const UserServices = class UserServices {

   /*
    * Creates a user with provided fields
    * 
    * @param {reqData} request data
    *       required field(s): irstName, lastName, email, address, city, state, zip
    *       optional field(s): none
    * 
    * @param {callback}
    * 
    * @return
    */
    static createUser(reqData, callback) {
        // Check that all the required fields are fill out
        let firstName = StringHelper.isValidString(reqData.payload.firstName);
        let lastName = StringHelper.isValidString(reqData.payload.lastName);
        let password = StringHelper.isValidString(reqData.payload.password);
        let email = StringHelper.isValidEmail(reqData.payload.email);
        let address = StringHelper.isValidString(reqData.payload.address);
        let city = StringHelper.isValidString(reqData.payload.city);
        let state = StringHelper.isValidString(reqData.payload.state);
        let zip = StringHelper.isValidString(reqData.payload.zip);

        if(firstName && lastName && email && password && address && city && state && zip) {
            FsHelper.read(Constants.USERS, email, (err, data) => {
                if(err){
                    let hashedPassword = AuthHelper.hash(password);
                    if(hashedPassword) {
                        let personObj = new Person(firstName, lastName, email, address, city, state, zip);
                        personObj.hashedPassword = hashedPassword;
                        // Store the user
                        FsHelper.create(Constants.USERS, email, personObj, (err) => {
                            if(!err) {
                                callback(200, {Success : Constants.SUCCESS_USER_CREATED});
                            } else {
                                callback(500, {Error : Constants.ERROR_CANNOT_CRETE_USER});
                            }
                        });
                    } else {
                        callback(500, {Error : Constants.ERROR_CANNOT_HASH_PASSWORD});
                    }
                } else {
                    callback(400, {Error : Constants.ERROR_USER_EXISTS});
                }
            });
        } else {
            callback(400, {Error : Constants.ERROR_MISSING_REQUIRED_USER_FIELDS});
        }
    }

    /*
    * Fetches user data as specified by email (userId)
    * 
    * @param {reqData} request data
    *       required field(s): email, auth token
    *       optional field(s): none
    * 
    * @param {callback}
    * 
    * @return user info match the specified email
    */
   static getUser(reqData, callback) {
        let token = StringHelper.isValidString(reqData.headers.token);
        if(token) {
            UserContext.getContext(token, (err, context) => {
                if(!err && context) {
                    FsHelper.read(Constants.USERS, context.user.email, (err, userData) => {
                        if(!err && userData){
                            // Remove the hashed password from the user object before returning it to the requester
                            delete userData.hashedPassword;
                            callback(200, userData);
                        }else {
                            callback(400, {Error : Constants.ERROR_CANNOT_FIND_USER});
                        }
                    });
                } else {
                    callback(400, {Error : Constants.ERROR_CANNOT_PERFORM_OPERATION});
                }
            });
        } else {
            callback(400, {Error : Constants.ERROR_CANNOT_FIND_TOKEN});
        }
    }

    /*
    * Updates user data as specified by email (userId)
    * 
    * @param {reqData} request data
    *       required field(s): email, auth token
    *       optional field(s): firstName, lastName, password, address, city, sstate, zip (at least must be specified)
    * 
    * @param {callback}
    * 
    * @return user info match the specified email
    */
    static updateUser(reqData, callback) {
        let token = StringHelper.isValidString(reqData.headers.token);
        if(token) {
            UserContext.getContext(token, (err, context) => {
                if(!err && context) {
                    let firstName = StringHelper.isValidString(reqData.payload.firstName);
                    let lastName = StringHelper.isValidString(reqData.payload.lastName);
                    let password = StringHelper.isValidString(reqData.payload.password);
                    let address = StringHelper.isValidString(reqData.payload.address);
                    let city = StringHelper.isValidString(reqData.payload.city);
                    let state = StringHelper.isValidString(reqData.payload.state);
                    let zip = StringHelper.isValidString(reqData.payload.zip);
                    // Error if nothing is sent to update
                    if(firstName || lastName || password || address || city || state || zip) {
                        FsHelper.read(Constants.USERS, context.user.email, (err, userData) => {
                            if(!err && userData){
                                // Update the specified fields
                                if(firstName) {
                                    userData.firstName = firstName
                                }
                                if(lastName) {
                                    userData.lastName = lastName;
                                }
                                if(password) {
                                    userData.hashedPassword = AuthHelper.hash(password);
                                }
                                if(address) {
                                    userData.address = address;
                                }
                                if(city) {
                                    userData.city = city;
                                }
                                if(state) {
                                    userData.state = state;
                                }
                                if(zip) {
                                    userData.zip = zip;
                                }
                                // Persist data
                                FsHelper.update(Constants.USERS, context.user.email, userData, (err) => {
                                    if(!err) {
                                        callback(200, {Success : Constants.SUCCESS_USER_UPDATED});
                                    } else {
                                        callback(500, {Error : Constants.ERROR_CANNOT_UPDATE_USER})
                                    }
                                });
                            } else {
                                callback(400, {Error : Constants.ERROR_CANNOT_FIND_USER});
                            }
                        });
                    } else {
                        callback(400, {Error : Constants.ERROR_MISSING_FIELDS_TO_UPDATE});
                    }
                } else {
                    callback(400, {Error : Constants.ERROR_CANNOT_PERFORM_OPERATION});
                }
            });
        } else {
            callback(400, {Error : Constants.ERROR_MISSING_AUTH_TOKEN});
        }
    }

    /*
    * Deletes user data as specified by email (userId)
    * 
    * @param {reqData} request data
    *       required field(s): email, auth token
    *       optional field(s): none
    * 
    * @param {callback}
    * 
    * @return
    * 
    * @TODO make artifact deletion atomic and roll-back when an error occurs
    */
    static deleteUser(reqData, callback) {
        let token = StringHelper.isValidString(reqData.headers.token);
        if(token) {
            UserContext.getContext(token, (err, context) => {
                if(!err && context) {
                    let error = false;
                    let orderHistory = context.user.orderhistory;
                    if(orderHistory) {
                        orderHistory.forEach((orderId) => {
                            FsHelper.delete(Constants.ORDERS, orderId, (err) => {                       
                                if(err) {
                                    error = Constants.ERROR_CANNOT_DELETE_ORDER;
                                }
                            });
                        });
                    }

                    if(!error && context.user.shoppingcart) {
                        FsHelper.delete(Constants.CARTS, context.user.shoppingcart, (err) => {
                            if(err) {
                                error = Constants.ERROR_CANNOT_DELETE_CART;
                            }
                        });
                    }

                    if(!error) {
                        FsHelper.delete(Constants.USERS, context.user.email, (err) => {
                            if(err) {
                                error = Constants.ERROR_CANNOT_DELETE_USER;
                            }
                        });
                    }

                    if(!error) {
                        FsHelper.delete(Constants.TOKENS, context.token, (err) => {
                            if(err) {
                                error = Constants.ERROR_CANNOT_FIND_TOKEN;
                            }
                        });
                    }

                    if(!error){
                        callback(200, {Suceess : Constants.SUCCESS_USER_DELETED});
                    } else {
                        callback(200, {Error : error});
                    }
                } else {
                    callback(400, {Error : Constants.ERROR_CANNOT_PERFORM_OPERATION});
                }
            });
        } else {
            callback(400, {Error : Constants.ERROR_MISSING_AUTH_TOKEN});
        }
    }
}

const UserContext = class UserContext {

    /*
    * Creates authenticated user context
    * 
    * @param {token} auth token
    *       required field(s): auth token
    *       optional field(s): none
    * 
    * @param {callback}
    * 
    * @return JSON representation of user context
    */
    static getContext(token, callback) {
        TokenHelper.getToken(token, (err, tokenData) => {
            if(!err && tokenData && tokenData.expires > Date.now()){
                FsHelper.read(Constants.USERS, tokenData.email, (err, userData) => {
                    if(!err && userData){
                        let userContext = {
                            'token' : token,
                            'expires' : tokenData.expires,
                            'user' : {
                                'email' : userData.email,
                                'firstName' : userData.firstName,
                                'lastName' : userData.lastName,
                                'hashedPassword' : userData.hashedPassword,
                                'address' : userData.address,
                                'city' : userData.city,
                                'state' : userData.state,
                                'zip' : userData.zip,
                                'shoppingcart' : userData.shoppingcart,
                                'order' : userData.order,
                                'orderhistory' : userData.orderhistory
                            }
                        };
                        callback(false, userContext);
                    } else {
                        callback(400, {Error : Constants.ERROR_CANNOT_FIND_USER});
                    }
                });
            } else {
                callback(500, {Error : Constants.ERROR_CANNOT_PERFORM_OPERATION});
            }
        });
    }
}

module.exports = services;
module.exports.UserServices = UserServices;
module.exports.UserContext = UserContext;
