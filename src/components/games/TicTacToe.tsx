
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface TicTacToeProps {
  difficulty: string;
  onBack: () => void;
}

const TicTacToe = ({ difficulty, onBack }: TicTacToeProps) => {
  const [board, setBoard] = useState<string[]>(Array(9).fill(''));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [score, setScore] = useState({ player: 0, ai: 0, draws: 0 });
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('ai');

  const winningLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const checkWinner = (squares: string[]) => {
    for (let line of winningLines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.includes('') ? null : 'draw';
  };

  const getAIMove = (squares: string[]) => {
    const availableMoves = squares.map((square, index) => square === '' ? index : null).filter(val => val !== null);
    
    if (difficulty === 'Easy') {
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    if (difficulty === 'Medium') {
      // 70% chance of smart move, 30% random
      if (Math.random() < 0.7) {
        return getBestMove(squares);
      }
      return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }
    
    // Hard mode - always best move
    return getBestMove(squares);
  };

  const getBestMove = (squares: string[]) => {
    // Check for winning move
    for (let i = 0; i < squares.length; i++) {
      if (squares[i] === '') {
        const testSquares = [...squares];
        testSquares[i] = 'O';
        if (checkWinner(testSquares) === 'O') {
          return i;
        }
      }
    }
    
    // Check for blocking move
    for (let i = 0; i < squares.length; i++) {
      if (squares[i] === '') {
        const testSquares = [...squares];
        testSquares[i] = 'X';
        if (checkWinner(testSquares) === 'X') {
          return i;
        }
      }
    }
    
    // Take center if available
    if (squares[4] === '') return 4;
    
    // Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => squares[i] === '');
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Take any available spot
    const availableMoves = squares.map((square, index) => square === '' ? index : null).filter(val => val !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    
    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      updateScore(gameWinner);
      return;
    }
    
    setIsXNext(!isXNext);
  };

  const updateScore = (gameWinner: string) => {
    if (gameWinner === 'X') {
      setScore(prev => ({ ...prev, player: prev.player + 1 }));
      toast.success('You won! 🎉');
    } else if (gameWinner === 'O') {
      setScore(prev => ({ ...prev, ai: prev.ai + 1 }));
      toast.error('AI wins! 🤖');
    } else {
      setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
      toast.info('It\'s a draw! 🤝');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(''));
    setIsXNext(true);
    setWinner(null);
  };

  useEffect(() => {
    if (gameMode === 'ai' && !isXNext && !winner) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board);
        if (aiMove !== null && aiMove !== undefined) {
          const newBoard = [...board];
          newBoard[aiMove] = 'O';
          setBoard(newBoard);
          
          const gameWinner = checkWinner(newBoard);
          if (gameWinner) {
            setWinner(gameWinner);
            updateScore(gameWinner);
          } else {
            setIsXNext(true);
          }
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isXNext, board, winner, gameMode, difficulty]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Button>
          <h1 className="text-3xl font-bold text-white">Tic Tac Toe</h1>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">Difficulty: {difficulty}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Board - Made bigger */}
          <div className="lg:col-span-3">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-center text-2xl">
                  {winner 
                    ? winner === 'draw' 
                      ? "It's a Draw!" 
                      : `${winner === 'X' ? 'You' : 'AI'} Won!`
                    : `${isXNext ? 'Your' : 'AI\'s'} Turn`
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
                  {board.map((cell, index) => (
                    <button
                      key={index}
                      onClick={() => handleClick(index)}
                      className="w-28 h-28 bg-white/20 hover:bg-white/30 border-2 border-white/30 rounded-lg flex items-center justify-center text-5xl font-bold text-white transition-all duration-200 hover:scale-105"
                      disabled={!!cell || !!winner}
                    >
                      {cell}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center gap-4 mt-8">
                  <Button onClick={resetGame} className="flex items-center gap-2 text-lg px-6 py-2">
                    <RotateCcw className="h-5 w-5" />
                    New Game
                  </Button>
                  <Button
                    onClick={() => setGameMode(gameMode === 'ai' ? 'pvp' : 'ai')}
                    variant="outline"
                    className="text-lg px-6 py-2"
                  >
                    {gameMode === 'ai' ? 'Play vs Friend' : 'Play vs AI'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Score Board */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-2xl">
                  <Trophy className="h-6 w-6" />
                  Score Board
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-lg">You (X):</span>
                    <span className="text-green-400 font-bold text-2xl">{score.player}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white text-lg">AI (O):</span>
                    <span className="text-red-400 font-bold text-2xl">{score.ai}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white text-lg">Draws:</span>
                    <span className="text-yellow-400 font-bold text-2xl">{score.draws}</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/20">
                  <div className="text-center">
                    <span className="text-white text-lg">Total Games: {score.player + score.ai + score.draws}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;
