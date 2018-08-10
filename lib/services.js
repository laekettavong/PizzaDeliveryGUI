/*
* Triage requests
*/

// Dependencies
const FsUsersServices = require('./fs_users_services');
const Config = require('./config');
const Utils = require('./utils');
const StringHelper = Utils.StringHelper;

const Services = {
    invalidUri : (reqData, callback) => {
        callback(404);
    },
    users : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            Services.getUsersServiceProvider()[reqData.method.toLowerCase()](reqData, callback);
        } else {
            callback(405);
        }
    },
    login : (reqData, callback) => {
        
    },
    getUsersServiceProvider : () => {
        switch(Config.dataStore) {
            case 'database' :
                return null; // @TODO - integrate with DB
            default :
                return FsUsersServices;
        }
    }
}

module.exports = Services;
