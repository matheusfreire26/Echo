// --- Echo_app/static/Echo_app/js/jogo_da_forca.js ---

document.addEventListener('DOMContentLoaded', () => {
    // =====================================
    // DADOS DO JOGO
    // =====================================
    const palavrasPorTema = {
        'Esportes': [
            { palavra: 'FUTEBOL', dica: 'O esporte mais popular do Brasil.' },
            { palavra: 'VÔLEI', dica: 'Jogado em quadra ou na areia, a bola não pode cair.' },
            { palavra: 'NATAÇÃO', dica: 'Modalidade de piscina.' },
            { palavra: 'ATLETISMO', dica: 'Conjunto de corridas, saltos e arremessos.' },
        ],
        'Cultura Pop': [
            { palavra: 'CINEMA', dica: 'A sétima arte.' },
            { palavra: 'NOVEMBRO', dica: 'Um mês frio, uma série de sucesso.' },
            { palavra: 'PIZZA', dica: 'Comida de filme de herói.' },
            { palavra: 'ROCK', dica: 'Gênero musical de guitarras distorcidas.' },
        ],
        'Tecnologia': [
            { palavra: 'ALGORITMO', dica: 'Sequência de passos para resolver um problema.' },
            { palavra: 'INTERNET', dica: 'Rede mundial de computadores.' },
            { palavra: 'JAVASCRIPT', dica: 'Linguagem de script usada neste jogo.' },
            { palavra: 'CELULAR', dica: 'Dispositivo móvel que você provavelmente está usando.' },
        ],
        'Cidades PE': [
            { palavra: 'RECIFE', dica: 'A capital pernambucana.' },
            { palavra: 'OLINDA', dica: 'Cidade conhecida pelo carnaval histórico.' },
            { palavra: 'CARUARU', dica: 'Capital do Forró e do Agreste.' },
            { palavra: 'PETROLINA', dica: 'Famosa pela produção de frutas no sertão.' },
        ]
    };

    const letrasAlfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    // =====================================
    // ELEMENTOS DO DOM E ESTADO
    // =====================================
    let palavraSecreta = '';
    let temaAtual = '';
    let dicaAtual = ''; // Variável para armazenar a dica
    let letrasAdivinhadas = [];
    let erros = 0;
    const maxErros = 8; // MÁXIMO DE ERROS ajustado para 8
    let jogoAtivo = true;

    // Elementos DOM
    const wordDisplay = document.getElementById('word-display');
    const keyboardContainer = document.getElementById('keyboard-container');
    const hangmanImage = document.getElementById('hangman-image'); 
    const messageDisplay = document.getElementById('message-display');
    const incorrectGuessesTable = document.getElementById('incorrect-guesses');
    const correctGuessesTable = document.getElementById('correct-guesses-table');
    const errosCountDisplay = document.getElementById('erros-count'); 
    const restartButton = document.getElementById('restart-button');
    
    // NOVOS ELEMENTOS PARA TEMA E DICA
    const showHintButton = document.getElementById('show-hint-button');
    const hintTextContainer = document.getElementById('hint-text');
    const temaDisplayWord = document.getElementById('tema-display-word');
    const temaDisplayHint = document.getElementById('tema-display-hint');
    
    // Verifica se a variável STATIC_IMAGE_PATH (definida no HTML) existe
    if (typeof STATIC_IMAGE_PATH === 'undefined') {
        console.error("A variável STATIC_IMAGE_PATH não está definida no HTML. O jogo não funcionará corretamente.");
        return; 
    }

    // =====================================
    // FUNÇÕES DE LÓGICA
    // =====================================

    /**
     * Inicializa um novo jogo.
     */
    function initializeGame() {
        letrasAdivinhadas = [];
        erros = 0;
        jogoAtivo = true;
        messageDisplay.textContent = '';
        messageDisplay.classList.remove('game-over', 'game-win');

        // Resetar o desenho da forca para a primeira imagem (forca1.jpeg)
        hangmanImage.src = `${STATIC_IMAGE_PATH}forca1.jpeg`;

        // Seleciona tema e palavra aleatória
        const temas = Object.keys(palavrasPorTema);
        temaAtual = temas[Math.floor(Math.random() * temas.length)];
        const palavrasDoTema = palavrasPorTema[temaAtual];
        const palavraObj = palavrasDoTema[Math.floor(Math.random() * palavrasDoTema.length)];

        palavraSecreta = palavraObj.palavra;
        dicaAtual = palavraObj.dica; // Armazena a dica

        // Atualiza UI
        temaDisplayWord.textContent = temaAtual; // Exibe apenas o TEMA
        temaDisplayHint.textContent = dicaAtual; // Armazena a dica
        hintTextContainer.classList.remove('visible'); // Esconde a dica
        showHintButton.disabled = false; // Habilita o botão de dica
        
        renderWordDisplay();
        renderKeyboard();
        updateHistoryTable();
    }

    /**
     * Renderiza a palavra oculta no DOM.
     */
    function renderWordDisplay() {
        wordDisplay.innerHTML = palavraSecreta.split('').map(letra => {
            const displayLetra = letrasAdivinhadas.includes(letra) ? letra : '_';
            return `<span>${displayLetra}</span>`;
        }).join('');
    }

    /**
     * Cria os botões do teclado virtual.
     */
    function renderKeyboard() {
        keyboardContainer.innerHTML = '';
        letrasAlfabeto.forEach(letra => {
            const button = document.createElement('button');
            button.classList.add('key-button');
            button.textContent = letra;
            button.setAttribute('data-letra', letra);
            button.addEventListener('click', () => handleGuess(letra, button));
            button.disabled = letrasAdivinhadas.includes(letra);
            keyboardContainer.appendChild(button);
        });
    }

    /**
     * Lida com o palpite de uma letra.
     */
    function handleGuess(letra, button) {
        if (!jogoAtivo || letrasAdivinhadas.includes(letra)) return;

        letrasAdivinhadas.push(letra);
        button.disabled = true;

        if (palavraSecreta.includes(letra)) {
            // Acertou
            button.classList.add('correct');
            renderWordDisplay();
            updateHistoryTable();
            checkGameStatus();
        } else {
            // Errou
            button.classList.add('incorrect');
            erros++;
            drawHangmanPart(); // Chama a função para mudar a imagem
            updateHistoryTable();
            checkGameStatus();
        }
    }

    /**
     * Desenha as partes da forca conforme número de erros (Muda a imagem JPEG).
     */
    function drawHangmanPart() {
        if (erros > 0 && erros <= maxErros) {
             hangmanImage.src = `${STATIC_IMAGE_PATH}forca${erros}.jpeg`;
        }
        
        errosCountDisplay.textContent = `${erros}`;
    }

    /**
     * Exibe a dica e desabilita o botão de lâmpada.
     */
    function showHint() {
        if (!showHintButton.disabled) {
            hintTextContainer.classList.add('visible');
            showHintButton.disabled = true; // Desabilita após o primeiro uso
        }
    }

    /**
     * Atualiza a tabela de tentativas anteriores.
     */
    function updateHistoryTable() {
        const letrasErradas = letrasAdivinhadas.filter(letra => !palavraSecreta.includes(letra));
        incorrectGuessesTable.textContent = letrasErradas.join(', ');

        const letrasCorretas = letrasAdivinhadas.filter(letra => palavraSecreta.includes(letra));
        correctGuessesTable.textContent = letrasCorretas.join(', ');
        
        errosCountDisplay.textContent = `${erros}`; 
    }

    /**
     * Verifica se o jogo terminou (vitória ou derrota).
     */
    function checkGameStatus() {
        const palavraAtual = palavraSecreta.split('').map(letra => letrasAdivinhadas.includes(letra) ? letra : '_').join('');

        if (palavraAtual === palavraSecreta) {
            jogoAtivo = false;
            messageDisplay.textContent = '🎉 Parabéns! Você salvou o boneco!';
            messageDisplay.classList.remove('game-over');
            messageDisplay.classList.add('game-win');
            disableKeyboard();
            showHintButton.disabled = true;
            hintTextContainer.classList.add('visible'); // Mostra a dica na vitória
        } else if (erros >= maxErros) {
            jogoAtivo = false;
            messageDisplay.innerHTML = `Fim de jogo! A palavra era: <strong>${palavraSecreta}</strong>`;
            messageDisplay.classList.remove('game-win');
            messageDisplay.classList.add('game-over');
            disableKeyboard();
            showHintButton.disabled = true;
            hintTextContainer.classList.add('visible'); // Mostra a dica na derrota

            // Garante que a imagem final (forca8.jpeg) seja exibida
            hangmanImage.src = `${STATIC_IMAGE_PATH}forca${maxErros}.jpeg`;
        }
    }

    /**
     * Desabilita todos os botões do teclado.
     */
    function disableKeyboard() {
        document.querySelectorAll('.key-button').forEach(button => {
            button.disabled = true;
        });
    }

    // =====================================
    // EVENT LISTENERS
    // =====================================
    restartButton.addEventListener('click', initializeGame);
    showHintButton.addEventListener('click', showHint); // Listener para o botão de lâmpada

    // Adiciona listener para teclado físico
    document.addEventListener('keydown', (event) => {
        const key = event.key.toUpperCase();
        if (letrasAlfabeto.includes(key) && jogoAtivo) {
            const button = document.querySelector(`.key-button[data-letra="${key}"]`);
            if (button && !button.disabled) {
                // Simula o clique do botão para acionar a mesma lógica
                handleGuess(key, button);
            }
        }
    });

    // Inicia o jogo
    initializeGame();
});