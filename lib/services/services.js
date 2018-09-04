/*
* Triage requests
*/

// Dependencies
const FsUsersServices = require('./fs/fs_users_services');
const FsLoginServices = require('./fs/fs_login_services');
const FsLogoutServices = require('./fs/fs_logout_services');
const FsShoppingCartServices = require('./fs/fs_shopping_cart_services');
const FsOrdersServices = require('./fs/fs_orders_services');
const FsHtmlServices = require('./fs/fs_html_services');
const Config = require('./../config');
const Utils = require('./../utils');
const StringHelper = Utils.StringHelper;

const services = {
    /*
    * JSON API Handlers
    */
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
    userApi : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getUserServices()[reqData.method.toLowerCase()](reqData, callback);
        } else {
            callback(405);
        }
    },
    loginApi : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getLoginServices()[reqData.method.toLowerCase()](reqData, callback);
        } else {
            callback(405);
        }
    },
    logoutApi : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getLogoutServices()[reqData.method.toLowerCase()](reqData, callback);
        } else {
            callback(405);
        }
    },
    shoppingcartApi : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getShoppingCartServices()[reqData.method.toLowerCase()](reqData, callback);
        } else {
            callback(405);
        }
    },
    orderApi : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getOrdersServices()[reqData.method.toLowerCase()](reqData, callback);
        } else {
            callback(405);
        }
    },
    /*
    * HTML Handlers
    */
    index : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getHtmlServices().index(reqData, callback);     
            //callback(undefined, undefined, 'html');
           // callback(200, {Success: 'Server is up'});
        } else {
            callback(405);
        }
    },
    menu : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getHtmlServices().menu(reqData, callback);     
        } else {
            callback(405);
        }
    },
    accountCreate : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getHtmlServices().accountCreate(reqData, callback);     
        } else {
            callback(405);
        }
    },
    accountEdit : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getHtmlServices().accountEdit(reqData, callback);     
        } else {
            callback(405);
        }
    },
    accountDeleted : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getHtmlServices().accountDeleted(reqData, callback);     
        } else {
            callback(405);
        }
    },
    shoppingCart : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getHtmlServices().shoppingCart(reqData, callback);     
        } else {
            callback(405);
        }
    },
    sessionCreate : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getHtmlServices().sessionCreate(reqData, callback);     
        } else {
            callback(405);
        }
    },
    sessionDeleted : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getHtmlServices().sessionDeleted(reqData, callback);     
        } else {
            callback(405);
        }
    },
    favicon : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getHtmlServices().favicon(reqData, callback);       
           // callback(200, {Success: 'Server is up'});
        } else {
            callback(405);
        }
    },
    public : (reqData, callback) => {
        if(StringHelper.isValidMethod(reqData.method)){
            ServiceProvider.getHtmlServices().public(reqData, callback);       
           // callback(200, {Success: 'Server is up'});
        } else {
            callback(405);
        }
    }
}

const ServiceProvider = {
    getUserServices : () => {
        switch(Config.dataStore) {
            case 'database' :
                return null; // @TODO - integrate with DB
            default :
                return FsUsersServices;
        }
    },
    getLoginServices : () => {
        switch(Config.dataStore) {
            case 'database' :
                return null; // @TODO - integrate with DB
            default :
                return FsLoginServices;
        }
    },
    getLogoutServices : () => {
        switch(Config.dataStore) {
            case 'database' :
                return null; // @TODO - integrate with DB
            default :
                return FsLogoutServices;
        }
    },
    getShoppingCartServices : () => {
        switch(Config.dataStore) {
            case 'database' :
                return null; // @TODO - integrate with DB
            default :
                return FsShoppingCartServices;
        }
    },
    getOrdersServices : () => {
        switch(Config.dataStore) {
            case 'database' :
                return null; // @TODO - integrate with DB
            default :
                return FsOrdersServices;
        }
    },
    getHtmlServices : () => {
        switch(Config.dataStore) {
            case 'database' :
                return null; // @TODO - integrate with DB
            default :
                return FsHtmlServices;
        }
    }
}

module.exports = services;
