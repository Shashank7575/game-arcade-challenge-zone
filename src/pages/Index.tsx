
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Trophy, Star, Zap } from 'lucide-react';
import TicTacToe from '@/components/games/TicTacToe';
import FlappyBird from '@/components/games/FlappyBird';
import Snake from '@/components/games/Snake';
import CarRacing from '@/components/games/CarRacing';

const games = [
  {
    id: 'tictactoe',
    title: 'Tic Tac Toe',
    description: 'Classic strategy game for two players',
    icon: '⭕',
    difficulty: ['Easy', 'Medium', 'Hard'],
    color: 'bg-blue-500'
  },
  {
    id: 'flappybird',
    title: 'Flappy Bird',
    description: 'Navigate through pipes in this addictive game',
    icon: '🐦',
    difficulty: ['Easy', 'Medium', 'Hard'],
    color: 'bg-green-500'
  },
  {
    id: 'snake',
    title: 'Snake Game',
    description: 'Grow your snake while avoiding walls',
    icon: '🐍',
    difficulty: ['Easy', 'Medium', 'Hard'],
    color: 'bg-purple-500'
  },
  {
    id: 'carracing',
    title: 'Car Racing',
    description: 'High-speed racing adventure',
    icon: '🏎️',
    difficulty: ['Easy', 'Medium', 'Hard'],
    color: 'bg-red-500'
  }
];

const Index = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Medium');

  const renderGame = () => {
    switch (selectedGame) {
      case 'tictactoe':
        return <TicTacToe difficulty={selectedDifficulty} onBack={() => setSelectedGame(null)} />;
      case 'flappybird':
        return <FlappyBird difficulty={selectedDifficulty} onBack={() => setSelectedGame(null)} />;
      case 'snake':
        return <Snake difficulty={selectedDifficulty} onBack={() => setSelectedGame(null)} />;
      case 'carracing':
        return <CarRacing difficulty={selectedDifficulty} onBack={() => setSelectedGame(null)} />;
      default:
        return null;
    }
  };

  if (selectedGame) {
    return renderGame();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Header - Made bigger */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Gamepad2 className="h-16 w-16 text-yellow-400" />
            <h1 className="text-6xl font-bold text-white">Arcade Zone</h1>
          </div>
          <p className="text-2xl text-gray-300 max-w-3xl mx-auto">
            Experience the ultimate gaming collection with classic arcade games, multiple difficulty levels, and endless fun!
          </p>
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-400" />
              <span className="text-white font-semibold text-lg">High Scores</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-400" />
              <span className="text-white font-semibold text-lg">4 Amazing Games</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-400" />
              <span className="text-white font-semibold text-lg">3 Difficulty Levels</span>
            </div>
          </div>
        </div>

        {/* Games Grid - Bigger cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {games.map((game) => (
            <Card key={game.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
              <CardHeader className="text-center">
                <div className={`w-24 h-24 ${game.color} rounded-full flex items-center justify-center text-4xl mx-auto mb-6`}>
                  {game.icon}
                </div>
                <CardTitle className="text-white text-2xl">{game.title}</CardTitle>
                <CardDescription className="text-gray-300 text-lg">{game.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2 justify-center">
                  {game.difficulty.map((level) => (
                    <Badge
                      key={level}
                      variant={level === 'Easy' ? 'secondary' : level === 'Medium' ? 'default' : 'destructive'}
                      className="text-sm py-1 px-3"
                    >
                      {level}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="text-white text-lg font-medium">Select Difficulty:</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full p-3 rounded text-lg bg-white/20 text-white border border-white/30"
                  >
                    {game.difficulty.map((level) => (
                      <option key={level} value={level} className="text-black">
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={() => setSelectedGame(game.id)}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg py-6"
                >
                  Play Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section - Bigger elements */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-12 border border-white/20">
          <h2 className="text-4xl font-bold text-white text-center mb-10">Why Choose Arcade Zone?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gamepad2 className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Classic Games</h3>
              <p className="text-gray-300 text-lg">Enjoy timeless arcade games with modern twists and smooth gameplay.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Multiple Difficulties</h3>
              <p className="text-gray-300 text-lg">Challenge yourself with Easy, Medium, and Hard difficulty levels.</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">High Scores</h3>
              <p className="text-gray-300 text-lg">Track your progress and compete for the highest scores.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
