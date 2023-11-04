const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

const messages = [];

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);

        messages.push(msg);

        io.emit('chat message', msg);
    });

    socket.emit('message history', messages);

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

io.emit('hello', 'world'); 