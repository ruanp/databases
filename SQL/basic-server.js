/* Import node's http module: */

var http = require("http");
var handler = require('./request-handler');
var connect = require('connect');

var requestListener = function (request, response) {
  var statusCode = 200,
      headers = defaultCorsHeaders;

  headers['Content-Type'] = "text/plain";
  response = handler.handleRequest(request, response, headers);
  console.log("Serving request type " + request.method + " for url " + request.url);
};

var port   = 8080,
    ip     = "localhost",
    server = connect.createServer(requestListener),
    defaultCorsHeaders = {
                          "access-control-allow-origin": "*",
                          "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
                          "access-control-allow-headers": "content-type, accept",
                          "access-control-max-age": 10 // Seconds.
                         };

server.listen(port);
