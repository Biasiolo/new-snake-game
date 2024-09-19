$(document).ready(function() {
    const gridContainer = $('#grid-container');
    const gridSize = 20;
    let snake = [{ x: 3, y: 10 }, { x: 2, y: 10 }, { x: 1, y: 10 }];
    let direction = 'right';
    let food = { x: 5, y: 5 };
    let interval;
    let speed = 110;
    let gameRunning = false;
    let score = 0;
    let highscore = localStorage.getItem('highscore') || 0;
    let isMusicOn = true; // Inicialmente o som está ativado

    // Variáveis para níveis
    let level = 1; // Nível inicial
    const applesPerLevel = 10; // Maçãs necessárias para avançar de nível

    // Referências aos elementos de áudio
    const overSound = $('#over')[0];
    const appleSound = $('#apple')[0];
    const hscoreSound = $('#hscore')[0];
    const themeSound = $('#theme')[0];

    // Função para tocar o som
    function playSound(sound) {
        if (!sound.paused) {
            sound.currentTime = 0;
        }
        sound.play();
    }

    // Função para parar o som
    function stopSound(sound) {
        sound.pause();
        sound.currentTime = 0;
    }

    // Função para exibir mensagem de nível
    function showLevelUpMessage() {
        $('#current-level').text(level);
        $('#level-up-message').removeClass('hidden');
        // Ocultar a mensagem após 3 segundos e iniciar a contagem regressiva
        setTimeout(() => {
            $('#level-up-message').addClass('hidden');
            startCountdown();
        }, 1500);
    }

    // Função para iniciar a contagem regressiva
    function startCountdown() {
        let countdown = 3;
        $('#countdown-number').text(countdown);
        $('#countdown-message').removeClass('hidden');

        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                $('#countdown-number').text(countdown);
            } else {
                clearInterval(countdownInterval);
                $('#countdown-message').addClass('hidden');
                resumeGame();
            }
        }, 1000);
    }

    // Função para retomar o jogo após a contagem regressiva
    function resumeGame() {
        increaseSpeed();
        startGame();
    }

    // Criar a grade
    function createGrid() {
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                gridContainer.append('<div class="cell"></div>');
            }
        }
        updateGrid(); 
        generateFood(); 
    }

    // Iniciar o jogo
    function startGame() {
        if (!gameRunning) {
            if (isMusicOn) {
                stopSound(themeSound); // Para o tema quando o jogo é reiniciado
            }
            interval = setInterval(moveSnake, speed);
            gameRunning = true;
        }
    }

    // Parar o jogo
    function stopGame() {
        clearInterval(interval);
        gameRunning = false;
        stopSound(themeSound); // Para o tema quando o jogo é pausado
    }

    // Reiniciar o jogo
    function restartGame() {
        snake = [{ x: 3, y: 10 }, { x: 2, y: 10 }, { x: 1, y: 10 }];
        direction = 'right';
        food = { x: 5, y: 5 };
        speed = 110; // Reinicia a velocidade inicial
        level = 1; // Reinicia o nível
        stopGame();
        if (score > highscore) {
            highscore = score; 
            $('#highscore-container').text(`High Score: ${highscore}`);
            localStorage.setItem('highscore', highscore); // Salva o high score no armazenamento local
        }
        score = 0; // Zera o score ao reiniciar o jogo
        $('#score-container').text(`Score: ${score}`); 
        $('#highscore-container').text(`High Score: ${highscore}`); // Atualiza o high score no display
        $('#game-over').addClass('hidden'); // Oculta o elemento de "Game Over"
        $('#current-level').text(level); // Atualiza o nível no display
        stopSound(themeSound); // Para o tema quando o jogo é reiniciado
        startGame();
    }

    // Mover a cobra
    function moveSnake() {
        let head = snake[0];
        let newHead;
        if (direction === 'right') {
            newHead = { x: head.x + 1, y: head.y };
        } else if (direction === 'left') {
            newHead = { x: head.x - 1, y: head.y };
        } else if (direction === 'up') {
            newHead = { x: head.x, y: head.y - 1 };
        } else if (direction === 'down') {
            newHead = { x: head.x, y: head.y + 1 };
        }

        if (checkCollision(newHead)) {
            stopGame();
            if (score > highscore) {
                highscore = score;
                localStorage.setItem('highscore', highscore);
                updateScore();
                playSound(hscoreSound); // Toca o som de high score
            }
            $('#game-over').removeClass('hidden'); 
            $('#game-over-score').text(`Score: ${score}`); 
            playSound(overSound); // Toca o som de game over

            // Atrasar o início do tema em 1 segundo após o som de game over
            setTimeout(function() {
                if (isMusicOn) { // Verifica se o som está ativado
                    themeSound.play(); // Retorna ao tema quando o jogo termina
                }
            }, 1000);

            return;
        }

        snake.unshift(newHead);
        if (newHead.x === food.x && newHead.y === food.y) {
            generateFood();
            score++;
            updateScore();
            playSound(appleSound); // Toca o som ao comer a maçã

            // Verifica se alcançou a quantidade de maçãs para avançar de nível
            if (score % applesPerLevel === 0) {
                level++;
                showLevelUpMessage();
                stopGame(); // Pausa o jogo ao avançar de nível
            }
        } else {
            snake.pop();
        }
        updateGrid();
    }

    // Verificar colisão
    function checkCollision(head) {
        return (
            head.x < 0 ||
            head.y < 0 ||
            head.x >= gridSize ||
            head.y >= gridSize ||
            snake.some((segment) => segment.x === head.x && segment.y === head.y)
        );
    }

    // Atualizar a grade
    function updateGrid() {
        const cells = $('.cell');
        cells.removeClass('alive').removeClass('food');
        snake.forEach((segment) => {
            const index = segment.x + segment.y * gridSize;
            cells.eq(index).addClass('alive');
        });
        const foodIndex = food.x + food.y * gridSize;
        cells.eq(foodIndex).addClass('food');
    }

    // Gerar comida
    function generateFood() {
        let x, y;
        do {
            x = Math.floor(Math.random() * gridSize);
            y = Math.floor(Math.random() * gridSize);
        } while (snake.some((segment) => segment.x === x && segment.y === y));
        food.x = x;
        food.y = y;
    }

    // Atualizar a pontuação
    function updateScore() {
        $('#score-container').text(`Score: ${score}`);
        if (score > highscore) {
            $('#highscore-container').text(`High Score: ${score}`);
        } else {
            $('#highscore-container').text(`High Score: ${highscore}`);
        }
    }

    // Aumentar a velocidade do jogo
    function increaseSpeed() {
        if (speed > 50) { // Define um limite mínimo para a velocidade
            speed -= 10; // Aumenta a velocidade diminuindo o intervalo
        }
    }

    // Event listener para teclas
    $(document).keydown(function(event) {
        if (event.key === 'ArrowRight' && direction !== 'left') {
            direction = 'right';
            event.preventDefault();
        } else if (event.key === 'ArrowLeft' && direction !== 'right') {
            direction = 'left';
            event.preventDefault();
        } else if (event.key === 'ArrowUp' && direction !== 'down') {
            direction = 'up';
            event.preventDefault();
        } else if (event.key === 'ArrowDown' && direction !== 'up') {
            direction = 'down';
            event.preventDefault();
        } else if (event.key === 'Shift' && !gameRunning) {
            startGame();
            event.preventDefault();
        } else if (event.key === 'Shift' && gameRunning) {
            stopGame();
            event.preventDefault();
        }
        // Adicionando o controle para reiniciar o jogo com a tecla Ctrl quando em Game Over
        else if (event.key === 'Control' && $('#game-over').is(':visible')) {
            restartGame();
            event.preventDefault();
        }
    });
    

    // Reiniciar o jogo e parar o tema
    $('#restart-button').click(function() {
        restartGame();
        stopSound(themeSound); // Para o tema quando o botão de reinício é pressionado
    });

    // Controlar o som do tema
    $('#soundOff').text('Music On').click(function() {
        if (themeSound.paused) {
            themeSound.play();
            $('#soundOff').text('Music On');
            isMusicOn = true; // O som está ativado
        } else {
            stopSound(themeSound);
            $('#soundOff').text('Music Off');
            isMusicOn = false; // O som está desativado
        }
    });

    createGrid();
    updateScore(); // Atualiza a pontuação inicial
});
