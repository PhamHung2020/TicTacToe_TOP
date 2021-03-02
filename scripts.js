const pubSub = (
    function () {
        const events = {};

        function subscribe(eventName, callbackFunc) {
            if (!events[eventName])
                events[eventName] = [];
            events[eventName].push(callbackFunc);
        }

        function publish(eventName, data) {
            if (!events[eventName]) return;
            events[eventName].forEach(callbackFunc => callbackFunc(data));
        }

        return { subscribe, publish }
    }
)();

function gameBoard() {
    const board = ['', '', '', '', '', '', '', '', ''];

    function getBoard(index) { return board[index]; }

    function setBoard(index, char) {
        if (index >= 0 && index <= 8) board[index] = char; 
    }

    function checkLine(index1, index2, index3) {
        if (board[index1] == board[index2] && board[index2] == board[index3] &&
            board[index1] == board[index3] && board[index1] != '')
            return board[index1];
        return null;
    }

    function checkWin() {
        return (checkLine(0, 1, 2, board) || checkLine(3, 4, 5, board) ||
                checkLine(6, 7, 8, board) || checkLine(0, 3, 6, board) ||
                checkLine(1, 4, 7, board) || checkLine(2, 5, 8, board) ||
                checkLine(0, 4, 8, board) || checkLine(2, 4, 6, board));
    }

    return { getBoard, setBoard, checkWin }
}

const gameBoardView = (function () {
    const boardView = document.getElementById('game-board');
    const buttons = boardView.childNodes;
    const board = gameBoard();

    function init() {
        for (let i = 0; i < 9; ++i) {
            const newButton = document.createElement('button');
            newButton.id = `button-${i}`;
            boardView.appendChild(newButton);
        }
        bindEvent();
        disable(true);
    }

    function bindEvent() {
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = +e.target.id[e.target.id.length - 1];
                pubSub.publish('move', index);
            })
        });
    }

    function setPos(index, playerName) {
        board.setBoard(index, playerName);
        buttons[index].textContent = playerName;
    }

    function clear() {
        buttons.forEach(button => button.textContent = '');
        for (let i = 0; i < 9; ++i) board.setBoard(i, '');
    }

    function disable(isDisable) {
        buttons.forEach(button => button.disabled = isDisable);
    }

    function getBoard() { return board; }

    return { init, setPos, clear, disable, getBoard }
})();

const choice_section = (function () {
    const buttonX = document.getElementById('x');
    const buttonO = document.getElementById('o');
    const buttonStart = document.getElementById('start-restart');
    const selectLevel = document.getElementById('level');

    function init() {
        buttonX.classList.add('border');
        bindEvent();
    }

    function disable(isDisable) {
        selectLevel.disabled = isDisable;
        buttonX.disabled = isDisable;
        buttonO.disabled = isDisable;
    }

    function bindEvent() {
        buttonO.addEventListener('click', function () { switchWeapon(buttonO) });
        buttonX.addEventListener('click', function () { switchWeapon(buttonX) });
        buttonStart.addEventListener('click', () => {
            if (buttonStart.textContent == 'Start') {
                buttonStart.textContent = 'Restart';
                pubSub.publish('start', null);
            }
            else {
                buttonStart.textContent = 'Start';
                pubSub.publish('restart', null);
            }
        });
    }

    function switchWeapon(buttonClicked) {
        if (!buttonClicked.classList.contains('border')) {
            buttonX.classList.toggle('border');
            buttonO.classList.toggle('border');
        }
    }

    function getPlayerWeapon() {
        if (buttonX.classList.contains('border')) return 'X';
        return 'O';
    }

    function getLevel() { return selectLevel.value; }

    return { init, disable, getPlayerWeapon, getLevel }
})();

const computer = (
    function computerMove() {
        function easyMove(board) {
            let pos = 0;
            while (board.getBoard(pos) != '') {
                pos = Math.floor(Math.random() * 9);
            }
            return pos;
        }

        function mediumMove(board, count, playerName, computerName) {
            if (count < 3) return easyMove(board);
            else return hardMove(board, count, playerName, computerName);
        }

        function hardMove(board, count, playerName, computerName) {
            return minimax(board, count, true, computerName, playerName)[2];
        }

        return { easyMove, mediumMove, hardMove }
    }
)();

const game = (
    function () {
        let playerName = null;
        let computerName = null;
        let level = null;
        let count = 0;
        const announce = document.getElementById('announce-winner');

        function start() {
            if (choice_section.getPlayerWeapon() == 'X') {
                playerName = 'X';
                computerName = 'O';
            }
            else {
                playerName = 'O';
                computerName = 'X';
            }
            level = choice_section.getLevel();
            count = 0;
            choice_section.disable(true);
            gameBoardView.disable(false);
            if (computerName == 'X')
                nextTurn(computerMove(), computerName);
            announce.textContent = 'Playing';
        }

        function restart() {
            choice_section.disable(false);
            gameBoardView.clear();
            gameBoardView.disable(true);
            announce.textContent = 'Press start to play';
        }

        function move(index) {
            if (!nextTurn(index, playerName)) nextTurn(computerMove(), computerName);
        }

        function nextTurn(index, char) {
            gameBoardView.setPos(index, char);
            if (gameBoardView.getBoard().checkWin()) {
                end(playerName);
                return true;
            }
            ++count;
            if (count == 9) {
                end(null);
                return true;
            }
            return false;
        }

        function computerMove() {
            switch (level) {
                case 'easy':
                    return computer.easyMove(gameBoardView.getBoard());
                case 'medium':
                    return computer.mediumMove(gameBoardView.getBoard(), count, playerName, computerName);
                case 'hard':
                    return computer.hardMove(gameBoardView.getBoard(), count, playerName, computerName);
            }
        }

        function end(winnerName) {
            if (winnerName != null)
                announce.textContent = 'The winner is ' + winnerName;
            else
                announce.textContent = 'Tie!!!';
            gameBoardView.disable(true);
        }

        function subscribe() {
            pubSub.subscribe('start', function () { start(); });
            pubSub.subscribe('restart', function () { restart(); });
            pubSub.subscribe('move', function (index) { move(index); });
        }

        return { start, restart, subscribe }
    }
)();

function minimax(board, count, isMaximize, playerCurrent, playerNext)
{
    let checkWinResult = board.checkWin();
    if (checkWinResult == playerCurrent)
        return [isMaximize ? 1 : -1, count, -1];
    else if (checkWinResult == playerNext)
        return [isMaximize ? -1 : 1, count, -1];
    if (count == 9) return [0, 9, null];

    let res = [isMaximize ? -2 : 2, count, -1];
    for (let i = 0; i < 9; ++i) {
        if (board.getBoard(i) == '') {
            board.setBoard(i, playerCurrent);
            const eval = this.minimax(board, count + 1, !isMaximize, playerNext, playerCurrent);
            board.setBoard(i, '');
            if (isMaximize == (res[0] < eval[0]))
                res = [eval[0], eval[1], i];
        }
    }
    return res;
}

gameBoardView.init();
choice_section.init();
game.subscribe();