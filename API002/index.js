////////////////////////////////////////////////////////////////////
//
// Main file for API
// Created : Sept 15, 2020
//
// TODO: refactor file into components

////////////////////////////////////////////////////////////////////
// Dependencies
const http = require("http");
const https = require("https");
const url = require("url");
const stringDecoder = require("string_decoder").StringDecoder;
const config = require("./config");
const fs = require("fs");
const _data = require("./lib/data");
var currentFunction = "request";

// End of Dependencies
////////////////////////////////////////////////////////////////////

// TEST SUITE
//
// test create
// function doCreate() {
//   _data.create(
//     "test",
//     "newSampleFile",
//     '{"test":[{"foo":"bar", "hoge":"piyo", "ham":"spam"}]}',
//     function (err) {
//       console.log("test write fail:", err);
//     }
//   );
// }

// // test read
// function doRead() {
//   _data.read("test", "newSampleFile", function (err, data) {
//     console.log("test read fail:".err);
//     console.log("  test the data read ", data);
//   });
// }

// // test update
// function doUpdate() {
//   _data.update(
//     "test",
//     "newSampleFile",
//     '{"test":[{"ham":"jam", "marco":"polo"}]}',
//     function (err) {
//       console.log("test update fail:", err);
//     }
//   );
// }

// // test delete
// function doDelete() {
//   _data.delete("test", "newSampleFile", function (err) {
//     console.log("test delete fail:", err);
//   });
// }

// setTimeout(doCreate, 1100);
// setTimeout(doRead, 1100);
// setTimeout(doUpdate, 1100);
// setTimeout(doDelete, 1100);

////////////////////////////////////////////////////////////////////
// Utility functions

// get random integer number from 0, up to max
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// Get named variable from query string
function getQueryVariable(queryStringObject) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (decodeURIComponent(pair[0]) == variable) {
      return decodeURIComponent(pair[1]);
    }
  }
  console.log("Query variable %s not found", variable);
}

// End of Utility functions
////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////
// Servers

////////////////////////////////////////////////////////////////////
// http

// instantiating http server
const httpServer = http.createServer(function (req, res) {
  unifiedServer(req, res);
});

// start http server and listen on dynamically defined port from config
httpServer.listen(config.httpPort, function () {
  console.log(
    `the http server is listening on port ${config.httpPort} in ${config.envName} mode`
  );
});

////////////////////////////////////////////////////////////////////
// https

// server options
var httpsServerOptions = {
  // key and cert are quired for encryption - read synchronously as we need them immediately
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem"),
};

// instantiating https server
const httpsServer = https.createServer(httpsServerOptions, function (req, res) {
  unifiedServer(req, res);
});

// start https server and listen on dynamically defined port from config
httpsServer.listen(config.httpsPort, function () {
  console.log(
    `the https server is listening on port ${config.httpsPort} in ${config.envName} mode`
  );
});

// end of Servers
////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////
// Server logic for both http and https servers

