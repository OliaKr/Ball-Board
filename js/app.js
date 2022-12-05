var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE'

var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var GLUE_IMG = '<img src="img/glue.png" />';

var gBoard;
var gGamerPos;

var gBallsCollected
var gBallsAdded
var isGlued = false
var gIntervalBall;
var gIntervalGlue;

function initGame() {
	gGamerPos = { i: 2, j: 9 };
	gBallsCollected = 0
	gBallsAdded = 2
	isGlued = false
	gBoard = buildBoard();
	renderBoard(gBoard);
	gIntervalBall = setInterval(setBall, 4500)
	gIntervalGlue = setInterval(setGlue, 5000)
}

function restartGame() {
	initGame()
	updateScore(0)
	document.querySelector('.restart').classList.add('hide')
}

function updateScore(score) {
	gBallsCollected += score
	var elBalls = document.querySelector('h3 span')
	elBalls.innerText = gBallsCollected
}

function buildBoard() {
	// Create the Matrix
	var board = createMat(11, 13)


	// Put FLOOR everywhere and WALL at edges
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[0].length; j++) {
			// Put FLOOR in a regular cell
			var cell = { type: FLOOR, gameElement: null };

			// Place Walls at edges
			if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
				cell.type = WALL;
			}

			// Add created cell to The game board
			board[i][j] = cell;
		}
	}
	// var cell = { type: FLOOR, gameElement: null };
	board[0][6].type = FLOOR;
	board[10][6].type = FLOOR;
	board[5][0].type = FLOOR;
	board[5][12].type = FLOOR;

	// Place the gamer at selected position
	board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

	// Place the Balls (currently randomly chosen positions)
	board[3][8].gameElement = BALL;
	board[7][4].gameElement = BALL;


	// console.log(board);
	return board;
}

function setBall() {
	var emptyCells = getEmptyCells(gBoard)
	if (!emptyCells.length) return
	var randIdx = getRandomInt(0, emptyCells.length)
	var randCell = emptyCells[randIdx]
	gBoard[randCell.i][randCell.j].gameElement = BALL;
	renderCell(randCell, BALL_IMG)
	gBallsAdded++
}

function setGlue() {
	var emptyCells = getEmptyCells(gBoard)
	if (!emptyCells.length) return
	var randIdx = getRandomInt(0, emptyCells.length)
	var randCell = emptyCells[randIdx]
	gBoard[randCell.i][randCell.j].gameElement = GLUE;
	renderCell(randCell, GLUE_IMG)

	setTimeout(clearGlue, 3000, randCell)
}

function clearGlue(randCell) {
	if (gBoard[randCell.i][randCell.j].gameElement !== GAMER) {
		gBoard[randCell.i][randCell.j].gameElement = null;
		renderCell(randCell, '');
	}
}

function getEmptyCells(board) {
	var emptyCells = []
	for (var i = 0; i < board.length; i++)
		for (var j = 0; j < board[0].length; j++) {
			if (!board[i][j].gameElement && board[i][j].type === 'FLOOR') {
				emptyCells.push({ i: i, j: j })
			}
		}
	return emptyCells
}


// Render the board to an HTML table
function renderBoard(board) {

	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];

			var cellClass = getClassName({ i: i, j: j })

			// TODO - change to short if statement
			// if (currCell.type === FLOOR) cellClass += ' floor';
			// else if (currCell.type === WALL) cellClass += ' wall';

			cellClass += (currCell.type === FLOOR) ? ' floor' : ' wall';


			//TODO - Change To template string
			strHTML += '\t<td class="cell ' + cellClass +
				'"  onclick="moveTo(' + i + ',' + j + ')" >\n';

			// TODO - change to switch case statement
			if (currCell.gameElement === GAMER) {
				strHTML += GAMER_IMG;
			} else if (currCell.gameElement === BALL) {
				strHTML += BALL_IMG;
			}

			strHTML += '\t</td>\n';
		}
		strHTML += '</tr>\n';
	}

	// console.log('strHTML is:');
	// console.log(strHTML);
	var elBoard = document.querySelector('.board');
	elBoard.innerHTML = strHTML;
}

function gameOver() {
	clearInterval(gIntervalBall)
	clearInterval(gIntervalGlue)
	var elRestart = document.querySelector('.restart')
	elRestart.classList.remove('hide');

}

// Move the player to a specific location
function moveTo(i, j) {

	if (isGlued) return

	if (i === -1) i = gBoard.length - 1;
	else if (i === gBoard.length) i = 0;
	else if (j === -1) j = gBoard[0].length - 1;
	else if (j === gBoard[0].length) j = 0;

	var targetCell = gBoard[i][j];
	if (targetCell.type === WALL) return;

	// Calculate distance to make sure we are moving to a neighbor cell
	var iAbsDiff = Math.abs(i - gGamerPos.i);
	var jAbsDiff = Math.abs(j - gGamerPos.j);

	// If the clicked Cell is one of the four allowed
	if ((iAbsDiff === 1 && jAbsDiff === 0) ||
		(jAbsDiff === 1 && iAbsDiff === 0) ||
		(jAbsDiff === 12 && iAbsDiff === 0) ||
		(jAbsDiff === 0 && iAbsDiff === 10)) {

		if (targetCell.gameElement === BALL) {
			updateScore(1);
			playSound()
			console.log('Collecting!');
			checkGameOver()

		} else if (targetCell.gameElement === GLUE) {
			isGlued = true
			setTimeout(function () {
				isGlued = false
			}, 3000);
		}
		// MOVING from current position
		// Model:
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
		// Dom:
		renderCell(gGamerPos, '');

		// MOVING to selected position
		// Model:
		gGamerPos.i = i;
		gGamerPos.j = j;
		gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
		// DOM:
		renderCell(gGamerPos, GAMER_IMG);

	} // else console.log('TOO FAR', iAbsDiff, jAbsDiff);

}

function checkGameOver() {
	if (gBallsCollected === gBallsAdded) gameOver()
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
	var cellSelector = '.' + getClassName(location)
	var elCell = document.querySelector(cellSelector);
	elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {
	var i = gGamerPos.i;
	var j = gGamerPos.j;
	switch (event.key) {
		case 'ArrowLeft':
			moveTo(i, j - 1);
			break;
		case 'ArrowRight':
			moveTo(i, j + 1);
			break;
		case 'ArrowUp':
			moveTo(i - 1, j);
			break;
		case 'ArrowDown':
			moveTo(i + 1, j);
			break;
	}
}

// Returns the class name for a specific cell
function getClassName(location) {
	var cellClass = 'cell-' + location.i + '-' + location.j;
	return cellClass;
}

function playSound() {
	var sound = new Audio("sound/pop.mp3")
	sound.play()
}


// ***************************************************************
// Another option for handling the passages

// function handleKey(event) {

// 	var i = gGamerPos.i;
// 	var j = gGamerPos.j;

// 	switch (event.key) {
// 		case 'ArrowLeft':
// 			if (j === 0) moveTo(i, gBoard[0].length - 1);
// 			else moveTo(i, j - 1);
// 			break;
// 		case 'ArrowRight':
// 			if (j === gBoard[0].length - 1) moveTo(i, 0);
// 			else moveTo(i, j + 1);
// 			break;
// 		case 'ArrowUp':
// 			if (i === 0) moveTo(gBoard.length - 1, j);
// 			else moveTo(i - 1, j);
// 			break;
// 		case 'ArrowDown':
// 			if (i === gBoard.length - 1) moveTo(0, j);
// 			else moveTo(i + 1, j);
// 			break;
// 	}
// }
