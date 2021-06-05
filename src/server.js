'use strict';

const DataUtils = require("./modules/data.utils.js");
const express = require('express');
const {Server} = require('ws');
const cookieParser = require('cookie-parser');
const cookie = require('cookie');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';
const COOKIE_USER_ID = 'pathwise-user-id';

const app = express();
app.use(cookieParser())

const server = app
  .use((request, res) => {
    if (!(request.cookies?.hasOwnProperty && request.cookies.hasOwnProperty(COOKIE_USER_ID))) {
      const userId = DataUtils.getRandomConnectionId();
      console.log("Set cookie: ", COOKIE_USER_ID, "to", userId)
      res.cookie(COOKIE_USER_ID, userId, {maxAge: 360000});
    }
    res.sendFile(INDEX, {root: __dirname});
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const wss = new Server({server});

wss.on('connection', (client, request) => {
  const requestCookie = request?.headers?.cookie;
  if (requestCookie) {
    const cookies = cookie.parse(requestCookie);
    if (cookies.hasOwnProperty(COOKIE_USER_ID)) {
      console.log('Client connected', cookies[COOKIE_USER_ID]);
    }
  }
  client.on('close', () => console.log('Client disconnected'));
});

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(DataUtils.getRandomConnectionId());
  });
}, 1000);
