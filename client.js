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

socket.on('message history', (history) => {
    const startIndex = Math.max(history.length - maxMessageHistory, 0);
    const limitedHistory = history.slice(startIndex);

    limitedHistory.forEach((userMessage) => {
        const item = document.createElement('li');
        item.textContent = `${userMessage.username}: ${userMessage.text}`;
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

    item.textContent = `${userMessage.username}: ${userMessage.text}`;
    campoMensagem.appendChild(item);

    campoMensagem.scrollTop = (0, document.campoMensagem.scrollHeight);

    if (history.length > maxMessageHistory) {
        history.shift();
    }
});