
/*
* Data model for app
*/

// Dependencies
const Config = require('./config');
const Currency = require('./utils').Currency;
const Colors = require('./constants').Colors;


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

const Menu = class Menu {
    // Pizza
    static getPizzaDescription() {
        return 'Our signature pizzas are made to order with the freshest ingredients.'
    }

    static getPizzaTypeDescriptionsMap() {
        return new Map([['Cheese', 'Plain cheese pizza with red sauage.'],
            ['Hawaiian', 'Ham, pineapple, and mozzarella cheese.'],
            ['Meatlovers', 'Ham, pepperoni, sausage, meatballs, bacon, and mozzarella cheese.'],
            ['New York Style', 'A \'New York style\' thin and crispy crust with red sauce, mozzarella cheese, and oregano.'],
            ['Old World', 'Thin crust, white garlic sauce, mozzarella cheese, pepperoni, sausage, onions, a special red sauce, and a blend of spices.'],
            ['Pepperoni', 'Plain cheese and pepperoni.'],
            ['Supreme', 'Pepperoni, sausage, onions, peppers, mushrooms, olives, and mozzarella cheese.'],
            ['Veggie', 'Pepperoni, sausage, onions, green peppers, banana peppers, mushrooms, black olives, and mozzarella cheese (red or white sauce).']]);
    }

    static getPizzaTypesSet() {
        //return new Set(['Cheese', 'Hawaiian', 'Meatlovers', 'New York Style', 'Old World', 'Pepperoni', 'Supreme', 'Veggie']);
        return new Set(Array.from(Menu.getPizzaTypeDescriptionsMap().keys()));
    }

    static getPizzaToppingsSet() {
        return new Set(['cheese', 'mozzarella cheese', 'pepperoni', 'sausage', 'ham', 'bacon', 'chicken', 'meatballs', 'mushrooms', 'olives', 'orions', 'pineapple', 'peppers']);
    }

    static getPizzaPricesMap() {
        return new Map([['sm', '10'], ['med', '15'], ['lg', '20'], ['sheet', '30']]);
    }

    static getPizzaSizesSet() {
        //return new Set(['sm', 'med', 'lg', 'sheet']);
        return new Set(Array.from(Menu.getPizzaPricesMap().keys));
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
        return new Set(['plain', 'mild', 'hot', 'bbq', 'parmesan']);
    }

    static getWingsPrice() {
        return 10;
    }

    // Bread sticks
    static getBreadSticksDescription() {
        return 'Fresh award winning giant bread sticks.'
    }

    static getBreadSticksSeasoningSet() {
        return new Set(['butter', 'cheese', 'garlic', 'parmesan']);
    }

    static getBreadSticksPrice() {
        return 7;
    }

    // Sodas
    static getSodaDescription() {
        return 'We carry both Coke and Pepsi products.'
    }

    static getSodaFlavorsSet() {
        return new Set(['Coke', 'Diet Coke', 'Pepsi', 'Sprite', 'Mountain Dew']);
    }

    static getSodaPrice() {
        return 2.50;
    }
}

module.exports.Pizza = class Pizza {
    constructor(type, size, toppings, sauce) {
        this.size = size;
        this.toppings = toppings;
        this.sauce = sauce;
        this.type = type;
        this.toppingsSet = new Set(toppings);
        this.price = 0;
        this.description = Mendu.getPizzaDescriptionsMap().get(this.type);
        this.calculatePrice();
    }

    // Calculate the total price for pizza
    calculatePrice() {
        if (this.isValidType() && this.isValidSize() && this.isValidToppings() && this.isValidSauce()) {
            this.price = Menu.getPizzaPricesMap().get(this.size.toLowerCase()) + this.calculateAdditionalCost();
        } else {
            //console.log(Colors.RED, 'Error: invalid pizza order');
            throw new Error('Error: invalid pizza order');
        }
    }

    // Validate the specified pizza type
    isValidType() {
        Menu.getPizzaTypesSet().forEach((pizzaType) => {
            if(pizzaType.toLowerCase() === this.type.toLowerCase()){
                isValid = true;
            }
        });
        return false;
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
        this.verifyOrder();
    }

    // Verify seasoning
    verifyOrder() {
        if (!Menu.getWingsSeasoningsSet().has(this.seasoning.toLowerCase())) {
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
        return `Item: ****** WINGS *****\n Seasoning: ${this.seasoning}\n Price: ${Currency[Config.currencyFormat](this.price)}`;
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
        return `Item: ****** BREAD STICKS *****\n Seasoning: ${this.seasoning}\n Price: ${Currency[Config.currencyFormat](this.price)}`;
    }
}

module.exports.Soda = class Soda {
    constructor(flavor) {
        this.flavor = flavor;
        this.verifyOrder();
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
        return Menu.getSodaPrice();
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

module.exports.ShoppingCart = class ShoppingCart {
    constructor(email){
        
    }
}


module.exports.Menu = Menu;
