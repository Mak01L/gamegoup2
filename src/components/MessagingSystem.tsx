import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  friend_profile: {
    username: string;
    avatar_url?: string;
    email?: string;
  };
}

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender_profile: {
    username: string;
    avatar_url?: string;
  };
}

const MessagingSystem: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { authUser } = useUser();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (authUser) {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [authUser]);

  const fetchFriends = async () => {
    if (!authUser) return;

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        friend_profile:profiles!friendships_friend_id_fkey(username, avatar_url, email)
      `)
      .eq('user_id', authUser.id)
      .eq('status', 'accepted');

    if (!error && data) {
      setFriends(data);
    }
  };

  const fetchFriendRequests = async () => {
    if (!authUser) return;

    const { data, error } = await supabase
      .from('friend_requests')
      .select(`
        *,
        sender_profile:profiles!friend_requests_sender_id_fkey(username, avatar_url)
      `)
      .eq('receiver_id', authUser.id)
      .eq('status', 'pending');

    if (!error && data) {
      setFriendRequests(data);
    }
  };

  const sendFriendRequest = async () => {
    if (!authUser || !searchUsername.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      // Find user by username
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('user_id, username')
        .eq('username', searchUsername.trim())
        .single();

      if (userError || !user) {
        setMessage('User not found');
        setLoading(false);
        return;
      }

      if (user.user_id === authUser.id) {
        setMessage('You cannot add yourself as a friend');
        setLoading(false);
        return;
      }

      // Check if already friends or request exists
      const { data: existingFriend } = await supabase
        .from('friendships')
        .select('id')
        .or(`and(user_id.eq.${authUser.id},friend_id.eq.${user.user_id}),and(user_id.eq.${user.user_id},friend_id.eq.${authUser.id})`)
        .single();

      if (existingFriend) {
        setMessage('Already friends with this user');
        setLoading(false);
        return;
      }

      const { data: existingRequest } = await supabase
        .from('friend_requests')
        .select('id')
        .or(`and(sender_id.eq.${authUser.id},receiver_id.eq.${user.user_id}),and(sender_id.eq.${user.user_id},receiver_id.eq.${authUser.id})`)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        setMessage('Friend request already sent or received');
        setLoading(false);
        return;
      }

      // Send friend request
      const { error: requestError } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: authUser.id,
          receiver_id: user.user_id,
          status: 'pending'
        });

      if (requestError) {
        setMessage('Failed to send friend request');
      } else {
        setMessage('Friend request sent successfully!');
        setSearchUsername('');
      }
    } catch (error) {
      setMessage('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = async (requestId: string, action: 'accept' | 'reject') => {
    const request = friendRequests.find(r => r.id === requestId);
    if (!request) return;

    // Update request status
    const { error: updateError } = await supabase
      .from('friend_requests')
      .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
      .eq('id', requestId);

    if (updateError) return;

    if (action === 'accept') {
      // Create friendship entries for both users
      await supabase.from('friendships').insert([
        {
          user_id: authUser!.id,
          friend_id: request.sender_id,
          status: 'accepted'
        },
        {
          user_id: request.sender_id,
          friend_id: authUser!.id,
          status: 'accepted'
        }
      ]);

      fetchFriends();
    }

    fetchFriendRequests();
  };

  const removeFriend = async (friendId: string) => {
    if (!authUser) return;

    // Remove both friendship entries
    await supabase
      .from('friendships')
      .delete()
      .or(`and(user_id.eq.${authUser.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${authUser.id})`);

    fetchFriends();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#18122B] rounded-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden border border-purple-400/30">
        {/* Header */}
        <div className="p-4 border-b border-purple-400/30">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-purple-200">Friends & Messages</h2>
            <button onClick={onClose} className="text-purple-400 hover:text-purple-200 text-2xl">
              ✕
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex bg-[#2D2350] rounded-lg">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'friends'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              👥 Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'requests'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              📨 Requests ({friendRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'add'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              ➕ Add Friend
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'friends' && (
            <div className="space-y-3">
              {friends.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <div className="text-4xl mb-2">👥</div>
                  <p>No friends yet. Add some friends to start chatting!</p>
                </div>
              ) : (
                friends.map(friend => (
                  <div key={friend.id} className="bg-[#221b3a] rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={friend.friend_profile.avatar_url || '/default-avatar.png'}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full border-2 border-purple-400"
                      />
                      <div>
                        <div className="font-medium text-white">{friend.friend_profile.username}</div>
                        <div className="text-sm text-gray-400">{friend.friend_profile.email}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => alert('Chat feature coming soon!')}
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                      >
                        💬 Chat
                      </button>
                      <button
                        onClick={() => removeFriend(friend.friend_id)}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-3">
              {friendRequests.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <div className="text-4xl mb-2">📨</div>
                  <p>No friend requests</p>
                </div>
              ) : (
                friendRequests.map(request => (
                  <div key={request.id} className="bg-[#221b3a] rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={request.sender_profile.avatar_url || '/default-avatar.png'}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full border-2 border-purple-400"
                      />
                      <div>
                        <div className="font-medium text-white">{request.sender_profile.username}</div>
                        <div className="text-sm text-gray-400">Wants to be your friend</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFriendRequest(request.id, 'accept')}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleFriendRequest(request.id, 'reject')}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'add' && (
            <div className="max-w-md mx-auto">
              <div className="bg-[#221b3a] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Add New Friend</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-purple-300 mb-2">Username</label>
                    <input
                      type="text"
                      value={searchUsername}
                      onChange={(e) => setSearchUsername(e.target.value)}
                      placeholder="Enter username"
                      className="w-full px-3 py-2 bg-[#2D2350] border border-purple-400/30 rounded-lg text-white"
                      onKeyPress={(e) => e.key === 'Enter' && sendFriendRequest()}
                    />
                  </div>
                  
                  {message && (
                    <div className={`text-sm p-2 rounded ${
                      message.includes('successfully') ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'
                    }`}>
                      {message}
                    </div>
                  )}
                  
                  <button
                    onClick={sendFriendRequest}
                    disabled={loading || !searchUsername.trim()}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Friend Request'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingSystem;