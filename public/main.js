const canvas = document.getElementById('drawing-board');
const colorInput = document.getElementById('stroke');
const sliderInput = document.getElementById('lineWidth');
const toolbar = document.getElementById('toolbar');
const clearButton = document.getElementById('clear');
const ctx = canvas.getContext('2d');
const canvasOffsetX = canvas.offsetLeft;
const canvasOffsetY = canvas.offsetTop;

canvas.width = window.innerWidth - canvasOffsetX;
canvas.height = window.innerHeight - canvasOffsetY;

let isPainting = false;
let color = colorInput.value;
let lineWidth = sliderInput.value;

let startX;
let startY;

const socket = io();

socket.on('connect', () => {
    console.log('Connected to server...');
});

socket.on('canvasState', (data) => {
    for(let i = 0; i < data.length; i++) {
        const line = data[i];
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
    if (!isPainting) return;

    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    const data = {
        x1: startX,
        y1: startY,
        x2: e.offsetX,
        y2: e.offsetY,
        color: ctx.strokeStyle,
        lineWidth: lineWidth
    }
    socket.emit('draw', data);

    startX = e.offsetX;
    startY = e.offsetY;
});