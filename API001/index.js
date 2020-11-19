// Main file for API

// dependency
const http = require('http');
const url = require('url');

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

    // send response
    res.end('.. handled request\n');

    // log what path person was asking for
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g,'');

    var searchStringObject = parsedUrl.search.substring(1);

    var vars = searchStringObject.split('&');
    
    // get http method
    var method = req.method.toLowerCase();

    //get headers as an object
    var headers = req.headers;

    console.log(`request received on path [${trimmedPath}] 
        with method [${method}] 
        and with these qs params of [${vars}] and headers:`, headers);
    
});



// start server and listen on port 3000
server.listen(3000,function(){
    console.log('the server is listening on port 3000');
})