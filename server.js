const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const maxCanvasState = 1_000_000;
let canvasState = [];
let guests = [];

io.on('connection', (socket) => {
    socket.emit('canvasState', {canvasState, guests});

    socket.on('guestConnect', (data) => {
        try {
            console.log('guestConnect', data);
            guests.push(data.id);
            socket.broadcast.emit('guestConnect', data);
        } catch (error) {
            console.log(error);
        }
    });

    socket.on('cursorMove', (data) => {
        try {
            socket.broadcast.emit('cursorMove', data);
        } catch (error) {
            console.log(error);
        }
    });

    socket.on('draw', (data) => {
        try {
            canvasState.push(data);
            if(canvasState.length > maxCanvasState) canvasState.shift();
            socket.broadcast.emit('draw', data);
        } catch (error) {
            console.log(error);
        }
    });

    socket.on('clearCanvas', (data) => {
        try {
            console.log('Clearing canvas...');
            canvasState = [];
            socket.broadcast.emit('clearCanvas', data);
        } catch (error) {
            console.log(error);
        }
    });
});



http.listen(3000, () => {
  console.log('listening on *:3000');
});
