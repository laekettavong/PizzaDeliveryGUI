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
// const Wings = DataModel.Wings; ///
// const BreadSticks = DataModel.BreadSticks;
// const Soda = DataModel.Soda;
//const MenuHelper = require('./../../menu_helper');
const Utils = require('./../../utils');
const StringHelper = Utils.StringHelper;
//const TokenHelper = Utils.TokenHelper;
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
        let token = reqData.headers.token ? StringHelper.isValidString(reqData.headers.token) : StringHelper.isValidString(reqData.queryString.token);
        if(token) {
            UserContext.getContext(token, (err, context) => {
                if(!err && context) {
                    FsHelper.read(Constants.CARTS, context.user.shoppingcart, (err, cartData) => {
                        if(!err && cartData){
                            //delete cartData.email;
                            //delete cartData.id;
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
        if(token) {
            UserContext.getContext(token, (err, context) => {
                if(!err && context) {
                    // If shopping cart doesn't exist, create one
                    if(!context.user.shoppingcart){
                        reqData.payload = ShoppingCartHelper.constructCart(context.user.email, reqData);
                        ShoppingCartServices.saveCart(reqData, callback)
                    } else {
                        ShoppingCartServices.getCart(reqData, (err, cartData) => {
                            if(!err && cartData) {
                                //reqData.payload.id = context.user.shoppingcart;
                                let itemKey = reqData.payload.itemId;
                                let itemCategory = StringHelper.isValidString(reqData.payload.itemCategory);
                                if(itemKey && itemCategory) {
                                    let itemToRemove = {
                                        'key' : itemKey,
                                        'category' :  itemCategory
                                    }
                                    reqData.payload = ShoppingCartHelper.removeFromCart(itemToRemove, cartData);
                                } else {
                                    reqData.payload = ShoppingCartHelper.addToCart(reqData, cartData);
                                }
                                
                                FsHelper.update(Constants.CARTS, context.user.shoppingcart, reqData.payload, (err) => {                
                                    if(!err) {
                                        callback(200, reqData.payload,);
                                    } else {
                                        callback(500, {Error : Constants.ERROR_CANNOT_UPDATE_CART})
                                    }
                                });
                            } else {
                                callback(500, {Error : Constants.ERROR_CANNOT_FIND_CART});
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
                            callback(500, {Error : Constants.ERROR_CANNOT_DELETE_CART});
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


const ShoppingCartHelper = class ShoppingCartHelper {
   /*
    * Constructs the shopping cart JSON
    * 
    * @param {email} user ID
    * @param {reqData} request data
    * 
    * @return a new shopping cart literal object
    */
    static constructCart(email, reqData){
        let shoppingCart = new ShoppingCart(email);
        switch(reqData.payload.category.toLowerCase()){
            case Constants.MENU_SODA.toLowerCase():
                shoppingCart.addItem(this.getSodaJSON(reqData.payload));
                break;
            
            case Constants.MENU_BREADSTRICKS.toLowerCase():
                shoppingCart.addItem(this.getBreadsticksJSON(reqData.payload));
                break;

            case Constants.MENU_WINGS.toLowerCase():
                shoppingCart.addItem(this.getWingsJSON(reqData.payload));
                break;
            
            case Constants.MENU_PIZZA.toLowerCase():
                shoppingCart.addItem(this.getPizzaJSON(reqData.payload));
                break;
        }

        return shoppingCart.constructCart();
    }

    /*
    * Updates an exisiting shop[ping cart
    * 
    * @param {reqData} cart item to be added/updated
    * @param {cartData} existing cart JSON
    * 
    * @return an updated shopping cart literal object
    */
    static addToCart(reqData, cartData){
       let shoppingCart = ShoppingCartHelper.unmarshallCart(cartData);
        switch(reqData.payload.category.toLowerCase()){
            case Constants.MENU_SODA.toLowerCase():
                shoppingCart.addItem(this.getSodaJSON(reqData.payload));
                break;
            
            case Constants.MENU_BREADSTRICKS.toLowerCase():
                shoppingCart.addItem(this.getBreadsticksJSON(reqData.payload));
                break;

            case Constants.MENU_WINGS.toLowerCase():
                shoppingCart.addItem(this.getWingsJSON(reqData.payload));
                break;
            
            case Constants.MENU_PIZZA.toLowerCase():
                shoppingCart.addItem(this.getPizzaJSON(reqData.payload));
                break;
        }

        return shoppingCart.constructCart();
    }


    /*
    * Updates an exisiting shop[ping cart
    * 
    * @param {reqData} cart item to be added/updated
    * @param {cartData} existing cart JSON
    * 
    * @return an updated shopping cart literal object
    */
   static removeFromCart(item, cartData){
    let shoppingCart = ShoppingCartHelper.unmarshallCart(cartData);
    shoppingCart.removeItem(item);
    return shoppingCart.constructCart();
 }

    /*
    * Reconstructs shopping cart from datastore
    * 
    * @param {cartData} existing cart JSON from datastore
    * 
    * @return an updated shopping cart literal object
    */
    static unmarshallCart(cartData) {
        let shoppingCart = new ShoppingCart(cartData.email);
        let pizzaArray = cartData.items.pizzas;
        let wingsArray = cartData.items.wings;
        let breadsticksArray = cartData.items.breadsticks;
        let sodaArray = cartData.items.sodas;

        sodaArray.forEach((soda) => {
            shoppingCart.addItem(this.getSodaJSON(soda));
        });

        breadsticksArray.forEach((breadsticks) => {
            shoppingCart.addItem(this.getBreadsticksJSON(breadsticks));
        });

        wingsArray.forEach((wings) => {
            shoppingCart.addItem(this.getWingsJSON(wings));
        });

        pizzaArray.forEach((pizza) => {
            shoppingCart.addItem(this.getPizzaJSON(pizza));
        });

        return shoppingCart;
    }

    /*
    * Reconstructs soda JSON
    * 
    * @param {payload} data object
    * 
    * @return a soda literal object
    */
    static getSodaJSON(payload) {
        return {
            category : Constants.MENU_SODA.toLowerCase(),
            flavor : payload.flavor.toLowerCase(),
            total: Menu.getSodaPrice() * payload.qty,
            qty : payload.qty,
            id : payload.id
        }
    }

    /*
    * Reconstructs breadsticks JSON
    * 
    * @param {payload} data object
    * 
    * @return a breadstick literal object
    */
    static getBreadsticksJSON(payload) {
        return {
            category : Constants.MENU_BREADSTRICKS.toLocaleLowerCase(),
            seasoning : payload.seasoning.toLowerCase(),
            total: Menu.getBreadSticksPrice() * payload.qty,
            qty : payload.qty,
            id : payload.id
        }
    }

    /*
    * Reconstructs chicken wings JSON
    * 
    * @param {payload} data object
    * 
    * @return a wings literal object
    */
    static getWingsJSON(payload) {
        return {
            category : Constants.MENU_WINGS.toLowerCase(),
            type : payload.type.toLowerCase(),
            seasoning : payload.seasoning.toLowerCase(),
            total: Menu.getWingsPrice() * payload.qty,
            qty : payload.qty,
            id : payload.id
        }
    }
    
    /*
    * Reconstructs pizza JSON
    * 
    * @param {payload} data object
    * 
    * @return a pizza literal object
    */
    static getPizzaJSON(payload) {
        let pizzaObj = new Pizza(payload.type, payload.size, payload.toppings);
        return {
            category : Constants.MENU_PIZZA.toLowerCase(),
            type : payload.type.toLowerCase(),
            size : payload.size.toLowerCase(),
            toppings : payload.toppings,
            total: pizzaObj.getPrice() * payload.qty,
            qty : payload.qty,
            id : payload.id
        }
    }
}

module.exports = services;
module.exports.ShoppingCartServices = ShoppingCartServices;