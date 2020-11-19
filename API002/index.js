// Main file for API

// dependency
const http = require('http');
const url = require('url');
const stringDecoder = require('string_decoder').StringDecoder;


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

    var searchStringObject = parsedUrl.search.substring(1);

    var vars = searchStringObject.split('&');
    
    // get http method
    var method = req.method.toLowerCase();

    //get headers as an object
    var headers = req.headers;

    // get the payload, if any
    var decoder = new stringDecoder('utf-8');
    var buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);

    });
    req.on('end',function(){

        buffer += decoder.end();

        // now send response after completing the handling of the data
        // send response
        res.end('.. handled request\n');

        console.log(`request received on path [${trimmedPath}] 
        with method [${method}] 
        and with these qs params of [${vars}] and headers:`, headers);
        console.log('and the received payload was: ', buffer);

    });
    
});

// start server and listen on port 3000
server.listen(3000,function(){

    console.log('the server is listening on port 3000');

})