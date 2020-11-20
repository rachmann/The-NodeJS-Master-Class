// Main file for API

// dependency
const http = require('http');
const url = require('url');
const stringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

function getQueryVariable(queryStringObject) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

// respond to all requests with a string
const server = http.createServer(function(req,res){

    //get url and parse it
    var parsedUrl = url.parse(req.url,true);
    // gat path from url

    // log what path person was asking for
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');
    // Get the query string as an object
    var queryStringObject = parsedUrl.query;
    // Similarly, get the search components
    var searchStringObject = parsedUrl.search.substring(1);
    var vars = searchStringObject.split('&');
    // get http method
    var method = req.method.toLowerCase();
    //get headers as an object
    var headers = req.headers;
    // get the payload, if any
    var decoder = new stringDecoder('utf-8');
    // a place to store the payload
    var buffer = '';
    // gather payload from caller
    req.on('data', function(data){

        buffer += decoder.write(data);

    });

    // log what we got
    console.log(`START: request received on path [${trimmedPath}] 
    with method [${method}] 
    and with these qs params of [${vars}] and headers:`, headers);
    console.log('and the received payload was: ', buffer);

    ////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////
    // Handle completed request from caller
    req.on('end',function(){

        buffer += decoder.end();

        // choose the correct handler, or notFound handler
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // construct the data object to send to the handler
        var data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, contentType, payload){
            // use the status code called-back by the handler, or 200 as default
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            // get the content type to be returned
            contentType = typeof(contentType) == 'string' ? contentType : 'application/json';
            // use the payload called-back by the handler, or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // cant send an object - need to send a string
            // convert payload to a string
            var payloadString = JSON.stringify(payload);

            //return the response
            res.setHeader('Content-Type',contentType);
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log(`END: Status [${statusCode}] with response [${payloadString}]`)
        });

    });
    
});

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
// start server and listen on dynamically defined port from config
server.listen(config.port,function(){

    console.log(`the server is listening on port ${config.port} in ${config.envName} mode`);

});

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
// define the handlers
var handlers = {};

// define a products handler
handlers.products = function (data, callback){
    var statusResult = 418;
    var contentType = 'application/json';

    callback(statusResult, contentType, {'name' : 'products handler'});
};

// define a not-found handler
handlers.notFound = function(data, contentType, callback){
 var contentType = 'text';
 // callback an http status code and a payload object
 callback(404, contentType, {} );
};

// define a request router
const router = {
    'products' : handlers.products
};
