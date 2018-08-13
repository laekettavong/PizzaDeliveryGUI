const Menu = require('./data_model').Menu;
const Currency = require('./utils').Currency;

module.exports = class MenuHelper {
    // @TODO: fetch menu data from file (i.e. menu.json)
    static constructMenu() {
        const pizzaTypes = new Object();
        Menu.getPizzaTypeDescriptionsMap().forEach((description, type) => {
            pizzaTypes[type] = description;
        });

        const pizza = new Object();
        pizza.description = Menu.getPizzaDescription();
        pizza.types = pizzaTypes;

        const sizes = new Object();
        Menu.getPizzaPricesMap().forEach((price, size) => {
            sizes[size] = Currency.USD(Number.parseInt(price));
        });

        pizza.sizes = sizes;
        pizza.toppings = Array.from(Menu.getPizzaToppingsSet().values());
        pizza.maxFreeToppings = Menu.getMaxFreeToppings();
        pizza.additionalToppingPrice = Currency.USD(Menu.getToppingPrice());

        const wings = new Object();
        wings.description = Menu.getWingsDecription();
        wings.seasoning = Array.from(Menu.getWingsSeasoningsSet().values());
        wings.price = Currency.USD(Menu.getWingsPrice());

        const breadSticks = new Object();
        breadSticks.description = Menu.getBreadSticksDescription();
        breadSticks.seasoning = Array.from(Menu.getBreadSticksSeasoningSet().values());
        breadSticks.price = Currency.USD(Menu.getBreadSticksPrice());

        const sodas = new Object();
        sodas.description = Menu.getSodaDescription();
        sodas.flavors = Array.from(Menu.getSodaFlavorsSet().values());
        sodas.price = Currency.USD(Menu.getSodaPrice());

        const menuObj = new Object();
        menuObj.name = 'Uncle Ralph\'s Pizzia';
        menuObj.pizza = pizza;
        menuObj.wings = wings;
        menuObj.breadSticks = breadSticks;
        menuObj.sodas = sodas;

        return menuObj;
    }
}