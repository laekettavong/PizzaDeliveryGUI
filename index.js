/*
* Entry file for API
*/

// Dependencies
const server = require('./lib/server');

// Declare the app
let app = {
    init : () => {
        server.init();
    }
}

app.init();

// Export the app
module.exports = app;