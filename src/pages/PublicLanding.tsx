import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Globe, Shield, Zap, Star, GamepadIcon, MessageCircleIcon } from 'lucide-react';
import GoogleAdSense from '../components/GoogleAdSense';

const PublicLanding: React.FC = () => {
  const features = [
    {
      icon: <GamepadIcon className="w-6 h-6 text-blue-400" />,
      title: "Connect with Gamers Worldwide",
      description: "Find players for your favorite games across all regions and languages. From casual mobile games to competitive esports."
    },
    {
      icon: <MessageCircleIcon className="w-6 h-6 text-green-400" />,
      title: "Real-Time Gaming Rooms",
      description: "Join active gaming rooms or create your own. Chat, strategize, and coordinate with players in real-time."
    },
    {
      icon: <Globe className="w-6 h-6 text-purple-400" />,
      title: "Global Gaming Community",
      description: "Access players from every region, speaking every language. Break barriers and make gaming friends globally."
    },
    {
      icon: <Shield className="w-6 h-6 text-orange-400" />,
      title: "Safe & Moderated",
      description: "Our community guidelines ensure a positive gaming environment for all players, with active moderation."
    }
  ];

  const popularGames = [
    "League of Legends", "Valorant", "CS2", "Dota 2", "Fortnite", 
    "Call of Duty", "Apex Legends", "Rocket League", "Overwatch 2", 
    "Minecraft", "Among Us", "Fall Guys", "PUBG", "Free Fire"
  ];

  const testimonials = [
    {
      name: "Alex Chen",
      game: "League of Legends",
      text: "Found my regular squad through GameGoUp. We've been playing together for months now!"
    },
    {
      name: "Sarah Martinez", 
      game: "Valorant",
      text: "Perfect for finding teammates who speak Spanish. The community is amazing."
    },
    {
      name: "Mike Johnson",
      game: "Apex Legends",
      text: "Quick and easy to find people to play with. No more solo queue!"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="GameGoUp Logo" className="h-10 w-auto" />
              <span className="text-2xl font-bold text-white">GameGoUp</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link to="/about" className="text-gray-300 hover:text-white transition-colors">About</Link>
              <Link to="/games" className="text-gray-300 hover:text-white transition-colors">Games</Link>
              <Link to="/blog" className="text-gray-300 hover:text-white transition-colors">Blog</Link>
              <Link to="/help" className="text-gray-300 hover:text-white transition-colors">Help</Link>
            </nav>
            <Link 
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Find Your Perfect
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> Gaming Squad</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Connect with gamers worldwide, join active gaming rooms, and never play alone again. 
            GameGoUp brings together players from every game, region, and skill level.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center"
            >
              Start Gaming Together
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              to="/how-it-works"
              className="border-2 border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-lg font-bold text-lg transition-all"
            >
              How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">10,000+</div>
              <div className="text-gray-400">Active Gamers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">500+</div>
              <div className="text-gray-400">Daily Rooms</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">50+</div>
              <div className="text-gray-400">Supported Games</div>
            </div>
          </div>
        </div>
      </section>

      {/* AdSense - Top of page */}
      <section className="max-w-4xl mx-auto px-4 mb-16">
        <GoogleAdSense 
          adSlot="auto" 
          adFormat="horizontal"
          position="landing-top"
        />
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose GameGoUp?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-900/50 p-6 rounded-xl border border-gray-700 hover:border-gray-600 transition-all">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Games */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Popular Games on GameGoUp</h2>
          <p className="text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            Find players for the most popular games across all platforms. From competitive esports 
            titles to casual mobile games, our community plays everything.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {popularGames.map((game, index) => (
              <div key={index} className="bg-gray-800 p-4 rounded-lg text-center hover:bg-gray-700 transition-colors">
                <span className="text-sm font-medium">{game}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link 
              to="/games" 
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              View All Supported Games →
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">How GameGoUp Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-3">Create Your Profile</h3>
              <p className="text-gray-400">Set up your gaming profile with your favorite games, preferred languages, and gaming schedule.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-3">Find or Create Rooms</h3>
              <p className="text-gray-400">Browse active gaming rooms or create your own. Filter by game, region, language, and skill level.</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-3">Start Gaming Together</h3>
              <p className="text-gray-400">Connect with your new gaming squad, coordinate strategies, and enjoy better gaming experiences.</p>
            </div>
          </div>
        </div>
      </section>

      {/* AdSense - Middle of page */}
      <section className="max-w-4xl mx-auto px-4 mb-16">
        <GoogleAdSense 
          adSlot="auto" 
          adFormat="horizontal"
          position="landing-middle"
        />
      </section>

      {/* Testimonials */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">What Gamers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.game} Player</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Level Up Your Gaming?</h2>
          <p className="text-xl mb-8">
            Join thousands of gamers who have already found their perfect gaming squad on GameGoUp.
          </p>
          <Link 
            to="/login"
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 inline-flex items-center"
          >
            Get Started Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/logo.png" alt="GameGoUp" className="h-8 w-auto" />
                <span className="text-xl font-bold">GameGoUp</span>
              </div>
              <p className="text-gray-400">
                Connecting gamers worldwide for better gaming experiences.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link to="/games" className="hover:text-white transition-colors">Supported Games</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 GameGoUp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLanding;
