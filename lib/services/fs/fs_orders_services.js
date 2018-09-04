/*
* FS-related tasks for orders services
*/

// Dependencies
const config = require('./../../config');
const stripe = require('stripe')(config.stripeKey);
const Mailgun = require('mailgun-js');
const FsHelper = require('./fs_helper');
const Constants = require('./../../constants');
const UserContext = require('./fs_users_services').UserContext
const Utils = require('./../../utils');
const StringHelper = Utils.StringHelper;
const DataModel = require('./../../data_model');
const Pizza = DataModel.Pizza;
const Wings = DataModel.Wings;
const BreadSticks = DataModel.BreadSticks;
const Soda = DataModel.Soda;

const services = {
    post : (reqData, callback) => {
        OrdersServices.processOrder(reqData, callback);
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

    /*
    * Processes order, charges user and sends order confirmation/receipt email
    * 
    * @param {reqData} request data
    *       required field(s): auth token
    *       optional field(s): none
    * 
    * @param {callback}
    * 
    * @return
    */
    static processOrder(reqData, callback) {
        //let stripeToken = StringHelper.isValidString(reqData.headers.stripe);
        let stripeToken = reqData.headers.stripe ? StringHelper.isValidString(reqData.headers.stripe) : StringHelper.isValidString(reqData.payload.id);
        console.log(stripeToken);
        if(stripeToken){
            UserContext.getContext(reqData.headers.token, (err, context) => {
                console.log(reqData.headers.token, err, context);
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
                                                                context.user.payment = {
                                                                    'stripe' : stripeToken,
                                                                    'amount' : cartData.items.total
                                                                }
                                                                // Process order, charge user, send notification
                                                                let orderProcessor = new OrderProcessor(cartData);
                                                                orderProcessor.chargeUser(context, (err) => {
                                                                    if(!err) {
                                                                        orderProcessor.sendConfirmationEmail((err) => {
                                                                            if(!err){
                                                                                callback(false);
                                                                            } else {
                                                                                callback(500, {Error : Constants.ERROR_CANNOT_SENT_NOTIFICATION});
                                                                            } 
                                                                        });
                                                                    } else {
                                                                        callback(500, {Error : Constants.ERROR_PAYMENT_FAILED});
                                                                    }                                                                
                                                                });                                                                
                                                            } else {
                                                                callback(500, {Error : Constants.ERROR_CANNOT_UPDATE_USER})
                                                            }
                                                        });
                                                    } else {
                                                        this.call(500, {Error : Constants.ERROR_CANNOT_FIND_USER});
                                                    }
                                                });
                                            } else {
                                                callback(500, {Error : Constants.ERROR_CANNOT_DELETE_CART });
                                            }
                                        });
                                    } else {
                                        this.call(500, {Error : Constants.ERROR_CANNOT_CREATE_ORDER});
                                    }
                                });
                            } else {
                                callback(500, {Error : Constants.ERROR_CANNOT_FIND_CART});
                            }
                        });
                } else {
                    callback(500, {Error : Constants.ERROR_CANNOT_CREATE_CONTEXT});
                }
            });
        } else {
            callback(400, {Error : Constants.ERROR_MISSING_REQUIRED_FIELDS});
        }
    }

    /*
    * Fetches user order
    * 
    * @param {reqData} request data
    *       required field(s): auth token
    *       optional field(s): none
    * 
    * @param {callback}
    * 
    * @return JSON representation of user order
    */
    static getOrder(reqData, callback) {
        UserContext.getContext(reqData.headers.token, (err, context) => {
            if(!err && context) {
                    FsHelper.read(Constants.ORDERS, context.user.order, (err, orderData) => {
                        if(!err && orderData) {
                            callback(200, orderData)
                        } else {
                            callback(500, {Error : Constants.ERROR_CANNOT_FIND_ORDER});
                        }
                    });
            } else {
                callback(400, {Error : Constants.ERROR_CANNOT_CREATE_CONTEXT});
            }
        });
    }

    /*
    * Updates user order
    * 
    * @param {reqData} request data
    *       required field(s): auth token
    *       optional field(s): none
    * 
    * @param {callback}
    * 
    * @return
    */
    static updateOrder(reqData, callback) {
        // @TODO
    }

    /*
    * Cancels user order
    * 
    * @param {reqData} request data
    *       required field(s): auth token
    *       optional field(s): none
    * 
    * @param {callback}
    * 
    * @return
    */
    static cancelOrder(reqData, callback) {
        // @TODO
    }
}

