
/*
* Data model for app
*/

// Dependencies
const Config = require('./config');
const Utils = require('./utils');
const Currency = Utils.Currency;
const RandomGenerator = Utils.RandomGenerator;
const Constants = require('./constants');
const Colors = Constants.Colors;
const ImageMap = Constants.ImageMap;


module.exports.Person = class Person {
    constructor(firstName, lastName, email, address, city, state, zip) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.address = address;
        this.city = city;
        this.state = state;
        this.zip = zip;
        this.creditCard;
    }
}

module.exports.CreditCard = class CreditCard {
    constructor(firstName, lastName, brand, number, securityCode, expiresYear, expiresMonth) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.brand = brand;
        this.number = number;
        this.securityCode = securityCode;
        this.expiresYear = expiresYear;
        this.expiresMonth = expiresMonth;
        this.verifyExpirationDate();
    }

    verifyExpirationDate() {
        if (Date.now() > new Date(this.expiresYear, this.expiresMonth)) {
            //console.log(Colors.RED, 'Error: credit card has expired');
            throw new Error('Error: credit card has expired');
        }
    }
}

const ShoppingCart = class ShoppingCart {
    constructor(email) {
        this.email = email;
        this.pizzaMap = new Map();
        this.wingsMap = new Map();
        this.breadsticksMap = new Map();
        this.sodaMap = new Map();
    }

    addItem(item) {
        if(item.category.toLowerCase() === 'pizza') {
            return this.addPizza(item);
        } else if(item.category.toLowerCase() === 'wings') {
            return this.addWings(item);
        } else if(item.category.toLowerCase() === 'breadsticks') {
            return this.addBreadSticks(item);
        } else if(item.category.toLowerCase() === 'soda') {
            return this.addSoda(item);
        }
    }

    addPizza(pizza) {
        try {
            // Remove existing item before upating
            this.pizzaMap.forEach((cartPizza, key) => {
                if(pizza.type == cartPizza.type && pizza.size == cartPizza.size) {
                    this.removePizza(key);
                }
            });
            // does not guantee key id uniqiness, it'll do for now
            return this.pizzaMap.set(pizza.id ? pizza.id : RandomGenerator.generateString(12), pizza);
        } catch(err) {
            console.log(Colors.RED, 'Error while attempting to add pizza to shopping cart', err);
            return false;
        }
    }

    addWings(wings) {
        try {
            // Remove existing item before upating
            this.wingsMap.forEach((cartWings, key) => {
                if(wings.seasoning == cartWings.seasoning && wings.type == cartWings.type) {
                    this.removeWings(key);
                }
            });
            // does not guantee key id uniqiness, it'll do for now
            return this.wingsMap.set(wings.id ? wings.id : RandomGenerator.generateString(12), wings);
        } catch(err) {
            console.log(Colors.RED, 'Error while attempting to add wings to shopping cart', err);
            return false;
        }
    }

    addBreadSticks(breadsticks) {
        try {
            // Remove existing item before upating
            this.breadsticksMap.forEach((cartBreadsticks, key) => {
                if(breadsticks.seasoning == cartBreadsticks.seasoning) {
                    this.removeBreadSticks(key);
                }
            });

            return this.breadsticksMap.set(breadsticks.id ? breadsticks.id : RandomGenerator.generateString(12), breadsticks);
        } catch(err) {
            console.log(Colors.RED, 'Error while attempting to add bread sticks to shopping cart', err);
            return false;
        }
    }

    addSoda(soda) {
        try {

            // Remove existing item before upating
            this.sodaMap.forEach((cartSoda, key) => {
                if(soda.flavor == cartSoda.flavor) {
                    this.removeSoda(key);
                }
            });

            // does not guantee key id uniqiness, it'll do for now
            return this.sodaMap.set(soda.id ? soda.id : RandomGenerator.generateString(12), soda);
        } catch(err) {
            console.log(Colors.RED, 'Error while attempting to add soda to shopping cart', err);
            return false;
        }
    }

    removeItem(item, generateNewKey) {
        if(item.category.toLowerCase() === 'pizza') {
            this.removePizza(item.key);
        } else if(item.category.toLowerCase() === 'wings') {
            this.removeWings(item.key);
        } else if(item.category.toLowerCase() === 'breadsticks') {
            this.removeBreadSticks(item.key);
        } else if(item.category.toLowerCase() === 'soda') {
            this.removeSoda(item.key);
        }
    }

    removePizza(itemKey) {
        try {
            return this.pizzaMap.delete(itemKey);
        } catch(err) {
            console.log(Colors.RED, 'Error while attempting to remove pizza from shopping cart', err);
            return false;
        }
    }

    removeWings(itemKey) {
        try {
            return this.wingsMap.delete(itemKey);
        } catch(err) {
            console.log(Colors.RED, 'Error while attempting to remove wings from shopping cart', err);
            return false;
        }
    }

    removeBreadSticks(itemKey) {
        try {
            return this.breadsticksMap.delete(itemKey);
        } catch(err) {
            console.log(Colors.RED, 'Error while attempting to remove bread sticks from shopping cart', err);
            return false;
        }
    }

    removeSoda(itemKey) {
        try {
            return this.sodaMap.delete(itemKey);
        } catch(err) {
            console.log(Colors.RED, 'Error while attempting to remove soda from shopping cart', err);
            return false;
        }
    }

    getPizzas() {
        return this.pizzaMap;
    }

    getWings() {
        return this.wingsMap;
    }

    getBreadSticks() {
        return this.breadsticksMap;
    }

    getSodas() {
        return this.sodaMap;
    }

    emptyCart() {
        this.pizzaMap.clear();
        this.wingsMap.clear();
        this.breadsticksMap.clear();
        this.sodaMap.clear();
    }

    constructCart(){
        
        // {category: 'pizza', type: 'New York Style', toppings:['ham','peppers','ham'], sauce: 'white', total: 20, qty: 2}
        // {category: 'wings', type: 'traditionl', seasoning: 'bbq', total: 10, qty: 1}
        // {category: 'breadsticks', seasoning: 'garlic', total: 20, qty: 2}
        //  category: 'soda', seasoning: 'diet coke', total: 5, qty: 1}

        try {
            let pizzaSet = new Set();
            let totalPrice = 0;
            this.pizzaMap.forEach((pizza, key) => {
                pizza.id = key;
                totalPrice += pizza.total;
                pizza.total = Currency.USD(pizza.total);
                pizzaSet.add(pizza);
            });

            let wingsSet = new Set();
            this.wingsMap.forEach((wings, key) => {
                wings.id = key;
                totalPrice += wings.total;
                wings.total = Currency.USD(wings.total);
                wingsSet.add(wings);
            });

            let breadsticksSet = new Set();
            this.breadsticksMap.forEach((breadsticks, key) => {
                breadsticks.id = key;
                totalPrice += breadsticks.total;
                breadsticks.total = Currency.USD(breadsticks.total);
                breadsticksSet.add(breadsticks);
            });

            let sodaSet = new Set();
            this.sodaMap.forEach((soda, key) => {
                soda.id = key;
                totalPrice += soda.total;
                soda.total = Currency.USD(soda.total);
                sodaSet.add(soda);
            });

            let items = {};
            items.pizzas = Array.from(pizzaSet.values());
            items.wings = Array.from(wingsSet.values());
            items.breadsticks = Array.from(breadsticksSet.values());
            items.sodas = Array.from(sodaSet.values());
            //items.total = Currency.USD(totalPrice);
            
            this.cartJSON = {};
            this.cartJSON.items = items;
            this.cartJSON.total = Currency.USD(totalPrice);
            this.cartJSON.email = this.email;

            return this.cartJSON;
        } catch(err) {
            console.log('Error while attempting to construct cart', err);
            return false;
        }
    }

    getJSON() {
        return JSON.stringify(this.cartJSON);
    }
}

