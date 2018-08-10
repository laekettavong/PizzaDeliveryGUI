
/*
* Data model for app
*/

// Dependencies
const Config = require('./config');
const Currency = require('./utils').Currency;
const Colors = require('./constants').Colors;


module.exports.Person = class Person {
    constructor(firstName, lastName, email, streetAddress, city, state, zip) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.streetAddress = streetAddress;
        this.city = city;
        this.state = state;
        this.zip = zip;
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

module.exports.Pizza = class Pizza {
    constructor(size, toppings) {
        this.size = size;
        this.toppings = toppings;
        this.toppingsSet = new Set(toppings);
        this.possibleSizes = new Set(['sm', 'med', 'lg', 'sheet']);
        this.possibleToppings = new Set(['cheese', 'pepperoni', 'sausage', 'ham', 'bacon', 'mushroom', 'olive', 'orion', 'pineapple']);
        this.maxToppings = 3;
        this.costPerTopping = 2;
        this.prices = new Map([['sm', '10'], ['med', '15'], ['lg', '20'], ['sheet', '30']]);
        this.price = 0;
        this.calculatePrice();
    }

    // Calculate the total price for pizza
    calculatePrice() {
        if (this.isValidSize() && this.isValidToppings()) {
            this.price = this.prices.get(this.size.toLowerCase()) + this.calculateAdditionalCost();
        } else {
            //console.log(Colors.RED, 'Error: invalid pizza order');
            throw new Error('Error: invalid pizza order');
        }
    }

    // Validate size ordered
    isValidSize() {
        return this.possibleSizes.has(this.size.toLowerCase());
    }

    // Validate the specified toppings
    isValidToppings() {
        for (let topping of this.toppingsSet) {
            if (!this.possibleToppings.has(topping.toLowerCase())) {
                return false;
            }
        }
        return true;
    }

    // Calculate additional cost per topping beyond max free toppings
    calculateAdditionalCost() {
        if (this.toppingsSet.size > this.maxToppings) {
            return (this.toppingsSet.size - this.maxToppings) * this.costPerTopping;
        }
        return 0;
    }

    // Return the total cost of pizza
    total() {
        return this.price;
    }

    // Descriptiuon of the pizza ordered
    toString() {
        return `Item: ****** PIZZA *****\n Size: ${this.size}\n Toppings: ${this.toppings}\n Price: ${Currency[Config.currencyFormat](this.price)}`;
    }
}

module.exports.Wings = class Wings {
    constructor(seasoning) {
        this.seasoning = seasoning;
        this.possibleSeasonings = new Set(['plain', 'mild', 'hot', 'bbq', 'parmesan']);
        this.price = 10;
        this.verifyOrder();
    }

    // Verify seasoning
    verifyOrder() {
        if (!this.possibleSeasonings.has(this.seasoning.toLowerCase())) {
            //console.log(Colors.RED, 'Error: invalid wings order');
            throw new Error('Error: invalid wings order')
        }
    }

    // Return the total price of wings
    total() {
        return this.price;
    }

    // Descriptiuon of the wings ordered
    toString() {
        return `Item: ****** WINGS *****\n Seasoning: ${this.seasoning}\n Price: ${Currency[Config.currencyFormat](this.price)}`;
    }
}

module.exports.BreadSticks = class BreadSticks {
    constructor(seasoning) {
        this.seasoning = seasoning;
        this.possibleSeasonings = new Set(['plain', 'cheese', 'garlic', 'parmesan']);
        this.price = 7;
        this.verifyOrder();
    }

    // Verify seasoning
    verifyOrder() {
        if (!this.possibleSeasonings.has(this.seasoning.toLowerCase())) {
            //console.log(Colors.RED, 'Error: invalid break stick order');
            throw new Error('Error: invalid bread stick order')
        }
    }

    // Return the total price of break sticks
    total() {
        return this.price;
    }

    // Descriptiuon of the breadsticks ordered
    toString() {
        return `Item: ****** BREAD STICKS *****\n Seasoning: ${this.seasoning}\n Price: ${Currency[Config.currencyFormat](this.price)}`;
    }
}

module.exports.Soda = class Soda {
    constructor(flavor) {
        this.flavor = flavor;
        this.possibleFlavors = new Set(['coke', 'diet coke', 'pepsy', 'sprite', 'mountain dew']);
        this.price = 2.50;
        this.verifyOrder();
    }

    // Verify flavor
    verifyOrder() {
        if (!this.possibleFlavorshas(this.flavor.toLowerCase())) {
            console.log(Colors.RED, 'Error: invalid soda order');
            throw new Error('Error: invalid soda order')
        }
    }

    // Return the total price of soda
    total() {
        return this.price;
    }

    // Descriptiuon of the breadsticks ordered
    toString() {
        return `Item: ****** SODAS *****\n Flavor: ${this.flavor}\n 2 liters Price: ${Currency[Config.currencyFormat](this.price)}`;
    }
}

module.exports.Order = class Order {
    constructor(person, pizzaArray, wingsArray, breadsticksArray, sodaArray) {
        this.person = person;
        this.orderId = '@TODO';
        this.pizzaArray = pizzaArray;
        this.wingsArray = wingsArray;
        this.breadsticksArray = breadsticksArray;
        this.sodaArray = sodaArray;
    }
}

