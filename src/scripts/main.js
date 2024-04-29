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

    // criar a grade
    function createGrid() {
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                gridContainer.append('<div class="cell"></div>');
            }
        }
        updateGrid(); 
        generateFood(); 
    }

    // iniciar o jogo
    function startGame() {
        if (!gameRunning) {
            interval = setInterval(moveSnake, speed);
            gameRunning = true;
        }
    }

    // parar o jogo
    function stopGame() {
        clearInterval(interval);
        gameRunning = false;
    }

    // reiniciar o jogo
    function restartGame() {
        snake = [{ x: 3, y: 10 }, { x: 2, y: 10 }, { x: 1, y: 10 }];
        direction = 'right';
        food = { x: 5, y: 5 };
        speed = 150;
        stopGame();
        if (score > highscore) {
            highscore = score; 
            $('#highscore-container').text(`High Score: ${highscore}`);
            localStorage.setItem('snakeHighscore', highscore); // Salva o high score no armazenamento local
        }
        score = 0; // Zera o score ao reiniciar o jogo
        $('#score-container').text(`Score: ${score}`); 
        $('#game-over').addClass('hidden'); // Exibe o elemento de "Game Over"
        startGame();
    }

    // mover a cobra
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
            }
            $('#game-over').removeClass('hidden'); 
            $('#game-over-score').text(`Score: ${score}`); 

            return;
        }
        snake.unshift(newHead);
        if (newHead.x === food.x && newHead.y === food.y) {
            generateFood();
            speed -= 5; 
            score++;
            updateScore();
        } else {
            snake.pop();
        }
        updateGrid();
    }

    // verificar colisão
    function checkCollision(head) {
        return (
            head.x < 0 ||
            head.y < 0 ||
            head.x >= gridSize ||
            head.y >= gridSize ||
            snake.some((segment) => segment.x === head.x && segment.y === head.y)
        );
    }

    // atualizar a grade
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

    // gerar comida
    function generateFood() {
        let x, y;
        do {
            x = Math.floor(Math.random() * gridSize);
            y = Math.floor(Math.random() * gridSize);
        } while (snake.some((segment) => segment.x === x && segment.y === y));
        food.x = x;
        food.y = y;
    }

    // atualizar a pontuação
    function updateScore() {
        $('#score-container').text(`Score: ${score}`);
        if (score > highscore) {
            $('#highscore-container').text(`High Score: ${score}`);
        } else {
            $('#highscore-container').text(`High Score: ${highscore}`);
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
    });

    $('#restart-button').click(restartGame);



    createGrid();
    updateScore(); // Atualiza a pontuação inicial
});
