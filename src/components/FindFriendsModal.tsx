import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import { games } from '../lib/roomOptions';

interface UserProfile {
  user_id: string;
  username: string;
  bio?: string;
  country?: string;
  city?: string;
  game_tags?: string;
  avatar_url?: string;
  gender?: string;
  sexual_orientation?: string;
  connection_types?: string;
  interests?: string;
}

interface SearchFilters {
  username: string;
  genders: string[];
  sexualOrientations: string[];
  countries: string[];
  games: string[];
  interests: string[];
  connectionTypes: string[];
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

const interests = [
  'Anime', 'Music', 'Movies', 'Art', 'Books', 'Sports', 'Travel', 'Tech',
  'Cooking', 'Photography', 'Fitness', 'Gaming', 'Series', 'K-pop', 'Love'
];

const connectionTypeOptions = [
  { id: 'gaming', label: 'Gaming Partners' },
  { id: 'chat', label: 'Chat Friends' },
  { id: 'both', label: 'Both' }
];

const FindFriendsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { authUser } = useUser();
  const [activeTab, setActiveTab] = useState<'search' | 'filters'>('search');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    username: '',
    genders: [],
    sexualOrientations: [],
    countries: [],
    games: [],
    interests: [],
    connectionTypes: []
  });

  const searchUsers = async () => {
    if (!authUser) return;
    
    setLoading(true);
    
    try {
      console.log('🔍 Starting search for users...');
      
      // First check how many profiles exist in total
      const { count: totalProfiles } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .neq('user_id', authUser.id);
      
      console.log('📊 Total profiles in database (excluding self):', totalProfiles);
      
      // First, get users that have already been rated by the current user
      const { data: ratedUsers, error: ratedError } = await supabase
        .from('likes_dislikes')
        .select('target_user_id')
        .eq('user_id', authUser.id);

      if (ratedError) {
        console.error('❌ Error fetching rated users:', ratedError);
        // Continue even if there's an error - maybe the table doesn't exist yet
      }

      const ratedUserIds = ratedUsers?.map(r => r.target_user_id) || [];
      console.log('👍 Already rated user IDs:', ratedUserIds);

      // Also get existing friends to exclude them
      const { data: existingFriends, error: friendsError } = await supabase
        .from('friendships')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${authUser.id},user2_id.eq.${authUser.id}`);

      if (friendsError) {
        console.error('❌ Error fetching friends:', friendsError);
      }

      const friendIds = existingFriends?.map(f => 
        f.user1_id === authUser.id ? f.user2_id : f.user1_id
      ) || [];

      console.log('🤝 Existing friend IDs:', friendIds);

      // Combine both arrays to exclude
      const excludeUserIds = [...ratedUserIds, ...friendIds];
      console.log('🚫 Users to exclude:', excludeUserIds);

      let query = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', authUser.id)
        .limit(50);

      // Exclude already rated users and friends
      if (excludeUserIds.length > 0) {
        query = query.not('user_id', 'in', `(${excludeUserIds.join(',')})`);
        console.log('🔍 Applied exclusion filter for', excludeUserIds.length, 'users');
      }

      if (filters.username.trim()) {
        query = query.ilike('username', `%${filters.username.trim()}%`);
        console.log('🔍 Filtering by username:', filters.username.trim());
      }

      if (filters.genders.length > 0) {
        query = query.in('gender', filters.genders);
        console.log('🔍 Filtering by genders:', filters.genders);
      }

      if (filters.sexualOrientations.length > 0) {
        query = query.in('sexual_orientation', filters.sexualOrientations);
        console.log('🔍 Filtering by sexual orientations:', filters.sexualOrientations);
      }

      if (filters.countries.length > 0) {
        query = query.in('country', filters.countries);
        console.log('🔍 Filtering by countries:', filters.countries);
      }

      const { data, error } = await query;
      
      console.log('📊 Query result:', { data: data?.length, error });
      
      if (error) {
        console.error('❌ Query error:', error);
        setSearchResults([]);
        setLoading(false);
        return;
      }
      
      if (!data) {
        console.log('❌ No data returned');
        setSearchResults([]);
        setLoading(false);
        return;
      }

      console.log(`✅ Found ${data.length} users before client-side filtering`);
      
      // Filter by games and interests on client side since they're stored as comma-separated strings
      let filteredData = data;
      
      if (filters.games.length > 0) {
        filteredData = filteredData.filter(user => {
          if (!user.game_tags) return false;
          const userGames = user.game_tags.split(',').map(g => g.trim().toLowerCase());
          return filters.games.some(game => 
            userGames.some(userGame => userGame.includes(game.toLowerCase()))
          );
        });
        console.log(`🎮 After games filter: ${filteredData.length} users`);
      }

      if (filters.interests.length > 0) {
        filteredData = filteredData.filter(user => {
          if (!user.interests) return false;
          const userInterests = user.interests.split(',').map(i => i.trim().toLowerCase());
          return filters.interests.some(interest => 
            userInterests.some(userInterest => userInterest.includes(interest.toLowerCase()))
          );
        });
        console.log(`💝 After interests filter: ${filteredData.length} users`);
      }

      if (filters.connectionTypes.length > 0) {
        filteredData = filteredData.filter(user => {
          if (!user.connection_types) return false;
          const userConnectionTypes = user.connection_types.split(',').map(c => c.trim().toLowerCase());
          return filters.connectionTypes.some(type => 
            userConnectionTypes.some(userType => userType.includes(type.toLowerCase()))
          );
        });
        console.log(`🔗 After connection types filter: ${filteredData.length} users`);
      }

      console.log(`✨ Final result: ${filteredData.length} users to show`);
      setSearchResults(filteredData);
      
    } catch (error) {
      console.error('💥 Exception in searchUsers:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeDislike = async (userId: string, action: 'like' | 'dislike') => {
    if (!authUser) return;

    try {
      console.log(`${action === 'like' ? '💖' : '👎'} ${action}ing user:`, userId);

      // Insert the like/dislike action
      const { error: insertError } = await supabase
        .from('likes_dislikes')
        .insert([{
          user_id: authUser.id,
          target_user_id: userId,
          action: action
        }]);

      if (insertError) {
        console.error('❌ Error inserting like/dislike:', insertError);
        alert(`Failed to ${action}: ` + insertError.message);
        return;
      }

      console.log(`✅ ${action} recorded successfully`);

      // If it was a like, check for a match
      if (action === 'like') {
        const { data: reciprocalLike, error: matchError } = await supabase
          .from('likes_dislikes')
          .select('id')
          .eq('user_id', userId)
          .eq('target_user_id', authUser.id)
          .eq('action', 'like')
          .single();

        if (!matchError && reciprocalLike) {
          console.log('🎉 IT\'S A MATCH!');
          alert(`🎉 It's a Match! You can now chat with this user.`);
          
          // Create friendship automatically
          const userId1 = authUser.id < userId ? authUser.id : userId;
          const userId2 = authUser.id < userId ? userId : authUser.id;
          
          const { error: friendshipError } = await supabase
            .from('friendships')
            .insert([{
              user1_id: userId1,
              user2_id: userId2,
              status: 'accepted',
              created_at: new Date().toISOString()
            }]);

          if (friendshipError) {
            console.error('❌ Error creating friendship:', friendshipError);
          } else {
            console.log('✅ Friendship created from match');
          }
        } else {
          alert(`💖 You liked this user. If they like you back, it will be a match!`);
        }
      } else {
        alert(`👎 You're not interested in this user. They won't appear in your search again.`);
      }

      // Refresh the search to remove this user from results
      await searchUsers();
      
    } catch (error) {
      console.error('💥 Exception in handleLikeDislike:', error);
      alert('An unexpected error occurred');
    }
  };

  // Debug function to reset all likes/dislikes
  const resetAllRatings = async () => {
    if (!authUser) return;
    
    const confirmReset = window.confirm('Are you sure you want to reset all your ratings? This will allow you to see all users again.');
    if (!confirmReset) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('likes_dislikes')
        .delete()
        .eq('user_id', authUser.id);
        
      if (error) {
        console.error('Error resetting ratings:', error);
        alert('Failed to reset ratings: ' + error.message);
      } else {
        console.log('✅ All ratings reset');
        alert('All ratings reset! The list will refresh automatically.');
        // Small delay to ensure database has processed the deletion
        await new Promise(resolve => setTimeout(resolve, 100));
        // Automatically refresh the search to show available users
        await searchUsers();
      }
    } catch (error) {
      console.error('Exception resetting ratings:', error);
      alert('An error occurred while resetting ratings');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      username: '',
      genders: [],
      sexualOrientations: [],
      countries: [],
      games: [],
      interests: [],
      connectionTypes: []
    });
  };

  const MultiSelectFilter: React.FC<{
    title: string;
    options: string[] | { id: string; label: string; icon?: string }[];
    selected: string[];
    onChange: (selected: string[]) => void;
    searchable?: boolean;
  }> = ({ title, options, selected, onChange, searchable = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
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
            {/* Search field for searchable lists */}
            {searchable && (
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

  useEffect(() => {
    // Add a small delay to ensure all database connections are ready
    const timer = setTimeout(() => {
      if (authUser) {
        searchUsers();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [authUser]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#18122B] rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-purple-400/30">
        {/* Header */}
        <div className="p-6 border-b border-purple-400/30">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-purple-200">🤝 Find Friends</h2>
            <button onClick={onClose} className="text-purple-400 hover:text-purple-200 text-2xl">
              ✕
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex bg-[#2D2350] rounded-lg">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'search'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              🔍 Search ({searchResults.length})
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
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'search' && (
            <>
              {/* Quick Search */}
              <div className="mb-6 bg-[#221b3a] rounded-lg p-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm text-purple-300 mb-1">Username</label>
                    <input
                      type="text"
                      value={filters.username}
                      onChange={(e) => setFilters(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Search by username"
                      className="w-full px-3 py-2 bg-[#2D2350] border border-purple-400/30 rounded-lg text-white"
                    />
                  </div>
                  <button
                    onClick={searchUsers}
                    disabled={loading}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Clear
                  </button>
                  <button
                    onClick={resetAllRatings}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                    title="Reset all your like/dislike ratings to see all users again"
                  >
                    🔄 Reset
                  </button>
                </div>
              </div>

              {/* Results */}
              {loading ? (
                <div className="text-center text-purple-300">Searching for users...</div>
              ) : searchResults.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <div className="text-6xl mb-4">🔍</div>
                  <p>No users found. Try adjusting your search filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map(user => (
                    <div key={user.user_id} className="bg-[#221b3a] rounded-lg p-4 border border-purple-400/30">
                      <div className="text-center mb-4">
                        <img
                          src={user.avatar_url || '/default-avatar.png'}
                          alt="Avatar"
                          className="w-16 h-16 rounded-full mx-auto mb-3 border-4 border-purple-400"
                        />
                        <h3 className="text-lg font-bold text-white">{user.username}</h3>
                        {user.country && user.city && (
                          <p className="text-purple-300 text-sm">
                            📍 {user.city}, {user.country}
                          </p>
                        )}
                      </div>

                      {user.bio && (
                        <div className="mb-4">
                          <p className="text-gray-300 text-sm text-center italic">
                            "{user.bio}"
                          </p>
                        </div>
                      )}

                      {user.game_tags && (
                        <div className="mb-4">
                          <p className="text-purple-300 text-xs mb-2">🎮 Games:</p>
                          <div className="flex flex-wrap gap-1">
                            {user.game_tags.split(',').slice(0, 3).map((tag, index) => (
                              <span key={index} className="bg-purple-800 text-purple-200 px-2 py-1 rounded-full text-xs">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLikeDislike(user.user_id, 'dislike')}
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                        >
                          👎 Not Interested
                        </button>
                        <button
                          onClick={() => handleLikeDislike(user.user_id, 'like')}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          💖 Like
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'filters' && (
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-purple-300 font-medium mb-3 border-b border-purple-500/30 pb-2">👤 Personal</h3>
                  <MultiSelectFilter
                    title="Gender"
                    options={genderOptions}
                    selected={filters.genders}
                    onChange={(selected) => setFilters(prev => ({ ...prev, genders: selected }))}
                  />
                  <MultiSelectFilter
                    title="Sexual Orientation"
                    options={sexualOrientationOptions}
                    selected={filters.sexualOrientations}
                    onChange={(selected) => setFilters(prev => ({ ...prev, sexualOrientations: selected }))}
                  />
                  <MultiSelectFilter
                    title="Connection Type"
                    options={connectionTypeOptions}
                    selected={filters.connectionTypes}
                    onChange={(selected) => setFilters(prev => ({ ...prev, connectionTypes: selected }))}
                  />
                </div>
                
                <div>
                  <h3 className="text-purple-300 font-medium mb-3 border-b border-purple-500/30 pb-2">🌍 Location & Interests</h3>
                  <MultiSelectFilter
                    title="Countries"
                    options={countries}
                    selected={filters.countries}
                    onChange={(selected) => setFilters(prev => ({ ...prev, countries: selected }))}
                    searchable={true}
                  />
                  <MultiSelectFilter
                    title="Games"
                    options={games}
                    selected={filters.games}
                    onChange={(selected) => setFilters(prev => ({ ...prev, games: selected }))}
                    searchable={true}
                  />
                  <MultiSelectFilter
                    title="Interests"
                    options={interests}
                    selected={filters.interests}
                    onChange={(selected) => setFilters(prev => ({ ...prev, interests: selected }))}
                  />
                </div>
              </div>
              
              <div className="flex gap-4 justify-center mt-6">
                <button
                  onClick={searchUsers}
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Apply Filters'}
                </button>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindFriendsModal;