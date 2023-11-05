const express = require('express');
const { createServer } = require('node:http');
const ipAddress = '26.129.17.144';
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

//Gerenciar Sessoes
var session = require('express-session');

app.use(session({
    secret: 'your secret',
    resave: false,
    saveUninitialized: true
}));

app.get('/', function (req, res) {
    if (req.session.authenticated) {
        res.redirect('/chat');
    } else {
        res.sendFile(__dirname + '/index.html');
    }
});

app.post('/login', function (req, res) {
    var username = req.body.username;

    // Verifique se o nome de usuário é válido
    // Isso dependerá de como você está armazenando os usuários
    // Neste exemplo, vamos assumir que você tem uma função `isValidUsername()` que faz isso
    if (isValidUsername(username)) {
        // Armazene o nome de usuário na sessão do usuário
        req.session.username = username;
        req.session.authenticated = true;

        // Envie uma resposta de sucesso
        res.send({ success: true });
    } else {
        // Se o nome de usuário não for válido, envie uma resposta de erro
        res.send({ success: false, message: 'Nome de usuário inválido' });
    }
});

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

server.listen(3000, ipAddress, () => {
    console.log('Servidor rodando na porta 3000');
}); 
