const express = require('express');
const { createServer } = require('http');
const ipAddress = '26.129.17.144';
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

//Gerenciar Sessoes
const session = require('express-session');

const messages = [];

const expressSession = session({
    secret: 'du@VT~2Wr4p]I*|)JLt%j3R03Mm%_XgB',
    resave: false,
    saveUninitialized: true
});

app.use(expressSession);

const sharedsession = require("express-socket.io-session");
io.use(sharedsession(expressSession, {
    autoSave:true
}));

app.use(express.json()); // Para analisar application/json
app.use(express.urlencoded({ extended: true })); // Para analisar application/x-www-form-urlencoded

app.get('/', function (req, res) {
    if (req.session.authenticated) {
        res.redirect('/bola.html');
    } else {
        res.sendFile(__dirname + '/index.html');
    }
});

app.post('/login', function (req, res) {
    const username = req.body.username;

    if (isValidUsername(username)) {
        // Armazene o nome de usuário na sessão do usuário
        req.session.username = username;
        req.session.authenticated = true;

        console.log(`${username}|message: ${username}`)

        // Envie uma resposta de sucesso
        res.send({ success: true });
    } else {
        // Se o nome de usuário não for válido, envie uma resposta de erro
        res.send({ success: false, message: 'Nome de usuário inválido' });
    }
});



app.use(express.static(__dirname));

// Estabelecer conexao com o servidor
io.on('connection', (socket) => {
    console.log('a user connected');

    // Avisar aos outros usuários que um novo usuário entrou
    socket.broadcast.emit('user-joined', { userId: socket.id, username: 'username' });

    // Acessar dados da sessão do usuário
    console.log("Session Data:", socket.handshake.session);
});
    
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);

        if (socket.handshake.session.username) {
            const userMessage = { text: msg, username: socket.handshake.session.username };

            messages.push(userMessage);

            io.emit('chat message', userMessage);
        } else {
            // Handle the case where the session or username is not set
            console.log('Username is not set in session');
        }   
    });


socket.emit('message history', messages);

// Avisar aos outros usuários a desconexão
socket.on('disconnect', () => {
    // Enviar uma mensagem de desconexão
    console.log('user disconnected');
});

server.listen(3000, ipAddress, () => {
    console.log('Servidor rodando na porta 3000');
}); 

function isValidUsername(username) {
    if (username == "") {
        return false;
    } else {
        return true;
    }
};