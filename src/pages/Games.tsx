import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Star, Gamepad2, Monitor, Smartphone, Trophy, Clock } from 'lucide-react';
import GoogleAdSense from '../components/GoogleAdSense';

const Games: React.FC = () => {
  const gameCategories = [
    {
      icon: <Monitor className="w-8 h-8 text-blue-400" />,
      title: "PC Gaming",
      description: "High-performance desktop gaming with the latest titles",
      games: ["League of Legends", "Valorant", "CS2", "World of Warcraft", "Apex Legends", "Overwatch 2"]
    },
    {
      icon: <Smartphone className="w-8 h-8 text-green-400" />,
      title: "Mobile Gaming", 
      description: "Gaming on the go with popular mobile titles",
      games: ["PUBG Mobile", "Free Fire", "Call of Duty Mobile", "Mobile Legends", "Wild Rift", "Clash Royale"]
    },
    {
      icon: <Trophy className="w-8 h-8 text-purple-400" />,
      title: "Esports",
      description: "Competitive gaming and professional tournaments",
      games: ["Dota 2", "CS2", "League of Legends", "Valorant", "Rocket League", "Overwatch 2"]
    },
    {
      icon: <Gamepad2 className="w-8 h-8 text-orange-400" />,
      title: "Console Gaming",
      description: "PlayStation, Xbox, and Nintendo gaming communities",
      games: ["Fortnite", "Call of Duty", "FIFA", "Minecraft", "Apex Legends", "Rocket League"]
    }
  ];

  const featuredGames = [
    {
      name: "League of Legends",
      players: "150M+",
      category: "MOBA",
      description: "The world's most popular multiplayer online battle arena game with strategic team-based gameplay.",
      image: "/avatars/avatar1.png"
    },
    {
      name: "Valorant", 
      players: "23M+",
      category: "FPS",
      description: "Riot's tactical first-person shooter combining precise gunplay with unique agent abilities.",
      image: "/avatars/avatar2.png"
    },
    {
      name: "CS2",
      players: "32M+", 
      category: "FPS",
      description: "The legendary Counter-Strike series continues with updated graphics and refined gameplay.",
      image: "/avatars/avatar3.png"
    },
    {
      name: "Apex Legends",
      players: "130M+",
      category: "Battle Royale",
      description: "Fast-paced battle royale with unique legends, each bringing their own abilities to the fight.",
      image: "/avatars/avatar4.png"
    },
    {
      name: "Fortnite",
      players: "400M+",
      category: "Battle Royale", 
      description: "The cultural phenomenon that redefined battle royale gaming with building mechanics and creative modes.",
      image: "/avatars/avatar5.png"
    },
    {
      name: "Minecraft",
      players: "140M+",
      category: "Sandbox",
      description: "The ultimate creativity game where players build, explore, and survive in infinite procedural worlds.",
      image: "/avatars/avatar6.png"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-gray-300 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="GameGoUp Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold text-white">GameGoUp</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Supported <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Games</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Connect with players across the most popular games in the world. From competitive esports titles 
            to casual mobile games, find your gaming community on GameGoUp.
          </p>
        </div>

        {/* AdSense Banner */}
        <div className="mb-12 text-center">
          <GoogleAdSense
            adSlot="auto"
            style={{ display: 'block', textAlign: 'center' }}
            adFormat="auto"
          />
        </div>

        {/* Game Categories */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Gaming Categories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gameCategories.map((category, index) => (
              <div key={index} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-center mb-4">
                  {category.icon}
                  <h3 className="text-xl font-bold ml-3">{category.title}</h3>
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">{category.description}</p>
                <div className="space-y-2">
                  {category.games.map((game, gameIndex) => (
                    <div key={gameIndex} className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-md">
                      {game}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Games */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Games</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredGames.map((game, index) => (
              <div key={index} className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all hover:transform hover:scale-105">
                <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                  <img 
                    src={game.image} 
                    alt={game.name}
                    className="w-20 h-20 rounded-full border-4 border-white/20"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold">{game.name}</h3>
                    <span className="text-sm bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                      {game.category}
                    </span>
                  </div>
                  <div className="flex items-center mb-3">
                    <Users className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-gray-400 text-sm">{game.players} players</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{game.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Game Statistics */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-8 border border-blue-500/30">
            <h2 className="text-3xl font-bold mb-8 text-center">Gaming on GameGoUp</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">50+</div>
                <div className="text-gray-300">Supported Games</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">500+</div>
                <div className="text-gray-300">Active Rooms</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">10K+</div>
                <div className="text-gray-300">Daily Matches</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">24/7</div>
                <div className="text-gray-300">Gaming Sessions</div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Get Started */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">How to Get Started</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Create Your Profile</h3>
              <p className="text-gray-300 leading-relaxed">
                Sign up and set your gaming preferences, favorite games, and availability. 
                The more details you provide, the better matches you'll get.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-400">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Find Your Game</h3>
              <p className="text-gray-300 leading-relaxed">
                Browse active rooms for your favorite games or create your own. 
                Use filters to find exactly the type of players and gameplay you're looking for.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Start Gaming</h3>
              <p className="text-gray-300 leading-relaxed">
                Connect with your matches, join voice chats, and start gaming together. 
                Build lasting friendships and climb the ranks as a team.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <h2 className="text-3xl font-bold mb-4">Ready to Find Your Gaming Squad?</h2>
            <p className="text-lg text-gray-300 mb-6">
              Join thousands of gamers already connecting and playing together on GameGoUp. 
              Your next epic gaming session is just one click away.
            </p>
            <Link 
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 inline-flex items-center"
            >
              Start Gaming Together
              <Gamepad2 className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900/90 border-t border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img src="/logo.png" alt="GameGoUp Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold text-white">GameGoUp</span>
            </div>
            <p className="text-gray-400">
              Connecting gamers worldwide, one match at a time.
            </p>
            <div className="flex justify-center space-x-6 mt-4">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Games;
