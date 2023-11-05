const socket = io();

const form = document.getElementById('form');
const input = document.querySelector('.input');
const campoMensagem = document.getElementById('campo-mensagem');

const maxMessageHistory = 6;


// Redirecionar para chat

function submitUsername() {
    var username = $('#username').val();

    $.ajax({
        url: '/login',
        type: 'POST',
        data: {
            username: username
        },
        success: function (response) {
            if (response.success) {
                // Redireciona para a página do chat
                window.location.href = '/chat';
            } else {
                // Trata o erro
                console.log(response.message);
            }
        },
        error: function (error) {
            // Trata o erro
            console.log(error);
        }
    });
}

socket.on('message history', (history) => {
    // Exibir o histórico de mensagens para o novo usuário

    const startIndex = Math.max(history.length - maxMessageHistory, 0);
    const limitedHistory = history.slice(startIndex);

    limitedHistory.forEach((msg) => {
        const item = document.createElement('li');
        item.textContent = msg;

        campoMensagem.appendChild(item);
    });
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

socket.on('chat message', (msg) => {
    const item = document.createElement('li');
    item.textContent = msg;
    campoMensagem.appendChild(item);

    window.scrollTo(0, document.body.scrollHeight);

    history.push(msg);
    if (history.length > maxMessageHistory) {
        history.shift();
    }
});