import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface CarRacingProps {
  difficulty: string;
  onBack: () => void;
}

const CarRacing = ({ difficulty, onBack }: CarRacingProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [playerCar, setPlayerCar] = useState({ x: 375, y: 500 });
  const [enemyCars, setEnemyCars] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [roadLines, setRoadLines] = useState<Array<{ y: number; id: number }>>([]);
  const [keys, setKeys] = useState({ left: false, right: false });
  
  // Updated canvas dimensions and car sizes
  const canvasWidth = 800;
  const canvasHeight = 600;
  const carWidth = 50;
  const carHeight = 80;

  const gameSettings = {
    Easy: { carSpeed: 5, enemySpeed: 3, spawnRate: 0.02 },
    Medium: { carSpeed: 6, enemySpeed: 4, spawnRate: 0.03 },
    Hard: { carSpeed: 7, enemySpeed: 5, spawnRate: 0.04 }
  };

  const settings = gameSettings[difficulty as keyof typeof gameSettings];

  const resetGame = useCallback(() => {
    setPlayerCar({ x: 375, y: 500 });
    setEnemyCars([]);
    setRoadLines([]);
    setScore(0);
    setGameState('menu');
  }, []);

  const startGame = useCallback(() => {
    setGameState('playing');
    setPlayerCar({ x: 375, y: 500 });
    setEnemyCars([]);
    setRoadLines([]);
    setScore(0);
  }, []);

  const togglePause = useCallback(() => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = setInterval(() => {
      // Move player car
      setPlayerCar(prev => {
        let newX = prev.x;
        if (keys.left && newX > 210) newX -= settings.carSpeed;
        if (keys.right && newX < 540) newX += settings.carSpeed;
        return { ...prev, x: newX };
      });

      // Update road lines
      setRoadLines(prev => {
        let newLines = prev.map(line => ({
          ...line,
          y: line.y + 5
        })).filter(line => line.y < canvasHeight + 50);

        // Add new road line
        if (newLines.length === 0 || newLines[newLines.length - 1].y > 50) {
          newLines.push({
            y: -50,
            id: Date.now()
          });
        }

        return newLines;
      });

      // Update enemy cars
      setEnemyCars(prev => {
        let newCars = prev.map(car => ({
          ...car,
          y: car.y + settings.enemySpeed
        })).filter(car => car.y < canvasHeight + 50);

        // Add new enemy car
        if (Math.random() < settings.spawnRate) {
          const lanes = [275, 375, 475];
          newCars.push({
            x: lanes[Math.floor(Math.random() * lanes.length)],
            y: -50,
            id: Date.now()
          });
        }

        // Check collisions
        newCars.forEach(car => {
          if (
            car.x < playerCar.x + carWidth &&
            car.x + carWidth > playerCar.x &&
            car.y < playerCar.y + carHeight &&
            car.y + carHeight > playerCar.y
          ) {
            setGameState('gameOver');
            if (score > highScore) {
              setHighScore(score);
              toast.success(`New High Score: ${score}! 🎉`);
            }
          }
        });

        return newCars;
      });

      // Update score
      setScore(prev => prev + 1);
    }, 50);

    return () => clearInterval(gameLoop);
  }, [gameState, keys, playerCar, score, highScore, settings]);

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with road background
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grass sides
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, 200, canvas.height);
    ctx.fillRect(600, 0, 200, canvas.height);

    // Draw road markings
    ctx.fillStyle = '#fff';
    roadLines.forEach(line => {
      ctx.fillRect(270, line.y, 10, 40);
      ctx.fillRect(520, line.y, 10, 40);
    });

    // Draw center line
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(395, i, 10, 30);
    }

    // Draw player car
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(playerCar.x, playerCar.y, carWidth, carHeight);
    ctx.fillStyle = '#000';
    ctx.fillRect(playerCar.x + 10, playerCar.y + 10, 30, 60);

    // Draw enemy cars
    ctx.fillStyle = '#0000ff';
    enemyCars.forEach(car => {
      ctx.fillRect(car.x, car.y, carWidth, carHeight);
      ctx.fillStyle = '#fff';
      ctx.fillRect(car.x + 10, car.y + 10, 30, 60);
      ctx.fillStyle = '#0000ff';
    });
  }, [playerCar, enemyCars, roadLines]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setKeys(prev => ({ ...prev, left: true }));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setKeys(prev => ({ ...prev, right: true }));
          break;
        case ' ':
          e.preventDefault();
          if (gameState === 'menu' || gameState === 'gameOver') {
            startGame();
          } else {
            togglePause();
          }
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          setKeys(prev => ({ ...prev, left: false }));
          break;
        case 'ArrowRight':
          setKeys(prev => ({ ...prev, right: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, startGame, togglePause]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900 p-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <Button onClick={onBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Button>
          <h1 className="text-3xl font-bold text-white">Car Racing</h1>
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
                  className="w-full border-2 border-white/30 rounded-lg"
                />
                
                {/* Game State Overlays */}
                {gameState === 'menu' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <div className="text-center text-white">
                      <h2 className="text-4xl font-bold mb-6">Car Racing</h2>
                      <p className="text-xl mb-6">Use arrow keys to steer!</p>
                      <Button onClick={startGame} size="lg" className="flex items-center gap-2 text-lg">
                        <Play className="h-5 w-5" />
                        Start Race
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
                      <h2 className="text-2xl font-bold mb-2">Crash!</h2>
                      <p className="mb-4">Distance: {score} meters</p>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={startGame} className="flex items-center gap-2">
                          <Play className="h-4 w-4" />
                          Race Again
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
                  Distance: {score}m
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

            {/* Mobile Controls - Bigger buttons */}
            <div className="mt-6 lg:hidden">
              <div className="flex justify-center gap-8">
                <Button
                  onTouchStart={() => setKeys(prev => ({ ...prev, left: true }))}
                  onTouchEnd={() => setKeys(prev => ({ ...prev, left: false }))}
                  onMouseDown={() => setKeys(prev => ({ ...prev, left: true }))}
                  onMouseUp={() => setKeys(prev => ({ ...prev, left: false }))}
                  variant="outline"
                  size="lg"
                  className="text-xl py-8 px-12"
                  disabled={gameState !== 'playing'}
                >
                  ← Left
                </Button>
                <Button
                  onClick={gameState === 'playing' ? togglePause : startGame}
                  variant="outline"
                  size="lg"
                  className="text-xl py-8 px-8"
                >
                  {gameState === 'playing' ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <Button
                  onTouchStart={() => setKeys(prev => ({ ...prev, right: true }))}
                  onTouchEnd={() => setKeys(prev => ({ ...prev, right: false }))}
                  onMouseDown={() => setKeys(prev => ({ ...prev, right: true }))}
                  onMouseUp={() => setKeys(prev => ({ ...prev, right: false }))}
                  variant="outline"
                  size="lg"
                  className="text-xl py-8 px-12"
                  disabled={gameState !== 'playing'}
                >
                  Right →
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-2xl">
                  <Trophy className="h-6 w-6" />
                  Race Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-lg">Distance:</span>
                    <span className="text-yellow-400 font-bold text-2xl">{score}m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white text-lg">Best Distance:</span>
                    <span className="text-green-400 font-bold text-2xl">{highScore}m</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-white/20">
                  <h4 className="text-white font-semibold mb-2">Difficulty Settings:</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>Speed: {settings.carSpeed}</div>
                    <div>Traffic: {settings.enemySpeed}</div>
                    <div>Density: {(settings.spawnRate * 100).toFixed(1)}%</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/20">
                  <h4 className="text-white font-semibold mb-2">Controls:</h4>
                  <div className="text-sm text-gray-300 space-y-1">
                    <div>• ← → Arrow keys to steer</div>
                    <div>• SPACE to pause</div>
                    <div>• Stay in your lane!</div>
                    <div>• Avoid other cars!</div>
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

export default CarRacing;
