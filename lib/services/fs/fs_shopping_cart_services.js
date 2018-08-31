/*
* FS-related tasks for shopping cart services
*/

// Dependencies
const FsHelper = require('./fs_helper');
const UserContext = require('./fs_users_services').UserContext
const Constants = require('./../../constants');
const DataModel = require('./../../data_model');
const ShoppingCart = DataModel.ShoppingCart;
const Menu = DataModel.Menu;
const Pizza = DataModel.Pizza;
const Wings = DataModel.Wings;
const BreadSticks = DataModel.BreadSticks;
const Soda = DataModel.Soda;
//const MenuHelper = require('./../../menu_helper');
const Utils = require('./../../utils');
const StringHelper = Utils.StringHelper;
const TokenHelper = Utils.TokenHelper;
const RandomGenerator = Utils.RandomGenerator;

const services = {
    post : (reqData, callback) => {
        ShoppingCartServices.saveCart(reqData, callback);
    },
    get : (reqData, callback) => {
        ShoppingCartServices.getCart(reqData, callback);
    },
    put : (reqData, callback) => {
        ShoppingCartServices.updateCart(reqData, callback);
    },
    delete : (reqData, callback) => {
        ShoppingCartServices.deleteCart(reqData, callback);
    }
}


const ShoppingCartServices = class ShoppingCartServices {
   /*
    * Persists user shopping cart
    * 
    * @param {reqData} request data
    *       required field(s): auth token
    *       optional field(s): none
    * 
    * @param {callback}
    * 
    * @return
    */
    static saveCart(reqData, callback) {
        let token = StringHelper.isValidString(reqData.headers.token);
        if(token) {
            UserContext.getContext(token, (err, context) => {
                if(!err && context) {
                    if(!context.user.shoppingcart) {
                        context.user.shoppingcart = RandomGenerator.generateString(25);
                    }
                    FsHelper.read(Constants.CARTS, context.user.shoppingcart, (err, data) => {
                        if(err) {
                            // Store shopping cart
                            FsHelper.create(Constants.CARTS, context.user.shoppingcart, reqData.payload, (err) => {
                                if(!err){
                                    FsHelper.update(Constants.USERS, context.user.email, context.user, (err) => {
                                        if(!err){
                                            callback(200, {Success : Constants.SUCCESS_CART_SAVED});
                                        } else {
                                            callback(500, {Error : Constants.ERROR_CANNOT_FIND_USER});
                                        }
                                    });
                                } else {
                                    callback(500, {Error : Constants.ERROR_CANNOT_SAVE_CART});
                                }
                            });
                        } else {
                            callback(400, {Error : Constants.ERROR_CART_EXISTS});
                        }
                    });
                } else {
                    callback(400, {Error : Constants.ERROR_CANNOT_PERFORM_OPERATION});
                }
            });
        } else {
            callback(400, {Error : Constants.ERROR_CANNOT_FIND_TOKEN});
        }
    }

   /*
    * Fetches user shopping cart
    * 
    * @param {reqData} request data
    *       required field(s): auth token
    *       optional field(s): none
    * 
    * @param {callback}
    * 
    * @return user shopping cart in JSON format
    */
    static getCart(reqData, callback) {
        let token = StringHelper.isValidString(reqData.headers.token);
        if(token) {
            UserContext.getContext(token, (err, context) => {
                if(!err && context) {
                    FsHelper.read(Constants.CARTS, context.user.shoppingcart, (err, cartData) => {
                        if(!err && cartData){
                            delete cartData.email;
                            delete cartData.id;
                            callback(false, cartData);
                        }else {
                            callback(500, {Error : Constants.ERROR_CANNOT_FIND_CART});
                        }
                    });  
                } else {
                    callback(400, {Error : Constants.ERROR_CANNOT_PERFORM_OPERATION});
                }
            });
        } else {
            callback(400, {Error : Constants.ERROR_MISSING_AUTH_TOKEN});
        }
    }

    /*
    * Updates user shopping cart
    * 
    * @param {reqData} request data
    *       required field(s): auth token
    *       optional field(s): none
    * 
    * @param {callback}
    * 
    * @return
    */
    static updateCart(reqData, callback) {
        let token = StringHelper.isValidString(reqData.headers.token);
        //console.log("AddCart", reqData.payload);
        if(token) {
            UserContext.getContext(token, (err, context) => {
                if(!err && context) {

                    console.log("LOAD",JSON.stringify(reqData.payload));
                    // If shopping cart doesn't exist, create one
                    if(!context.user.shoppingcart){
                        let shoppingCart = new ShoppingCart(context.user.email);
                        if(reqData.payload.category.toLowerCase() == 'soda') {
                            let soda = {
                                category : 'soda',
                                flavor : reqData.payload.flavor,
                                total: Menu.getSodaPrice() * reqData.payload.qty,
                                qty : reqData.payload.qty
                            }
                            shoppingCart.addItem(soda);
                        } else if(reqData.payload.category.toLowerCase() == 'breadsticks') {
                            let breadsticks = {
                                category : 'breadsticks',
                                seasoning : reqData.payload.seasoning,
                                total: Menu.getBreadSticksPrice() * reqData.payload.qty,
                                qty : reqData.payload.qty
                            }
                            shoppingCart.addItem(breadsticks);
                        } else if(reqData.payload.category.toLowerCase() == 'wings') {
                            let wings = {
                                category : 'wings',
                                seasoning : reqData.payload.seasoning,
                                total: Menu.getWingsPrice() * reqData.payload.qty,
                                qty : reqData.payload.qty
                            }
                            shoppingCart.addItem(wings);
                        } else if(reqData.payload.category.toLowerCase() == 'pizza') {
                            let pizzaObj = new Pizza(reqData.payload.type, reqData.payload.size, reqData.payload.toppings);
                            let pizza = {
                                category : 'pizza',
                                type : reqData.payload.type,
                                size : reqData.payload.size,
                                toppings : reqData.payload.toppings,
                                total: pizzaObj.getPrice() * reqData.payload.qty,
                                qty : reqData.payload.qty
                            }
                            shoppingCart.addItem(pizza);
                        }

                        reqData.payload = shoppingCart.constructCart();
                        console.log("PAYLOAD", reqData.payload);
                        ShoppingCartServices.saveCart(reqData, callback)
               
                    } else {


                        reqData.payload.id = context.user.shoppingcart;
                        FsHelper.update(Constants.CARTS, context.user.shoppingcart, reqData.payload, (err) => {                
                            if(!err) {
                                callback(200, {Success : Constants.SUCCESS_CART_UPDATED});
                            } else {
                                callback(500, {Error : Constants.ERROR_CANNOT_UPDATE_CART})
                            }
                        });
                    }

                } else {
                    callback(400, {Error : Constants.ERROR_CANNOT_PERFORM_OPERATION});
                }
            });
        } else {
            callback(400, {Error : Constants.ERROR_MISSING_AUTH_TOKEN});
        }
    }


    static updateCartOLD(reqData, callback) {
        let token = StringHelper.isValidString(reqData.headers.token);
        if(token) {
            UserContext.getContext(token, (err, context) => {
                if(!err && context) {
                    reqData.payload.id = context.user.shoppingcart;
                    FsHelper.update(Constants.CARTS, context.user.shoppingcart, reqData.payload, (err) => {                
                        if(!err) {
                            callback(200, {Success : Constants.SUCCESS_CART_UPDATED});
                        } else {
                            callback(500, {Error : Constants.ERROR_CANNOT_UPDATE_CART})
                        }
                    });
                } else {
                    callback(400, {Error : Constants.ERROR_CANNOT_PERFORM_OPERATION});
                }
            });
        } else {
            callback(400, {Error : Constants.ERROR_MISSING_AUTH_TOKEN});
        }
    }

   /*
    * Deletes user shopping cart
    * 
    * @param {reqData} request data
    *       required field(s): auth token
    *       optional field(s): none
    * 
    * @param {callback}
    * 
    * @return
    */
    static deleteCart(reqData, callback) {
        let token = StringHelper.isValidString(reqData.headers.token);
        if(token) {
            UserContext.getContext(token, (err, context) => {
                if(!err && context) {
                    FsHelper.delete(Constants.CARTS, context.user.shoppingcart, (err)=> {
                        if(!err) {
                            delete context.user.shoppingcart;
                            FsHelper.update(Constants.USERS, context.user.email, context.user, (err) => {
                                if(!err){
                                    callback(200, {Success : Constants.SUCCESS_CART_DELETED});
                                } else {
                                    calbback(500, {Error : Constants.ERROR_CANNOT_UPDATE_USER});
                                }
                            });
                        } else {
                            calbback(500, {Error : Constants.ERROR_CANNOT_DELETE_CART});
                        }
                    });  
                } else {
                    callback(400, {Error : Constants.ERROR_CANNOT_PERFORM_OPERATION});
                }
            });
        } else {
            callback(400, {Error : Constants.ERROR_MISSING_AUTH_TOKEN});
        }
    }

   /*
    * Constructs test shopping cart JSON for testing
    * 
    * @param {email} email
    *       required field(s): email
    *       optional field(s): none
    * 
    * @param {callback}
    * 
    * @return JSON representation of user shopping cart
    */
    static constructTestShoppingCart(email) {
        let shoppingCart = new ShoppingCart(email);
        let pizza1 = {
            category : 'pizza',
            type : 'Cheese',
            size : 'med',
            toppings : ['cheese'],
            total: 30,
            qty : 2
        }

        let pizza2= {
            category : 'pizza',
            type : 'Pepperoni',
            size : 'lg',
            toppings : ['cheese', 'pepperoni'],
            total: 20,
            qty : 1
        }

        let wings1 = {
            category : 'wings',
            type : 'traditional',
            seasoning : 'bbq',
            total : 40,
            qty: 4
        }

        let wings2 = {
            category : 'wings',
            type : 'boneless',
            seasoning : 'parmesan',
            total : 10,
            qty: 1
        }


        let breadsticks = {
            category : 'breadsticks',
            seasoning : 'garlic',
            total : 14,
            qty : 2
        }

        let soda1 = {
            category : 'soda',
            flavor : 'Diet Coke',
            total: 5,
            qty : 2
        }

        let soda2 = {
            category : 'soda',
            flavor : 'Sprite',
            total: 2.5,
            qty : 1
        }
    
        shoppingCart.addItem(pizza1);
        shoppingCart.addItem(pizza2);
        shoppingCart.addItem(wings1);
        shoppingCart.addItem(wings2);
        shoppingCart.addItem(breadsticks);
        shoppingCart.addItem(soda1);
        shoppingCart.addItem(soda2);

        return shoppingCart.constructCart();
    }
}

module.exports = services;