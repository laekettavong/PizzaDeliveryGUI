/*
* FS-related tasks for shopping cart services
*/

// Dependencies
const FsHelper = require('./fs_helper');
const Constants = require('./../../constants');
const DataModel = require('./../../data_model');
const ShoppingCart = DataModel.ShoppingCart;
const MenuHelper = require('./../../menu_helper');
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
    // Requred data: email, token, payload items
    // Optional data: none
    static saveCart(reqData, callback) {
        let email = StringHelper.isValidEmail(reqData.payload.email);
        let token = StringHelper.isValidString(reqData.headers.token);
        if(email && token && reqData.payload.items) {
            TokenHelper.verifyToken(token, email, (isValidToken) => {
                if(isValidToken){      
                    FsHelper.read(Constants.USERS, email, (err, userData) => {
                        if(!err && userData) {
                            if(!userData.shoppingcart) {
                                userData.shoppingcart = RandomGenerator.generateString(25);
                            }
                            FsHelper.read(Constants.CARTS, userData.shoppingcart, (err, data) => {
                                if(err) {
                                    // Store shopping cart
                                    reqData.payload.id = userData.shoppingcart;
                                    FsHelper.create(Constants.CARTS, reqData.payload.id, reqData.payload, (err) => {
                                        if(!err){
                                            //callback(200);
                                            FsHelper.update(Constants.USERS, email, userData, (err) => {
                                                if(!err){
                                                    callback(false);
                                                } else {
                                                    callback(500, {Error : 'Could not create user shopping cart'});
                                                }
                                            });
                                        } else {
                                            callback(500, {Error : 'Could not persist shopping cart'});
                                        }
                                    });
                                } else {
                                    callback(400, {Error : 'Shopping cart alreay exists'});
                                }
                            });
                        } else {
                            callback(403, {Error : 'Not authorized, token is invalid'});
                        }
                    });
                } else {
                    callback(403, {Error : 'Not authorized, token is invalid'});
                }
            });
        } else {
            callback(400, {Error : 'Missing required fields'})            
        }
    }

    // Requred data: email, token, payload items
    // Optional data: none
    static getCart(reqData, callback) {
        let email = StringHelper.isValidEmail(reqData.queryString.email);
        let token = StringHelper.isValidString(reqData.headers.token);
        if(email && token){

            TokenHelper.verifyToken(token, email, (isValidToken) => {
                if(isValidToken){
                    FsHelper.read(Constants.USERS, email, (err, userData) => {
                        if(!err && userData) {
                            FsHelper.read(Constants.CARTS, userData.shoppingcart, (err, cartData) => {
                                if(!err && cartData){
                                    delete cartData.email;
                                    delete cartData.id;
                                    callback(false, cartData);
                                }else {
                                    callback(500, {Error : 'Could not find shopping cart'});
                                }
                            });
                        } else {
                            callback(500, {Error : 'Could not find user'});
                        }
                    });
                } else {
                    callback(403, {Error : 'Token is invalid'});
                }
            });
        } else {
            callback(400, {Error : 'Missing required fields'})            
        }         
    }

    static updateCart(reqData, callback) {
        let email = StringHelper.isValidEmail(reqData.payload.email);
        let token = StringHelper.isValidString(reqData.headers.token);
        if(email && token && reqData.payload.items) {
            TokenHelper.verifyToken(token, email, (isValidToken) => {
                if(isValidToken){
                    FsHelper.read(Constants.USERS, email, (err, userData) => {
                        if(!err && userData) {
                            reqData.payload.id = userData.shoppingcart;
                            FsHelper.update(Constants.CARTS, userData.shoppingcart, reqData.payload, (err) => {                
                                if(!err) {
                                    callback(200);
                                } else {
                                    callback(500, {Error : 'Could not update shopping cart'})
                                }
                            });
                        } else {
                            callback(500, {Error : 'Could not find user'});
                        }
                    });
                } else {
                    callback(403, {Error : 'Token is invalid'});
                }
            });
        } else {
            callback(400, {Error : 'Missing required fields'})            
        }
    }

    // Requred data: email, token
    // Optional data: none
    static deleteCart(reqData, callback) {
        let email = StringHelper.isValidEmail(reqData.payload.email);
        let token = StringHelper.isValidString(reqData.headers.token);
        if(email && token){
            TokenHelper.verifyToken(token, email, (isValidToken) => {
                if(isValidToken){
                    FsHelper.read(Constants.USERS, email, (err, userData) => {
                        if(!err && userData) {
                            FsHelper.delete(Constants.CARTS, userData.shoppingcart, (err)=> {
                                if(!err) {
                                    delete userData.shoppingcart;
                                    FsHelper.update(Constants.USERS, email, userData, (err) => {
                                        if(!err){
                                            callback(200);
                                        } else {
                                            calbback(500, {Error : 'Could not update user while emptying shopping cart'});
                                        }
                                    });
                                } else {
                                    calbback(500, {Error : 'Could not delete shopping cart'});
                                }
                            });                               
                        } else {
                            callback(500, {Error : 'Could not find user'});
                        }
                    });
                } else {
                    callback(403, {Error : 'Token is invalid'});
                }
            });
        } else {
            callback(400, {Error : 'Missing required fields'})            
        }

    }

    // Construct fake shopping cart JSON for testing
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

        // Sample POST payload
        /*
            {
                "email":"laekettavong@gmail.com",
                "pizzas": [
                    {
                        "category": "pizza",
                        "type": "Cheese",
                        "size": "med",
                        "toppings": [
                            "cheese"
                        ],
                        "total": "$30.00",
                        "qty": 2,
                        "id": "m7ocndh7yofh"
                    },
                    {
                        "category": "pizza",
                        "type": "Pepperoni",
                        "size": "lg",
                        "toppings": [
                            "cheese",
                            "pepperoni"
                        ],
                        "total": "$20.00",
                        "qty": 1,
                        "id": "vglwo16whtir"
                    }
                ],
                "wings": [
                    {
                        "category": "wings",
                        "type": "traditional",
                        "seasoning": "bbq",
                        "total": "$40.00",
                        "qty": 4,
                        "id": "6be0mcevmtbr"
                    },
                    {
                        "category": "wings",
                        "type": "boneless",
                        "seasoning": "parmesan",
                        "total": "$10.00",
                        "qty": 1,
                        "id": "v7ig5qu7w3yx"
                    }
                ],
                "breadsticks": [
                    {
                        "category": "breadsticks",
                        "seasoning": "garlic",
                        "total": "$14.00",
                        "qty": 2,
                        "id": "xbgq9trioa87"
                    }
                ],
                "sodas": [
                    {
                        "category": "soda",
                        "flavor": "Diet Coke",
                        "total": "$5.00",
                        "qty": 2,
                        "id": "6llx265ck69p"
                    },
                    {
                        "category": "soda",
                        "flavor": "Sprite",
                        "total": "$2.50",
                        "qty": 1,
                        "id": "k9ojcxtknlbf"
                    }
                ],
                "total": "$121.50"
            }
        */
    }
}

