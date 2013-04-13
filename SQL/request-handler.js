/* You should implement your request handler function in this file.
 * But you need to pass the function to http.createServer() in
 * basic-server.js.  So you must figure out how to export the function
 * from this file and include it in basic-server.js. Check out the
 * node module documentation at http://nodejs.org/api/modules.html. */

// Load Node modules
var qs  = require('querystring'),
    ejs = require('ejs'),
    fs  = require('fs');

// Load templates once
var indexTemplate    = fs.readFileSync('./views/index.ejs').toString(),
    notFoundTemplate = fs.readFileSync('./views/404.ejs').toString();

// Messages storage array
var messages = [],
    PUBLIC_DIR = 'public';

var handleRequest = function(request, response, headers) {
  var urlPath = require('url').parse(request.url).path,
      statusCode, fileName, retData = '';

  if(urlPath === '/') {
    statusCode = 200;
    headers['Content-Type'] = 'text/html';
    retData = ejs.render(indexTemplate);
  } else if(fileName = urlPath.match(/([^\/]+\.css)$/)) {
    statusCode = 200;
    headers['Content-Type'] = 'text/css';
    // console.log(require('url').parse(request.url));
    retData = fs.readFileSync(__dirname + '/public/css/' + fileName[0]);
  } else if(fileName = urlPath.match(/([^\/]+\.js)$/)) {
    statusCode = 200;
    headers['Content-Type'] = 'text/javascript';
    // console.log(fileName);
    retData = fs.readFileSync(__dirname + '/public/js/' + fileName[0]);
  } else if(urlPath.match(/classes\/(?!messages)([a-zA-Z0-9\-]+)$/)) {
    statusCode = 200;
    headers['Content-Type'] = 'text/html';
    retData = ejs.render(indexTemplate);
  } else if(urlPath === '/classes/messages' && request.headers['content-type'] === 'json') {
    if(request.method === 'GET') {
      statusCode = 200;
      retData = messages.length === 0 ? '[]' : JSON.stringify(messages);
    }
    else if(request.method === 'POST') {
      statusCode = 200;
      retData = "\n";
      var data = '';

      // Buffer the post request's data
      request.on('data', function(chunk) {
        data += chunk;
      });

      // Process request now that the request has been completed
      request.on('end', function() {
        
        var message = JSON.parse(data);
        // console.log('New Message: ',message);
        // Only maintain 20 messages
        if(messages.length > 20) {
          messages.shift();
        }
        message['createdAt'] = new Date();
        message['updatedAt'] = new Date();
        messages.push(message);
        // console.log(messages);
      });
    }
    else {
      statusCode = 200;
    }
  }
  // Used for ServerSpec.spec tests only
  // else if(urlPath === '/classes/room1') {
  //   if(request.method === 'GET') {
  //     statusCode = 200;
  //     retData = messages.length === 0 ? '[]' : messages.pop();
  //   }
  //   if(request.method === 'POST') {
  //     statusCode = 302;
  //     retData = "\n";
  //     messages.push(JSON.stringify([request._postData]));
  //   }
  // }
  else {
    statusCode = 404;
    headers['Content-Type'] = 'text/html';
    retData = ejs.render(notFoundTemplate);
  }

  response.writeHead(statusCode, headers);
  response.end(retData);
};

exports.handleRequest = handleRequest;
