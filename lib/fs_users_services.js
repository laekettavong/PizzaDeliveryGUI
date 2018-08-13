/*
* FS-related tasks for users services
*/

// Dependencies
const Constants = require('./constants');
const DataModel = require('./data_model');
const FsHelper = require('./fs_helper');
const Utils = require('./utils');
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
        UserService.deleteUser(reqData, callback);
    }
}

const UserServices = class UserServices {
    // Required data: firstName, lastName, email, password, address, city, sstate, zip
    // Optional data: none
    static createUser(reqData, callback) {
        // Check that all the required fields are fill out
        // firstName, lastName, email, streetAddress, city, state, zip
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
                            if(!err){
                                callback(200);
                            } else {
    
                                callback(500, {Error : 'Cannot create the user'});
                            }
                        })
                    } else {
                        callback(500, {Error : 'Could not hash the user\'s password'});
                    }
                } else {
                    callback(400, {Error : 'User alreay exists'});
                }
            });
        } else {
            callback(400, {Error : 'Missing required user fields'});
        }
    }

    // Require data: email
    // Optional data: none
    static getUser(reqData, callback) {
        // Check that the email is valid
        let email = StringHelper.isValidEmail(reqData.queryString.email);
        if(email){
            let token = StringHelper.isValidString(reqData.headers.token);
            TokenHelper.verifyToken(token, email, (isValidToken) => {
                if(isValidToken){
                    FsHelper.read(Constants.USERS, email, (err, userData) => {
                        if(!err && userData){
                            // Remove the hashed password from the user object before returning it to the requester
                            delete userData.hashedPassword;
                            callback(200, userData);
                        }else {
                            callback(400);
                        }
                    })
                } else {
                    callback(403, {Error : 'Token is invalid'});
                }
            });
        } else {
            callback(400, {Error : 'Missing required field: email'});
        }
    }

    // Required data: email
    // Optional data: firstName, lastName, password, address, city, sstate, zip (at least must be specified)
    static updateUser(reqData, callback) {
         // Check for the required field
         let email = StringHelper.isValidEmail(reqData.payload.email);
         if(email){
             // Check for optional fields
             let firstName = StringHelper.isValidString(reqData.payload.firstName);
             let lastName = StringHelper.isValidString(reqData.payload.lastName);
             let password = StringHelper.isValidString(reqData.payload.password);
             let address = StringHelper.isValidString(reqData.payload.address);
             let city = StringHelper.isValidString(reqData.payload.city);
             let state = StringHelper.isValidString(reqData.payload.state);
             let zip = StringHelper.isValidString(reqData.payload.zip);
             // Error if nothing is sent to update
             if(firstName || lastName || password || address || city || state || zip){
                 let token = StringHelper.isValidString(reqData.headers.token);
                 TokenHelper.verifyToken(token, email, (isValidToken) => {
                     if(isValidToken){
                         FsHelper.read(Constants.USERS, email, (err, userData) => {
                             if(!err && userData){
                                 // Update the specified fields
                                 if(firstName){
                                     userData.firstName = firstName
                                 }
                                 if(lastName){
                                     userData.lastName = lastName;
                                 }
                                 if(password){
                                     userData.hashedPassword = AuthHelper.hash(password);
                                 }
                                 if(address){
                                     userData.address = address;
                                 }
                                 if(city){
                                     userData.city = city;
                                 }
                                 if(state){
                                     userData.state = state;
                                 }
                                 if(zip){
                                     userData.zip = zip;
                                 }
                                 // Persist data
                                 FsHelper.update(Constants.USERS, email, userData, (err) => {
                                     if(!err){
                                         callback(200);
                                     } else {
                                         consolog.log(err);
                                         callback(500, {Error : 'Could not update user info'})
                                     }
                                 })
                 
                             } else {
                                 callback(400, {Error : 'User does not exist'});
                             }
                         });
                     } else {
                        callback(403, {Error : 'Missing or invalid token'});
                     }
                 });
             } else {
                 callback(400, {Error : 'Missing fields to update'});
             }
         } else {
             callback(400, {Error : 'Missing required field: email'});
         }
    }

    // Require data: email
    // Optional data: none
    static deleteUser(reqData, callback) {
        let email = StringHelper.isValidEmail(reqData.queryString.email);
        if(email){
            let token = StringHelper.isValidString(reqData.headers.token);
            TokenHelper.verifyToken(token, email, (isValidToken) => {
                if(isValidToken){
                    FsHelper.read(Constants.USERS, email, (err, userData) => {
                        if(!err && userData){
                            FsHelper.delete(Constants.USERS, email, (err) => {
                                if(!err){
                                    callback(200, {Success : 'User deleted'}); 
                                    // @TODO cleanup (delete) any other data files associated with the user

                                    /*
                                    // Delete each of the checks associated with the user
                                    let userChecks = StringHelper.isUserChecks(userData.checks);
                                    if(ArrayUtils.isNotEmptyArray(userChecks)){
                                        let checksDeleted = 0;
                                        let hasDeletionErrors = false;
                                        userChecks.forEach((checkId) => {
                                            FsHelper.delete(Constants.CHECKS, checkId, (err) => {
                                                if(err){
                                                    hasDeletionErrors = true;
                                                }
                                                checksDeleted++;
                                                if(checksDeleted == userChecks.length){
                                                    if(!hasDeletionErrors){
                                                        callback(200);
                                                    } else {
                                                        callback(500, {Error : 'Errors encountered while attempting to delete all of the user\'s checks. All checks may not have been deleted from the system successfully.'});
                                                    }
                                                }
                                            })
                                        })
                                    } else {
                                        callback(200);
                                    } 

                                    */

                                } else {
                                    callback(500, {Error : 'Could find user'})
                                }
                            })
                        }else {
                            callback(400, {Error : 'Could find user'});
                        }
                    });
                } else {
                    callback(403, {Error : 'Missing or invalid token'});
                }
            });
        } else {
            callback(400, {Error : 'Missing required field: email'})
        }
    }
}


module.exports = services;