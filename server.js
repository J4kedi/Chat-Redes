const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

// Lista de arquivos estáticos que você deseja servir
const staticFiles = [
    'assets/mononoke.jpg',
    'assets/apple-touch-icon.png',
    'assets/favicon-32x32.png',
    'assets/favicon-16x16.png',
];

app.get('/assets/apple-touch-icon.png', (req, res) => {
    res.sendFile(join(__dirname + '/assets/apple-touch-icon.png'));
    console.log("deu certo");
});

app.get('/assets/favicon-32x32.png', (req, res) => {
    res.sendFile(join(__dirname + '/assets/favicon-32x32.png'));
    console.log("deu certo");
});

app.get('/assets/favicon-16x16.png', (req, res) => {
    res.sendFile(join(__dirname + '/assets/favicon-16x16.png'));
    console.log("deu certo");
});

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
});

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});