const Menu = class Menu {
    // Pizza
    static getPizzaDescription() {
        return 'Our signature pizzas are made to order with the freshest ingredients, premium toppings, and real cheese.'
    }

    static getPizzaTypeDescriptionsMap() {
        return new Map([['cheese', 'Plain cheese pizza with red sauce.'],
            ['hawaiian', 'Ham, pineapple, and mozzarella cheese.'],
            ['meatlovers', 'Ham, pepperoni, sausage, meatballs, bacon, and mozzarella cheese.'],
            ['new york style', 'A \'New York style\' thin and crispy crust with red sauce, mozzarella cheese, and oregano.'],
            ['old world', 'Thin crust, white garlic sauce, mozzarella cheese, pepperoni, sausage, onions, a special red sauce, and a blend of spices.'],
            ['pepperoni', 'Plain cheese and pepperoni.'],
            ['supreme', 'Pepperoni, sausage, onions, peppers, mushrooms, olives, and mozzarella cheese.'],
            ['veggie', 'Pepperoni, sausage, onions, green peppers, banana peppers, mushrooms, black olives, and mozzarella cheese (red or white sauce).']]);
    }
    static getImageMap() {
        return ImageMap;
    }

    static getPizzaTypesSet() {
        return new Set(Array.from(Menu.getPizzaTypeDescriptionsMap().keys()));
    }

    static getPizzaToppingsSet() {
        return new Set(['cheese', 'mozzarella cheese', 'pepperoni', 'sausage', 'ham', 'bacon', 'chicken', 'meatballs', 'mushrooms', 'olives', 'onions', 'pineapple', 'peppers']);
    }

    static getPizzaPricesMap() {
        return new Map([['sm', '10'], ['med', '15'], ['lg', '20'], ['sheet', '30']]);
    }

    static getPizzaSizesSet() {
        return new Set(Array.from(Menu.getPizzaPricesMap().keys()));
    }

    static getPizzaSauceSet() {
        return new Set(['red', 'white']);
    }

    static getMaxFreeToppings() {
        return 3;
    }

    static getToppingPrice() {
        return 2;
    }

    // Wings
    static getWingsDecription() {
        return 'Choose bonesless wings or traditional wings, each order comes with 10 wings and includes Uncle Ralph\'s signature seasoning, and blue cheese and celery.'
    }

    static getWingsSeasoningsSet() {
        return new Set(['mild', 'hot', 'bbq', 'parmesan']);
    }

    static getWingsTypesSet() {
        return new Set(['traditional', 'boneless']);
    }

    static getWingsPrice() {
        return 10;
    }

    // Bread sticks
    static getBreadSticksDescription() {
        return 'Fresh-baked, award winning giant breadsticks brushed with garlic sauce and seasonings.'
    }

    static getBreadSticksSeasoningSet() {
        return new Set(['butter', 'cheese', 'garlic', 'parmesan']);
    }

    static getBreadSticksPrice() {
        return 7;
    }

    // Sodas
    static getSodaDescription() {
        return 'We carry Pepsi products - Pepsi, Diet Pepsi, Mountain Dew, and Sierra Mist.';
    }

    static getSodaFlavorsSet() {
        return new Set(['pepsi', 'diet pepsi', 'pepsi zero', 'mountain dew', 'diet mountain dew', 'sierra mist']);
    }

    static getSodaPrice() {
        return 2.50;
    }
}

module.exports.Pizza = class Pizza {
    constructor(type, size, toppings, sauce) {
        this.type = type;
        this.size = size;
        this.toppings = toppings;
        this.sauce = sauce !== undefined ? sauce : 'red';
        this.toppingsSet = new Set(toppings);
        this.price = 0;
        this.description = Menu.getPizzaTypeDescriptionsMap().get(this.type);
        this.calculatePrice();
    }

    // Calculate the total price for pizza
    calculatePrice() {
        if (this.isValidPizza()) {
            this.price = Number.parseFloat(Menu.getPizzaPricesMap().get(this.size.toLowerCase())) + Number.parseFloat(this.calculateAdditionalCost());
        } else {
            console.log(Colors.RED, 'Error: invalid pizza order');
            throw new Error('Error: invalid pizza order');
        }
    }

    // Validate pizza order
   isValidPizza() {
        return this.isValidType() && this.isValidSize() && this.isValidToppings() && this.isValidSauce();
    }
    // Validate the specified pizza type
    isValidType() {
        return Menu.getPizzaTypesSet().has(this.type.toLowerCase());
    }

    // Validate size ordered
    isValidSize() {
        return Menu.getPizzaSizesSet().has(this.size.toLowerCase());
    }

    // Validate the specified toppings
    isValidToppings() {
        for (let topping of this.toppingsSet) {
            if (!Menu.getPizzaToppingsSet().has(topping.toLowerCase())) {
                return false;
            }
        }
        return true;
    }

    // Validate sauce type
    isValidSauce() {
        return Menu.getPizzaSauceSet().has(this.sauce.toLowerCase());
    }

    // Calculate additional cost per topping beyond max free toppings
    calculateAdditionalCost() {
        if (this.toppingsSet.size > Menu.getMaxFreeToppings()) {
            return (this.toppingsSet.size - Menu.getMaxFreeToppings()) * Menu.getToppingPrice();
        }
        return 0;
    }

    // Return the total cost of pizza
    getPrice() {
        return this.price;
    }

    // Descriptiuon of the pizza ordered
    toString() {
        return `\tSize: ${this.size}\n \tToppings: ${this.toppings}\n \tPrice: ${Currency[Config.currencyFormat](Number.parseFloat(this.price))}\n`;
    }
}

