import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Globe, Shield, Zap, GamepadIcon, MessageCircleIcon, Heart, Lightbulb } from 'lucide-react';
import GoogleAdSense from '../components/GoogleAdSense';

const About: React.FC = () => {
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">GameGoUp</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We're building the world's most inclusive gaming community where players from every background, 
            skill level, and region can connect, collaborate, and create lasting friendships through their 
            shared passion for gaming.
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

        {/* Our Mission */}
        <section className="mb-16">
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <div className="flex items-center mb-6">
              <Heart className="w-8 h-8 text-red-400 mr-4" />
              <h2 className="text-3xl font-bold">Our Mission</h2>
            </div>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              Gaming has the unique power to bring people together across geographical, cultural, and linguistic boundaries. 
              At GameGoUp, we believe that every gamer deserves to find their tribe - whether they're looking for competitive 
              teammates, casual gaming buddies, or mentors to help them improve their skills.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Our platform breaks down the barriers that often prevent gamers from connecting. Language differences, 
              time zone challenges, skill level gaps - we're working to solve these problems with innovative features 
              that make gaming more accessible and enjoyable for everyone.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="mb-16">
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <div className="flex items-center mb-6">
              <Lightbulb className="w-8 h-8 text-yellow-400 mr-4" />
              <h2 className="text-3xl font-bold">Our Story</h2>
            </div>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              GameGoUp was born from the frustration of playing solo in games designed for teams. Our founders, 
              passionate gamers themselves, experienced firsthand the challenges of finding reliable teammates who 
              shared their gaming schedules, skill levels, and communication preferences.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              After countless nights of disappointing random matchmaking experiences, they realized that the gaming 
              community needed a dedicated platform designed specifically for meaningful connections. Not just another 
              Discord server or forum, but a sophisticated matching system that considers gaming preferences, 
              availability, communication styles, and personal compatibility.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Today, GameGoUp serves thousands of gamers worldwide, helping them form lasting friendships and 
              competitive teams that extend far beyond individual gaming sessions. We're proud to be part of 
              countless gaming success stories and lifelong friendships.
            </p>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">What Makes Us Different</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <GamepadIcon className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Game-Specific Matching</h3>
              <p className="text-gray-300 leading-relaxed">
                Unlike generic social platforms, we understand that gaming preferences are specific. Our matching 
                algorithm considers your favorite games, playstyles, preferred roles, and even your gaming schedule 
                to connect you with truly compatible players.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <Globe className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Global Reach, Local Feel</h3>
              <p className="text-gray-300 leading-relaxed">
                Connect with players worldwide while maintaining the intimacy of local gaming groups. Our platform 
                supports multiple languages and time zone coordination, making it easy to find players in your 
                region or expand your gaming horizons globally.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <Shield className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Safe Gaming Environment</h3>
              <p className="text-gray-300 leading-relaxed">
                We take community safety seriously. Our comprehensive moderation system, user reporting tools, 
                and community guidelines ensure that GameGoUp remains a welcoming space for gamers of all 
                backgrounds and skill levels.
              </p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <Zap className="w-10 h-10 text-orange-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Real-Time Features</h3>
              <p className="text-gray-300 leading-relaxed">
                Gaming happens in real-time, and so should your connections. Our platform offers instant messaging, 
                live room updates, real-time availability status, and quick team formation tools to keep up with 
                the fast-paced nature of modern gaming.
              </p>
            </div>
          </div>
        </section>

        {/* Community Stats */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-8 border border-blue-500/30">
            <h2 className="text-3xl font-bold mb-8 text-center">Growing Community</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">10K+</div>
                <div className="text-gray-300">Active Gamers</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">500+</div>
                <div className="text-gray-300">Gaming Rooms</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">50+</div>
                <div className="text-gray-300">Supported Games</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">24/7</div>
                <div className="text-gray-300">Active Community</div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <h2 className="text-3xl font-bold mb-4">Ready to Join Our Community?</h2>
            <p className="text-lg text-gray-300 mb-6">
              Thousands of gamers are already connecting, competing, and creating lasting friendships on GameGoUp. 
              Your next gaming adventure starts with finding the right teammates.
            </p>
            <Link 
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 inline-flex items-center"
            >
              Join GameGoUp Today
              <Users className="ml-2 w-5 h-5" />
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

export default About;
