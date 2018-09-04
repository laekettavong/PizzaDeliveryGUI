/*
* Server-related tasks
*/

// Dependencies
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const util = require('util');
const debug = util.debuglog('servers');
const StringDecoder = require('string_decoder').StringDecoder;
const Config = require('./config');
const Services = require('./services/services');
const Utils = require('./utils');
const Constants = require('./constants');
const JSONHelper = Utils.JSONHelper;
const Colors = Constants.Colors;

const router = {
    '' : Services.index,
    'menu' : Services.menu,
    'session/create' : Services.sessionCreate,
    'session/deleted' : Services.sessionDeleted,
    'account/create' : Services.accountCreate,
    'account/edit' : Services.accountEdit,
    'account/deleted' : Services.accountDeleted,
    'account/shoppingCart' : Services.shoppingCart,
    'favicon.ico' : Services.favicon,
    'public' : Services.public,
    'ping' : Services.ping,
    'api/users' : Services.userApi,
    'api/login' : Services.loginApi,
    'api/logout' : Services.logoutApi,
    'api/shoppingcart' : Services.shoppingcartApi,
    'api/orders' : Services.orderApi,

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

        // The get the HTTP Method
        let method = req.method.toUpperCase();
        
        // Get the headers a an object
        let headers = req.headers;
    
        let contype = req.headers['content-type'];

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

            serviceProvider = trimmedPath.indexOf('public/') > -1 ? Services.public : serviceProvider;

            // Construct the data object to sent to handler
            let reqData = {
                'trimmedPath' : trimmedPath,
                'queryString' : queryString,
                'headers' : headers,
                'method' : method,
                'payload' : JSONHelper.convertToObject(buffer)
            };

            // Route the request to the handler specified in the rounter
            serviceProvider(reqData, (statusCode, payload, contentType) => {
                // Use the status code called back by the handler, or default to 200
                statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
    
                // Detemerine the type of response (fallback to JSON)
                contentType = typeof(contentType) == 'string' ? contentType : 'json';

                // Return the response parts that are content-specific
                let payloadString = '';
                if(contentType == 'json') {
                    res.setHeader('Content-Type', 'application/json');
                    payload = typeof(payload) == 'object' ? payload : {};
                    payloadString = JSON.stringify(payload);
                }

                if(contentType == 'html'){
                    res.setHeader('Content-Type', 'text/html');
                    payloadString = typeof(payload) == 'string'? payload : '';
                  }
         
                  if(contentType == 'favicon'){
                    res.setHeader('Content-Type', 'image/x-icon');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                  }
         
                  if(contentType == 'plain'){
                    res.setHeader('Content-Type', 'text/plain');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                  }
         
                  if(contentType == 'css'){
                    res.setHeader('Content-Type', 'text/css');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                  }
         
                  if(contentType == 'png'){
                    res.setHeader('Content-Type', 'image/png');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                  }
         
                  if(contentType == 'jpg'){
                    res.setHeader('Content-Type', 'image/jpeg');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                  }
         
                  if(contentType == 'plain'){
                    res.setHeader('Content-Type', 'text/plain');
                    payloadString = typeof(payload) !== 'undefined' ? payload : '';
                  }

                  // Return the response-parts common to all content-types
                  res.writeHead(statusCode);
                  res.end(payloadString);

                // If the response is 200, print green otherwise print red
                if(statusCode == 200){
                    debug(Colors.GREEN, `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
                } else {
                    debug(Colors.RED, `${method.toUpperCase()} /${trimmedPath} ${statusCode}`);
                }
                //debug('Returning this response: ', statusCode, payloadString);
            });
        });
    }
}

module.exports = server;