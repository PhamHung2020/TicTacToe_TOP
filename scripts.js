const pubSub = (
    function()
    {
        const events = {};
        function subscribe(eventName, callbackFunc)
        {
            if (!events[eventName])
                events[eventName] = [];
            events[eventName].push(callbackFunc);
        }
        function publish(eventName, data)
        {
            if (!events[eventName]) return;
            events[eventName].forEach(callbackFunc => callbackFunc(data));
        }

        return { subscribe, publish };
    }
)();


const Level = {
    easy : "easy",
    medium : "medium",
    hard : "hard"
}

// function player(name)
// {
//     const playerName = name;
//     const getName = () => playerName;
//     return { getName };
// }

const gameBoardView = (function() 
{
    const boardView = document.getElementById('game-board');
    const buttons = boardView.childNodes;
    const board = ['', '', '', '', '', '', '', '', ''];
    function init()
    {
        for (let i = 0; i < 9; ++i)
        {
            const newButton = document.createElement('button');
            newButton.id = `button-${i}`;
            boardView.appendChild(newButton);
        }
        bindEvent();
        disable(true);
    }

    function bindEvent()
    {
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = +e.target.id[e.target.id.length - 1];
                pubSub.publish('move', index);
            })
        });
    }

    function getPos(index)
    {
        return board[index];
    }

    function setPos(index, playerName)
    {
        if (playerName == 'X' || playerName == 'O')
            board[index] = playerName;
        buttons[index].textContent = playerName;
    }

    function checkLine(index1, index2, index3)
    {
        if (board[index1] == board[index2] && 
            board[index2] == board[index3] && 
            board[index1] == board[index3] &&
            board[index1] != '')
            return true;
        return false;
    }

    function checkWin()
    {
        if (checkLine(0, 1, 2) || checkLine(3, 4, 5) || checkLine(6, 7, 8) ||
            checkLine(0, 3, 6) || checkLine(1, 4, 7) || checkLine(2, 5, 8) ||
            checkLine(0, 4, 8) || checkLine(2, 4, 6))
            return true;
        return false;
    }

    function clear()
    {
        buttons.forEach(button => button.textContent = '');
        for (let i = 0; i < 9; ++i) board[i] = '';
        count = 0;
    }

    function disable(isDisable)
    {
        buttons.forEach(button => button.disabled = isDisable);
    }

    return { init, setPos, getPos, checkWin, clear, disable };
})();

const choice_section = (function() {
    const buttonX = document.getElementById('x');
    const buttonO = document.getElementById('o');
    const buttonStart = document.getElementById('start-restart');
    const selectLevel = document.getElementById('level');

    function init()
    {
        buttonX.classList.add('border');
        bindEvent();
    }

    function disable(isDisable)
    {
        selectLevel.disabled = isDisable;
        buttonX.disabled = isDisable;
        buttonO.disabled = isDisable;
    }

    function bindEvent()
    {
        buttonO.addEventListener('click', function() { switchWeapon(buttonO) });
        buttonX.addEventListener('click', function() { switchWeapon(buttonX) });
        buttonStart.addEventListener('click', () => {
            if (buttonStart.textContent == 'Start')
            {
                buttonStart.textContent = 'Restart';
                pubSub.publish('start', null);
            }
            else
            {
                buttonStart.textContent = 'Start';
                pubSub.publish('restart', null);
            }
        });
    }

    function switchWeapon(buttonClicked)
    {
        if (!buttonClicked.classList.contains('border'))
        {
            buttonX.classList.toggle('border');
            buttonO.classList.toggle('border');
        }
    }

    function getPlayerWeapon()
    {
        if (buttonX.classList.contains('border'))
            return 'X';
        return 'O';
    }

    function getLevel()
    {
        return selectLevel.value;
    }

    return {init, disable, getPlayerWeapon, getLevel};
})();

const computer = (
    function computerMove()
    {
        function easyMove(gameBoardView)
        {
            let pos = 0;
            while (gameBoardView.getPos(pos) != '')
            {
                pos = Math.floor(Math.random() * 9);
            }
            return pos;
        }

        function mediumMove()
        {

        }

        function hardMove()
        {

        }

        return { easyMove, mediumMove, hardMove };
    }
)();

const game = (
    function()
    {
        let playerName = null;
        let computerName = null;
        let level = null;
        let count = 0;
        const announce = document.getElementById('announce-winner');
        function start()
        {
            if (choice_section.getPlayerWeapon() == 'X')
            {
                playerName = 'X';
                computerName = 'O';
            }
            else
            {
                playerName = 'O';
                computerName = 'X';
            }
            level = choice_section.getLevel();
            count = 0;
            choice_section.disable(true);
            gameBoardView.disable(false);
            if (computerName == 'X')
                computerMove();    
            announce.textContent = 'Playing';
        }

        function restart()
        {
            choice_section.disable(false);
            gameBoardView.clear();
            gameBoardView.disable(true);
            announce.textContent = 'Press start to play';
        }

        function move(index)
        {
            gameBoardView.setPos(index, playerName);
            if (gameBoardView.checkWin())
            {
                end(playerName);
                return;
            }
            ++count;
            computerMove();
            if (gameBoardView.checkWin())
            {
                end(computerName);
                return;
            }
            ++count;
            if (count >= 8)
                end(null);
        }

        function computerMove()
        {
            switch (level)
            {
                case 'easy':
                    gameBoardView.setPos(computer.easyMove(gameBoardView), computerName);
                    break;
                case 'medium':
                    gameBoardView.setPos(computer.mediumMove(), computerName);
                    break;
                case 'hard': gameBoardView.setPos(computer.hardMove(), computerName);
                break;
            }
        }

        function end(winnerName)
        {
            if (winnerName != null)
                announce.textContent = 'The winner is ' + winnerName;
            else
                announce.textContent = 'Draw!!!';
            gameBoardView.disable(true);
        }
        
        function subscribe()
        {
            pubSub.subscribe('start', function() { start(); });
            pubSub.subscribe('restart', function() { restart(); });
            pubSub.subscribe('move', function(index) { move(index); });
        }

        return {start, restart, subscribe};
    }
)();

gameBoardView.init();
choice_section.init();
game.subscribe();