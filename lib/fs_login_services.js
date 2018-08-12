/*
* FS-related tasks for login services
*/

// Dependencies
const FsHelper = require('./fs_helper');
const Constants = require('./constants');
const MenuHelper = require('./menu_helper');
const Utils = require('./utils');
const StringHelper = Utils.StringHelper;
const AuthHelper = Utils.AuthHelper;
const RandomGenerator = Utils.RandomGenerator;

const services = {
    // Required data:  email, password
    // Optional data: none
    post : (reqData, callback) => {
        let email = StringHelper.isValidEmail(reqData.payload.email);
        let password = StringHelper.isValidString(reqData.payload.password);
        if(email && password){
            // Lookup user that matches the phone numbaber
            FsHelper.read(Constants.USERS, email, (err, userData) => {
                if(!err && userData){
                    // Hased the incoming password, and compare it with the password stored in the user object
                    let hashedPassword = AuthHelper.hash(password);
                    // If valid create a new token wiht a random name. Set expiration date 1 hour in the future
                    if(AuthHelper.isAuthenticated(hashedPassword, userData.hashedPassword)){
                        let tokenId = RandomGenerator.generateString(20);
                        let expires = Date.now() + 1000 * 60 * 60; // token is good for one hour
                        let tokenObj = {
                            'email' : email,
                            'id' : tokenId,
                            'expires' : expires
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
     },
     // Require data: tokenId
     // Optional data: none
     get : (reqData, callback) => {
        // Check that the id is valid
        let tokenId = StringHelper.isValidString(reqData.queryString.id);
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
   },
    // Required data: tokenId, extend
    // Optional data: none
    put : (reqData, callback) => {
        let tokenId = StringHelper.isValidString(reqData.payload.id);
        let extend = StringHelper.isValidBoolean(reqData.payload.extend);
        if(tokenId && extend){
            FsHelper.read(Constants.TOKENS, tokenId, (err, tokenData) => {
                if(!err && tokenData){
                    // Check make sure the token isn't already expired
                    if(tokenData.expires > Date.now()){
                        tokenData.expires = Date.now() + 1000 * 60 * 60;
                        FsHelper.update(Constants.TOKENS, tokenId, tokenData, (err) => {
                            if(!err){
                                callback(200);
                            } else {
                                callback(500, {Error : 'Could not update the token'});
                            }
                        })
                    } else {
                        callback(400, {Error : 'Token has already exoired'});
                    }
                } else {
                    callback(400, {Error : 'Token does not exist'});
                }
            })
        } else {
            callback(400, {Error : 'Missisng required field: tokenId'});
        }
    },
    // Require data: tokenId
    // Optional data: none
    delete : (reqData, callback) => {
        let tokenId = StringHelper.isValidString(reqData.queryString.id);
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