module.exports.Wings = class Wings {
    constructor(type, seasoning) {
        this.type = type;
        this.seasoning = seasoning;
        this.verifyOrder();
    }

    // Verify seasoning
    verifyOrder() {
        if (!Menu.getWingsSeasoningsSet().has(this.seasoning.toLowerCase()) || !Menu.getWingsTypesSet().has(this.type.toLowerCase())) {
            //console.log(Colors.RED, 'Error: invalid wings order');
            throw new Error('Error: invalid wings order')
        }
    }

    // Return the total price of wings
    total() {
        return Menu.getWingsPrice();
    }

    // Descriptiuon of the wings ordered
    toString() {
        return `*** [WINGS] *****\n \tType: ${this.type}\n \tSeasoning: ${this.seasoning}\n \tPrice: ${Currency[Config.currencyFormat](Number.parseFloat(Menu.getWingsPrice()))}\n`;
    }
}

module.exports.BreadSticks = class BreadSticks {
    constructor(seasoning) {
        this.seasoning = seasoning;
        this.verifyOrder();
    }

    // Verify seasoning
    verifyOrder() {
        if (!Menu.getBreadSticksSeasoningSet().has(this.seasoning.toLowerCase())) {
            //console.log(Colors.RED, 'Error: invalid break stick order');
            throw new Error('Error: invalid bread stick order')
        }
    }

    // Return the total price of break sticks
    total() {
        return Menu.getBreadSticksPrice();
    }

    // Descriptiuon of the breadsticks ordered
    toString() {
        return `*** [BREAD STICKS] *****\n \tSeasoning: ${this.seasoning}\n \tPrice: ${Currency[Config.currencyFormat](Number.parseFloat(Menu.getBreadSticksPrice()))}\n`;
    }
}

module.exports.Soda = class Soda {
    constructor(flavor, qty) {
        this.flavor = flavor;
        this.verifyOrder();
        this.qty = qty;
    }

    // Verify flavor
    verifyOrder() {
        if (!Menu.getSodaFlavorsSet().has(this.flavor.toLowerCase())) {
            console.log(Colors.RED, 'Error: invalid soda order');
            throw new Error('Error: invalid soda order')
        }
    }

    // Return the total price of soda
    total() {
        return Menu.getSodaPrice() * this.qty;
    }

    // Descriptiuon of the breadsticks ordered
    toString() {
        return `*** [SODAS] *****\n \tFlavor: ${this.flavor}\n \tTwo Liters Price: ${Currency[Config.currencyFormat](Number.parseFloat(Menu.getSodaPrice()))}\n`;
    }
}

module.exports.ShoppingCart = class ShoppingCart {
    constructor(email){
        
    }
}


module.exports.Menu = Menu;
module.exports.ShoppingCart = ShoppingCart;
