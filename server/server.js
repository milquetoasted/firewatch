// declare necessary dependencies
var express = require('express');
var http = require('http');

var app = express();
var server = http.createServer(app);

// serve static public files
app.use(express.static('../client'));

server.listen(3000, function () {
  console.log('server running on port 3000');
});
