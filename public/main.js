const canvas = document.getElementById('drawing-board');
const colorInput = document.getElementById('stroke');
const sliderInput = document.getElementById('lineWidth');
const toolbar = document.getElementById('toolbar');
const ctx = canvas.getContext('2d');
const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;
const guestId = Math.random() * 1000;

canvas.width = window.innerWidth - canvasOffsetX;
canvas.height = window.innerHeight - canvasOffsetY;

let isPainting = false;
let color = colorInput.value;
let lineWidth = sliderInput.value;

let startX;
let startY;

const socket = io();
socket.emit('guestConnect', {id: guestId});

const cursors = [];
const userCursor = new Cursor(guestId);
cursors.push(userCursor);

socket.on('connect', () => {
    console.log('Connected to server...');
});

socket.on('canvasState', (data) => {
    data.guests.forEach((id) => cursors.push(new Cursor(id)));
    for(let i = 0; i < data.canvasState.length; i++) {
        const line = data.canvasState[i];
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.lineWidth;
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
    }
});

socket.on('guestConnect', (data) => {
    console.log(`Guest connected`);
    cursors.push(new Cursor(data.id));
})

socket.on('cursorMove', (data) => {
    const {x, y, clientLineWidth, clientColor, id} = data;
    movedCursor = cursors.find((el) => el.id == id);
    movedCursor.move(x, y, clientLineWidth, clientColor);
});

socket.on('draw', (data) => {
    ctx.beginPath();
    ctx.moveTo(data.x1, data.y1);
    ctx.lineTo(data.x2, data.y2);
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.lineWidth;
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
});

socket.on('clearCanvas', (data) => {
    console.log('Clearing by server request');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

toolbar.addEventListener('click', e => {
    if (e.target.id === 'clear') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        socket.emit('clearCanvas', {access: true});
    }
});

toolbar.addEventListener('change', e => {
    if (e.target.id === 'stroke') {
        ctx.strokeStyle = e.target.value;
        color = e.target.value;
    }
    if (e.target.id === 'lineWidth') {
        lineWidth = e.target.value;
    }
});

canvas.addEventListener('mousedown', e => {
    isPainting = true;
    startX = e.offsetX; // e.clientX;
    startY = e.offsetY; // e.clientY;
});

document.addEventListener('mouseup', e => {
    if(isPainting) {
        isPainting = false;
        ctx.stroke();
        ctx.beginPath();
    }
});

canvas.addEventListener('mousemove', e => {
    userCursor.move(e.clientX, e.clientY, lineWidth, color);
    socket.emit('cursorMove', {
        x: e.clientX,
        y: e.clientY,
        clientLineWidth: lineWidth,
        clientColor: color,
        id: guestId
    });

    if (isPainting) {
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();

        const drawData = {
            x1: startX,
            y1: startY,
            x2: e.offsetX,
            y2: e.offsetY,
            color: ctx.strokeStyle,
            lineWidth: lineWidth
        }
        socket.emit('draw', drawData);
    }

    startX = e.offsetX;
    startY = e.offsetY;
});

canvas.addEventListener('mouseover', (e) => {
    userCursor.show();
});

canvas.addEventListener('mouseout', (e) => {
    userCursor.hide();
});