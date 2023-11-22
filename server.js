const { createServer } = require('http');
const { Server } = require('socket.io');
const ipAddress = '127.0.0.1';
const express = require('express');
const session = require('express-session');

const app = express();
const server = createServer(app);
const io = new Server(server);

//lista de mensagens 
const messages = [];
//Lista de usuários conectados
const usuariosConectados = [];

//Criar Sessão
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

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

app.get('/', function (req, res) {
    if (req.session.authenticated) {
        res.redirect('/inicial.html');
    } else {
        res.sendFile(__dirname + '/index.html');
    }
});

app.post('/login', function (req, res) {
    const username = req.body.username;

    if (isValidUsername(username)) {
        req.session.username = username;
        req.session.authenticated = true;

        console.log(`${username}|message: ${username}`)

        res.send({ success: true });
    } else {
        res.send({ success: false, message: 'Nome de usuário inválido' });
    }
});


app.use(express.static(__dirname));

app.get('/logout', function(req, res) {
    const usernam = req.query.usernam;

    const user = usuariosConectados.find(user => user === usernam);

    console.log(user);

    if (user) {
        req.sessionStore.destroy(user.sessionID, (err) => {
            if (err) {
                res.status(500).send('Erro ao desconectar usuário');
            } else {
                // Redirecionar para o index após o logout
                res.redirect('/index.html');
            }
        });
    } else {
        res.status(404).send('Usuário não encontrado');
    }
});



io.on('connection', (socket) => {
    const username = socket.handshake.session.username;

    console.log(`${username} conectou`);

    if (username !== undefined) {
        usuariosConectados.push({ username, socketId: socket.id });
        io.emit('conectado', `${username} entrou no chat`, usuariosConectados);
    }

    console.log("Session Data:", socket.handshake.session);

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        const usuario = socket.handshake.session.username;
    
        if (usuario) {
            const cor = getUsernameColor(usuario);
    
            const userMessage = { text: msg, username: usuario, color: cor };
    
            messages.push(userMessage);
    
            io.emit('chat message', userMessage);
    
            if (msg === '/q') {
                io.to(socket.id).emit('disconnect-user');
            }
        } else {
            console.log(`${username} não está conectado à sessão.`);
        }
    });


    socket.emit('message history', messages);

    socket.on('disconnect-request', ({ username }) => {
        const disconnectedUser = usuariosConectados.find(user => user.username === username);
    
        if (disconnectedUser) {
            const index = usuariosConectados.indexOf(disconnectedUser);
            usuariosConectados.splice(index, 1);
    
            io.emit('conectado', `${disconnectedUser.username} saiu do chat`, usuariosConectados);
            socket.disconnect(); // Desconectar o usuário manualmente
        }
    
        console.log(`${username} solicitou desconexão`);
    });
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

function getUsernameColor(username) {
    let hashCode = 0;
    for (let i = 0; i < username.length; i++) {
        hashCode = username.charCodeAt(i) + ((hashCode << 5) - hashCode);
    }
    
    const finalColor = `#${(hashCode & 0x00FFFFFF).toString(16).toUpperCase().padStart(6, '0')}`;
    return finalColor;
}