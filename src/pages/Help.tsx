import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Search, MessageCircle, Shield, Users, Settings } from 'lucide-react';
import GoogleAdSense from '../components/GoogleAdSense';

const Help: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      icon: <Users className="w-6 h-6 text-blue-400" />,
      title: "Getting Started",
      faqs: [
        {
          question: "How do I create an account on GameGoUp?",
          answer: "Creating an account is simple! Click the 'Get Started' button on our homepage, choose to sign up with email or Google, fill in your basic information, and verify your email address. Once verified, you can complete your gaming profile and start connecting with other players."
        },
        {
          question: "What information should I include in my gaming profile?",
          answer: "For the best experience, include your favorite games, preferred gaming times, skill level, preferred communication language, and gaming goals (casual, competitive, learning, etc.). The more detailed your profile, the better matches our algorithm can find for you."
        },
        {
          question: "How does GameGoUp match me with other players?",
          answer: "Our matching algorithm considers multiple factors: your game preferences, skill level, availability, communication preferences, and gaming goals. We also factor in your location for better connection quality and similar time zones."
        }
      ]
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-green-400" />,
      title: "Using the Platform",
      faqs: [
        {
          question: "How do I join a gaming room?",
          answer: "Browse available rooms on your dashboard, use filters to find rooms that match your preferences, and click 'Join Room' on any room that interests you. Some rooms may have requirements like skill level or game ownership that you'll need to meet."
        },
        {
          question: "Can I create my own gaming room?",
          answer: "Absolutely! Click the 'Create Room' button, choose your game, set your preferences (skill level, communication language, room size), write a description of what you're looking for, and publish your room. Other players can then find and join your room."
        },
        {
          question: "How do voice chat and communication work?",
          answer: "GameGoUp integrates with popular communication platforms like Discord. Room creators can share their server links, or you can exchange contact information with your matched players to coordinate on your preferred platform."
        }
      ]
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-400" />,
      title: "Safety & Community",
      faqs: [
        {
          question: "How does GameGoUp ensure a safe gaming environment?",
          answer: "We have comprehensive community guidelines, active moderation, user reporting systems, and automated content filtering. We also provide blocking and muting features, and our support team reviews all reports promptly."
        },
        {
          question: "What should I do if I encounter inappropriate behavior?",
          answer: "Use the report feature available on all user profiles and in chat interfaces. Provide as much detail as possible about the incident. Our moderation team reviews all reports within 24 hours and takes appropriate action based on our community guidelines."
        },
        {
          question: "Can I block or mute other users?",
          answer: "Yes, you can block or mute any user from their profile page or during chat interactions. Blocked users cannot see your profile, join your rooms, or send you messages. Muted users remain visible but you won't see their messages."
        }
      ]
    },
    {
      icon: <Settings className="w-6 h-6 text-orange-400" />,
      title: "Account & Settings",
      faqs: [
        {
          question: "How do I update my gaming preferences?",
          answer: "Go to your profile settings, navigate to the 'Gaming Preferences' section, and update your favorite games, skill levels, availability, and communication preferences. Changes take effect immediately and improve your future matches."
        },
        {
          question: "Can I change my username?",
          answer: "Yes, you can change your username once every 30 days. Go to Account Settings > Profile Information and click 'Edit' next to your username. Choose a unique username that follows our community guidelines."
        },
        {
          question: "How do I delete my account?",
          answer: "We're sorry to see you go! Go to Account Settings > Privacy & Security > Delete Account. You'll need to confirm your decision and provide feedback. Account deletion is permanent and cannot be undone after 30 days."
        }
      ]
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const filteredFaqs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

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
            Help & <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Support</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions and learn how to make the most of your GameGoUp experience. 
            Can't find what you're looking for? Our support team is here to help.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* AdSense Banner */}
        <div className="mb-12 text-center">
          <GoogleAdSense
            adSlot="auto"
            style={{ display: 'block', textAlign: 'center' }}
            adFormat="auto"
          />
        </div>

        {/* Quick Help Cards */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Quick Help</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center hover:border-gray-600 transition-colors">
              <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Getting Started</h3>
              <p className="text-gray-300 text-sm">Learn the basics of using GameGoUp</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center hover:border-gray-600 transition-colors">
              <MessageCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Using Rooms</h3>
              <p className="text-gray-300 text-sm">Join and create gaming rooms</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center hover:border-gray-600 transition-colors">
              <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Stay Safe</h3>
              <p className="text-gray-300 text-sm">Community guidelines and safety</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center hover:border-gray-600 transition-colors">
              <Settings className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Account Settings</h3>
              <p className="text-gray-300 text-sm">Manage your profile and preferences</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No FAQ items match your search. Try different keywords.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredFaqs.map((category, categoryIndex) => (
                <div key={categoryIndex} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center mb-6">
                    {category.icon}
                    <h3 className="text-2xl font-bold ml-3">{category.title}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {category.faqs.map((faq, faqIndex) => {
                      const globalIndex = categoryIndex * 1000 + faqIndex;
                      return (
                        <div key={faqIndex} className="border border-gray-700 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleFaq(globalIndex)}
                            className="w-full px-6 py-4 text-left bg-gray-700/50 hover:bg-gray-700 transition-colors flex items-center justify-between"
                          >
                            <span className="font-semibold text-lg">{faq.question}</span>
                            {openFaq === globalIndex ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          
                          {openFaq === globalIndex && (
                            <div className="px-6 py-4 bg-gray-800/50">
                              <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Contact Support */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-8 border border-blue-500/30 text-center">
            <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-lg text-gray-300 mb-6">
              Can't find the answer you're looking for? Our support team is available 24/7 to help you 
              with any questions or issues you might have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact Support
              </Link>
              <a 
                href="mailto:support@gamegoup.com"
                className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
              >
                Email Us
              </a>
            </div>
          </div>
        </section>

        {/* Help Resources */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">Additional Resources</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/about" className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <h3 className="text-lg font-bold mb-2">About GameGoUp</h3>
              <p className="text-gray-300">Learn more about our mission and community</p>
            </Link>
            
            <Link to="/games" className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <h3 className="text-lg font-bold mb-2">Supported Games</h3>
              <p className="text-gray-300">Browse all games available on our platform</p>
            </Link>
            
            <Link to="/terms" className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <h3 className="text-lg font-bold mb-2">Terms & Privacy</h3>
              <p className="text-gray-300">Read our terms of service and privacy policy</p>
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

export default Help;
