import GIF from 'gif.js';

// Selecione o elemento onde você deseja exibir o GIF
const gifContainer = document.getElementById('gif-container');

// Crie uma instância do GIF
const gif = new GIF({
  workers: 2, // Número de workers (processos em segundo plano)
  quality: 10, // Qualidade
});

// Adicione um quadro do GIF
gif.addFrame(imageElement, { delay: 100 }); // Ajuste a propriedade 'delay' para alterar a velocidade

// Renderize o GIF no elemento HTML
gif.on('finished', (blob) => {
  const img = document.createElement('img');
  img.src = URL.createObjectURL(blob);
  gifContainer.appendChild(img);
});

gif.render();