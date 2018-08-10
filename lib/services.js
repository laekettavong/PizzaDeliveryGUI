/*
* Triage requests
*/

// Dependencies
const FsUsersServices = require('./fs_users_services');
const FsLoginServices = require('./fs_login_services');
const FsLogoutServices = require('./fs_logout_services');
const Config = require('./config');
const Utils = require('./utils');
const StringHelper = Utils.StringHelper;

const service = {
    invalidUri : (reqData, callback) => {
        callback(404);
    },
    users : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceHelper.getUsersServiceProvider()[reqData.method.toLowerCase()](reqData, callback);
        } else {
            callback(405);
        }
    },
    login : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceHelper.getLoginServiceProvider()[reqData.method.toLowerCase()](reqData, callback);
        } else {
            callback(405);
        }
    },
    logout : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceHelper.getLogoutServiceProvider()[reqData.method.toLowerCase()](reqData, callback);
        } else {
            callback(405);
        }
    },
}

const ServiceHelper = {
    getUsersServiceProvider : () => {
        switch(Config.dataStore) {
            case 'database' :
                return null; // @TODO - integrate with DB
            default :
                return FsUsersServices;
        }
    },
    getLoginServiceProvider : () => {
        switch(Config.dataStore) {
            case 'database' :
                return null; // @TODO - integrate with DB
            default :
                return FsLoginServices;
        }
    },
    getLogoutServiceProvider : () => {
        switch(Config.dataStore) {
            case 'database' :
                return null; // @TODO - integrate with DB
            default :
                return FsLogoutServices;
        }
    }
}

module.exports = service;
