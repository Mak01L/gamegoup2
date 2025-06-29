import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import ProfileModal from './ProfileModal';
import { cleanEmptyRooms } from '../lib/roomOptions';
import { usePinnedRoomsStore } from '../store/pinnedRoomsStore';

interface RoomModalProps {
  room: {
    id: string;
    name: string;
    game: string;
    region?: string;
    language?: string;
    country?: string;
    description?: string;
    created_at?: string;
  };
  onClose: () => void;
  onRoomLeft?: (roomId: string) => void; // Add this prop
}

interface Message {
  id: string;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
  room_id?: string; // Make room_id optional to fix TS error
}

interface RoomUser {
  id: string;
  user_id: string;
  is_owner: boolean;
  joined_at: string;
  profile?: { username?: string; email?: string; avatar_url?: string };
}

const RoomModal: React.FC<RoomModalProps> = ({ room, onClose, onRoomLeft }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<RoomUser[]>([]);
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);
  const [userCount, setUserCount] = useState(0); // Background counter
  const [isUpdating, setIsUpdating] = useState(false); // Prevent flicker
  const chatRef = useRef<HTMLDivElement>(null);
  const lastUpdateRef = useRef<number>(0);
  const { authUser, profile } = useUser();
  const addRoom = usePinnedRoomsStore(state => state.addRoom);
  const removeRoom = usePinnedRoomsStore(state => state.removeRoom);

  // Load messages and subscribe to new ones
  useEffect(() => {
    let channel: any;
    let isMounted = true;
    
    const fetchMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', room.id)
        .order('created_at', { ascending: true });
      if (!error && isMounted) {
        setMessages(data || []);
        console.log(`Loaded ${data?.length || 0} messages for room ${room.id}`);
      }
      setLoading(false);
    };
    
    fetchMessages();
    
    // Create a stable channel name without timestamp to avoid creating multiple channels
    // This ensures the subscription persists even when the component re-renders
    const channelName = `room-messages-${room.id}`;
    console.log(`Creating channel: ${channelName}`);
    
    // First, try to remove any existing channel with the same name to prevent duplicates
    try {
      // Fix TS error by using type assertion
      const existingChannel = supabase.getChannels().find(ch => (ch as any).name === channelName);
      if (existingChannel) supabase.removeChannel(existingChannel);
    } catch (e) {
      console.log('No existing channel to remove');
    }
    
    // Create a new channel with a more reliable configuration
    channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: true },
          presence: { key: authUser?.id || 'anonymous' },
        }
      })
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `room_id=eq.${room.id}` 
        },
        (payload) => {
          console.log('New message received:', payload.new);
          // Use a callback function to ensure we're working with the latest state
          setMessages(currentMessages => {
            // Prevents duplicates by checking message ID
            if (currentMessages.some(m => m.id === payload.new.id)) {
              console.log('Duplicate message ignored');
              return currentMessages;
            }
            console.log('Adding new message to chat');
            const newMessage = payload.new as Message;
            return [...currentMessages, newMessage];
          });
        }
      )
      .subscribe((status) => {
        console.log(`Channel ${channelName} status:`, status);
        // If subscription fails, try to reconnect
        if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
          console.log('Channel error, attempting to reconnect...');
          setTimeout(() => {
            if (isMounted) fetchMessages();
          }, 2000);
        }
      });
    
    // Set up a periodic refresh to ensure we don't miss any messages
    const refreshInterval = setInterval(() => {
      if (isMounted) fetchMessages();
    }, 30000); // Refresh every 30 seconds
    
    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
      if (channel) {
        console.log(`Removing channel: ${channelName}`);
        supabase.removeChannel(channel);
      }
    };
  }, [room.id, authUser?.id]);

  // Fetch users helper with anti-flicker logic
  const fetchUsers = useCallback(async (eventType: 'background' | 'user_change' | 'initial' = 'background') => {
    try {
      const now = Date.now();
      
      // Debounce rapid updates
      if (eventType === 'background' && now - lastUpdateRef.current < 2000) {
        return;
      }
      
      if (eventType !== 'initial') {
        console.log(`🔄 Fetching users (${eventType}) for room ${room.id}`);
      }
      
      // First get room_users
      const { data: roomUsers, error: roomUsersError } = await supabase
        .from('room_users')
        .select('id, user_id, is_owner, joined_at')
        .eq('room_id', room.id);
      
      if (roomUsersError) {
        console.error('Error fetching room_users:', roomUsersError);
        return;
      }
      
      // Update background counter always
      setUserCount(roomUsers?.length || 0);
      
      if (!roomUsers || roomUsers.length === 0) {
        if (eventType !== 'background') {
          console.log(`No users found in room ${room.id}`);
          setUsers([]);
        }
        return;
      }
      
      if (eventType !== 'background') {
        console.log(`Found ${roomUsers.length} users in room_users table`);
      }
      
      // Only update UI for important events
      if (eventType === 'user_change' || eventType === 'initial') {
        setIsUpdating(true);
        
        // Then get profiles for each user - show real data only
        const usersWithProfiles = await Promise.all(
          roomUsers.map(async (roomUser) => {
            if (eventType === 'initial') {
              console.log(`🔍 Fetching profile for user: ${roomUser.user_id}`);
            }
            
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('username, avatar_url, bio, country, game_tags')
              .eq('user_id', roomUser.user_id)
              .maybeSingle();
            
            if (eventType === 'initial') {
              if (profileError) {
                console.log(`❌ No profile found for user ${roomUser.user_id}:`, profileError);
              } else {
                console.log(`✅ Profile found for user ${roomUser.user_id}:`, profile);
              }
            }
            
            // Only show real profile data - no fake data
            const userWithProfile = {
              ...roomUser,
              profile: profile ? {
                username: profile.username || 'No username set',
                email: 'User profile exists',
                avatar_url: profile.avatar_url || '/default-avatar.png',
                bio: profile.bio,
                country: profile.country,
                game_tags: profile.game_tags
              } : {
                username: 'No profile',
                email: 'User has not created profile',
                avatar_url: 'https://ui-avatars.com/api/?name=No+Profile&background=6366f1&color=fff',
                bio: null,
                country: null,
                game_tags: null
              }
            };
            
            if (eventType === 'initial') {
              console.log(`👤 Final user data for ${roomUser.user_id}:`, userWithProfile.profile);
            }
            return userWithProfile;
          })
        );
        
        if (eventType === 'initial') {
          console.log(`Room ${room.id} users with profiles:`, usersWithProfiles);
        }
        
        setUsers(usersWithProfiles);
        setIsUpdating(false);
      }
      
      lastUpdateRef.current = now;
    } catch (error) {
      console.error('Exception in fetchUsers:', error);
      setUsers([]);
    }
  }, [room.id]);

  // Join room on mount (but don't leave on unmount - allow minimizing)
  useEffect(() => {
    const joinRoom = async () => {
      if (!authUser) return;
      try {
        // Add user to room_users directly - no profile creation
        console.log(`Adding user ${authUser.id} to room ${room.id}`);
        const { error: roomUserError } = await supabase.from('room_users').upsert([
          { room_id: room.id, user_id: authUser.id }
        ], { onConflict: 'room_id,user_id' });
        
        if (roomUserError) {
          console.error('Error adding user to room:', roomUserError);
        } else {
          console.log('User successfully added to room');
          // Background update only - no UI flicker
          setTimeout(() => fetchUsers('background'), 1000);
        }
        
        // Pin room in sidebar
        addRoom({ id: room.id, name: room.name, game: room.game });
      } catch (error) {
        console.error('Error in joinRoom:', error);
      }
    };
    
    if (authUser) {
      joinRoom();
    }
    
    // No cleanup - user stays in room when modal closes
  }, [room.id, authUser?.id, fetchUsers]);

  // Subscribe to room users in real time with event-based updates
  useEffect(() => {
    let subscription: any;
    
    // Initial load
    fetchUsers('initial');
    
    // Subscribe to user changes (visible updates)
    subscription = supabase
      .channel('room-users-' + room.id)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'room_users', 
        filter: `room_id=eq.${room.id}` 
      }, () => {
        console.log('👤 User joined room - updating UI');
        fetchUsers('user_change');
      })
      .on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: 'room_users', 
        filter: `room_id=eq.${room.id}` 
      }, () => {
        console.log('👤 User left room - updating UI');
        fetchUsers('user_change');
      })
      .subscribe();
    
    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [room.id, fetchUsers]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !authUser) return;
    
    // Store the message locally to prevent input lag
    const messageContent = input.trim();
    setInput('');
    
    // Use profile.username for chat messages
    const usernameToSend = profile?.username || authUser.email;
    
    try {
      // Add optimistic update for better UX
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        room_id: room.id,
        user_id: authUser.id,
        username: usernameToSend as string,
        content: messageContent,
        created_at: new Date().toISOString()
      };
      
      // Add message to local state immediately for better UX
      setMessages(currentMessages => [...currentMessages, optimisticMessage]);
      
      // Then send to server
      const { data, error } = await supabase.from('messages').insert([
        {
          room_id: room.id,
          user_id: authUser.id,
          username: usernameToSend,
          content: messageContent,
        },
      ]).select();
      
      if (error) {
        console.error('Error sending message:', error);
        // Remove optimistic message if there was an error
        setMessages(currentMessages => 
          currentMessages.filter(msg => msg.id !== optimisticMessage.id)
        );
        // Show error to user
        alert('Failed to send message. Please try again.');
      } else {
        console.log('Message sent successfully:', data);
        // Replace optimistic message with real one from server
        setMessages(currentMessages => 
          currentMessages.map(msg => 
            msg.id === optimisticMessage.id ? data[0] : msg
          )
        );
      }
    } catch (error) {
      console.error('Exception in handleSend:', error);
    }
  };

  const handleViewProfile = (userId: string) => {
    setViewProfileId(userId);
  };

  const handleCloseProfile = () => {
    setViewProfileId(null);
  };

  // Leave room handler
  const handleLeaveRoom = async () => {
    if (!authUser) return;
    
    try {
      // Remove user from room
      console.log(`Removing user ${authUser.id} from room ${room.id}`);
      const { error: removeError, data: removedData } = await supabase
        .from('room_users')
        .delete()
        .eq('room_id', room.id)
        .eq('user_id', authUser.id)
        .select();
      
      if (removeError) {
        console.error('Error removing user from room:', removeError);
        return;
      }
      
      console.log('User successfully removed from room:', removedData);
      
      // Trigger manual update of room count
      window.dispatchEvent(new CustomEvent('roomUserChanged', { detail: { roomId: room.id } }));
      
      // Check if room is empty and delete if necessary
      const { data: usersLeft, error: countError } = await supabase
        .from('room_users')
        .select('id')
        .eq('room_id', room.id);
      
      if (countError) {
        console.error('Error checking remaining users:', countError);
      } else {
        console.log(`Users left in room ${room.id}:`, usersLeft?.length || 0);
        
        if (!usersLeft || usersLeft.length === 0) {
          console.log('Room is empty, deleting...');
          // Delete messages first
          await supabase.from('messages').delete().eq('room_id', room.id);
          // Then delete the room
          const { error: roomDeleteError } = await supabase.from('rooms').delete().eq('id', room.id);
          if (roomDeleteError) {
            console.error('Error deleting empty room:', roomDeleteError);
          } else {
            console.log('Empty room deleted successfully');
          }
        }
      }
      
      // Remove from pinned rooms and close modal
      removeRoom(room.id);
      if (onRoomLeft) {
        onRoomLeft(room.id);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Exception in handleLeaveRoom:', error);
    }
  };

  if (loading) return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2000]">
      <div className="bg-[#18122B] rounded-2xl p-8 w-full max-w-lg shadow-2xl text-white flex flex-col items-center font-inter">
        <span className="text-purple-300 text-lg font-semibold">Loading...</span>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[2000] w-full max-w-2xl p-2 pointer-events-none">
        <div className="bg-[#18122B] rounded-2xl p-6 w-full shadow-2xl text-white flex flex-col items-stretch font-inter relative border-2 border-purple-900 pointer-events-auto">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-purple-800 pb-3 mb-3">
            <div>
              <h2 className="text-2xl font-bold text-purple-200 uppercase tracking-wide">{room.name}</h2>
              <div className="text-xs text-purple-400 mt-1">
                Created: {room.created_at ? new Date(room.created_at).toLocaleString() : 'Unknown'}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleLeaveRoom} className="bg-gradient-to-r from-orange-400 to-pink-500 text-[#18122B] font-bold px-4 py-1 rounded-xl shadow hover:from-orange-500 hover:to-pink-600 text-sm">Leave Room</button>
              <button onClick={onClose} className="text-purple-400 hover:text-purple-200 text-2xl font-bold px-2 focus:outline-none">&times;</button>
            </div>
          </div>
          {/* Chat */}
          <div className="flex-1 flex flex-col min-h-[320px] max-h-[340px] mb-4">
            <div ref={chatRef} className="flex-1 bg-[#221b3a]/70 rounded-xl p-4 overflow-y-auto shadow-inner">
              {messages.length === 0 ? (
                <div className="text-center text-purple-400 py-4">No messages yet. Be the first to send a message!</div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.user_id === authUser?.id ? 'justify-end' : 'justify-start'} mb-2`}>
                    <div
                      className={
                        'max-w-[70%] px-4 py-2 rounded-2xl shadow text-sm font-medium flex items-center gap-2 ' +
                        (msg.user_id === authUser?.id
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-[#232046] text-purple-200 border border-purple-700')
                      }
                    >
                      <span className="font-bold text-purple-200 mr-1">{msg.username}:</span>
                      <span className="text-white">{msg.content}</span>
                      <span className="text-xs text-gray-400 ml-2">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSend} className="flex gap-2 mt-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg border-2 border-purple-500 bg-[#221b3a] text-white text-base outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Type your message..."
              />
              <button
                type="submit"
                className="px-6 py-2 rounded-lg font-bold text-base bg-gradient-to-r from-purple-400 to-blue-400 text-[#18122B] border-none cursor-pointer shadow hover:from-purple-500 hover:to-blue-500 disabled:opacity-60"
                disabled={!input.trim()}
              >
                Send
              </button>
            </form>
          </div>
          {/* Room Users */}
          <div className="bg-[#221b3a]/80 rounded-xl p-4 mt-2 border border-purple-800">
            <h3 className="text-md font-semibold text-purple-300 mb-3">
              Room Users ({userCount})
            </h3>
            <div className={`flex flex-wrap gap-3 transition-opacity duration-200 ${isUpdating ? 'opacity-70' : 'opacity-100'}`}>
              {users.length === 0 ? (
                <div className="text-gray-400 text-sm">No users in this room</div>
              ) : (
                users.map(user => (
                  <div 
                    key={user.id} 
                    className="flex items-center gap-3 bg-[#232046]/80 px-3 py-2 rounded-lg border border-purple-800 min-w-[180px] transition-all duration-300 hover:bg-[#2a2458]/80"
                  >
                    <img 
                      src={user.profile?.avatar_url || '/default-avatar.png'} 
                      alt={user.profile?.username || 'User'} 
                      className="w-9 h-9 rounded-full border-2 border-purple-400 object-cover bg-[#18122B] transition-transform duration-200 hover:scale-105" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/default-avatar.png';
                      }}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-semibold text-purple-200 truncate">
                        {user.profile?.username || 'User'}
                      </span>
                      <span className="text-xs text-gray-400 truncate">
                        {user.profile?.email || `ID: ${user.user_id.slice(0, 8)}`}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {user.is_owner && (
                        <span className="text-xs bg-gradient-to-r from-green-400 to-green-300 text-[#18122B] rounded-full px-2 py-0.5 font-bold mb-1">Owner</span>
                      )}
                      <button
                        onClick={() => handleViewProfile(user.user_id)}
                        className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full px-3 py-1 font-semibold shadow hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Profile Modal Overlay */}
      {viewProfileId && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="relative max-w-md w-full mx-4">
            <ProfileModal userId={viewProfileId!} onClose={handleCloseProfile} />
          </div>
        </div>
      )}
    </>
  );
};

export default RoomModal;