const OrderProcessor = class OrderProcessor {
    constructor(orderData){
        this.orderData = orderData;
        this.processOrder();
    }

    /*
    * Processes the order and compiles the order receipt
    * 
    * @param 
    * 
    * @return
    */
    processOrder() {
        let pizzas = this.orderData.items.pizzas;
        let wings = this.orderData.items.wings
        let breadsticks = this.orderData.items.breadsticks;
        let sodas = this.orderData.items.sodas;
        let total = this.orderData.items.total;
        this.invoice = 'Thank you for your patronage\n';

        if(pizzas){
            this.invoice += '\n*** [Pizzas] *****\n'
            pizzas.forEach((order) => {

                let pizza = new Pizza(order.type, order.size, order.toppings);
                let total = 
                this.invoice += `\tSize: ${order.size}\n \tToppings: ${order.toppings}\n \tQty: ${order.qty}\n \tTotal: ${order.total}\n\n`;
            });    
        }           

        if(wings) {
            this.invoice += '\n*** [Wings] *****\n'
            wings.forEach((order) => {
                let wings = new Wings(order.type, order.seasoning);
                this.invoice += `\tType: ${order.type}\n \tSeasoning: ${order.seasoning}\n \tQty: ${order.qty} \tTotal: ${order.total}\n\n`;
            });
        }

        if(breadsticks) {
            this.invoice += '\n*** [Bread Sticks] *****\n'
            breadsticks.forEach((order) => {
                let breadsticks = new BreadSticks(order.seasoning);
                this.invoice += `\tSeasoning: ${order.seasoning}\n \tQty: ${order.qty} \tTotal: ${order.total}\n\n`;

            });
        }

        if(sodas) {
            this.invoice += '\n*** [Sodas] *****\n'
            sodas.forEach((order) => {
                let soda = new Soda(order.flavor);
                this.invoice += `\tFlavor: ${order.flavor}\n \tQty: ${order.qty} \tTotal: ${order.total}\n\n`;
            });
        }
        this.invoice += `\n\n*****[Total] :: ${this.orderData.items.total}\n`;
    }

    getInvoice() {
        return this.invoice;
    }

    /*
    * Fetches user data as specified by email (userId)
    * 
    * @param {context} context of user making the rewuest
    * 
    * @param {callback}
    * 
    * @return
    */
    chargeUser(context, callback) {
        stripe.charges.create({
            amount: context.user.payment.amount.replace(/(\$|\.)/g, ''),
            currency: config.currencyFormat.toLowerCase(),
            description: Constants.MENU_PIZZIA_NAME,
            source: context.user.payment.stripe,
            receipt_email: context.user.email
        }).then((charge) => {
            //console.log('Successful user payment');
            callback(false);
        }).catch((err) => {
            //console.log('User payment failed', err);
            callback(500, {Error : Constants.ERROR_PAYMENT_FAILED});
        });
    }
    
    /*
    * Sends user reciept/order confirmation email
    * 
    * @param {callback}
    * 
    * @return
    */
    sendConfirmationEmail(callback) {
        let mailgun = new Mailgun({apiKey: config.mailgunKey, domain: config.mailgunDomain});
        let emailObj = {
            from: config.fromEmail,
            to: this.orderData.email,
            subject: `${Constants.MENU_PIZZIA_NAME} - your order`,
            html: this.invoice
        }

        mailgun.messages().send(emailObj, (err, body) => {
            if (!err) {
                //console.log(`Order confirmation email sent to: ${this.orderData.email}`);
                callback(false);
            }
            else {
                //console.log(Constants.ERROR_CANNOT_SENT_NOTIFICATION, err);
                callback(500, {Error : Constants.ERROR_CANNOT_SENT_NOTIFICATION})
            }
        });
    }       
}

module.exports = services;