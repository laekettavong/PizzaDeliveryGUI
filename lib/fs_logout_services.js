/*
* FS-related tasks for login services
*/

// Dependencies
const FsHelper = require('./fs_helper');
const Constants = require('./constants');
const Utils = require('./utils');
const FsLoginServices = require('./fs_login_services');
const StringHelper = Utils.StringHelper;
const AuthHelper = Utils.AuthHelper;
const TokenHelper = Utils.TokenHelper;
const RandomGenerator = Utils.RandomGenerator;


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
        FsLoginServices.delete(reqData, callback);
     }
}

module.exports = services;