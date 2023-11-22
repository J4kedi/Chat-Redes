const { createServer } = require('http');
const { Server } = require('socket.io');
const ipAddress = '26.143.149.78';
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
    autoSave:false
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

        console.log(`nickname: ${username}`)

        res.send({ success: true });
    } else {
        res.send({ success: false, message: 'Nome de usuário inválido' });
    }
});

app.get('/logout', async function(req, res) {
    const username = req.query.username;
    const disconnectedUser = usuariosConectados.find(user => user.username === username);

    usuariosConectados.splice(usuariosConectados.indexOf(disconnectedUser), 1);

    if (disconnectedUser) {
        try {
            // Envia o comando de redirecionamento apenas para o usuário que está desconectando
            io.to(disconnectedUser.socketId).emit('redirect', '/index.html');

            // Aguarda um pouco antes de destruir a sessão para dar tempo de enviar o comando de redirecionamento
            await new Promise(resolve => setTimeout(resolve, 100));

            // Destrói a sessão do usuário desconectado
            req.sessionStore.destroy(disconnectedUser.socketId, (err) => {
                if (err) {
                    res.status(500).send('Erro ao desconectar usuário');
                } else {
                    res.send(`Usuário ${disconnectedUser.username} desconectado`);
                }
            });
        } catch (error) {
            res.status(500).send(error);
        }
    } else {
        res.status(404).send('Usuário não encontrado');
    }
});

app.use(express.static(__dirname));


io.on('connection', (socket) => {
    const username = socket.handshake.session.username;

    console.log(`${username} conectado`);

    socket.emit('message history', messages);

    if (username !== undefined) {
        usuariosConectados.push({ username, socketId: socket.id });
        console.log(usuariosConectados);
        io.emit('conectado', `${username} entrou no chat`, usuariosConectados);
    }

    console.log("Session Data:", socket.handshake.session);

    socket.on('chat message', (msg) => {
        const usuario = socket.handshake.session.username;
        console.log(`${usuario}| message: ${msg}`);
    
        if (usuario) {
            const cor = getUsernameColor(usuario);
    
            const userMessage = { text: msg, username: usuario, color: cor };
            
            historicoMsg(userMessage);
            
            io.emit('chat message', userMessage);
        } else {
            console.log(`${username} não está conectado à sessão.`);
        }
    });

    socket.on('disconnect', () => {
        console.log(`${username} desconectou`);
    });
});

server.listen(3000, ipAddress, () => {
    console.log('Servidor rodando na porta 3000');
}); 

function isValidUsername(username) {
    if (username == "" || usuariosConectados.some(user => user.username === username)) {
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

function historicoMsg(userMessage) {
    messages.push(userMessage);
            
    if(messages.length > 6){
        messages.shift();
    }
}