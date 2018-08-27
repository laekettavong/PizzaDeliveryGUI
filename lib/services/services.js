/*
* Triage requests
*/

// Dependencies
const FsUsersServices = require('./fs/fs_users_services');
const FsLoginServices = require('./fs/fs_login_services');
const FsLogoutServices = require('./fs/fs_logout_services');
const FsShoppingCartServices = require('./fs/fs_shopping_cart_services');
const FsOrdersServices = require('./fs/fs_orders_services');
const Config = require('./../config');
const Utils = require('./../utils');
const StringHelper = Utils.StringHelper;

const service = {
    invalidUri : (reqData, callback) => {
        callback(404, {Error: 'Invalid URI'});
    },
    ping : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            callback(200, {Success: 'Server is up'});
        } else {
            callback(405);
        }
    },
    users : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getUsersService()[reqData.method.toLowerCase()](reqData, callback);
        } else {
            callback(405);
        }
    },
    login : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getLoginService()[reqData.method.toLowerCase()](reqData, callback);
        } else {
            callback(405);
        }
    },
    logout : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getLogoutService()[reqData.method.toLowerCase()](reqData, callback);
        } else {
            callback(405);
        }
    },
    shoppingcart : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getShoppingCartService()[reqData.method.toLowerCase()](reqData, callback);
        } else {
            callback(405);
        }
    },
    orders : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getOrdersService()[reqData.method.toLowerCase()](reqData, callback);
        } else {
            callback(405);
        }
    }
}

const ServiceProvider = {
    getUsersService : () => {
        switch(Config.dataStore) {
            case 'database' :
                return null; // @TODO - integrate with DB
            default :
                return FsUsersServices;
        }
    },
    getLoginService : () => {
        switch(Config.dataStore) {
            case 'database' :
                return null; // @TODO - integrate with DB
            default :
                return FsLoginServices;
        }
    },
    getLogoutService : () => {
        switch(Config.dataStore) {
            case 'database' :
                return null; // @TODO - integrate with DB
            default :
                return FsLogoutServices;
        }
    },
    getShoppingCartService : () => {
        switch(Config.dataStore) {
            case 'database' :
                return null; // @TODO - integrate with DB
            default :
                return FsShoppingCartServices;
        }
    },
    getOrdersService : () => {
        switch(Config.dataStore) {
            case 'database' :
                return null; // @TODO - integrate with DB
            default :
                return FsOrdersServices;
        }
    }
}

module.exports = service;
