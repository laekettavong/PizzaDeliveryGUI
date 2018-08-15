/*
* FS-related tasks for orders services
*/

// Dependencies
const FsHelper = require('./fs_helper');
const Constants = require('./constants');
const DataModel = require('./classes');
const UserContext = require('./fs_users_services').UserContext

const Utils = require('./utils');
const StringHelper = Utils.StringHelper;
const TokenHelper = Utils.TokenHelper;

const services = {
    post : (reqData, callback) => {
        OrdersServices.placeOrder(reqData, callback);
    },
    get : (reqData, callback) => {
        OrdersServices.getOrder(reqData, callback);
    },
    put : (reqData, callback) => {
        OrdersServices.updateOrder(reqData, callback);
    },
    delete : (reqData, callback) => {
        OrdersServices.cancelOrder(reqData, callback);
    }
}

const OrdersServices = class OrderServices {
    static placeOrder(reqData, callback) {
        UserContext.getContext(reqData.headers.token, (err, context) => {
            if(!err && context) {
                    FsHelper.read(Constants.CARTS, context.user.shoppingcart, (err, cartData) => {
                        if(!err && cartData) {
                            FsHelper.create(Constants.ORDERS, context.user.shoppingcart, cartData, (err) => {
                                if(!err){
                                    FsHelper.delete(Constants.CARTS, context.user.shoppingcart, (err) => {
                                        if(!err) {
                                            FsHelper.read(Constants.USERS, context.user.email, (err, userData) => {
                                                if(!err){
                                                    delete userData.shoppingcart;
                                                    userData.order = context.user.shoppingcart;
                                                    if(!userData.orderhistory){
                                                        userData.orderhistory = new Array(context.user.shoppingcart);
                                                    } else {
                                                        userData.orderhistory.push(context.user.shoppingcart);
                                                    }
                                                    FsHelper.update(Constants.USERS, context.user.email, userData, (err) => {
                                                        if(!err){
                                                            callback(200);
                                                        } else {
                                                            callback(500, {Error : 'Could not update user info'})
                                                        }
                                                    });
                                                } else {
                                                    this.call(500, {Error : 'Could not find user'});
                                                }
                                            });
                                        } else {
                                            callback(500, {Error : 'Could not delete shopping cart'});
                                        }
                                    });
                                } else {
                                    this.call(500, {Error : 'Could not creat order'});
                                }
                            });
                        } else {
                            callback(500, {Error : 'Could not find shopping cart'});
                        }
                    });
            } else {
                callback(400, err);
            }
        });
    }

    static getOrder(reqData, callback) {

    }

    static updateOrder(reqData, callback) {

    }

    static cancelOrder(reqData, callback) {

    }
}


module.exports = services;

