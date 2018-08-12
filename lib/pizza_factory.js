const Pizza = require('./datamodel').Pizza;

module.exports = class PizzaFactory {
    static createCheese(size, sauceType) {
        return new Pizza('Cheese', size, ['cheese'], toppingsArray, sauceType !== undefined ? sauceType : 'red');
    }

    static createHawaiian(size, toppingsArray, sauceType) {
        return new Pizza('Hawaiian', size, toppingsArray, toppingsArray, sauceType !== undefined ? sauceType : 'red');
    }

    static createMeatlovers(size, toppingsArray, sauceType) {
        return new Pizza('Meatlovers', size, toppingsArray, toppingsArray, sauceType !== undefined ? sauceType : 'red');
    }

    static createNewYorkStyle(size, toppingsArray, sauceType) {
        return new Pizza('New York Style', size, toppingsArray, toppingsArray, sauceType !== undefined ? sauceType : 'red');
    }

    static createOldWorld(size, toppingsArray, sauceType) {
        return new Pizza('Old World', size, toppingsArray, toppingsArray, sauceType !== undefined ? sauceType : 'red');
    }

    static createPepperoni(size, sauceType) {
        return new Pizza('Pepperoni', size, ['cheese', 'pepperoni'], toppingsArray, sauceType !== undefined ? sauceType : 'red');
    }

    static createSupreme(size, toppingsArray, sauceType) {
        return new Pizza('Supreme', size, toppingsArray, toppingsArray, sauceType !== undefined ? sauceType : 'red');
    }

    static createVeggie(size, toppingsArray, sauceType) {
        return new Pizza('Supreme', size, toppingsArray, sauceType !== undefined ? sauceType : 'red');
    }

}