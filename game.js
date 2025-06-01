const kitty = document.getElementById('kitty');
const game = document.getElementById('game');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('game-over');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const dayButton = document.getElementById('day-button');
const eveningButton = document.getElementById('evening-button');
const nightButton = document.getElementById('night-button');


let isJumping = false;
let isGameOver = false;
let score = 0;
let gameSpeed = 4;
let position = 0;
let obstacles = [];
let gameInterval;
let obstacleInterval;
let kittyToggleInterval; // переменная для управления интервалом смены картинок
let toggle = 1;      // переключатель картинок
let lastToggle = 0;
let kittySpeed = 400;

let backgrounds = [
  "url('background1.png')",
  "url('background2.png')",
  "url('backgrond3.png')"
];

function startGame() {
	// Скрываем экран старта и экране окончания игры
	startScreen.style.display = 'none';
	gameOverElement.style.display = 'none';

	isGameOver = false;
	score = 0;
	gameSpeed = 4;
	position = 0;
	
	scoreElement.textContent = score;

	obstacles.forEach(ob => ob.remove());
	obstacles = [];

	kitty.style.bottom = '20px';

	clearInterval(gameInterval);
	clearInterval(obstacleInterval);

	kittyToggleInterval = setInterval(() => {
		if (!isJumping && !isGameOver) {
			if (toggle == 0) {
				kitty.style.backgroundImage = "url('kitty3.png')";
				kitty.style.width = 79 + 'px';
				kitty.style.height = 75 + 'px';
				toggle = 1;
				lastToggle = 0;

			} else if (toggle == 1) {
				kitty.style.backgroundImage = "url('kitty.png')";
				kitty.style.width = 75 + 'px';
				kitty.style.height = 75 + 'px';
				toggle = 2;

				if (lastToggle == 2)
				{
					toggle = 0;
				}
				else
				{
					toggle = 2;
				}

			} else if (toggle == 2)
			{
				kitty.style.backgroundImage = "url('kitty2.png')";
				kitty.style.width = 70 + 'px';
				kitty.style.height = 75 + 'px';
				toggle = 1;
				lastToggle = 2;
			}
		}
	}, kittySpeed);

	gameInterval = setInterval(updateGame, 20);
	clearTimeout(obstacleInterval);  
	startObstacleSpawn();
}

function startObstacleSpawn() {
	if (isGameOver) return;

	createObstacle();

	const randomDelay = 2000 + Math.random() * 1200;

	obstacleInterval = setTimeout(startObstacleSpawn, randomDelay);
}

function jump() {
	// Если игрок уже прыгает или игра окончена, не начинаем новый прыжок
	if (isJumping || isGameOver) return;
	isJumping = true;

	// Поднимаем вверх
	let upInterval = setInterval(() => {
		kitty.style.backgroundImage = "url('jump.png')";
		kitty.style.width = 80 + 'px';
		kitty.style.height = 60 + 'px';

		if (position >= 140) {  // Высота прыжка 90px
			clearInterval(upInterval);

			// Начинаем опускать 
			let downInterval = setInterval(() => {
					if (position <= 0) {  // Когда касается земли
						kitty.style.backgroundImage = "url('kitty.png')";
						kitty.style.width = 75 + 'px';
						kitty.style.height = 75 + 'px';
						clearInterval(downInterval);
						isJumping = false;
						position = 0;
					} else {
						position -= 6;
						kitty.style.bottom = (position + 20) + 'px';
					}
			}, 20);
		} else {
			position += 4;
			kitty.style.bottom = (position + 20) + 'px';
		}
	}, 20);
}

function createObstacle() {
	// Прекращаем создание препятствий, если игра окончена
	if (isGameOver) return;

	// Создаем препятствие
	const obstacle = document.createElement('div');
	obstacle.classList.add('obstacle');

	const height = Math.random() > 0.5 ? 30 : 35; // Случайная высота препятствия
	obstacle.style.height = height + 'px';
	obstacle.style.width = height + 5 + 'px' ;
	obstacle.style.right = '40px';

	// Добавляем препятствие в игровую область
	game.appendChild(obstacle);
	obstacles.push({ element: obstacle, x: 0 });
}

function updateGame() {
	// Обновляем движение всех препятствий
	obstacles.forEach((ob, index) => {
		ob.x += gameSpeed;
		ob.element.style.right = ob.x + 'px';

		// Проверка на столкновение с дракончиком
		const obstacleLeft = game.clientWidth - ob.x;
		const obstacleRight = obstacleLeft + 20;
		const dragonLeft = 55;
		const dragonRight = 90;
		const dragonBottom = position;

		const obstacleHeight = parseInt(ob.element.style.height);
		
		if (
			obstacleLeft < dragonRight &&
			obstacleRight > dragonLeft &&
			dragonBottom < obstacleHeight
		) {
			gameOver();  // Если столкновение, конец игры
		}

		// Удаляем препятствия, которые ушли за экран и из массива 
		if (obstacleLeft + 20 < 0) {
			ob.element.remove();
			obstacles.splice(index, 1);

			// Увеличиваем счет и скорость
			if (!isGameOver) {
					score++;
					scoreElement.textContent = score;
					if (score % 10 === 0) {
						gameSpeed += 0.5;
						kittySpeed -= 40;
					}
			}
		}
	});
}

function gameOver() {
	// Конец игры, останавливаем интервалы
	isGameOver = true;
	clearInterval(gameInterval);
	clearTimeout(obstacleInterval);
	gameOverElement.style.display = 'block';  // Показываем экран окончания игры
	
	// Удалить все оставшиеся препятствия
	obstacles.forEach(ob => ob.element.remove());
	obstacles = [];
}

dayButton.addEventListener('click', () => {
	game.style.backgroundImage = backgrounds[0];
});

eveningButton.addEventListener('click', () => {
	game.style.backgroundImage = backgrounds[1];
});

nightButton.addEventListener('click', () => {
	game.style.backgroundImage = backgrounds[2];
});

// Слушаем нажатие клавиши
document.addEventListener('keydown', e => {
	if (e.code === 'Space') {
		if (isGameOver) {
			startGame();  // Перезапуск игры
		} else if (startScreen.style.display !== 'none') {
			startGame();  // Начало игры с экрана старта
		} else {
			jump();  // Прыжок
		}
		e.preventDefault();
	}
});

// Слушаем клики на игровую область
game.addEventListener('click', () => {
	if (isGameOver || startScreen.style.display !== 'none') {
		startGame();  // Перезапуск игры
	} else {
		jump();  // Прыжок
	}
});

// Слушаем клик по кнопке "Начать игру"
startButton.addEventListener('click', startGame);
