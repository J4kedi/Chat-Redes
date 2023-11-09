const socket = io();

const buttonInicio = document.querySelector('.botao-inicio');
const inputUserName = document.getElementById('name');
const form = document.getElementById('form');
const input = document.querySelector('.input');
const campoMensagem = document.getElementById('campo-mensagem');

const maxMessageHistory = 6;


// Redirecionar para chat

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
                // Redireciona para a página do chat
                window.location.href = '/inicial.html';
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

// Informar que um novo usuario entrou

socket.on('user-joined', (data) => {
    const userElement = document.createElement('div');
    userElement.textContent = `${data.username} entrou no chat!`;
    document.getElementById('user-list').appendChild(userElement);
});

socket.on('message history', (history) => {
    // Exibir o histórico de mensagens para o novo usuário
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

    window.scrollTo(0, document.body.scrollHeight);

    if (history.length > maxMessageHistory) {
        history.shift();
    }
});



// FECHAR COM /Q

socket.on('disconnect', () => {
    const chatInput = document.getElementById('chat-input');
    
    // Verifica se a mensagem é '/q' (quit chat)
    if (message === '/q') {
        socket.emit('quit-chat'); // Informa ao servidor that que o usuario deseja sair do chat
        socket.disconnect(); // Desconecta do servidor
        return;
    }

    // Envia a mensagem se ela não é '/q'
    socket.emit('chat-message', message);
});

// Adiciona o evento de saida do chat
if (chatInput) {
    chatInput.addEventListener('keydown', function(event) {
        try {
            if (event.key === 'Enter') {
                const message = chatInput.value;
                chatInput.value = '';
            }
        } catch (error) {
            // Tratar o erro
        }
    });
}