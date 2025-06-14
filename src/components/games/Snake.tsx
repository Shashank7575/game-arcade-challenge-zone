
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface SnakeProps {
  difficulty: string;
  onBack: () => void;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

const Snake = ({ difficulty, onBack }: SnakeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const gameSettings = {
    Easy: { speed: 150, gridSize: 20 },
    Medium: { speed: 100, gridSize: 20 },
    Hard: { speed: 70, gridSize: 20 }
  };

  const settings = gameSettings[difficulty as keyof typeof gameSettings];
  const canvasSize = 400;
  const gridCount = canvasSize / settings.gridSize;

  const generateFood = useCallback(() => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * gridCount),
        y: Math.floor(Math.random() * gridCount)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake, gridCount]);

  const resetGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setFood(generateFood());
    setScore(0);
    setGameState('menu');
  }, [generateFood]);

  const startGame = useCallback(() => {
    setGameState('playing');
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setFood(generateFood());
    setScore(0);
  }, [generateFood]);

  const togglePause = useCallback(() => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  }, []);

  const moveSnake = useCallback(() => {
    if (gameState !== 'playing') return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount) {
        setGameState('gameOver');
        if (score > highScore) {
          setHighScore(score);
          toast.success(`New High Score: ${score}! 🎉`);
        }
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameState('gameOver');
        if (score > highScore) {
          setHighScore(score);
          toast.success(`New High Score: ${score}! 🎉`);
        }
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameState, direction, food, score, highScore, gridCount, generateFood]);

  // Game loop
  useEffect(() => {
    const gameInterval = setInterval(moveSnake, settings.speed);
    return () => clearInterval(gameInterval);
  }, [moveSnake, settings.speed]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridCount; i++) {
      ctx.beginPath();
      ctx.moveTo(i * settings.gridSize, 0);
      ctx.lineTo(i * settings.gridSize, canvasSize);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * settings.gridSize);
      ctx.lineTo(canvasSize, i * settings.gridSize);
      ctx.stroke();
    }

    // Draw snake
    ctx.fillStyle = '#0f0';
    snake.forEach((segment, index) => {
      if (index === 0) {
        ctx.fillStyle = '#0a0'; // Head slightly different color
      } else {
        ctx.fillStyle = '#0f0';
      }
      ctx.fillRect(
        segment.x * settings.gridSize + 1,
        segment.y * settings.gridSize + 1,
        settings.gridSize - 2,
        settings.gridSize - 2
      );
    });

    // Draw food
    ctx.fillStyle = '#f00';
    ctx.fillRect(
      food.x * settings.gridSize + 1,
      food.y * settings.gridSize + 1,
      settings.gridSize - 2,
      settings.gridSize - 2
    );
  }, [snake, food, settings.gridSize, gridCount]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState === 'playing') {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            setDirection(prev => prev !== 'DOWN' ? 'UP' : prev);
            break;
          case 'ArrowDown':
            e.preventDefault();
            setDirection(prev => prev !== 'UP' ? 'DOWN' : prev);
            break;
          case 'ArrowLeft':
            e.preventDefault();
            setDirection(prev => prev !== 'RIGHT' ? 'LEFT' : prev);
            break;
          case 'ArrowRight':
            e.preventDefault();
            setDirection(prev => prev !== 'LEFT' ? 'RIGHT' : prev);
            break;
        }
      }
      
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'menu' || gameState === 'gameOver') {
          startGame();
        } else {
          togglePause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, startGame, togglePause]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Button>
          <h1 className="text-3xl font-bold text-white">Snake Game</h1>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">Difficulty: {difficulty}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Canvas */}
          <div className="lg:col-span-3">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 relative">
                <canvas
                  ref={canvasRef}
                  width={canvasSize}
                  height={canvasSize}
                  className="w-full max-w-md mx-auto border-2 border-white/30 rounded-lg"
                />
                
                {/* Game State Overlays */}
                {gameState === 'menu' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <div className="text-center text-white">
                      <h2 className="text-2xl font-bold mb-4">Snake Game</h2>
                      <p className="mb-4">Use arrow keys to move!</p>
                      <Button onClick={startGame} className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Start Game
                      </Button>
                    </div>
                  </div>
                )}

                {gameState === 'paused' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <div className="text-center text-white">
                      <h2 className="text-2xl font-bold mb-4">Paused</h2>
                      <Button onClick={togglePause} className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Resume
                      </Button>
                    </div>
                  </div>
                )}

                {gameState === 'gameOver' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <div className="text-center text-white">
                      <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
                      <p className="mb-4">Score: {score}</p>
                      <p className="mb-4">Length: {snake.length}</p>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={startGame} className="flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          Play Again
                        </Button>
                        <Button onClick={resetGame} variant="outline" className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4" />
                          Menu
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Score Display */}
                <div className="absolute top-4 left-4 text-white text-xl font-bold">
                  Score: {score}
                </div>
                <div className="absolute top-4 right-4 text-white text-xl font-bold">
                  Length: {snake.length}
                </div>

                {/* Controls */}
                {gameState === 'playing' && (
                  <div className="absolute bottom-4 right-4">
                    <Button onClick={togglePause} variant="outline" size="sm">
                      <Pause className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mobile Controls */}
            <div className="mt-4 lg:hidden">
              <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                <div></div>
                <Button
                  onClick={() => setDirection(prev => prev !== 'DOWN' ? 'UP' : prev)}
                  variant="outline"
                  size="lg"
                  disabled={gameState !== 'playing'}
                >
                  ↑
                </Button>
                <div></div>
                <Button
                  onClick={() => setDirection(prev => prev !== 'RIGHT' ? 'LEFT' : prev)}
                  variant="outline"
                  size="lg"
                  disabled={gameState !== 'playing'}
                >
                  ←
                </Button>
                <Button
                  onClick={gameState === 'playing' ? togglePause : startGame}
                  variant="outline"
                  size="lg"
                >
                  {gameState === 'playing' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  onClick={() => setDirection(prev => prev !== 'LEFT' ? 'RIGHT' : prev)}
                  variant="outline"
                  size="lg"
                  disabled={gameState !== 'playing'}
                >
                  →
                </Button>
                <div></div>
                <Button
                  onClick={() => setDirection(prev => prev !== 'UP' ? 'DOWN' : prev)}
                  variant="outline"
                  size="lg"
                  disabled={gameState !== 'playing'}
                >
                  ↓
                </Button>
                <div></div>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white">Score:</span>
                    <span className="text-yellow-400 font-bold text-xl">{score}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Length:</span>
                    <span className="text-green-400 font-bold text-xl">{snake.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">High Score:</span>
                    <span className="text-purple-400 font-bold text-xl">{highScore}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/20">
                  <h4 className="text-white font-semibold mb-2">Difficulty:</h4>
                  <div className="text-sm text-gray-300">
                    Speed: {settings.speed}ms
                  </div>
                </div>

                <div className="pt-4 border-t border-white/20">
                  <h4 className="text-white font-semibold mb-2">Controls:</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>• Arrow keys to move</div>
                    <div>• SPACE to pause</div>
                    <div>• Eat red food to grow</div>
                    <div>• Don't hit walls or yourself!</div>
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

export default Snake;
