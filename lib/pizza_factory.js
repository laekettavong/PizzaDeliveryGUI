const Pizza = require('./classes').Pizza;

module.exports = class PizzaFactory {
    static create(pizza) {
        switch(pizza.type) {
            case 'cheese':
                PizzaFactory.createCheese(pizza);
                break;     
        }

    }


    static createCheese(pizza) {
        return new Pizza('Cheese', pizza.size, ['cheese'], pizza.sauceType);
    }

    static createHawaiian(pizza) {
        return new Pizza('Hawaiian', pizza.size, toppingsArray);
    }

    static createMeatlovers(size, toppingsArray, sauceType) {
        return new Pizza('Meatlovers', size, toppingsArray);
    }

    static createNewYorkStyle(size, toppingsArray, sauceType) {
        return new Pizza('New York Style', size, toppingsArray);
    }

    static createOldWorld(size, toppingsArray, sauceType) {
        return new Pizza('Old World', size, toppingsArray);
    }

    static createPepperoni(size, sauceType) {
        return new Pizza('Pepperoni', size, ['cheese', 'pepperoni'], sauceType);
    }

    static createSupreme(size, toppingsArray, sauceType) {
        return new Pizza('Supreme', size, toppingsArray, sauceType);
    }

    static createVeggie(size, toppingsArray, sauceType) {
        return new Pizza('Supreme', size, toppingsArray, sauceType);
    }

}