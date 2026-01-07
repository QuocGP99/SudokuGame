
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, 
  RotateCcw, 
  PlusCircle, 
  Eye, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { createSudokuGame, checkWin, SudokuBoard } from './sudokuLogic';

const App: React.FC = () => {
  // Game State
  const [level, setLevel] = useState(1);
  const [board, setBoard] = useState<SudokuBoard>([]);
  const [initialBoard, setInitialBoard] = useState<SudokuBoard>([]);
  const [solution, setSolution] = useState<SudokuBoard>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isWin, setIsWin] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Initialize Game
  const startNewGame = useCallback(() => {
    const { gameBoard, solution: solved } = createSudokuGame(level);
    setBoard(gameBoard);
    setInitialBoard(JSON.parse(JSON.stringify(gameBoard)));
    setSolution(solved);
    setMistakes(0);
    setTimer(0);
    setIsGameActive(true);
    setIsWin(false);
    setIsGameOver(false);
    setSelectedCell(null);
  }, [level]);

  useEffect(() => {
    startNewGame();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (isGameActive && !isWin && !isGameOver) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive, isWin, isGameOver]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCellClick = (r: number, c: number) => {
    if (isGameOver || isWin) return;
    setSelectedCell({ r, c });
  };

  const handleInput = useCallback((num: number) => {
    if (!selectedCell || isGameOver || isWin) return;
    const { r, c } = selectedCell;

    if (initialBoard[r][c] !== null) return;
    if (board[r][c] === num) return;

    const newBoard = board.map(row => [...row]);
    
    if (num !== solution[r][c]) {
      setMistakes(prev => {
        const next = prev + 1;
        if (next >= 3) setIsGameOver(true);
        return next;
      });
    }

    newBoard[r][c] = num;
    setBoard(newBoard);

    if (checkWin(newBoard, solution)) {
      setIsWin(true);
      setIsGameActive(false);
    }
  }, [selectedCell, board, solution, initialBoard, isGameOver, isWin]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '9') {
        handleInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedCell && initialBoard[selectedCell.r][selectedCell.c] === null) {
          const newBoard = board.map(row => [...row]);
          newBoard[selectedCell.r][selectedCell.c] = null;
          setBoard(newBoard);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, selectedCell, board, initialBoard]);

  const getCellClasses = (r: number, c: number) => {
    const isSelected = selectedCell?.r === r && selectedCell?.c === c;
    const isInitial = initialBoard[r][c] !== null;
    const value = board[r][c];
    const selectedValue = selectedCell ? board[selectedCell.r][selectedCell.c] : null;
    const isSameNumber = value !== null && value === selectedValue;
    
    let isInvalid = !isInitial && value !== null && value !== solution[r][c];

    // Core classes for layout and styling
    let classes = "relative flex items-center justify-center text-2xl sm:text-3xl font-medium cursor-pointer transition-all duration-150 select-none aspect-square ";
    
    // Backgrounds
    if (isSelected) classes += "bg-blue-500 text-white z-10 scale-105 shadow-lg rounded-sm ";
    else if (isSameNumber) classes += "bg-blue-100 ";
    else classes += "bg-white hover:bg-slate-50 ";

    // Text colors
    if (!isSelected) {
      if (isInitial) classes += "text-slate-900 font-bold ";
      else if (isInvalid) classes += "text-red-500 bg-red-50 ";
      else classes += "text-blue-600 ";
    }

    // Grid Borders Logic (Bolder for 3x3 blocks)
    classes += "border-slate-200 border-[0.5px] ";
    if (c % 3 === 0) classes += "border-l-2 border-l-slate-800 ";
    if (c === 8) classes += "border-r-2 border-r-slate-800 ";
    if (r % 3 === 0) classes += "border-t-2 border-t-slate-800 ";
    if (r === 8) classes += "border-b-2 border-b-slate-800 ";

    return classes;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col gap-6">
        {/* Header Section */}
        <header className="text-center space-y-4">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            SUDOKU <span className="text-blue-600">PRO</span>
          </h1>
          
          <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex flex-col items-center justify-center border-r border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Level</span>
              <select 
                value={level}
                onChange={(e) => setLevel(parseInt(e.target.value))}
                className="font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
              >
                {[...Array(10)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
              </select>
            </div>
            <div className="flex flex-col items-center justify-center border-r border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400">Time</span>
              <span className="font-mono font-bold text-slate-700">{formatTime(timer)}</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Mistakes</span>
              <span className={`font-bold ${mistakes > 0 ? 'text-red-500' : 'text-slate-700'}`}>{mistakes}/3</span>
            </div>
          </div>
        </header>

        {/* Game Board Container */}
        <div className="relative aspect-square w-full shadow-2xl rounded-lg overflow-hidden bg-slate-800">
          <div className="grid grid-cols-9 w-full h-full">
            {board.map((row, rIdx) => 
              row.map((val, cIdx) => (
                <div 
                  key={`${rIdx}-${cIdx}`}
                  className={getCellClasses(rIdx, cIdx)}
                  onClick={() => handleCellClick(rIdx, cIdx)}
                >
                  {val || ''}
                </div>
              ))
            )}
          </div>

          {/* Overlays */}
          {(isWin || isGameOver) && (
            <div className="absolute inset-0 z-20 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-xs w-full space-y-4">
                {isWin ? (
                  <div className="space-y-2">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Tuyệt vời!</h2>
                    <p className="text-slate-500 text-sm">Bạn đã hoàn thành ở cấp độ {level}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Kết thúc!</h2>
                    <p className="text-slate-500 text-sm">Bạn đã mắc quá 3 lỗi sai.</p>
                  </div>
                )}
                <button 
                  onClick={startNewGame}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-transform active:scale-95"
                >
                  Chơi ván mới
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-9 gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleInput(num)}
              className="aspect-square flex items-center justify-center bg-white border border-slate-200 rounded-lg text-xl font-bold text-slate-700 shadow-sm hover:border-blue-400 hover:text-blue-600 transition-all active:scale-90"
            >
              {num}
            </button>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3">
          <button 
            onClick={startNewGame}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 transition-all active:scale-95"
          >
            <PlusCircle size={20} /> Ván mới
          </button>
          <button 
            onClick={() => setBoard(JSON.parse(JSON.stringify(initialBoard)))}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-slate-600 border border-slate-200 font-bold rounded-2xl shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <RotateCcw size={20} /> Reset
          </button>
          <button 
            onClick={() => { setBoard(JSON.parse(JSON.stringify(solution))); setIsWin(true); }}
            className="px-6 py-4 bg-slate-800 text-white rounded-2xl shadow-lg hover:bg-slate-900 transition-all active:scale-95"
          >
            <Eye size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
