// declare necessary dependencies
var express = require('express');
var http = require('http');
const request = require('request');
const parse = require('csv-parse')

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

// serve static public files
app.use(express.static('../client'));

io.on('connection', function(socket){
  socket.on('lit fam', function(){
    console.log('burn motherfuckers');
    request('https://firms.modaps.eosdis.nasa.gov/data/active_fire/c6/csv/MODIS_C6_Global_24h.csv',
    function (error, response, body) {
      if (!error && response.statusCode == 200) {
        return parse(body, {}, function(err, output) {
          if (output && !err) {
            updateClient(output.map(x => x.slice(0,2)).slice(1));
          }
        });
      }
    });
  });
});

var updateClient = function(data) {
  io.sockets.emit('oh no', data);
};

server.listen(3000, function () {
  console.log('server running on port 3000');
});
