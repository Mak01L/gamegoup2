import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import ShinyText from './ShinyText';
import GlareHover from './GlareHover';
import { games as allGames } from '../lib/roomOptions';

interface UserProfile {
  user_id: string;
  username: string;
  bio?: string;
  country?: string;
  city?: string;
  game_tags?: string;
  avatar_url?: string;
  gender?: string;
  connection_types?: string[];
  interests?: string[];
  conversation_style?: string;
  availability_hours?: string[];
}

interface SearchFilters {
  connectionTypes: string[];
  genders: string[];
  sexualOrientations: string[];
  countries: string[];
  cities: { name: string; country: string }[];
  games: string[];
  interests: string[];
  languages: string[];
}

const genderOptions = [
  { id: 'male', label: 'Male', icon: '♂️' },
  { id: 'female', label: 'Female', icon: '♀️' },
  { id: 'non-binary', label: 'Non-binary', icon: '⚧️' },
  { id: 'genderfluid', label: 'Gender Fluid', icon: '🌊' },
  { id: 'agender', label: 'Agender', icon: '⚪' },
  { id: 'prefer-not-say', label: 'Prefer not to say', icon: '🤐' },
  { id: 'other', label: 'Other', icon: '✨' }
];

const sexualOrientationOptions = [
  { id: 'heterosexual', label: 'Heterosexual', icon: '💑' },
  { id: 'homosexual', label: 'Homosexual', icon: '🏳️‍🌈' },
  { id: 'bisexual', label: 'Bisexual', icon: '💗' },
  { id: 'pansexual', label: 'Pansexual', icon: '💖' },
  { id: 'asexual', label: 'Asexual', icon: '🖤' },
  { id: 'demisexual', label: 'Demisexual', icon: '💜' },
  { id: 'queer', label: 'Queer', icon: '🌈' },
  { id: 'questioning', label: 'Questioning', icon: '❓' },
  { id: 'prefer-not-say', label: 'Prefer not to say', icon: '🤐' },
  { id: 'other', label: 'Other', icon: '✨' }
];

const countries = [
  'Argentina', 'Brazil', 'Chile', 'Colombia', 'Mexico', 'Peru', 'USA', 'Spain', 
  'France', 'Germany', 'Italy', 'United Kingdom', 'Canada', 'Australia', 'Japan',
  'China', 'India', 'Russia', 'South Korea', 'Portugal', 'Netherlands', 'Belgium',
  'Sweden', 'Norway', 'Finland', 'Denmark', 'Switzerland', 'Austria', 'Poland',
  'Ukraine', 'Turkey', 'Egypt', 'South Africa', 'Nigeria', 'Kenya', 'Singapore',
  'Thailand', 'Vietnam', 'Philippines', 'Indonesia', 'New Zealand', 'Uruguay',
  'Paraguay', 'Bolivia', 'Ecuador', 'Venezuela', 'Costa Rica', 'Panama'
];

// Usando la lista completa de juegos importada de roomOptions

const interests = [
  'Anime', 'Music', 'Movies', 'Art', 'Books', 'Sports', 'Travel', 'Tech',
  'Cooking', 'Photography', 'Fitness', 'Gaming', 'Series', 'K-pop'
];

const FindFriendsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { authUser } = useUser();
  const [activeTab, setActiveTab] = useState<'swipe' | 'filters' | 'matches'>('swipe');
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<UserProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [showFilters, setShowFilters] = useState(true);
  const [savedFilters, setSavedFilters] = useState<{name: string, filters: SearchFilters}[]>([]);
  const [filterName, setFilterName] = useState('');

  const [filters, setFilters] = useState<SearchFilters>({
    connectionTypes: ['gaming', 'chat'],
    genders: [],
    sexualOrientations: [],
    countries: [],
    cities: [],
    games: [],
    interests: [],
    languages: ['Spanish', 'English']
  });

  useEffect(() => {
    if (authUser) {
      fetchPotentialMatches();
      fetchMatches();
      loadSavedFilters();
    }
  }, [authUser]);
  
  // Load saved filters
  const loadSavedFilters = () => {
    if (!authUser) return;
    
    const savedFiltersStr = localStorage.getItem(`savedFilters_${authUser.id}`);
    if (savedFiltersStr) {
      try {
        const parsed = JSON.parse(savedFiltersStr);
        setSavedFilters(parsed);
      } catch (e) {
        console.error('Error loading saved filters', e);
      }
    }
  };
  
  // Save current filter
  const saveCurrentFilter = () => {
    if (!authUser || !filterName.trim()) return;
    
    const newSavedFilters = [
      ...savedFilters,
      { name: filterName.trim(), filters: {...filters} }
    ];
    
    setSavedFilters(newSavedFilters);
    setFilterName('');
    
    localStorage.setItem(`savedFilters_${authUser.id}`, JSON.stringify(newSavedFilters));
  };
  
  // Apply saved filter
  const applySavedFilter = (savedFilter: {name: string, filters: SearchFilters}) => {
    setFilters(savedFilter.filters);
    fetchPotentialMatches();
  };
  
  // Delete saved filter
  const deleteSavedFilter = (index: number) => {
    if (!authUser) return;
    
    const newSavedFilters = [...savedFilters];
    newSavedFilters.splice(index, 1);
    
    setSavedFilters(newSavedFilters);
    localStorage.setItem(`savedFilters_${authUser.id}`, JSON.stringify(newSavedFilters));
  };

  useEffect(() => {
    if (potentialMatches.length > 0 && currentIndex < potentialMatches.length) {
      setCurrentProfile(potentialMatches[currentIndex]);
    } else {
      setCurrentProfile(null);
    }
  }, [potentialMatches, currentIndex]);

  const fetchPotentialMatches = async () => {
    if (!authUser) return;

    let query = supabase
      .from('profiles')
      .select('*')
      .neq('user_id', authUser.id)
      .limit(20);

    // Apply filters
    if (filters.countries.length > 0) {
      query = query.in('country', filters.countries);
    }

    if (filters.genders.length > 0) {
      query = query.in('gender', filters.genders);
    }

    if (filters.sexualOrientations.length > 0) {
      query = query.in('sexual_orientation', filters.sexualOrientations);
    }

    const { data, error } = await query;
    
    if (!error && data) {
      setPotentialMatches(data);
      setCurrentIndex(0);
      setMatchCount(data.length);
    }
  };

  const fetchMatches = async () => {
    if (!authUser) return;

    const { data, error } = await supabase
      .from('user_matches')
      .select(`
        *,
        user1:profiles!user_matches_user1_id_fkey(*),
        user2:profiles!user_matches_user2_id_fkey(*)
      `)
      .or(`user1_id.eq.${authUser.id},user2_id.eq.${authUser.id}`)
      .eq('is_active', true);

    if (!error && data) {
      const matchProfiles = data.map(match => 
        match.user1_id === authUser.id ? match.user2 : match.user1
      );
      setMatches(matchProfiles);
    }
  };

  const handleSwipe = async (action: 'like' | 'pass') => {
    if (!currentProfile || !authUser) return;

    // Record the swipe
    await supabase.from('user_swipes').insert({
      swiper_id: authUser.id,
      swiped_id: currentProfile.user_id,
      action
    });

    if (action === 'like') {
      // Check if the other user already liked us
      const { data: existingSwipe } = await supabase
        .from('user_swipes')
        .select('*')
        .eq('swiper_id', currentProfile.user_id)
        .eq('swiped_id', authUser.id)
        .eq('action', 'like')
        .single();

      if (existingSwipe) {
        // It's a match!
        await supabase.from('user_matches').insert({
          user1_id: authUser.id,
          user2_id: currentProfile.user_id,
          matched_at: new Date().toISOString(),
          is_active: true
        });

        // Create notification
        await supabase.from('notification_queue').insert({
          user_id: currentProfile.user_id,
          type: 'match',
          title: 'New Match!',
          message: `${authUser.email?.split('@')[0]} wants to connect with you`,
          data: { match_user_id: authUser.id }
        });

        alert('It\'s a Match! 🎉');
        fetchMatches();
      }
    }

    // Move to next profile
    setCurrentIndex(prev => prev + 1);
  };

  const MultiSelectFilter: React.FC<{
    title: string;
    options: string[] | { id: string; label: string; icon?: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
  }> = ({ title, options, selected, onChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Determine if the list is long and needs search
    const needsSearch = options.length > 10;
    
    // Filter options based on search term
    const filteredOptions = searchTerm.trim() === '' ? options : options.filter(option => {
      const label = typeof option === 'string' ? option : option.label;
      return label.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    return (
      <div className="mb-4 bg-[#221b3a]/50 p-3 rounded-lg border border-purple-500/20">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-purple-300">{title}</label>
            {selected.length > 0 && (
              <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                {selected.length}
              </span>
            )}
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-purple-300 hover:text-white"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
        
        {/* Show current selections as chips */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {selected.map(id => {
              const option = options.find(opt => 
                typeof opt === 'string' ? opt === id : opt.id === id
              );
              const label = typeof option === 'string' ? option : option?.label || id;
              const icon = typeof option === 'object' && option?.icon;
              
              return (
                <span 
                  key={id} 
                  className="bg-purple-600/50 text-white text-xs px-2 py-1 rounded-full flex items-center"
                >
                  {icon && <span className="mr-1">{icon}</span>}
                  {label}
                  <button 
                    onClick={() => onChange(selected.filter(item => item !== id))}
                    className="ml-1 text-white hover:text-red-300"
                    aria-label={`Remove ${label}`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}
        
        {isExpanded && (
          <>
            {/* Search field for long lists */}
            {needsSearch && (
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-1 rounded-lg border border-purple-400/50 bg-[#281e46]/[0.85] text-white text-sm outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>
            )}
            
            {/* Options grid with scroll */}
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-purple-900/20">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(option => {
                  const id = typeof option === 'string' ? option : option.id;
                  const label = typeof option === 'string' ? option : option.label;
                  const icon = typeof option === 'object' ? option.icon : null;
                  
                  return (
                    <label key={id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-900/20 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selected.includes(id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onChange([...selected, id]);
                          } else {
                            onChange(selected.filter(item => item !== id));
                          }
                        }}
                        className="accent-purple-500"
                      />
                      {icon && <span className="text-lg">{icon}</span>}
                      <span className="text-sm text-white">{label}</span>
                    </label>
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-2 text-purple-300 text-sm">
                  No results found
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#18122B] rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border border-purple-400/30">
        {/* Header */}
        <div className="p-6 border-b border-purple-400/30">
          <div className="flex justify-between items-center mb-4">
            <ShinyText text="🤝 Find Friends" className="text-2xl font-bold" />
            <button onClick={onClose} className="text-purple-400 hover:text-purple-200 text-2xl">
              ✕
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex bg-[#2D2350] rounded-lg">
            <button
              onClick={() => setActiveTab('swipe')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'swipe'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              🃏 Discover
            </button>
            <button
              onClick={() => setActiveTab('filters')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'filters'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              ⚙️ Filters
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'matches'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              💬 Matches ({matches.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'swipe' && (
            <div className="flex flex-col items-center justify-center h-full">
              {currentProfile ? (
                <div className="w-full max-w-md">
                  {/* Profile Card */}
                  <div className="bg-[#221b3a] rounded-2xl p-6 border border-purple-400/30 mb-6">
                    <div className="text-center mb-4">
                      <img
                        src={currentProfile.avatar_url || '/default-avatar.png'}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-purple-400"
                      />
                      <h3 className="text-xl font-bold text-white">{currentProfile.username}</h3>
                      <p className="text-purple-300 text-sm">
                        📍 {currentProfile.city}, {currentProfile.country}
                      </p>
                    </div>

                    {currentProfile.bio && (
                      <div className="mb-4">
                        <p className="text-gray-300 text-sm text-center italic">
                          "{currentProfile.bio}"
                        </p>
                      </div>
                    )}

                    {currentProfile.game_tags && (
                      <div className="mb-4">
                        <p className="text-purple-300 text-xs mb-2">🎮 Games:</p>
                        <div className="flex flex-wrap gap-2">
                          {currentProfile.game_tags.split(',').map(tag => (
                            <span key={tag} className="bg-purple-800 text-purple-200 px-2 py-1 rounded-full text-xs">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <GlareHover
                      width="50%"
                      height="50px"
                      background="linear-gradient(to right, #ef4444, #dc2626)"
                      borderRadius="12px"
                      borderColor="transparent"
                      glareColor="#ffffff"
                      glareOpacity={0.3}
                    >
                      <button
                        onClick={() => handleSwipe('pass')}
                        className="w-full h-full bg-transparent text-white font-bold rounded-xl flex items-center justify-center gap-2"
                      >
                        👎 PASS
                      </button>
                    </GlareHover>

                    <GlareHover
                      width="50%"
                      height="50px"
                      background="linear-gradient(to right, #10b981, #059669)"
                      borderRadius="12px"
                      borderColor="transparent"
                      glareColor="#ffffff"
                      glareOpacity={0.3}
                    >
                      <button
                        onClick={() => handleSwipe('like')}
                        className="w-full h-full bg-transparent text-white font-bold rounded-xl flex items-center justify-center gap-2"
                      >
                        👍 CONNECT
                      </button>
                    </GlareHover>
                  </div>

                  <div className="text-center mt-4 text-purple-300 text-sm">
                    {currentIndex + 1} of {matchCount} profiles
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <div className="text-6xl mb-4">🎯</div>
                  <ShinyText text="No more profiles to show" className="text-lg mb-2" />
                  <p className="text-sm">Try adjusting your filters to see more people</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'filters' && (
            <div className="max-w-2xl mx-auto relative">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="absolute top-0 right-0 bg-purple-700 hover:bg-purple-600 text-white p-2 rounded-lg z-10 transition-all"
                title={showFilters ? "Hide filters" : "Show filters"}
              >
                {showFilters ? "📌" : "🔍"}
              </button>
              
              {showFilters && (
                <div className="mt-2">
                  {/* Filter categories */}
                  <div className="mb-6">
                    <h3 className="text-purple-300 font-medium mb-3 border-b border-purple-500/30 pb-2">🎯 Connection Type</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <MultiSelectFilter
                        title="Looking for:"
                        options={[
                          { id: 'gaming', label: 'Gaming Partners' },
                          { id: 'chat', label: 'Chat Friends' },
                          { id: 'both', label: 'Both' }
                        ]}
                        selected={filters.connectionTypes}
                        onChange={(selected) => setFilters(prev => ({ ...prev, connectionTypes: selected }))}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-purple-300 font-medium mb-3 border-b border-purple-500/30 pb-2">👤 Personal Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <MultiSelectFilter
                        title="⚧️ Gender:"
                        options={genderOptions}
                        selected={filters.genders}
                        onChange={(selected) => setFilters(prev => ({ ...prev, genders: selected }))}
                      />

                      <MultiSelectFilter
                        title="🏳️‍🌈 Orientation:"
                        options={sexualOrientationOptions}
                        selected={filters.sexualOrientations}
                        onChange={(selected) => setFilters(prev => ({ ...prev, sexualOrientations: selected }))}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-purple-300 font-medium mb-3 border-b border-purple-500/30 pb-2">🌍 Location & Languages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <MultiSelectFilter
                        title="Countries:"
                        options={countries}
                        selected={filters.countries}
                        onChange={(selected) => setFilters(prev => ({ ...prev, countries: selected }))}
                      />

                      <MultiSelectFilter
                        title="🗣️ Languages:"
                        options={[
                          'Spanish', 'English', 'Portuguese', 'French', 'German', 'Italian',
                          'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi',
                          'Dutch', 'Swedish', 'Norwegian', 'Finnish', 'Danish', 'Polish',
                          'Turkish', 'Greek', 'Thai', 'Vietnamese', 'Indonesian', 'Tagalog',
                          'Hebrew', 'Czech', 'Hungarian', 'Romanian', 'Bulgarian', 'Ukrainian'
                        ]}
                        selected={filters.languages}
                        onChange={(selected) => setFilters(prev => ({ ...prev, languages: selected }))}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-purple-300 font-medium mb-3 border-b border-purple-500/30 pb-2">🎮 Interests</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <MultiSelectFilter
                        title="Games:"
                        options={allGames}
                        selected={filters.games}
                        onChange={(selected) => setFilters(prev => ({ ...prev, games: selected }))}
                      />

                      <MultiSelectFilter
                        title="💭 Other interests:"
                        options={interests}
                        selected={filters.interests}
                        onChange={(selected) => setFilters(prev => ({ ...prev, interests: selected }))}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {!showFilters && (
                <div className="bg-[#221b3a] rounded-lg p-4 mb-4 text-center">
                  <p className="text-purple-300">Filters hidden. Click the "🔍" button to show them.</p>
                </div>
              )}

              <div className="mt-6">
                {/* Saved Filters */}
                {savedFilters.length > 0 && (
                  <div className="bg-[#221b3a] rounded-lg p-4 mb-4">
                    <h3 className="text-purple-300 font-medium mb-2">💾 Saved Filters</h3>
                    <div className="flex flex-wrap gap-2">
                      {savedFilters.map((savedFilter, index) => (
                        <div key={index} className="flex items-center bg-purple-800/30 rounded-lg px-2 py-1">
                          <button 
                            onClick={() => applySavedFilter(savedFilter)}
                            className="text-white text-sm hover:text-purple-300"
                          >
                            {savedFilter.name}
                          </button>
                          <button 
                            onClick={() => deleteSavedFilter(index)}
                            className="ml-2 text-red-400 hover:text-red-300 text-xs"
                            title="Delete filter"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Save Current Filter */}
                <div className="bg-[#221b3a] rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Filter name"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-purple-400/50 bg-[#281e46]/[0.85] text-white text-sm outline-none focus:ring-1 focus:ring-purple-400"
                    />
                    <button
                      onClick={saveCurrentFilter}
                      disabled={!filterName.trim()}
                      className={`px-3 py-2 rounded-lg text-white text-sm ${!filterName.trim() ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500'}`}
                    >
                      Save Filter
                    </button>
                  </div>
                </div>
                
                {/* Match counter */}
                <div className="bg-[#221b3a] rounded-lg p-4 mb-4 text-center">
                  <ShinyText text={`📊 Potential matches: ${matchCount}`} className="text-lg font-semibold" />
                </div>
                
                {/* Action buttons */}
                <div className="flex gap-4 justify-center">
                  <GlareHover>
                    <button
                      onClick={fetchPotentialMatches}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-xl font-semibold"
                    >
                      Apply Filters
                    </button>
                  </GlareHover>
                  
                  <button
                    onClick={() => setFilters({
                      connectionTypes: ['gaming', 'chat'],
                      genders: [],
                      sexualOrientations: [],
                      countries: [],
                      cities: [],
                      games: [],
                      interests: [],
                      languages: ['Spanish', 'English']
                    })}
                    className="bg-gray-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-gray-700"
                  >
                    Reset All
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="max-w-2xl mx-auto">
              {matches.length === 0 ? (
                <div className="text-center text-gray-400">
                  <div className="text-6xl mb-4">💔</div>
                  <ShinyText text="No matches yet" className="text-lg mb-2" />
                  <p className="text-sm">Start swiping to find your gaming partners!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map(match => (
                    <div key={match.user_id} className="bg-[#221b3a] rounded-lg p-4 border border-purple-400/30">
                      <div className="flex items-center gap-4">
                        <img
                          src={match.avatar_url || '/default-avatar.png'}
                          alt="Avatar"
                          className="w-12 h-12 rounded-full border-2 border-purple-400"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{match.username}</h4>
                          <p className="text-sm text-purple-300">
                            📍 {match.city}, {match.country}
                          </p>
                        </div>
                        <GlareHover>
                          <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg font-semibold">
                            💬 Chat
                          </button>
                        </GlareHover>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindFriendsModal;