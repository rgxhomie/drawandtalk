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

            try {
                const notificationUri = 'https://em.staging.api.onereach.ai/http/2200fa1f-8ac8-4d05-82a3-9e4e9421b2aa/borys/prod/notification-sender';
                const notification = fetch(notificationUri, {
                    method: 'POST',
                    cache: 'no-cache',
                    headers: {
                        'accept': 'application/json',
                        'content-type':  'application/json'
                    }
                });
            } catch (error) {
                console.log(`Notification error`, error);
            }
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
