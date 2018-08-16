/*
* FS-related tasks for orders services
*/

// Dependencies
const config = require('./config');
const stripe = require('stripe')(config.stripeKey);
const Mailgun = require('mailgun-js');
const FsHelper = require('./fs_helper');
const Constants = require('./constants');
const UserContext = require('./fs_users_services').UserContext
const Utils = require('./utils');
const StringHelper = Utils.StringHelper;
const DataModel = require('./classes');
const Pizza = DataModel.Pizza;
const Wings = DataModel.Wings;
const BreadSticks = DataModel.BreadSticks;
const Soda = DataModel.Soda;

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
        let stripeToken = StringHelper.isValidString(reqData.headers.stripe);
        if(stripeToken){
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
                                                                                callback(500, {Error : 'Counld not send order confirmation email'});
                                                                            } 
                                                                        });
                                                                    } else {
                                                                        callback(500, {Error : 'Could not charge user'});
                                                                    }                                                                
                                                                });                                                                
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
        } else {
            callback(400, {Error : 'Missing required field'});
        }
    }

    static getOrder(reqData, callback) {
        UserContext.getContext(reqData.headers.token, (err, context) => {
            if(!err && context) {
                    FsHelper.read(Constants.ORDERS, context.user.order, (err, orderData) => {
                        if(!err && orderData) {
                            callback(200, orderData)
                        } else {
                            callback(500, {Error : 'Could not find order'});
                        }
                    });
            } else {
                callback(400, err);
            }
        });
    }

    static updateOrder(reqData, callback) {
        // @TODO
    }

    static cancelOrder(reqData, callback) {
        // @TODO
    }
}

const OrderProcessor = class OrderProcessor {
    constructor(orderData){
        this.orderData = orderData;
        this.processOrder();
    }

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
                // constructor(type, size, toppings, sauce) 
                let pizza = new Pizza(order.type, order.size, order.toppings);
                let total = 
                this.invoice += `\tSize: ${order.size}\n \tToppings: ${order.toppings}\n \tQty: ${order.qty}\n \tTotal: ${order.total}\n\n`;
            });    
        }           

        if(wings) {
            this.invoice += '\n*** [Wings] *****\n'
            wings.forEach((order) => {
                // constructor(type, seasoning)
                let wings = new Wings(order.type, order.seasoning);
                this.invoice += `\tType: ${order.type}\n \tSeasoning: ${order.seasoning}\n \tQty: ${order.qty} \tTotal: ${order.total}\n\n`;
            });
        }

        if(breadsticks) {
            this.invoice += '\n*** [Bread Sticks] *****\n'
            breadsticks.forEach((order) => {
                // constructor(seasoning) 
                let breadsticks = new BreadSticks(order.seasoning);
                this.invoice += `\tSeasoning: ${order.seasoning}\n \tQty: ${order.qty} \tTotal: ${order.total}\n\n`;

            });
        }

        if(sodas) {
            this.invoice += '\n*** [Sodas] *****\n'
            sodas.forEach((order) => {
                // cconstructor(flavor) 
                let soda = new Soda(order.flavor);
                this.invoice += `\tFlavor: ${order.flavor}\n \tQty: ${order.qty} \tTotal: ${order.total}\n\n`;
            });
        }
        this.invoice += `\n\n*****[Total] :: ${this.orderData.items.total}\n`;
        console.log('Invoice:', this.invoice);
    }

    getInvoice() {
        return this.invoice;
    }

    chargeUser(context, callback) {
        stripe.charges.create({
            amount: context.user.payment.amount.replace(/(\$|\.)/g, ''),
            currency: config.currencyFormat.toLowerCase(),
            description: 'Uncle Ralph\'s Pizzia',
            source: context.user.payment.stripe,
            receipt_email: context.user.email
        }).then((charge) => {
            console.log('Sucess - user payment');
            callback(false);
        }).catch((err) => {
            console.log('User payment failed', err);
            callback(500, {Error : 'User payment failed'});
        });
    }
    
    sendConfirmationEmail(callback) {
        let mailgun = new Mailgun({apiKey: config.mailgunKey, domain: config.mailgunDomain});
        let emailObj = {
            from: config.fromEmail,
            to: this.orderData.email,
            subject: 'Uncle Ralph\'s Pizzia - your order',
            html: this.invoice
        }

        mailgun.messages().send(emailObj, (err, body) => {
            if (!err) {
                console.log(`Order confirmation email sent to: ${this.orderData.email}`);
                callback(false);
            }
            else {
                console.log('Could not send order confirmation email');
                callback(500, {Error : 'Could not send order confirmation email'})
            }
        });
    }       
}


module.exports = services;
