const socket = io();

const buttonInicio = document.querySelector('.botao-inicio');
const inputUserName = document.getElementById('name');
const form = document.getElementById('form');
const input = document.querySelector('.input');
const campoMensagem = document.getElementById('campo-mensagem');

const maxMessageHistory = 6;

if(buttonInicio) {
    buttonInicio.addEventListener('click', ()=> {
        const user = inputUserName.value;

        submitUsername({ username: user });        
    })
}

function submitUsername(data) {
    $.ajax({
        url: '/login',
        type: 'POST',
        data: data,

        success: function (response) {
            if (response.success) {
                window.location.href = '/inicial.html';
            } else {
                console.log(response.message);
            }
        },

        error: function (error) {
            console.log(error);
        }
    });
}

socket.on('conectado', (mensagem, username) => {
    if (username !== undefined) {
        const item = document.createElement('li');
        item.textContent = `${mensagem}`;
        item.style.backgroundColor = '#FFF';
        campoMensagem.appendChild(item);
}});

socket.on('message history', (history) => {
    const startIndex = Math.max(history.length - maxMessageHistory, 0);
    const limitedHistory = history.slice(startIndex);

    limitedHistory.forEach((userMessage) => {
        const item = document.createElement('li');
        item.textContent = `${userMessage.username}: ${userMessage.text}`;
        item.style.backgroundColor = userMessage.color;
        campoMensagem.appendChild(item);
    });
});

if (form && input) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value) {
            socket.emit('chat message', input.value);
            input.value = '';
        }
    });
};

socket.on('chat message', (userMessage) => {
    const item = document.createElement('li');
    const username = userMessage.username;
    const backColor = userMessage.color; 
    const texto = userMessage.text

    if (texto === '/q') {
        fetch(`/logout?usernam=${username}`, { method: 'GET' })
            .then(response => {
                if (response.redirected) {
                    // Usuário desconectado com sucesso, redireciona para o index
                    socket.emit('disconnect-request', { username });
                } else {
                    // Trate outros status de resposta, se necessário
                    console.error(`Erro ao desconectar usuário: ${response.statusText}`);
                }
            })
            .catch(err => console.error(err));
            
            socket.on('disconnect-user', () => {
                window.location.href = '/index.html';
            });

        item.textContent = `${username} Saiu do chat`;
        item.style.backgroundColor = '#FFF';
        campoMensagem.appendChild(item);
    } else {
        item.textContent = `${username}: ${texto}`;
        item.style.backgroundColor = backColor;
        campoMensagem.appendChild(item);
    
        campoMensagem.scrollTop = campoMensagem.scrollHeight;
    
        if (history.length > maxMessageHistory) {
            history.shift();
        }
    }
});
