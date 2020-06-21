"use strict";
process.title = 'guesstheflag';

const express = require('express');
const rest = express();
const cors = require('cors');
var webSocketServer = require('websocket').server;
var http = require('http');
const bodyParser = require('body-parser');
const db = require('./db');
const helper = require('./helper');

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

var webSocketsServerPort = 1999;
var restServerPort = 5000;

var clients = [];
var players = [];
var gameStatus = 'new';
var answer = '';

const htmlEntities = helper.htmlEntities;
const getColor = helper.getColor;
const removeColor = helper.removeColor;

// rest server settings
rest.use(bodyParser.urlencoded({ extended: false }));
rest.use(bodyParser.json());

rest.get('/api/flags', cors(corsOptions), (req, res) => {
  console.log('get /api/flags')
  var flagNames = [];
  db.getFlags().then(flags => {
    flags.forEach(flag => flagNames.push({ flagName: flag.flagName, flagCounter: flag.flagCounter }))
    res.json(flagNames)
  })
});

rest.post('/api/flag', cors(corsOptions), (req, res) => {
  console.log('post /api/flag')
  if (req.body.token) {
    if (helper.verifyToken(req.body.token)) {
      const flagName = req.body.flagName
      db.updateFlag(flagName).then(() => {
        res.json('ok')
      })
    }
  }
});

rest.post('/api/authenticate', cors(corsOptions), (req, res) => {
  console.log('post /api/authenticate');
  let token = null;
  const username = req.body.username;
  const password = req.body.password;
  const promise = db.usernameExists(username);
  promise.then(function(result) {
    if (result) {
      db.usernamePassword(username, password)
        .then((result) => {
          if (result) {
            token = helper.getToken(username);
            res.json({
              token: token
            });
          } else {
            res.json({
              message: 'User Authentication Failure'
            });
          }
        })
        .catch((e) => {
          console.log(e.message)
          res.json({
            message: 'User Authentication Failure'
          });
        })
    } else {
      db.saveUsername(username, password)
        .then(value => {
          token = helper.getToken(username);
          res.json({
            token: token
          })
        })
        .catch(e => {
          console.log(e)
          res.json({
            message: 'User Authentication Failure'
          });
        });
    }
  })
});
rest.listen(restServerPort, () => console.log((new Date()) + " REST server is listening on port " + restServerPort));

// websocket server
var server = http.createServer(function(request, response) {
});
server.listen(webSocketsServerPort, () => console.log((new Date()) + " WS server is listening on port " + webSocketsServerPort));
var wsServer = new webSocketServer({
  httpServer: server
});

// broadcast message to all connected clients
function broadcastMessage(json) {
  for (var i = 0; i < clients.length; i++) {
    clients[i].sendUTF(json);
  }
}

// handle messages
wsServer.on('request', function(request) {
  console.log((new Date()) + ' Connection from origin ' + request.origin);
  var connection = request.accept(null, request.origin);
  var index = clients.push(connection) - 1;
  var userName = false;
  var userColor = false;
  console.log((new Date()) + ' Connection accepted');
  connection.on('message', function(message) {
    if (message.type === 'utf8') { // accept only text
      try {
        var json = JSON.parse(message.utf8Data);
      } catch (e) {
        console.log('Received invalid JSON :( ', message.utf8Data);
        return;
      }
      if (userName === false) {
        userName = htmlEntities(json.text);
        userColor = getColor();
        connection.sendUTF(JSON.stringify({ type: 'color', data: userColor }));
        players.push(userName);
      } else {
        if (helper.verifyToken(json.token)) {
          if (json.type === 'message') {
            console.log((new Date()) + ' Received Message from ' + userName + ': ' + json.text);
            var obj = {
              time: (new Date()).getTime(),
              text: htmlEntities(json.text),
              author: userName,
              color: userColor
            };
            var json = JSON.stringify({ type: 'message', data: obj });
            broadcastMessage(json);
          } else if (json.type === 'click') {
            console.log('received click on id ' + json.id + ' with color ' + json.color);
            broadcastMessage(message.utf8Data);
          } else if (json.type === 'gamesettings') {
            if (json.value === 'start_game') {
              var randomPlayer = Math.floor(Math.random() * (players.length))
              console.log(randomPlayer);
              var drawer = players.slice(randomPlayer, randomPlayer + 1);
              console.log('And the drawer of this round is ' + drawer);
              broadcastMessage(JSON.stringify({ type: 'drawer', value: drawer }));
              gameStatus = 'waitingForFlag';
              var obj = {
                time: (new Date()).getTime(),
                text: 'Please wait while flag is getting selected',
                author: drawer,
                color: userColor
              };
              var json = JSON.stringify({ type: 'message', data: obj });
              broadcastMessage(json);
            } else if (json.value === 'flag') {
              console.log('Selected flag ' + json.flag);
              answer = json.flag;
              broadcastMessage(JSON.stringify({ type: 'flag', value: json.flag }));
              var obj = {
                time: (new Date()).getTime(),
                text: 'Flag is selected. Have fun!',
                author: 'system',
                color: userColor
              };
              var json = JSON.stringify({ type: 'message', data: obj });
              broadcastMessage(json);
              gameStatus = 'play';
            } else if (json.value === 'win') {
              console.log('Win registered. Congrats ' + json.userName);
              var obj = {
                time: (new Date()).getTime(),
                text: json.userName + ' guessed the right country ' + answer + '! Congrats!!',
                author: userName,
                color: userColor
              };
              var json = JSON.stringify({ type: 'message', data: obj });
              broadcastMessage(json);
              broadcastMessage(JSON.stringify({ type: 'restart_game' }));
              gameStatus = 'end';
            }
          }
        }
      }
    }
  });

  // user disconnected at Event close and handling on EventHandler onClose
  connection.on('close', function(connection) {
    if (userName !== false && userColor !== false) {
      console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected");
      clients.splice(index, 1);
      removeColor(userColor);
    }
  });
});
