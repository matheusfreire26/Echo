// --- Echo_app/static/Echo_app/js/jogo_da_memoria.js ---

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('game-grid');
    const movesCounter = document.getElementById('moves-counter');
    const restartButton = document.getElementById('restart-button');

    // Conjunto de 8 emojis que serão duplicados para formar 8 pares (16 cartas)
    const cardEmojis = [
        '🍎', '🍌', '🍇', '🍉', '🍓', '🥝', '🍍', '🥭'
    ];
    
    let cardsArray = [];
    let firstCard = null;
    let secondCard = null;
    let lockBoard = false; // Bloqueia cliques enquanto duas cartas estão virando
    let moves = 0;
    let matches = 0;

    // Função para embaralhar um array (Algoritmo de Fisher-Yates)
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 1. Inicializa o Jogo
    function initializeGame() {
        // Cria 8 pares e embaralha
        cardsArray = shuffle([...cardEmojis, ...cardEmojis]);
        
        // Limpa a grade e o contador
        grid.innerHTML = '';
        moves = 0;
        matches = 0;
        movesCounter.textContent = moves;

        // Cria e injeta as cartas no DOM
        cardsArray.forEach((emoji, index) => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card');
            cardElement.setAttribute('data-emoji', emoji);
            cardElement.setAttribute('data-index', index);

            cardElement.innerHTML = `
                <div class="card-face card-front">${emoji}</div>
                <div class="card-face card-back"></div>
            `;

            cardElement.addEventListener('click', flipCard);
            grid.appendChild(cardElement);
        });
    }

    // 2. Lógica de Virar a Carta
    function flipCard() {
        // Ignora se o tabuleiro estiver travado ou se a carta já estiver combinada/virada
        if (lockBoard) return;
        if (this === firstCard) return; // Evita clicar na mesma carta duas vezes

        this.classList.add('flipped');

        // Primeira carta virada
        if (!firstCard) {
            firstCard = this;
            return;
        }

        // Segunda carta virada
        secondCard = this;
        lockBoard = true; // Trava o tabuleiro após a segunda carta
        
        // Incrementa e exibe os movimentos
        moves++;
        movesCounter.textContent = moves;

        // Verifica a correspondência
        checkForMatch();
    }

    // 3. Verifica se as duas cartas viradas são um par
    function checkForMatch() {
        // Verifica se os atributos 'data-emoji' das duas cartas são iguais
        const isMatch = firstCard.getAttribute('data-emoji') === secondCard.getAttribute('data-emoji');
    
        // Se for um par: desativa o clique (permanece virada)
        isMatch ? disableCards() : unflipCards(); // ⬅️ Ponto de decisão
    }

    // 4. Ação: Par Encontrado
   function disableCards() {
        // 1. Remove Listeners: Impede que as cartas sejam clicadas novamente.
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
    
        // 2. Adiciona a classe visual 'matched' (que as impede de serem desviradas)
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
    
        matches++;
    
        // 3. 🚨 ESSENCIAL: Zera o estado para permitir o próximo turno.
        resetBoard(); 
    
        // ... (verifica se o jogo acabou) ...
    }

    // 5. Ação: Não é um Par
    function unflipCards() {
        // Adiciona a classe 'locked' na grid para impedir cliques até que o setTimeout termine
        grid.classList.add('locked'); 
    
        // Espera 1.5 segundo, depois vira as cartas de volta
        setTimeout(() => {
        // 🚨 NOVO CHECK: Só desvira se a carta ainda não foi marcada como 'matched'
        if (!firstCard.classList.contains('matched')) {
            firstCard.classList.remove('flipped');
        }
        if (!secondCard.classList.contains('matched')) {
            secondCard.classList.remove('flipped');
        }
        
        grid.classList.remove('locked');
        resetBoard();
        }, 1500);
    }

    // 6. Reseta as Variáveis de Controle de Turno
    function resetBoard() {
        [firstCard, secondCard, lockBoard] = [null, null, false];
    }

    // 7. Event Listener para o Botão de Reiniciar
    restartButton.addEventListener('click', () => {
        // Aplica uma animação sutil para esconder antes de re-inicializar
        grid.style.opacity = '0'; 
        setTimeout(() => {
            initializeGame();
            grid.style.opacity = '1';
        }, 300);
    });

    // Inicia o jogo quando a página carrega
    initializeGame();
});