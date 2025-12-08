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
    let letrasAdivinhadas = [];
    let erros = 0;
    let jogoAtivo = true;

    // Elementos DOM
    const wordDisplay = document.getElementById('word-display');
    const keyboardContainer = document.getElementById('keyboard-container');
    const forcaGabarito = document.getElementById('forca-gabarito');
    const messageDisplay = document.getElementById('message-display');
    const temaDisplay = document.querySelector('#tema-display span');
    const incorrectGuessesTable = document.getElementById('incorrect-guesses');
    const correctGuessesTable = document.getElementById('correct-guesses-table');
    const restartButton = document.getElementById('restart-button');

    // Contagem de peças existentes no HTML (peças do boneco, com data-step)
    const forcaPieces = Array.from(document.querySelectorAll('.forca-piece'))
        .sort((a, b) => (parseInt(a.dataset.step) || 0) - (parseInt(b.dataset.step) || 0));
    const maxErros = Math.max(forcaPieces.length, 1); // garante >=1

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
        // NÃO limpamos o innerHTML do forca-gabarito (peças são estáticas no HTML)
        messageDisplay.textContent = '';
        messageDisplay.classList.remove('game-over', 'game-win');

        // Seleciona tema e palavra aleatória
        const temas = Object.keys(palavrasPorTema);
        temaAtual = temas[Math.floor(Math.random() * temas.length)];
        const palavrasDoTema = palavrasPorTema[temaAtual];
        const palavraObj = palavrasDoTema[Math.floor(Math.random() * palavrasDoTema.length)];

        palavraSecreta = palavraObj.palavra;

        // Atualiza UI
        temaDisplay.textContent = `${temaAtual} (Dica: ${palavraObj.dica})`;
        renderWordDisplay();
        renderKeyboard();
        updateHistoryTable();

        // tenta resetar desenho se função estiver disponível (script inline pode definir)
        if (typeof window.resetHangman === 'function') {
            window.resetHangman();
        } else {
            // fallback: remove classe visível das peças se existirem
            forcaPieces.forEach(p => p.classList.remove('forca-piece-visible'));
        }
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
            drawHangmanPart();
            updateHistoryTable();
            checkGameStatus();
        }
    }

    /**
     * Desenha as partes da forca conforme número de erros.
     * Agora usa as peças estáticas do DOM (com data-step) ou funções globais se existirem.
     */
    function drawHangmanPart() {
        // limita erros ao maxErros
        if (erros < 0) erros = 0;
        if (erros > maxErros) erros = maxErros;

        // Se função global do template estiver disponível, use-a (preferível)
        if (typeof window.showHangmanStep === 'function') {
            try {
                window.showHangmanStep(erros);
                return;
            } catch (e) {
                // segue para fallback se erro
                console.warn('showHangmanStep falhou, usando fallback local.', e);
            }
        }

        // Fallback: aplica classe nas peças correspondentes
        forcaPieces.forEach(p => {
            const s = parseInt(p.dataset.step) || 0;
            if (s > 0 && s <= erros) {
                p.classList.add('forca-piece-visible');
                p.setAttribute('aria-hidden', 'false');
            } else {
                p.classList.remove('forca-piece-visible');
                p.setAttribute('aria-hidden', 'true');
            }
        });
    }

    /**
     * Atualiza a tabela de tentativas anteriores.
     */
    function updateHistoryTable() {
        const letrasErradas = letrasAdivinhadas.filter(letra => !palavraSecreta.includes(letra));
        incorrectGuessesTable.textContent = letrasErradas.join(', ');

        const letrasCorretas = letrasAdivinhadas.filter(letra => palavraSecreta.includes(letra));
        correctGuessesTable.textContent = letrasCorretas.join(', ');
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
        } else if (erros >= maxErros) {
            jogoAtivo = false;
            messageDisplay.innerHTML = `💀 Fim de jogo! A palavra era: <strong>${palavraSecreta}</strong>`;
            messageDisplay.classList.remove('game-win');
            messageDisplay.classList.add('game-over');
            disableKeyboard();

            // mostra o boneco completo (garante exibição total)
            if (typeof window.showHangmanStep === 'function') {
                try { window.showHangmanStep(maxErros); } catch (e) {}
            } else {
                forcaPieces.forEach(p => p.classList.add('forca-piece-visible'));
            }
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

    // Inicia o jogo
    initializeGame();
});
