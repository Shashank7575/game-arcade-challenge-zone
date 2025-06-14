import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface FlappyBirdProps {
  difficulty: string;
  onBack: () => void;
}

const FlappyBird = ({ difficulty, onBack }: FlappyBirdProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [bird, setBird] = useState({ x: 150, y: 300, velocity: 0 });
  const [pipes, setPipes] = useState<Array<{ x: number; topHeight: number; passed: boolean }>>([]);
  
  // Updated canvas dimensions
  const canvasWidth = 800;
  const canvasHeight = 600;
  
  const gameSettings = {
    Easy: { gravity: 0.3, jumpForce: -6, pipeSpeed: 2, pipeGap: 200 },
    Medium: { gravity: 0.4, jumpForce: -7, pipeSpeed: 3, pipeGap: 180 },
    Hard: { gravity: 0.5, jumpForce: -8, pipeSpeed: 4, pipeGap: 150 }
  };

  const settings = gameSettings[difficulty as keyof typeof gameSettings];

  const resetGame = useCallback(() => {
    setBird({ x: 150, y: 300, velocity: 0 });
    setPipes([]);
    setScore(0);
    setGameState('menu');
  }, []);

  const jump = useCallback(() => {
    if (gameState === 'playing') {
      setBird(prev => ({ ...prev, velocity: settings.jumpForce }));
    }
  }, [gameState, settings.jumpForce]);

  const startGame = useCallback(() => {
    setGameState('playing');
    setBird({ x: 150, y: 300, velocity: 0 });
    setPipes([{ x: 400, topHeight: 150, passed: false }]);
    setScore(0);
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      setBird(prev => {
        const newY = prev.y + prev.velocity;
        const newVelocity = prev.velocity + settings.gravity;
        
        // Check collision with ground or ceiling
        if (newY > 550 || newY < 0) {
          setGameState('gameOver');
          if (score > highScore) {
            setHighScore(score);
            toast.success(`New High Score: ${score}! 🎉`);
          }
          return prev;
        }
        
        return { ...prev, y: newY, velocity: newVelocity };
      });

      setPipes(prev => {
        const newPipes = prev.map(pipe => ({
          ...pipe,
          x: pipe.x - settings.pipeSpeed
        })).filter(pipe => pipe.x > -100);

        // Add new pipe
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < 200) {
          newPipes.push({
            x: 600,
            topHeight: Math.random() * 200 + 50,
            passed: false
          });
        }

        // Check for score
        newPipes.forEach(pipe => {
          if (!pipe.passed && pipe.x < bird.x) {
            pipe.passed = true;
            setScore(prev => prev + 1);
          }
        });

        // Check collision with pipes
        newPipes.forEach(pipe => {
          if (
            bird.x + 20 > pipe.x &&
            bird.x < pipe.x + 60 &&
            (bird.y < pipe.topHeight || bird.y + 20 > pipe.topHeight + settings.pipeGap)
          ) {
            setGameState('gameOver');
            if (score > highScore) {
              setHighScore(score);
              toast.success(`New High Score: ${score}! 🎉`);
            }
          }
        });

        return newPipes;
      });
    }, 20);

    return () => clearInterval(gameLoop);
  }, [gameState, bird.x, bird.y, score, highScore, settings]);

  // Canvas drawing - Updated for larger canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale everything for the larger canvas
    const scaleFactor = 1.5;

    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw bird
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(bird.x, bird.y, 30 * scaleFactor, 30 * scaleFactor);
    ctx.fillStyle = '#FF6347';
    ctx.fillRect(bird.x + 8 * scaleFactor, bird.y + 8 * scaleFactor, 15 * scaleFactor, 15 * scaleFactor);

    // Draw pipes
    ctx.fillStyle = '#228B22';
    pipes.forEach(pipe => {
      // Top pipe
      ctx.fillRect(pipe.x, 0, 80 * scaleFactor, pipe.topHeight);
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.topHeight + settings.pipeGap, 80 * scaleFactor, canvas.height - pipe.topHeight - settings.pipeGap);
    });

    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
  }, [bird, pipes, settings.pipeGap]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'menu' || gameState === 'gameOver') {
          startGame();
        } else {
          jump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, jump, startGame]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Button>
          <h1 className="text-3xl font-bold text-white">Flappy Bird</h1>
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">Difficulty: {difficulty}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Canvas - Bigger size */}
          <div className="lg:col-span-3">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 relative">
                <canvas
                  ref={canvasRef}
                  width={canvasWidth}
                  height={canvasHeight}
                  className="w-full h-full border-2 border-white/30 rounded-lg cursor-pointer"
                  onClick={gameState === 'playing' ? jump : startGame}
                />
                
                {/* Game State Overlays */}
                {gameState === 'menu' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <div className="text-center text-white">
                      <h2 className="text-4xl font-bold mb-6">Flappy Bird</h2>
                      <p className="text-xl mb-6">Click or press SPACE to jump!</p>
                      <Button onClick={startGame} size="lg" className="flex items-center gap-2 text-lg">
                        <Play className="h-5 w-5" />
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
                <div className="absolute top-6 left-6 text-white text-3xl font-bold">
                  Score: {score}
                </div>

                {/* Controls */}
                {gameState === 'playing' && (
                  <div className="absolute top-6 right-6">
                    <Button onClick={togglePause} variant="outline" size="lg">
                      <Pause className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-2xl">
                  <Trophy className="h-6 w-6" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-lg">Current Score:</span>
                    <span className="text-yellow-400 font-bold text-2xl">{score}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white text-lg">High Score:</span>
                    <span className="text-green-400 font-bold text-2xl">{highScore}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/20">
                  <h4 className="text-white font-semibold mb-2">Difficulty Settings:</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>Gravity: {settings.gravity}</div>
                    <div>Pipe Speed: {settings.pipeSpeed}</div>
                    <div>Pipe Gap: {settings.pipeGap}px</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/20">
                  <h4 className="text-white font-semibold mb-2">Controls:</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>• Click to flap</div>
                    <div>• SPACE to flap</div>
                    <div>• Avoid the pipes!</div>
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

export default FlappyBird;