module.exports = services;


/*
{
    "pizzas": [
        {
            "category": "pizza",
            "type": "Cheese",
            "size": "med",
            "toppings": [
                "cheese"
            ],
            "total": "$30.00",
            "qty": 2,
            "id": "m7ocndh7yofh"
        },
        {
            "category": "pizza",
            "type": "Pepperoni",
            "size": "lg",
            "toppings": [
                "cheese",
                "pepperoni"
            ],
            "total": "$20.00",
            "qty": 1,
            "id": "vglwo16whtir"
        }
    ],
    "wings": [
        {
            "category": "wings",
            "type": "traditional",
            "seasoning": "bbq",
            "total": "$40.00",
            "qty": 4,
            "id": "6be0mcevmtbr"
        },
        {
            "category": "wings",
            "type": "boneless",
            "seasoning": "parmesan",
            "total": "$10.00",
            "qty": 1,
            "id": "v7ig5qu7w3yx"
        }
    ],
    "breadsticks": [
        {
            "category": "breadsticks",
            "seasoning": "garlic",
            "total": "$14.00",
            "qty": 2,
            "id": "xbgq9trioa87"
        }
    ],
    "sodas": [
        {
            "category": "soda",
            "flavor": "Diet Coke",
            "total": "$5.00",
            "qty": 2,
            "id": "6llx265ck69p"
        },
        {
            "category": "soda",
            "flavor": "Sprite",
            "total": "$2.50",
            "qty": 1,
            "id": "k9ojcxtknlbf"
        }
    ],
    "total": "$121.50"
}

 */