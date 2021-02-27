const gameBoard = (function gameBoard() 
{
    const board = document.getElementById('game-board');
    function init()
    {
        for (let i = 0; i < 9; ++i)
        {
            const newButton = document.createElement('button');
            newButton.id = `button-${i}`;
            newButton.addEventListener('click', (e) => 
            {
                e.target.textContent = 'X'; 
            })
            board.appendChild(newButton);
        }
    }
    function bindEvent()
    {

    }
    return { init };
})();

gameBoard.init();