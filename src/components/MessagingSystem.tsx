import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import PinnedPrivateMessageModal from '../modals/PinnedPrivateMessageModal';

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
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'add' | 'matches' | 'pmessages'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // State for private message modal
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [privateModalConversationId, setPrivateModalConversationId] = useState<string | null>(null);
  const [privateModalOtherUser, setPrivateModalOtherUser] = useState<{ id: string; username: string; avatar_url?: string } | null>(null);

  // Matches state
  const [matches, setMatches] = useState<any[]>([]);
  const [privateMessages, setPrivateMessages] = useState<any[]>([]);

  useEffect(() => {
    if (authUser) {
      fetchFriends();
      fetchFriendRequests();
      fetchMatches();
      fetchPrivateMessages();
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

  const fetchMatches = async () => {
    if (!authUser) return;
    // Buscar matches activos donde el usuario es user1 o user2
    const { data, error } = await supabase
      .from('user_matches')
      .select('id, user1_id, user2_id, matched_at, chat_started, is_active, user1:profiles!user_matches_user1_id_fkey(id,username,avatar_url), user2:profiles!user_matches_user2_id_fkey(id,username,avatar_url)')
      .or(`user1_id.eq.${authUser.id},user2_id.eq.${authUser.id}`)
      .eq('is_active', true);
    if (!error && data) {
      // Filtrar para mostrar el otro usuario
      const filtered = data.map((match: any) => {
        const other = match.user1_id === authUser.id ? match.user2 : match.user1;
        return {
          id: match.id,
          user: {
            id: other.id,
            username: other.username,
            avatar_url: other.avatar_url || '/default-avatar.png',
          },
          matched_at: match.matched_at,
        };
      });
      setMatches(filtered);
    }
  };

  const fetchPrivateMessages = async () => {
    if (!authUser) return;
    // Obtener todos los amigos aceptados
    const { data: friendsData, error: friendsError } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', authUser.id)
      .eq('status', 'accepted');
    if (friendsError || !friendsData) return;
    const friendIds = friendsData.map((f: any) => f.friend_id);
    if (friendIds.length === 0) {
      setPrivateMessages([]);
      return;
    }
    // Buscar conversaciones privadas con amigos
    const { data: conversations, error: convError } = await supabase
      .from('private_conversations')
      .select('id, user1_id, user2_id, last_message_at, messages:private_messages(content,created_at,sender_id), user1:profiles!private_conversations_user1_id_fkey(id,username,avatar_url), user2:profiles!private_conversations_user2_id_fkey(id,username,avatar_url)')
      .or(`user1_id.in.(${[authUser.id,...friendIds].join(',')}),user2_id.in.(${[authUser.id,...friendIds].join(',')})`)
      .order('last_message_at', { ascending: false });
    if (!convError && conversations) {
      // Filtrar solo las conversaciones donde el otro usuario es un amigo
      const filtered = conversations.filter((conv: any) => {
        const otherId = conv.user1_id === authUser.id ? conv.user2_id : conv.user1_id;
        return friendIds.includes(otherId);
      }).map((conv: any) => {
        const other = conv.user1_id === authUser.id ? conv.user2 : conv.user1;
        return {
          id: conv.id,
          user: {
            id: other.id,
            username: other.username,
            avatar_url: other.avatar_url || '/default-avatar.png',
          },
          last_message_at: conv.last_message_at,
          last_message: conv.messages?.length ? conv.messages[conv.messages.length-1] : null,
        };
      });
      setPrivateMessages(filtered);
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
    <>
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
              <button
                onClick={() => setActiveTab('pmessages')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'pmessages'
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-300 hover:text-white'
                }`}
              >
                📬 P.Messages ({privateMessages.length})
              </button>
              <button
                onClick={() => setActiveTab('matches' as any)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'matches'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                💖 Matches ({matches.length})
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
                          onClick={async () => {
                            // Find or create conversation
                            if (!authUser) return;
                            let conversationId: string | null = null;
                            try {
                              const { data: existing } = await supabase
                                .from('private_conversations')
                                .select('id')
                                .or(`and(user1_id.eq.${authUser.id},user2_id.eq.${friend.friend_id}),and(user1_id.eq.${friend.friend_id},user2_id.eq.${authUser.id})`)
                                .maybeSingle();
                              if (existing) {
                                conversationId = existing.id;
                              } else {
                                const { data: newConv } = await supabase
                                  .from('private_conversations')
                                  .insert({
                                    user1_id: authUser.id,
                                    user2_id: friend.friend_id,
                                    last_message_at: new Date().toISOString()
                                  })
                                  .select('id')
                                  .single();
                                conversationId = newConv?.id || null;
                              }
                              if (conversationId) {
                                setPrivateModalConversationId(conversationId);
                                setPrivateModalOtherUser({
                                  id: friend.friend_id,
                                  username: friend.friend_profile.username,
                                  avatar_url: friend.friend_profile.avatar_url
                                });
                                setShowPrivateModal(true);
                              }
                            } catch (e) {
                              alert('Error opening chat');
                            }
                          }}
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

            {activeTab === 'pmessages' && (
              <div className="space-y-3">
                {privateMessages.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <div className="text-4xl mb-2">📬</div>
                    <p>No private messages with friends yet.</p>
                  </div>
                ) : (
                  privateMessages.map(pm => (
                    <div key={pm.id} className="bg-[#221b3a] rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={pm.user.avatar_url}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full border-2 border-blue-400"
                        />
                        <div>
                          <div className="font-medium text-white">{pm.user.username}</div>
                          <div className="text-xs text-blue-300">Último mensaje: {pm.last_message ? pm.last_message.content : 'Sin mensajes'}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setPrivateModalConversationId(pm.id);
                          setPrivateModalOtherUser(pm.user);
                          setShowPrivateModal(true);
                        }}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        💬 Chat
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'matches' && (
              <div className="space-y-3">
                {matches.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <div className="text-4xl mb-2">💖</div>
                    <p>No matches yet.</p>
                  </div>
                ) : (
                  matches.map(match => (
                    <div key={match.id} className="bg-[#221b3a] rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={match.user.avatar_url}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full border-2 border-pink-400"
                        />
                        <div>
                          <div className="font-medium text-white">{match.user.username}</div>
                          <div className="text-xs text-pink-300">Matched at {new Date(match.matched_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          // Buscar o crear conversación privada
                          if (!authUser) return;
                          let conversationId: string | null = null;
                          try {
                            const { data: existing } = await supabase
                              .from('private_conversations')
                              .select('id')
                              .or(`and(user1_id.eq.${authUser.id},user2_id.eq.${match.user.id}),and(user1_id.eq.${match.user.id},user2_id.eq.${authUser.id})`)
                              .maybeSingle();
                            if (existing) {
                              conversationId = existing.id;
                            } else {
                              const { data: newConv } = await supabase
                                .from('private_conversations')
                                .insert({
                                  user1_id: authUser.id,
                                  user2_id: match.user.id,
                                  last_message_at: new Date().toISOString()
                                })
                                .select('id')
                                .single();
                              conversationId = newConv?.id || null;
                            }
                            if (conversationId) {
                              setPrivateModalConversationId(conversationId);
                              setPrivateModalOtherUser({
                                id: match.user.id,
                                username: match.user.username,
                                avatar_url: match.user.avatar_url
                              });
                              setShowPrivateModal(true);
                            }
                          } catch (e) {
                            alert('Error opening chat');
                          }
                        }}
                        className="px-3 py-1 bg-pink-600 text-white rounded-lg text-sm hover:bg-pink-700"
                      >
                        💬 Chat
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Private Message Modal for pinned chats */}
      {showPrivateModal && privateModalConversationId && privateModalOtherUser && (
        <PinnedPrivateMessageModal
          conversationId={privateModalConversationId}
          otherUser={privateModalOtherUser}
          onClose={() => {
            setShowPrivateModal(false);
            setPrivateModalConversationId(null);
            setPrivateModalOtherUser(null);
          }}
        />
      )}
    </>
  );
};

export default MessagingSystem;