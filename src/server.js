'use strict';

const DataUtils = require("./public/js/modules/data.utils.js");
const express = require('express');
const {Server} = require('ws');
const cookieParser = require('cookie-parser');
const cookie = require('cookie');
const path = require('path');
const PORT = process.env.PORT || 3000;
const INDEX = 'public/index.html';
const COOKIE_USER_ID = 'pathwise-user-id';

const onlineUsers = [];


function main() {
  const app = express();
  app.use(cookieParser());
  const server = app.listen(PORT, () => onStartEventHandler());
  const wss = new Server({server});
  registerListeners(app, wss);
  registerBroadcasts(wss);
}

function onStartEventHandler() {
  console.log(`Listening on ${PORT}`);
}

function registerListeners(app, wss) {
  app.use(express.static(path.join(__dirname, 'public')));
  app.get("/", onPageLoadEventHandler);
  wss.on("connection", onConnectEventHandler);
}

function registerBroadcasts(wss) {
  setInterval(() => {
    wss.clients.forEach((client) => {
      client.send(DataUtils.serializeMessage("time", new Date()));
    });
  }, 1000);
}

function onPageLoadEventHandler(request, res) {
  if (!(request.cookies?.hasOwnProperty && request.cookies.hasOwnProperty(COOKIE_USER_ID))) {
    const userId = DataUtils.getRandomConnectionId();
    console.log("Set cookie: ", COOKIE_USER_ID, "to", userId)
    res.cookie(COOKIE_USER_ID, userId, {maxAge: 360000});
  }
  res.sendFile(INDEX, {root: __dirname});
}

function onClientCloseEventHandler() {
  console.log('Client disconnected')
}

function onConnectEventHandler(socket, request) {
  const user_id = DataUtils.getCookieFromRequest(cookie, request, COOKIE_USER_ID);
  if (user_id) {
    console.log('Client connected', user_id);
    socket.on("close", onClientCloseEventHandler);
  } else {
    socket.send('ERROR: Missing Cookie');
    socket.close();
  }
}


main();
