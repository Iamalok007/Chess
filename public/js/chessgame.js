const socket = io();
const chess = new Chess();
const boardElement = document.querySelector('.chessboard');

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const getPieceUnicode = (piece) => {
    const unicodeMap = {
        wP: '♙',
        wN: '♘',
        wB: '♗',
        wR: '♖',
        wQ: '♕',
        wK: '♔',
        bP: '♟',
        bN: '♞',
        bB: '♝',
        bR: '♜',
        bQ: '♛',
        bK: '♚',
    };
    const key = piece.color + piece.type.toUpperCase();
    console.log(`Piece: ${key}, Unicode: ${unicodeMap[key]}`);
    return unicodeMap[key] || "";
};

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = '';
    board.forEach((row, rowIdx) => {
        row.forEach((square, squareIdx) => {
            const squareElement = document.createElement('div');
            squareElement.classList.add('square', (rowIdx + squareIdx) % 2 === 1 ? 'black' : 'white');
            
            squareElement.dataset.row = rowIdx;
            squareElement.dataset.col = squareIdx;

            if (square) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece', square.color === 'w' ? 'white' : 'black');
                pieceElement.innerText = getPieceUnicode(square);

                pieceElement.draggable = playerRole === square.color;
                pieceElement.addEventListener('dragstart', (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowIdx, col: squareIdx };
                        e.dataTransfer.setData('text/plain', null);
                    }
                });

                pieceElement.addEventListener('dragend', () => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            squareElement.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSquare = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col)
                    };

                    handleMove(sourceSquare, targetSquare);
                }
            });

            boardElement.appendChild(squareElement);
        });
    });

    if(playerRole==='b'){
        boardElement.classList.add('rotate');
    }else{
        boardElement.classList.remove('rotate');
    
    }
};

const handleMove = (source, target) => {
    const move = chess.move({
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`
    });

    if (move) {
        renderBoard();
        socket.emit('move', move);
    } else {
        console.log('Invalid move');
    }
};

socket.on('playerRole', (role) => {
    playerRole = role;
    renderBoard();
});

socket.on('spectator', () => {
    playerRole = 'spectator';
    renderBoard();
});

socket.on('boardState', (fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on('move', (move) => {
    chess.move(move);
    renderBoard();
});


