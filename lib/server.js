/*
* Server-related tasks
*/

// Dependencies
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const Config = require('./config');
const Services = require('./services');
const Utils = require('./utils');
const Constants = require('./constants');
const JSONHelper = Utils.JSONHelper;
const Colors = Constants.Colors;

const router = {
    users : Services.users,
    orders : Services.orders
}

const httpsServerOptions = {
    // below two .pem files were generated using oopenssl as follows
    key : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
    cert : fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
}

const server = {
    httpServer : http.createServer((req, res) => {
        server.unifiedServer(req, res); 
    }),
    httpsServer : https.createServer(httpsServerOptions, (req, res) => {
        server.unifiedServer(req, res); 
    }),
    init : () => {
        server.httpServer.listen(Config.httpPort, () => {
            console.log(Colors.LIGHT_BLUE, `The HTTP server is listening on port ${Config.httpPort}`);
        });

        server.httpsServer.listen(Config.httpsPort, () => {
            console.log(Colors.MAGENTA, `The HTTPS server is listening on port ${Config.httpsPort}`);
        });
    },
    unifiedServer : (req, res) => {
        // Get thge URL and parse it
        let parsedUrl = url.parse(req.url, true);

        // Get the path from the URL
        let path = parsedUrl.pathname;
        let trimmedPath = path.replace(/^\/+|\/+$/g, '');
    
        // Get the query string as an object
        let queryString = parsedUrl.query;
    
        // The get teh HTTP Method
        let method = req.method.toUpperCase();
    
        // Get the headers a an object
        let headers = req.headers;
    
        // Get the payload, if any
        let decoder = new StringDecoder('utf-8');
        let buffer = '';
    
        req.on('data', (data) => {
            buffer += decoder.write(data);
        });


        req.on('end', () => {
            buffer += decoder.end();
            // Choose the handler this request should go to. If one is not found, use the notFound handler
            let serviceProvider = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : Services.invalidUri;

            // Construct the data object to sent to handler
            let reqData = {
                'trimmedPath' : trimmedPath,
                'queryString' : queryString,
                'headers' : headers,
                'method' : method,
                'payload' : JSONHelper.convertToObject(buffer)
            };

            // Route the request to the handler specified in the rounter
            serviceProvider(reqData, (statusCode, payload) => {
                // Use the status code called back by the handler, or default to 200
                statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
    
                // Use the payload called back by the handler, or defult to an empty object
                payload = typeof(payload) == 'object' ? payload : {};
    
                // Convert payload to a string
                let payloadString = JSON.stringify(payload);
    
                // Return the response
                res.setHeader('Content-Type', 'application/json')
                res.writeHead(statusCode);
                res.end(payloadString);

                // If the response is 200, print green otherwise print red
                if(statusCode == 200){
                    console.log(Colors.GREEN, `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
                } else {
                    console.log(Colors.RED, `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
                }
                //debug('Returning this response: ', statusCode, payloadString);
            });

        });
    }
}

module.exports = server;