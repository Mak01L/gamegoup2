import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import { useAutoRefresh } from '../hooks/useAutoRefresh';
import { debugLog, errorLog } from '../lib/devUtils';
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

interface UserToRate {
  user_id: string;
  username: string;
  avatar_url?: string;
}

const MessagingSystem: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { authUser } = useUser();

  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'discover' | 'matches' | 'pmessages'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // State for Like/Dislike system
  const [usersToRate, setUsersToRate] = useState<UserToRate[]>([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);

  // State for private message modal
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [privateModalConversationId, setPrivateModalConversationId] = useState<string | null>(null);
  const [privateModalOtherUser, setPrivateModalOtherUser] = useState<{ id: string; username: string; avatar_url?: string } | null>(null);

  // Matches state
  const [matches, setMatches] = useState<any[]>([]);
  const [privateMessages, setPrivateMessages] = useState<any[]>([]);

  useEffect(() => {
    if (authUser) {
      const fetchData = async () => {
        await fetchFriends();
        await fetchFriendRequests();
        await fetchMatches();
        await fetchPrivateMessages();
        await fetchUsersToRate(); // Add this for the discover tab
      };
      fetchData();
    }

    // Listen for refresh matches event
    const handleRefreshMatches = () => {
      if (authUser) {
        fetchMatches();
      }
    };

    window.addEventListener('refreshMatches', handleRefreshMatches);

    return () => {
      window.removeEventListener('refreshMatches', handleRefreshMatches);
    };
  }, [authUser]);

  const fetchFriends = async () => {
    if (!authUser) return;

    try {
      // First, get all friendships where the user is involved
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('*')
        .or(`user1_id.eq.${authUser.id},user2_id.eq.${authUser.id}`)
        .eq('status', 'accepted');

      if (friendshipsError || !friendships || friendships.length === 0) {
        setFriends([]);
        return;
      }

      // Get all friend IDs to batch fetch profiles
      const friendIds = friendships.map(friendship => {
        return friendship.user1_id === authUser.id ? friendship.user2_id : friendship.user1_id;
      });

      // Batch fetch all friend profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url')
        .in('user_id', friendIds);

      // Map friendships with their corresponding profiles
      const friendsWithProfiles = friendships.map(friendship => {
        const friendId = friendship.user1_id === authUser.id ? friendship.user2_id : friendship.user1_id;
        const friendProfile = profiles?.find(p => p.user_id === friendId);

        return {
          ...friendship,
          friend_id: friendId,
          friend_profile: friendProfile || { 
            username: 'Unknown User', 
            avatar_url: '/default-avatar.png'
          }
        };
      });

      setFriends(friendsWithProfiles);

    } catch (error) {
      setFriends([]);
    }
  };

  const fetchFriendRequests = async () => {
    if (!authUser) return;

    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('Fetching friend requests for user:', authUser.id);
    }

    // First get the friend requests
    const { data: requests, error: requestsError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('receiver_id', authUser.id)
      .eq('status', 'pending');

    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('Friend requests raw data:', requests);
      console.log('Friend requests error:', requestsError);
    }

    if (requestsError || !requests) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.error('Error fetching friend requests:', requestsError);
      }
      setFriendRequests([]);
      return;
    }

    // Then get the profiles for each sender
    const requestsWithProfiles = await Promise.all(
      requests.map(async (request) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('user_id', request.sender_id)
          .single();

        return {
          ...request,
          sender_profile: profile || { username: 'Unknown', avatar_url: null }
        };
      })
    );

    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('Friend requests with profiles:', requestsWithProfiles);
    }
    setFriendRequests(requestsWithProfiles);
  };

  const fetchMatches = async () => {
    if (!authUser) return;
    
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('🔍 === FETCHING MATCHES ===');
      console.log('👤 Current user ID:', authUser.id);
    }
    
    // First, get the raw matches without trying to join profiles
    const { data: rawMatches, error } = await supabase
      .from('user_matches')
      .select('id, user1_id, user2_id, matched_at, chat_started, is_active')
      .or(`user1_id.eq.${authUser.id},user2_id.eq.${authUser.id}`)
      .eq('is_active', true);
    
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('📊 Raw matches query result:');
      console.log('   Data:', rawMatches);
      console.log('   Error:', error);
      console.log('   Number of matches found:', rawMatches?.length || 0);
    }
    
    if (error) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.error('❌ Error fetching matches:', error);
      }
      setMatches([]);
      return;
    }

    if (!rawMatches || rawMatches.length === 0) {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.log('ℹ️ No matches found - setting empty matches array');
      }
      setMatches([]);
      return;
    }

    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('✅ Found', rawMatches.length, 'matches, processing...');
    }

    // Now get the profiles for each match separately
    const processedMatches = [];
    
    for (const match of rawMatches) {
      const isUser1 = match.user1_id === authUser.id;
      const otherUserId = isUser1 ? match.user2_id : match.user1_id;
      
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.log('🔗 Processing match:', {
          matchId: match.id,
          user1_id: match.user1_id,
          user2_id: match.user2_id,
          currentUserId: authUser.id,
          isUser1,
          otherUserId
        });
      }
      
      // Fetch the other user's profile
      const { data: otherUserProfile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url')
        .eq('user_id', otherUserId)
        .single();
      
      if (profileError) {
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.error('Error fetching profile for user:', otherUserId, profileError);
        }
        continue; // Skip this match if we can't get the profile
      }
      
      processedMatches.push({
        id: match.id,
        user: {
          id: otherUserProfile.user_id,
          username: otherUserProfile.username || 'Unknown User',
          avatar_url: otherUserProfile.avatar_url || '/default-avatar.png',
        },
        matched_at: match.matched_at,
      });
    }
    
    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('✅ Final processed matches:', processedMatches);
    }
    setMatches(processedMatches);
  };

  const fetchPrivateMessages = async () => {
    if (!authUser) return;
    // Get all accepted friends
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
    // Search for private conversations with friends
    const { data: conversations, error: convError } = await supabase
      .from('private_conversations')
      .select('id, user1_id, user2_id, last_message_at, messages:private_messages(content,created_at,sender_id), user1:profiles!private_conversations_user1_id_fkey(id,username,avatar_url), user2:profiles!private_conversations_user2_id_fkey(id,username,avatar_url)')
      .or(`user1_id.in.(${[authUser.id,...friendIds].join(',')}),user2_id.in.(${[authUser.id,...friendIds].join(',')})`)
      .order('last_message_at', { ascending: false });
    if (!convError && conversations) {
      // Filter only conversations where the other user is a friend
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
        .or(`and(user1_id.eq.${authUser.id},user2_id.eq.${user.user_id}),and(user1_id.eq.${user.user_id},user2_id.eq.${authUser.id})`)
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
    console.log(`🔄 ${action.toUpperCase()} friend request:`, requestId);
    
    const request = friendRequests.find(r => r.id === requestId);
    if (!request) {
      console.error('❌ Request not found:', requestId);
      setMessage('Request not found');
      return;
    }

    console.log('📋 Processing request:', request);

    try {
      // Update request status
      console.log('📝 Updating request status to:', action === 'accept' ? 'accepted' : 'rejected');
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', requestId);

      if (updateError) {
        console.error('❌ Failed to update request status:', updateError);
        setMessage('Failed to update friend request status: ' + updateError.message);
        return;
      }

      console.log('✅ Request status updated successfully');

      if (action === 'accept') {
        console.log('👥 Creating friendship entry...');
        
        // Based on the logs, we know the table structure uses user1_id and user2_id
        // We'll create a single friendship record with the lower ID as user1_id and higher ID as user2_id
        // This prevents duplicate entries and maintains consistency
        const userId1 = authUser!.id < request.sender_id ? authUser!.id : request.sender_id;
        const userId2 = authUser!.id < request.sender_id ? request.sender_id : authUser!.id;
        
        console.log('👥 Creating friendship with user1_id:', userId1, 'user2_id:', userId2);
        
        const { error: insertError, data: insertData } = await supabase
          .from('friendships')
          .insert([{
            user1_id: userId1,
            user2_id: userId2,
            status: 'accepted',
            created_at: new Date().toISOString()
          }])
          .select();

        if (insertError) {
          console.error('❌ Failed to create friendship:', insertError);
          
          // Check if it's an RLS policy issue
          if (insertError.message.includes('row-level security policy')) {
            setMessage('❌ Permission denied: Unable to create friendship due to security settings. Please contact support.');
          } else if (insertError.message.includes('duplicate key')) {
            setMessage('✅ You are already friends with this user!');
          } else {
            setMessage('❌ Failed to create friendship: ' + insertError.message);
          }
          
          // Revert the request status if friendship creation failed
          await supabase.from('friend_requests').update({ status: 'pending' }).eq('id', requestId);
          return;
        }

        console.log('✅ Friendship created successfully:', insertData);
        setMessage('✅ Friend request accepted! You are now friends.');
        
        // Clear message after 5 seconds
        setTimeout(() => setMessage(''), 5000);
        
        // Refresh friends list
        console.log('🔄 Refreshing friends list...');
        await fetchFriends();
      } else {
        setMessage('❌ Friend request rejected.');
        setTimeout(() => setMessage(''), 3000);
      }

      // Refresh friend requests list
      console.log('🔄 Refreshing friend requests list...');
      await fetchFriendRequests();
      
    } catch (error) {
      console.error('💥 Exception in handleFriendRequest:', error);
      setMessage('An unexpected error occurred: ' + (error as Error).message);
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!authUser) return;

    // Remove the friendship entry (there should only be one with user1_id < user2_id)
    await supabase
      .from('friendships')
      .delete()
      .or(`and(user1_id.eq.${authUser.id},user2_id.eq.${friendId}),and(user1_id.eq.${friendId},user2_id.eq.${authUser.id})`);

    fetchFriends();
  };

  // New functions for Like/Dislike system
  const fetchUsersToRate = async () => {
    if (!authUser) return;

    try {
      console.log('🔍 Fetching users to rate...');
      
      // Get all users except the current user
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url')
        .neq('user_id', authUser.id);

      if (usersError) {
        console.error('❌ Error fetching users:', usersError);
        return;
      }

      console.log('👥 All users found:', allUsers?.length);

      // Get users that have already been rated by the current user
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

      // Filter out already rated users and existing friends
      const { data: existingFriends, error: friendsError } = await supabase
        .from('friendships')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${authUser.id},user2_id.eq.${authUser.id}`);

      const friendIds = existingFriends?.map(f => 
        f.user1_id === authUser.id ? f.user2_id : f.user1_id
      ) || [];

      console.log('🤝 Existing friend IDs:', friendIds);

      // Filter users
      const availableUsers = allUsers?.filter(user => 
        !ratedUserIds.includes(user.user_id) && 
        !friendIds.includes(user.user_id)
      ) || [];

      console.log('✨ Available users to rate:', availableUsers.length);
      
      setUsersToRate(availableUsers);
      setCurrentUserIndex(0);
      
    } catch (error) {
      console.error('💥 Exception in fetchUsersToRate:', error);
    }
  };

  const handleLikeDislike = async (action: 'like' | 'dislike') => {
    if (!authUser || currentUserIndex >= usersToRate.length) return;

    const targetUser = usersToRate[currentUserIndex];
    setLoading(true);

    try {
      console.log(`${action === 'like' ? '💖' : '👎'} ${action}ing user:`, targetUser.username);

      // Insert the like/dislike action
      const { error: insertError } = await supabase
        .from('likes_dislikes')
        .insert([{
          user_id: authUser.id,
          target_user_id: targetUser.user_id,
          action: action
        }]);

      if (insertError) {
        console.error('❌ Error inserting like/dislike:', insertError);
        setMessage(`Failed to ${action}: ` + insertError.message);
        setLoading(false);
        return;
      }

      console.log(`✅ ${action} recorded successfully`);

      // If it was a like, check for a match
      if (action === 'like') {
        const { data: reciprocalLike, error: matchError } = await supabase
          .from('likes_dislikes')
          .select('id')
          .eq('user_id', targetUser.user_id)
          .eq('target_user_id', authUser.id)
          .eq('action', 'like')
          .single();

        if (!matchError && reciprocalLike) {
          console.log('🎉 IT\'S A MATCH!');
          setMessage(`🎉 It's a Match with ${targetUser.username}!`);
          
          // Create friendship automatically
          const userId1 = authUser.id < targetUser.user_id ? authUser.id : targetUser.user_id;
          const userId2 = authUser.id < targetUser.user_id ? targetUser.user_id : authUser.id;
          
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
            await fetchFriends(); // Refresh friends list
            await fetchMatches(); // Refresh matches
          }
        }
      }

      // Move to next user
      setCurrentUserIndex(prev => prev + 1);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('💥 Exception in handleLikeDislike:', error);
      setMessage('An unexpected error occurred');
    }

    setLoading(false);
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
            
            {/* Status Message */}
            {message && (
              <div className={`mb-4 p-3 rounded-lg border text-sm ${
                message.includes('✅') || message.includes('successfully') || message.includes('accepted') 
                  ? 'text-green-300 bg-green-900/30 border-green-500/50' 
                  : 'text-red-300 bg-red-900/30 border-red-500/50'
              }`}>
                {message}
              </div>
            )}
            
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
                onClick={() => setActiveTab('discover')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'discover'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                ✨ Discover
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

            {activeTab === 'discover' && (
              <div className="max-w-md mx-auto">
                {currentUserIndex >= usersToRate.length ? (
                  <div className="text-center text-gray-400 py-8">
                    <div className="text-4xl mb-4">🎉</div>
                    <p className="text-lg mb-2">You've seen everyone!</p>
                    <p className="text-sm">No hay más personas para evaluar por ahora.</p>
                    <button
                      onClick={fetchUsersToRate}
                      className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      🔄 Refresh List
                    </button>
                  </div>
                ) : usersToRate.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-lg mb-2">Loading users...</p>
                    <p className="text-sm">Buscando personas que puedas conocer.</p>
                  </div>
                ) : (
                  <div className="bg-[#221b3a] rounded-lg overflow-hidden">
                    {/* User Card */}
                    <div className="relative">
                      <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 p-8 text-center">
                        <img
                          src={usersToRate[currentUserIndex]?.avatar_url || '/default-avatar.png'}
                          alt="Avatar"
                          className="w-24 h-24 rounded-full border-4 border-white mx-auto mb-4 shadow-lg"
                        />
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {usersToRate[currentUserIndex]?.username}
                        </h3>
                        <div className="text-purple-300 text-sm">
                          User {currentUserIndex + 1} of {usersToRate.length}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="p-6 flex justify-center gap-4">
                        <button
                          onClick={() => handleLikeDislike('dislike')}
                          disabled={loading}
                          className="flex-1 max-w-[120px] py-3 px-4 bg-red-600 text-white rounded-full text-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                        >
                          👎 Dislike
                        </button>
                        <button
                          onClick={() => handleLikeDislike('like')}
                          disabled={loading}
                          className="flex-1 max-w-[120px] py-3 px-4 bg-green-600 text-white rounded-full text-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                        >
                          💖 Like
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
                          <div className="text-xs text-blue-300">Last message: {pm.last_message ? pm.last_message.content : 'No messages'}</div>
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
                          // Search or create private conversation
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