const Pizza = require('./classes').Pizza;

module.exports = class PizzaFactory {
    static create(pizza) {
        switch(pizza.type) {   
            case 'hawaiian':
                PizzaFactory.createHawaiian(pizza);
                break;     
            case 'meatlovers':
                PizzaFactory.createMeatlovers(pizza);
                break;     
            case 'new york style':
                PizzaFactory.createNewYorkStyle(pizza);
                break;     
            case 'old world':
                PizzaFactory.createOldWorld(pizza);
                break;     
            case 'createPepperoni':
                PizzaFactory.createPepperoni(pizza);
                break;     
            case 'supreme':
                PizzaFactory.createSupreme(pizza);
                break;     
            case 'veggie':
                PizzaFactory.createVeggie(pizza);
                break;
            default :
                PizzaFactory.createCheese(pizza);
        }
    }

    static createCheese(pizza) {
        return new Pizza('cheese', pizza.size, ['cheese'], pizza.sauceType);
    }

    static createHawaiian(pizza) {
        return new Pizza('hawaiian', pizza.size, pizza.toppings);
    }

    static createMeatlovers(pizza) {
        return new Pizza('meatlovers', pizza.size, pizza.toppings);
    }

    static createNewYorkStyle(pizza) {
        return new Pizza('new york style', pizza.size, pizza.toppings);
    }

    static createOldWorld(pizza) {
        return new Pizza('old world', pizza.size, pizza.toppings);
    }

    static createPepperoni(pizza) {
        return new Pizza('pepperoni', pizza.size, ['cheese', 'pepperoni']);
    }

    static createSupreme(pizza) {
        return new Pizza('supreme', pizza.size, pizza.toppings);
    }

    static createVeggie(pizza) {
        return new Pizza('veggie', pizza.size, pizza.toppings, pizza.sauce);
    }
}