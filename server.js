"use strict";
process.title = 'chat';

// websocket server port
var webSocketsServerPort = 1999;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

var clients = [];

const helper = require('./helper');
const htmlEntities = helper.htmlEntities;
const getColor = helper.getColor;
const removeColor = helper.removeColor;


var server = http.createServer(function(request, response){
});
server.listen(webSocketsServerPort, function() {
  console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

var wsServer = new webSocketServer({
  httpServer: server
});

// broadcast message to all connected clients
function broadcastMessage(json) {
  for (var i = 0; i < clients.length; i++){
    clients[i].sendUTF(json);
  }
}

wsServer.on('request', function(request){
  console.log((new Date()) + ' Connection from origin ' + request.origin);
  var connection = request.accept(null, request.origin);
  var index = clients.push(connection) - 1;
  var userName = false;
  var userColor = false;
  console.log((new Date()) + ' Connection accepted');
  connection.on('message', function (message) {
    if (message.type === 'utf8'){ // accept only text
      try {
        var json = JSON.parse(message.utf8Data);
      } catch (e) {
        console.log('Received invalid JSON :( ', message.utf8Data);
        return;
      }
      if (userName === false) {
        userName = htmlEntities(json.text);
        userColor = getColor();
        connection.sendUTF(JSON.stringify({type: 'color', data: userColor}));
      }else{
        if (json.type === 'message') {
          console.log((new Date()) + ' Received Message from ' + userName + ': ' + json.text);
          var obj = {
            time: (new Date()).getTime(),
            text: htmlEntities(json.text),
            author: userName,
            color: userColor
          };
          var json = JSON.stringify({type: 'message', data: obj});
          broadcastMessage(json);
        }else if (json.type === 'click') {
          console.log('received click on id ' + json.id + ' with color ' + json.color);
          broadcastMessage(message.utf8Data);
        }
      }
    }
  });

  // user disconnected at Event close and handling on EventHandler onClose
  connection.on('close', function (connection) {
    if (userName !== false && userColor !== false) {
      console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected");
      clients.splice(index, 1);
      removeColor(userColor);
    }
  });
});