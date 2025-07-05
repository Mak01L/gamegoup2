import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, ArrowRight, Clock, Tag } from 'lucide-react';
import GoogleAdSense from '../components/GoogleAdSense';

const Blog: React.FC = () => {
  const blogPosts = [
    {
      title: "The Complete Guide to Finding Your Perfect Gaming Squad in 2024",
      excerpt: "Building lasting gaming relationships requires more than just skill matching. Learn the psychology behind successful gaming partnerships and discover proven strategies for finding teammates who complement your playstyle.",
      author: "Alex Chen",
      date: "March 15, 2024",
      readTime: "8 min read",
      category: "Guide",
      image: "/avatars/avatar1.png",
      content: "Long-form content about gaming squad formation, psychology of team dynamics, communication strategies, skill complementarity, and building trust in online gaming relationships..."
    },
    {
      title: "Mobile Gaming Revolution: How Smartphones Changed Competitive Gaming Forever",
      excerpt: "From casual time-killers to professional esports tournaments, mobile gaming has transformed the industry. Explore how touch controls, cloud gaming, and mobile-first design have created new opportunities for gamers worldwide.",
      author: "Sarah Martinez",
      date: "March 12, 2024", 
      readTime: "6 min read",
      category: "Industry",
      image: "/avatars/avatar2.png",
      content: "Comprehensive analysis of mobile gaming evolution, technical innovations, market impact, professional mobile esports scene, accessibility improvements, and future predictions..."
    },
    {
      title: "Cross-Platform Gaming: Breaking Down the Barriers Between Consoles and PC",
      excerpt: "The gaming community has never been more connected. Discover how cross-platform play is revolutionizing multiplayer gaming, the technical challenges developers face, and what this means for the future of gaming communities.",
      author: "Mike Johnson",
      date: "March 10, 2024",
      readTime: "7 min read", 
      category: "Technology",
      image: "/avatars/avatar3.png",
      content: "Technical deep-dive into cross-platform gaming implementation, network architecture, input method balancing, social features integration, and community impact analysis..."
    },
    {
      title: "Gaming Mental Health: Building Positive Communities in Competitive Environments",
      excerpt: "Competitive gaming can be intense, but it doesn't have to be toxic. Learn evidence-based strategies for maintaining mental wellness while gaming, building supportive communities, and dealing with competitive stress.",
      author: "Dr. Emma Wilson",
      date: "March 8, 2024",
      readTime: "9 min read",
      category: "Wellness",
      image: "/avatars/avatar4.png", 
      content: "Research-backed insights into gaming psychology, stress management techniques, community building strategies, toxicity prevention, and maintaining healthy gaming habits..."
    },
    {
      title: "The Economics of Esports: Understanding the Multi-Billion Dollar Industry",
      excerpt: "Esports has evolved from basement tournaments to sold-out stadiums. Analyze the business models, revenue streams, career opportunities, and economic impact of competitive gaming on a global scale.",
      author: "David Kim",
      date: "March 5, 2024",
      readTime: "10 min read",
      category: "Business",
      image: "/avatars/avatar5.png",
      content: "Detailed economic analysis of esports industry, revenue models, sponsorship dynamics, career paths, market growth projections, and regional market differences..."
    },
    {
      title: "Voice Chat Etiquette: Communication Best Practices for Online Gaming",
      excerpt: "Effective communication can make or break a gaming session. Master the art of voice chat with practical tips for clear communication, conflict resolution, and building team chemistry through better conversation skills.",
      author: "Lisa Thompson",
      date: "March 3, 2024",
      readTime: "5 min read",
      category: "Tips",
      image: "/avatars/avatar6.png",
      content: "Practical guide to gaming communication, voice chat setup, conflict resolution techniques, cultural sensitivity, team coordination strategies, and building rapport with teammates..."
    }
  ];

  const categories = ["All", "Guide", "Industry", "Technology", "Wellness", "Business", "Tips"];
  const [selectedCategory, setSelectedCategory] = React.useState("All");

  const filteredPosts = selectedCategory === "All" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

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
            GameGoUp <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Blog</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Insights, guides, and analysis from the world of gaming. Stay updated with the latest trends, 
            strategies, and community developments that shape the gaming landscape.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
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

        {/* Featured Post */}
        {filteredPosts.length > 0 && (
          <section className="mb-16">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl overflow-hidden border border-blue-500/30">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <div className="h-64 md:h-full bg-gradient-to-br from-blue-600/40 to-purple-600/40 flex items-center justify-center">
                    <img 
                      src={filteredPosts[0].image} 
                      alt={filteredPosts[0].title}
                      className="w-24 h-24 rounded-full border-4 border-white/20"
                    />
                  </div>
                </div>
                <div className="p-8 md:w-2/3">
                  <div className="flex items-center mb-4">
                    <Tag className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="text-blue-400 font-semibold">{filteredPosts[0].category}</span>
                    <span className="text-gray-400 mx-2">•</span>
                    <span className="text-gray-400">Featured</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">{filteredPosts[0].title}</h2>
                  <p className="text-gray-300 mb-6 leading-relaxed">{filteredPosts[0].excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-400 text-sm">
                      <User className="w-4 h-4 mr-2" />
                      <span className="mr-4">{filteredPosts[0].author}</span>
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="mr-4">{filteredPosts[0].date}</span>
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{filteredPosts[0].readTime}</span>
                    </div>
                    <button className="flex items-center text-blue-400 hover:text-blue-300 font-semibold">
                      Read More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Blog Posts Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.slice(1).map((post, index) => (
              <article key={index} className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all hover:transform hover:scale-105">
                <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-16 h-16 rounded-full border-4 border-white/20"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <Tag className="w-4 h-4 text-blue-400 mr-2" />
                    <span className="text-blue-400 text-sm font-semibold">{post.category}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 line-clamp-2">{post.title}</h3>
                  <p className="text-gray-300 mb-4 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button className="text-blue-400 hover:text-blue-300 font-semibold text-sm flex items-center">
                      Read Article
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Gaming Industry Insights */}
        <section className="mb-16">
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700">
            <h2 className="text-3xl font-bold mb-6">Gaming Industry Insights</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4 text-blue-400">Market Trends</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Mobile gaming revenue expected to reach $116 billion by 2024
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Cross-platform gaming adoption increased by 67% in the last year
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Social gaming features drive 43% higher player retention
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    VR gaming market projected to grow 15x by 2030
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 text-green-400">Community Statistics</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    3.2 billion gamers worldwide as of 2024
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    Average gaming session duration: 1.5 hours
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    76% of gamers prefer playing with friends online
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    Female gamers now represent 48% of the gaming population
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-8 border border-blue-500/30">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-lg text-gray-300 mb-6">
              Get the latest gaming insights, community updates, and platform features delivered to your inbox.
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors">
                Subscribe
              </button>
            </div>
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

export default Blog;
