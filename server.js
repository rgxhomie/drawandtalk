const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const maxCanvasState = 1_000_000;
let canvasState = [];

io.on('connection', (socket) => {
    console.log('A user has connected');
    socket.emit('canvasState', canvasState);

    socket.on('draw', (data) => {
        console.log(`Incoming draw event`, data);
        canvasState.push(data);
        if(canvasState.length > maxCanvasState) canvasState.shift();
        socket.broadcast.emit('draw', data);
    });

    socket.on('clearCanvas', (data) => {
        console.log('Clearing canvas...');
        canvasState = [];
        socket.broadcast.emit('clearCanvas', data);
    })
});



http.listen(3000, () => {
  console.log('listening on *:3000');
});
