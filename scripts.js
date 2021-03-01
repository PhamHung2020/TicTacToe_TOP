const Level = {
    easy : "easy",
    medium : "medium",
    hard : "hard"
}

function player(name)
{
    const playerName = name;
    const getName = () => playerName;
    return { getName };
}

const gameBoardView = (function gameBoardView() 
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
                setPos(index, choice_section.getPlayerWeapon());
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
        board.forEach(item => item = '');
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
                disable(true);
                buttonStart.textContent = 'Restart';
                gameBoardView.disable(false);
            }
            else
            {
                disable(false);
                buttonStart.textContent = 'Start';
                gameBoardView.clear();
                gameBoardView.disable(true);
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

    return {init, getPlayerWeapon};
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

        return { easyMove };
    }
)();

const game = (
    function game(humanPlayerName, computerPlayerName)
    {
        const humanPlayer = player(humanPlayerName);
        const computerPlayer = player(computerPlayerName);

        function start()
        {
            if (computerPlayer.getName() == 'X')
            {
                gameBoardView.setPos(computer.easyMove(), 'X');
            }
            while (!gameBoardView.checkWin())
            {
                
            }
        }
        
    }
)();

gameBoardView.init();
choice_section.init();