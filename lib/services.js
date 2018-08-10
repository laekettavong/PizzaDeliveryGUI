/*
* Triage requests
*/

// Dependencies
const FsServices = require('./fsservices');
const Config = require('./config');
const Utils = require('./utils');
const StringHelper = Utils.StringHelper;

const Services = {
    invalidUri : (reqData, callback) => {
        callback(404);
    },
    users : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            Services.getServiceProvider()[reqData.method.toLowerCase()](reqData, callback);
        } else {
            callback(405);
        }
    },
    login : (reqData, callback) => {
        
    },
    getServiceProvider : () => {
        switch(Config.dataStore) {
            case 'database' :
                return null; // @TODO - integrate with DB
            default :
                return FsServices;
        }
    }
}

module.exports = Services;