const unifiedServer = function (req, res) {
  var statusCodeFinal = 200;
  var contentTypeFinal = "application/json";
  var payloadString = "";

  //get url and parse it
  var parsedUrl = url.parse(req.url, true);
  // gat path from url

  // log what path person was asking for
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, "");
  // Get the query string as an object
  var queryStringObject = parsedUrl.query;
  // Similarly, get the search components
  var searchStringObject = "";
  var vars = "";

  if (parsedUrl.search) {
    searchStringObject = parsedUrl.search.substring(1);
    vars = searchStringObject.split("&");
  }

  // get http method
  var method = req.method.toLowerCase();
  //get headers as an object
  var headers = req.headers;
  // get the payload, if any
  var decoder = new stringDecoder("utf-8");
  // a place to store the payload
  var buffer = "";

  // gather payload from caller
  req.on("data", function (data) {
    currentFunction = "req.data";
    buffer += decoder.write(data);
  });

  // log what we got
  if (config.envName == "staging") {
    console.log(
      `START: request received on path [${trimmedPath}]
    with method [${method}]
    and with these qs params of [${vars}] and headers:`,
      headers
    );
    console.log("and the received payload was: ", buffer);
  }

  ////////////////////////////////////////////////////////////////////
  // Handle completed request from caller
  req.on("end", function () {
    try {
      currentFunction = "req.end";
      buffer += decoder.end();

      // choose the correct handler, or notFound handler
      var chosenHandler =
        typeof router[trimmedPath] !== "undefined"
          ? router[trimmedPath]
          : handlers.notFound;

      // construct the data object to send to the handler
      var data = {
        trimmedPath: trimmedPath,
        queryStringObject: queryStringObject,
        method: method,
        headers: headers,
        payload: buffer,
      };

      // Route the request to the handler specified in the router
      chosenHandler(data, function (statusCode, contentType, payload) {
        currentFunction = "callback";

        // use the status code called-back by the handler, or 200 as default
        statusCodeFinal = typeof statusCode == "number" ? statusCode : 200;
        // get the content type to be returned
        contentTypeFinal =
          typeof contentType == "string" ? contentType : "application/json";
        // use the payload called-back by the handler, or default to an empty object
        payload = typeof payload == "object" ? payload : {};

        // cant send an object - need to send a string
        // convert payload to a string
        payloadString = JSON.stringify(payload);
      });
    } catch (err) {
      statusCodeFinal = 500;
      errString = " " + err;
      console.log(err);
      payloadString =
        'Server error in function "' +
        currentFunction +
        '" as [' +
        errString.replace(/\r?\n|\r/g, "") +
        " ]";
      contentTypeFinal = "application/json";
    } finally {
      //return the response
      res.setHeader("Content-Type", contentTypeFinal);
      res.writeHead(statusCodeFinal);
      var response = payloadString;
      if (statusCodeFinal > 499) {
        // TODO: notify support team
        response = "Server encountered an error. Support has been notified.";
      }
      res.end(response);
      console.log(
        `END: Status [${statusCodeFinal}] with response [${response}]`
      );
      if (statusCodeFinal > 499) {
        process.exit(-1);
      }
    }
  });
};

// End of Server logic for both http and https servers
////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
// define the handlers
var handlers = {};

///////////////////////////////
// Default services...

// define a ping handler
handlers.ping = function (data, callback) {
  currentFunction = "ping";

  var statusResult = 200;
  var contentType = "application/json";
  // must be a POST for this ping
  if (data.method === "get") {
    statusResult = 400;
  }
  callback(statusResult, contentType, "");
};

// define a not-found handler
handlers.notFound = function (data, callback) {
  currentFunction = "notFound";

  var statusResult = 404;
  var contentType = "text";

  callback(statusResult, contentType, "");
};

// End of Default services...
////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////
// Business services

// define a products handler
handlers.product = function (data, callback) {
  currentFunction = "product";
  var statusResult = 418;
  var contentType = "application/json";
  // TODO: search DB and return results.
  // ... with no other required libraries, this will be a small challenge. Ok, I'm up for that!:
  // TODO: create file based no-sql DB to hold JSON data (like Stratus software)
  callback(statusResult, contentType, { name: "products handler" });
};

// Homework Assignment #1 Hello World API
//  1. It should be a RESTful JSON API that listens on a port of your choice.
//
//  2. When someone sends an HTTP request to the route /hello,
//     you should return a welcome message, in JSON format.
//     This message can be anything you want.
//
handlers.hello = function (data, callback) {
  currentFunction = "hello";
  var statusResult = 200;
  var contentType = "application/json";
  var helloResponse = phrases[getRandomInt(phrases.length)];
  var result = helloResponse.split("~");
  var jokeString = `{ "hello" :[{ "${result[0]}" : "${result[1]}" }] }`;
  var jokeObj = JSON.parse(jokeString);

  callback(statusResult, contentType, jokeObj);
};

// End of Business services
////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////
// Containers

// define a request router
const router = {
  product: handlers.product,
  ping: handlers.ping,
  hello: handlers.hello,
};

// define a number of responses
const phrases = [
  "Why do developers have such high insurance rates?~They keep crashing!",
  "What is it called when an IT person gets a bandage on their fingers?~Tech knuckle support",
  "How does a computer get drunk?~It takes screenshots",
  "What’s the best way to learn about computers?~Bit by bit",
  "Who is a computer’s favorite singer?~A Dell.",
  "Why do people on Twitter tell me I’m always confused?~Because I don’t follow",
  "Why are people afraid of computers?~They byte",
  "Where do naughty disk drives get sent?~Boot camp.",
];

// End of Containers
////////////////////////////////////////////////////////////////////

// End of File
////////////////////////////////////////////////////////////////////
