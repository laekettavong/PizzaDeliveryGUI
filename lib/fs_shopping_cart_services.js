/*
* FS-related tasks for shopping cart services
*/

// Dependencies
const FsHelper = require('./fs_helper');
const Constants = require('./constants');
const DataModel = require('./classes');
const ShoppingCart = DataModel.ShoppingCart;
const MenuHelper = require('./menu_helper');
const Utils = require('./utils');
const StringHelper = Utils.StringHelper;
const TokenHelper = Utils.TokenHelper;

const services = {
    post : (reqData, callback) => {
        ShoppingCartServices.addItem(reqData, callback);
    },
    get : (reqData, callback) => {
        ShoppingCartServices.getItems(reqData, callback);
    },
    put : (reqData, callback) => {
        ShoppingCartServices.updateItems(reqData, callback);
    },
    delete : (reqData, callback) => {
        ShoppingCartServices.deleteItems(reqData, callback);
    }
}

const ShoppingCartServices = class ShoppingCartServices {
    // Required data: tokenId
    // Optional data: none
    static addItem(reqData, callback) {
        let email = StringHelper.isValidString(reqData.payload.email);
        let token = StringHelper.isValidString(reqData.headers.token);
        TokenHelper.verifyToken(token, email, (isValidToken) => {
                if(isValidToken){
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

                    let cartObj = shoppingCart.constructCart();
                    //console.log(shoppingCart.getJSON());
                    
                    ShoppingCartHelper.saveCart(email, cartObj, callback);
                    //callback(false);
                } else {
                    callback(403, {Error : 'Token is invalid'});
                } 
            });
    }

    static getItems(reqData, callback) {
        ShoppingCartHelper.getCart(reqData, (err, cartData) => {
            if(!err && cartData){
               // console.log(cartData.items.total, JSON.stringify(cartData.items.sodas));
                callback(200, cartData);
            }else {
                callback(400);
            }
        });
       
    }

    static updateItems(reqData, callback) {

    }

    static deleteItems(reqData, callback) {
        
    }
}

const ShoppingCartHelper = class ShoppingCartHelper {
    static saveCart(email, cartObj, callback) {
        let fileName = `shoppingcart-${email}`;
        FsHelper.read(Constants.CARTS, fileName, (err, data) => {
            if(err) {
                // Store shopping cart
                FsHelper.create(Constants.CARTS, fileName, cartObj, (err) => {

                    if(!err){
                        callback(200);
                    } else {
                        callback(500, {Error : 'Could not persist shopping cart'});
                    }
                });
            } else {
                callback(400, {Error : 'Shopping cart alreay exists'});
            }
        });
    }

    static getCart(reqData, callback)  {
        let email = StringHelper.isValidEmail(reqData.queryString.email);
        if(email){
            let token = StringHelper.isValidString(reqData.headers.token);
            let fileName = `shoppingcart-${email}`;
            TokenHelper.verifyToken(token, email, (isValidToken) => {
                if(isValidToken){
                    FsHelper.read(Constants.CARTS, fileName, (err, cartData) => {
                        if(!err && cartData){
                            callback(false, cartData);
                        }else {
                            callback(400);
                        }
                    })
                } else {
                    callback(403, {Error : 'Token is invalid'});
                }
            });
        } else {
            callback(400, {Error : 'Missing required field: email'});
        }
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