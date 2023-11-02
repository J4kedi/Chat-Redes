const express = require('express');
const { createServer } = require('node:http');

const app = express();
const server = createServer(app);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/../index.html');
});

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});