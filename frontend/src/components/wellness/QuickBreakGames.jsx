import { useState } from 'react';
import { Gamepad2, X, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { wellnessAPI } from '../../services/api';

const TIC_TAC_TOE_WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export default function QuickBreakGames({ onGameComplete }) {
  const [activeGame, setActiveGame] = useState(null);

  // Tic Tac Toe State
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  // RPS State
  const [rpsResult, setRpsResult] = useState(null);

  const calculateWinner = (squares) => {
    for (let i = 0; i < TIC_TAC_TOE_WINNING_LINES.length; i++) {
      const [a, b, c] = TIC_TAC_TOE_WINNING_LINES[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return null;
  };

  const handleTicTacClick = (i) => {
    if (board[i] || calculateWinner(board)) return;
    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const winner = calculateWinner(newBoard);
    if (winner || !newBoard.includes(null)) {
      const result = winner === 'X' ? 'Win' : (winner === 'O' ? 'Loss' : 'Draw');
      const score = result === 'Win' ? 100 : 50;
      toast.success(`Game Over! Result: ${result}`);
      wellnessAPI.recordGameScore('Tic Tac Toe', score, result).then(onGameComplete);
      setTimeout(() => setBoard(Array(9).fill(null)), 2000);
    }
  };

  const playRPS = (choice) => {
    const choices = ['Rock', 'Paper', 'Scissors'];
    const pcChoice = choices[Math.floor(Math.random() * choices.length)];
    let result = 'Draw';
    
    if (
      (choice === 'Rock' && pcChoice === 'Scissors') ||
      (choice === 'Paper' && pcChoice === 'Rock') ||
      (choice === 'Scissors' && pcChoice === 'Paper')
    ) {
      result = 'Win';
    } else if (choice !== pcChoice) {
      result = 'Loss';
    }

    setRpsResult({ user: choice, pc: pcChoice, result });
    const score = result === 'Win' ? 50 : 10;
    wellnessAPI.recordGameScore('Rock Paper Scissors', score, result).then(onGameComplete);
  };

  const closeGame = () => {
    setActiveGame(null);
    setBoard(Array(9).fill(null));
    setRpsResult(null);
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-xl p-6 shadow-card">
      <div className="flex items-center gap-2 mb-6">
        <Gamepad2 className="w-5 h-5 text-indigo-500" />
        <h3 className="font-extrabold text-slate-800 text-lg">Quick Break Activities</h3>
      </div>

      {!activeGame ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="card cursor-pointer hover:border-indigo-300 transition-colors text-center p-4" onClick={() => setActiveGame('tictactoe')}>
            <div className="text-3xl mb-2">❌⭕</div>
            <h4 className="text-xs font-bold text-slate-700">Tic Tac Toe</h4>
          </div>
          <div className="card cursor-pointer hover:border-indigo-300 transition-colors text-center p-4" onClick={() => setActiveGame('rps')}>
            <div className="text-3xl mb-2">✊✋✌️</div>
            <h4 className="text-xs font-bold text-slate-700">Rock Paper Scissors</h4>
          </div>
          <div className="card cursor-pointer hover:border-indigo-300 transition-colors text-center p-4 bg-slate-50 opacity-70">
            <div className="text-3xl mb-2 grayscale">🧠</div>
            <h4 className="text-xs font-bold text-slate-700">Tech Trivia</h4>
            <span className="text-[9px] text-slate-400 font-bold uppercase">Coming Soon</span>
          </div>
        </div>
      ) : (
        <div className="relative">
          <button onClick={closeGame} className="absolute -top-4 -right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500">
            <X className="w-4 h-4" />
          </button>

          {/* Tic Tac Toe */}
          {activeGame === 'tictactoe' && (
            <div className="flex flex-col items-center">
              <h4 className="font-bold text-slate-800 mb-4">Tic Tac Toe (You are X)</h4>
              <div className="grid grid-cols-3 gap-2 bg-slate-200 p-2 rounded-xl">
                {board.map((sq, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleTicTacClick(i)}
                    className="w-16 h-16 bg-white rounded-lg text-2xl font-extrabold flex items-center justify-center hover:bg-slate-50 text-slate-800"
                  >
                    {sq}
                  </button>
                ))}
              </div>
              <button onClick={() => setBoard(Array(9).fill(null))} className="mt-4 text-xs font-bold text-brand-blue flex items-center gap-1 hover:underline">
                <RefreshCw className="w-3 h-3" /> Restart Game
              </button>
            </div>
          )}

          {/* RPS */}
          {activeGame === 'rps' && (
            <div className="text-center space-y-6">
              <h4 className="font-bold text-slate-800">Rock Paper Scissors</h4>
              <div className="flex justify-center gap-4">
                {['Rock', 'Paper', 'Scissors'].map(choice => (
                  <button 
                    key={choice} 
                    onClick={() => playRPS(choice)}
                    className="btn-secondary px-6 py-3 text-lg"
                  >
                    {choice === 'Rock' ? '✊' : choice === 'Paper' ? '✋' : '✌️'}
                  </button>
                ))}
              </div>
              
              {rpsResult && (
                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 animate-fade-in">
                  <p className="text-sm font-bold mb-2 text-slate-700">You: {rpsResult.user} vs PC: {rpsResult.pc}</p>
                  <p className={`text-lg font-extrabold ${rpsResult.result === 'Win' ? 'text-emerald-600' : rpsResult.result === 'Loss' ? 'text-rose-600' : 'text-slate-600'}`}>
                    {rpsResult.result === 'Win' ? 'You Won!' : rpsResult.result === 'Loss' ? 'You Lost!' : 'Draw!'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
