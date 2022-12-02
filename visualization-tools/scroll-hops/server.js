const express = require('express');
const expressWebSocket = require('express-ws');
const websocketStream = require('websocket-stream/stream');
const app = express();
const fs = require('fs');

// const data = require('./data/cleaned.json');
// // console.log(data);
// console.log(data.slice(0, 2));

// fs.writeFileSync('./data/small.json', JSON.stringify(data.slice(0, 50)));

// extend express app with app.ws()
expressWebSocket(app, null, {
    // ws options here
    // perMessageDeflate: false,
});

app.ws('/', function(ws, req) {
  // convert ws instance to stream
  const stream = websocketStream(ws, {
    // websocket-stream options here
    binary: true,
  });
  fs.createReadStream(__dirname + '/data/small.json').pipe(stream);
  // fs.createReadStream('bigdata.json').pipe(stream);
});

app.listen(3000);