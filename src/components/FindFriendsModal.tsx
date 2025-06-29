import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';

interface UserProfile {
  user_id: string;
  username: string;
  bio?: string;
  country?: string;
  city?: string;
  game_tags?: string;
  avatar_url?: string;
  gender?: string;
}

const FindFriendsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { authUser } = useUser();
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [gameFilter, setGameFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const searchUsers = async () => {
    if (!authUser) return;
    
    setLoading(true);
    
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('user_id', authUser.id)
        .limit(20);

      if (searchTerm.trim()) {
        query = query.ilike('username', `%${searchTerm.trim()}%`);
      }

      if (gameFilter.trim()) {
        query = query.ilike('game_tags', `%${gameFilter.trim()}%`);
      }

      if (countryFilter.trim()) {
        query = query.eq('country', countryFilter);
      }

      const { data, error } = await query;
      
      if (!error && data) {
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    if (!authUser) return;

    try {
      // Check if request already exists
      const { data: existingRequest } = await supabase
        .from('friend_requests')
        .select('id')
        .or(`and(sender_id.eq.${authUser.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${authUser.id})`)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        alert('Friend request already sent or received');
        return;
      }

      // Check if already friends
      const { data: existingFriend } = await supabase
        .from('friendships')
        .select('id')
        .or(`and(user_id.eq.${authUser.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${authUser.id})`)
        .single();

      if (existingFriend) {
        alert('Already friends with this user');
        return;
      }

      const { error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: authUser.id,
          receiver_id: userId,
          status: 'pending'
        });

      if (!error) {
        alert('Friend request sent!');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  useEffect(() => {
    searchUsers();
  }, [authUser]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#18122B] rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border border-purple-400/30">
        {/* Header */}
        <div className="p-6 border-b border-purple-400/30">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-purple-200">🤝 Find Friends</h2>
            <button onClick={onClose} className="text-purple-400 hover:text-purple-200 text-2xl">
              ✕
            </button>
          </div>
          
          {/* Search Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-purple-300 mb-1">Username</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by username"
                className="w-full px-3 py-2 bg-[#2D2350] border border-purple-400/30 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-purple-300 mb-1">Game</label>
              <input
                type="text"
                value={gameFilter}
                onChange={(e) => setGameFilter(e.target.value)}
                placeholder="Search by game"
                className="w-full px-3 py-2 bg-[#2D2350] border border-purple-400/30 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-purple-300 mb-1">Country</label>
              <input
                type="text"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                placeholder="Search by country"
                className="w-full px-3 py-2 bg-[#2D2350] border border-purple-400/30 rounded-lg text-white"
              />
            </div>
          </div>
          
          <button
            onClick={searchUsers}
            disabled={loading}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
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

                  <button
                    onClick={() => sendFriendRequest(user.user_id)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-blue-600"
                  >
                    🤝 Add Friend
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindFriendsModal;