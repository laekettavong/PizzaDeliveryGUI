
const fs = require('fs');
const path = require('path');
const Config = require('./../../config');
const Utils = require('./../../utils');
const StringHelper = Utils.StringHelper;
const ShoppingCartServices = require('./fs_shopping_cart_services').ShoppingCartServices;
const Model = require('./../../data_model');
const Menu = Model.Menu;

const FsTemplate = {
    baseDir : path.join(__dirname, './../../../templates/'),
    readFile : (templateName, callback) => {
        fs.readFile(`${FsTemplate.baseDir}${templateName}.html`, 'utf8', (err, str) => {
            if(!err && str && StringHelper.isValidString(str)) {
                callback(false, str);
            } else {
                callback('Template not found');
            }
        });
    }
}

// Get the contents of a static (public) asset
const FsPublic = {
    baseDir : path.join(__dirname, './../../../public/'),

    /*
    * Fetches static resource
    * 
    * @param {fileName} resource to fetch
    * @param {callback}
    * 
    * @return
    * 
    */
    getStaticAsset : (fileName, callback) => {
        fileName = StringHelper.isValidString(fileName);
        if(fileName) {
            fs.readFile(`${FsPublic.baseDir}${fileName}`, (err, data) => {
                if(!err && data) {
                    callback(false, data);
                } else {
                    callback('No template could be found');
                }
             });
        } else {
            callback('A valid file was not specified');
        }
    }
}

const FsHtmlServices = class FsHtmlServices {

    /*
    * Constructs the HTML for the default/index page
    * 
    * @param {data} request data
    * @param {callback}
    * 
    * @return
    * 
    */
    static index(data, callback) {
        // Reject any request  that isn't a GET
        if(data.method.toLowerCase() == 'get') {
            // Prepare data for interpolation
            let templateData = {
                'head.title' : 'Uncle Ralph\'s Pizzia',
                'head.description' : 'Welcome to Uncle Ralph\'s Pizzia',
                'body.class' : 'index',

            };
            FsHtmlServices.constructHtml('index', templateData, callback);
        } else {
            callback(405, undefined, 'html');
        }
    }

    /*
    * Constructs the HTML for the menu page
    * 
    * @param {data} request data
    * @param {callback}
    * 
    * @return
    * 
    */
    static menu(data, callback) {
        // Reject any request  that isn't a GET
        if(data.method.toLowerCase() == 'get') {
            // Prepare data for interpolation
            let templateData = {
                'head.title' : 'Uncle Ralph\'s Pizzia Menu',
                'head.description' : 'All our pizzas are made with the freshest ingredients',
                'body.class' : 'menu'
            };
            FsHtmlServices.constructHtml('menu', templateData, callback);
        } else {
            callback(405, undefined, 'html');
        }
    }

    /*
    * Constructs the HTML for sign up page
    * 
    * @param {data} request data
    * @param {callback}
    * 
    * @return
    * 
    */
    static accountCreate(data, callback) {
        // Reject any request  that isn't a GET
        if(data.method.toLowerCase() == 'get') {
            // Prepare data for interpolation
            let templateData = {
                'head.title' : 'Uncle Ralph\'s Pizzia Registration',
                'head.description' : 'Welcome, please sign up',
            };
            FsHtmlServices.constructHtml('accountCreate', templateData, callback);
        } else {
            callback(405, undefined, 'html');
        }
    }

    /*
    * Constructs the HTML for the account settings page
    * 
    * @param {data} request data
    * @param {callback}
    * 
    * @return
    * 
    */
    static accountEdit(data, callback) {
        // Reject any request  that isn't a GET
        if(data.method.toLowerCase() == 'get') {
            // Prepare data for interpolation
            let templateData = {
                'head.title' : 'Account Setting',
                'body.class' : 'accountEdit'
            };
            FsHtmlServices.constructHtml('accountEdit', templateData, callback);
        } else {
            callback(405, undefined, 'html');
        }
    }

    /*
    * Constructs the HTML for the account deletion page
    * 
    * @param {data} request data
    * @param {callback}
    * 
    * @return
    * 
    */
    static accountDeleted(data, callback) {
        // Reject any request  that isn't a GET
        if(data.method.toLowerCase() == 'get') {
            // Prepare data for interpolation
            let templateData = {
                'head.title' : 'Account Deleted',
                'head.description' : 'Your account has been deleted',
                'body.class' : 'accountDeleted'
            };
            FsHtmlServices.constructHtml('accountDeleted', templateData, callback);
        } else {
            callback(405, undefined, 'html');
        }
    }

    /*
    * Constructs the HTML for the shopping cart
    * 
    * @param {data} request data
    * @param {callback}
    * 
    * @return
    * 
    */
    static shoppingCart(data, callback) {
        // Reject any request  that isn't a GET
        if(data.method.toLowerCase() == 'get') {
            // Prepare data for interpolation
            let templateData = {
                'head.title' : 'Shopping Cart',
                'head.description' : 'Your account has been deleted',
                'body.class' : 'shoppingcart'
            };
            FsHtmlServices.constructShoppingCartHtml(data, 'shoppingCart', templateData, callback);
        } else {
            callback(405, undefined, 'html');
        }
    }

    /*
    * Constructs the HTML for the login page
    * 
    * @param {data} request data
    * @param {callback}
    * 
    * @return
    * 
    */
    static sessionCreate(data, callback) {
        // Reject any request  that isn't a GET
        if(data.method.toLowerCase() == 'get') {
            // Prepare data for interpolation
            let templateData = {
                'head.title' : 'Login to your Account',
                'head.description' : 'Please enter your email and password to access you account',
                'body.class' : 'sessionCreate'
            };
            FsHtmlServices.constructHtml('sessionCreate', templateData, callback);
        } else {
            callback(405, undefined, 'html');
        }
    }

    /*
    * Constructs the HTML for the logout page
    * 
    * @param {data} request data
    * @param {callback}
    * 
    * @return
    * 
    */
    static sessionDeleted(data, callback) {
        // Reject any request  that isn't a GET
        if(data.method.toLowerCase() == 'get') {
            // Prepare data for interpolation
            let templateData = {
                'head.title' : 'Logout',
                'head.description' : 'You have been logged out of your account',
                'body.class' : 'sessionDeleted'
            };
            FsHtmlServices.constructHtml('sessionDeleted', templateData, callback);
        } else {
            callback(405, undefined, 'html');
        }
    }

    /*
    * Constructs the HTML for a given page from templates
    * 
    * @param {templateName} target HTML template
    * @param {templateData} template data to interpolate
    * @param {callback}
    * 
    * @return
    * 
    */
    static constructHtml(templateName, templateData, callback) {
        FsHtmlServices.getTemplate(templateName, templateData, (err, str) => {
            if(!err && str) {
                // Add the universal header and footer
                FsHtmlServices.addUniversalTemplates(str, templateData, (err, str) => {
                    if(!err && str) {
                        // Return the page as HTML
                        callback(200, str, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    }

    /*
    * Constructs the HTML body for shopping cart
    * 
    * @param {reqData} request data
    * @param {templateName} target HTML template
    * @param {templateData} template data to interpolate
    * @param {callback}
    * 
    * @return
    * 
    */
    static constructShoppingCartHtml(reqData, templateName, templateData, callback) {
        FsHtmlServices.getTemplate(templateName, templateData, (err, str) => {
            if(!err && str) {
                ShoppingCartServices.getCart(reqData, (err, cartData) => {
                    if(!err && cartData) {
                        let pizzaArray = cartData.items.pizzas;
                        let wingsArray = cartData.items.wings;
                        let breadsticksArray = cartData.items.breadsticks;
                        let sodaArray = cartData.items.sodas;

                        pizzaArray.forEach((pizza) => {
                            let imageKey = StringHelper.replaceWhiteSpace(pizza.type, '-');
                            let pizzaType = StringHelper.capitalizeAllFirstLetter(pizza.type);
                            let toppings = pizza.toppings.join(", ");
                            str += FsHtmlServices.getShoppingCartItemForm(pizza.id, pizza.category, Menu.getImageMap().get(`${pizza.category}-${imageKey}`), `<strong>Pizza:</strong> ${pizza.qty} order(s) of ${pizzaType} with toppings:  ${toppings}<br><br>Total: ${pizza.total}`);
                        });

                        wingsArray.forEach((wings) => {
                            let imageKey = StringHelper.replaceWhiteSpace(wings.seasoning, '-');
                            str += FsHtmlServices.getShoppingCartItemForm(wings.id, wings.category, Menu.getImageMap().get(`${wings.category}-${imageKey}`), `<strong>Wings:</strong> ${wings.qty} order(s) of ${wings.seasoning} ${wings.type} chicken wings <br><br>Total: ${wings.total}`);
                        });

                        breadsticksArray.forEach((sticks) => {
                            let imageKey = StringHelper.replaceWhiteSpace(sticks.seasoning, '-');
                            str += FsHtmlServices.getShoppingCartItemForm(sticks.id, sticks.category, Menu.getImageMap().get(`${sticks.category}-${imageKey}`), `<strong>Breadsticks:</strong> ${sticks.qty} order(s) of freshly-baked ${sticks.seasoning} bread sticks <br><br>Total: ${sticks.total}`);
                        });

                        sodaArray.forEach((soda) => {
                            let imageKey = StringHelper.replaceWhiteSpace(soda.flavor, '-');
                            let flavor = StringHelper.capitalizeAllFirstLetter(soda.flavor);
                            str += FsHtmlServices.getShoppingCartItemForm(soda.id, soda.category, Menu.getImageMap().get(`${soda.category}-${imageKey}`), `<strong>Soda:</strong> ${soda.qty} two liters of ${flavor} <br><br>Total: ${soda.total}`);
                        });

                        str += FsHtmlServices.getShoppingCartFooter(cartData.total);
                    } else {
                        str += FsHtmlServices.getShoppingCartFooter(cartData.total);
                    }
                    // Add the universal header and footer
                    FsHtmlServices.addUniversalTemplates(str, templateData, (err, str) => {
                        if(!err && str) {
                            // Return the page as HTML
                            callback(200, str, 'html');
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    }

    /*
    * HTML template for shopping cart items
    * 
    * @param {id} cart item id
    * @param {category} item category
    * @param {image} URL to item image
    * @param {caption} description of item
    * 
    * @return
    * 
    */
    static getShoppingCartItemForm(id, category, image, caption) {
        return `                    
            <form id="${id}" class="itemForm" action="/api/shoppingcart" method="PUT" enctype="application/json">
                <div class="container cartItems">
                <div class="row">
                    <div class="col-md-3">
                    <div class="thumbnail">
                        <img src="${image}" style="width:100%;">
                    </div>
                    </div>
                    <div class="col-md-9">
                        <div class="row shoppingCartCaption">${caption}</div>
                        <input type="hidden" name="itemId" value="${id}"/>
                        <input type="hidden" name="itemCategory" value="${category}"/>
                        <input type="hidden" name="_method" value="PUT"/>
                        <button type="submit" class="btn btn-primary">Delete</button>
                    </div>
                </div>
                </div>
            </form>`;
    }

    /*
    * HTML template for shopping cart footer
    * 
    * @param {total} total amount for items in cart
    * 
    * @return
    * 
    */
    static getShoppingCartFooter(total) {
        if(total){
            return `
                <div class="container">
                    <div class="alert alert-info hide-elem">
                        <strong>Empty Cart!</strong> Please return to menu to add more items.
                    </div>
                </div>
            
                <div class="container" id="placeOrderBtn">
                <h3 id="cartTotal">Total: ${total} </h3>
                <br>
                    <a href="#" class="btn btn-primary" role="button" data-toggle="modal" data-target="#orderModal">Place Order</a>
                </div>
                `;
        } else {
            return `
                <div class="container">
                    <div class="alert alert-info">
                        <strong>Empty Cart!</strong> Please return to menu to add more items.
                    </div>
                </div>
                `;
        }

    }

    /*
    * Constructs HTML, swapping varibles with values
    * 
    * @param {templateName} template file name to interpole
    * @param {templateData} data to interpolate with template
    * @param {callback}
    * 
    * @return
    * 
    */
    static getTemplate(templateName, templateData, callback) {
        templateName = StringHelper.isValidString(templateName);
        templateData = StringHelper.isValidObject(templateData);
        if(templateName && templateData) {
            FsTemplate.readFile(templateName, (err, str) => {
                if(!err && str) {
                    callback(false, FsHtmlServices.interpolate(str, templateData));
                } else {
                    callback('Template not found');
                }
            });
        } else {
            callback('A valid template name was not specified'); 
        }
    }

    /*
    * Swaps out palceholders with real values
    * 
    * @param {str} target string to interoplate
    * @param {data} 
    * @param {callback}
    * 
    * @return
    * 
    */
    static interpolate(str, data) {
        str = !StringHelper.isValidString(str) ? '' : str;
        data = StringHelper.isValidObject(data);

        // Add the templateGlobals to the data object, prepending their key name with "global" 
        for(let key in Config.templateGlobals) {
            if(Config.templateGlobals.hasOwnProperty(key)) {
                data[`global.${key}`] = Config.templateGlobals[key];
            }
        }

        // For each key in the data object, insert its value into the string a the corresponding placeholder
        for(let key in data) {
            if(data.hasOwnProperty(key) && typeof(data[key]) == 'string') {
                let replace = data[key];
                let find = `{${key}}`;
                str = str.replace(find, replace);
            }
        }
        return str;
    }

    /*
    * Stitches the header and footer to the target page template
    * 
    * @param {str} target string to interoplate
    * @param {data} template values
    * @param {callback}
    * 
    * @return
    * 
    */
    static addUniversalTemplates(str, data, callback) {
        str = !StringHelper.isValidString(str) ? '' : str;
        data = StringHelper.isValidObject(data);
        // Get the header
        FsHtmlServices.getTemplate('header', data, (err, headerStr) => {
            if(!err && headerStr) {
                // Get the footer
                FsHtmlServices.getTemplate('footer', data, (err, footerStr) => {
                    if(!err && footerStr) {
                        // Add them all together
                        callback(false, `${headerStr}${str}${footerStr}`);
                    } else {
                        callback('Could not find th footer template');
                    }
                });
            } else {
                callback('Could not find th header template');
            }
        });
    }

    /*
    * Fetches static favicon.ico data
    * 
    * @param {data}
    * @param {callback}
    * 
    * @return
    * 
    */
    static favicon(data, callback) {
        if(data.method.toLowerCase() == 'get') {
            FsPublic.getStaticAsset('favicon.ico', (err, data) => {
                if(!err && data) {
                    callback(200, data, 'favicon');
                } else {
                    callback(500);
                }
            });
        } else {
            callback(405);
        }
    }

    /*
    * Fetches static resources from 'public' directory
    * 
    * @param {data}
    * @param {callback}
    * 
    * @return
    * 
    */
    static public(data, callback) {
        if(data.method.toLowerCase() == 'get') {
            let assetName = data.trimmedPath.replace('public/', '').trim();
            if(assetName.length > 0) {
                FsPublic.getStaticAsset(assetName, (err, data) => {
                    if(!err && data) {
                        let contentType = 'plain';

                        if(assetName.indexOf('.css') > -1){
                            contentType = 'css';
                        }

                        if(assetName.indexOf('.png') > -1){
                            contentType = 'png';
                        }

                        if(assetName.indexOf('.jpg') > -1){
                            contentType = 'jpg';
                        }

                        if(assetName.indexOf('.ico') > -1){
                            contentType = 'favicon';
                        }

                        callback(200, data, contentType);
                    } else {
                        callback(404);
                    }
                });
            } else {
                callback(404);
            }
        } else {
            callback(405);
        }
    }
}

module.exports = FsHtmlServices;