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
  const chatRef = useRef<HTMLDivElement>(null);
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
      if (!error && isMounted) setMessages(data || []);
      setLoading(false);
    };
    fetchMessages();
    // Suscripción realtime robusta
    channel = supabase.channel('room-messages-' + room.id)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${room.id}` },
        payload => {
          setMessages(msgs => {
            // Previene duplicados
            if (msgs.some(m => m.id === payload.new.id)) return msgs;
            return [...msgs, payload.new as Message];
          });
        }
      )
      .subscribe();
    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [room.id]);

  // Fetch users helper (must be defined before use)
  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from('room_users')
      .select('id, user_id, is_owner, joined_at, profiles:profiles(username,email,avatar_url)')
      .eq('room_id', room.id);
    let usersList = [];
    if (!error && data) {
      usersList = data.map((u: any) => ({ ...u, profile: u.profiles }));
    }
    // Ensure current user is always present in the list if joined
    if (authUser && !usersList.some(u => u.user_id === authUser.id)) {
      usersList.push({
        id: 'local',
        user_id: authUser.id,
        is_owner: false,
        joined_at: new Date().toISOString(),
        profile: { username: profile?.username, email: authUser.email, avatar_url: profile?.avatar_url }
      });
    }
    setUsers(usersList);
  }, [room.id, authUser, profile?.username]);

  // Join room on mount, leave on unmount
  useEffect(() => {
    let joined = false;
    const joinRoom = async () => {
      if (!authUser) return;
      // 1. Upsert user profile
      await supabase.from('profiles').upsert([
        {
          user_id: authUser.id,
          username: profile?.username || authUser.email,
          email: authUser.email,
          avatar_url: profile?.avatar_url || null
        }
      ], { onConflict: 'user_id' });
      // 2. Upsert room_users
      console.log(`Adding user ${authUser.id} to room ${room.id}`);
      const { error: roomUserError } = await supabase.from('room_users').upsert([
        { room_id: room.id, user_id: authUser.id }
      ], { onConflict: 'room_id,user_id' });
      
      if (roomUserError) {
        console.error('Error adding user to room:', roomUserError);
      } else {
        console.log('User successfully added to room');
        // Trigger manual update of room count
        window.dispatchEvent(new CustomEvent('roomUserChanged', { detail: { roomId: room.id } }));
      }
      // 3. Pin room in sidebar
      addRoom({ id: room.id, name: room.name, game: room.game });
    };
    
    if (authUser) {
      joinRoom();
      joined = true;
    }
    
    return () => {
      const leaveAndMaybeDelete = async () => {
        if (joined && authUser) {
          await supabase.from('room_users').delete().eq('room_id', room.id).eq('user_id', authUser.id);
          // Check if room is empty
          const { data: usersLeft } = await supabase.from('room_users').select('id').eq('room_id', room.id);
          if (!usersLeft || usersLeft.length === 0) {
            await supabase.from('rooms').delete().eq('id', room.id);
          }
        }
      };
      leaveAndMaybeDelete();
    };
  }, [room.id, authUser?.id]);

  // Subscribe to room users in real time
  useEffect(() => {
    let subscription: any;
    fetchUsers();
    subscription = supabase
      .channel('room-users-' + room.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_users', filter: `room_id=eq.${room.id}` }, fetchUsers)
      .subscribe();
    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [room.id]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !authUser) return;
    // Use profile.username for chat messages
    const usernameToSend = profile?.username || authUser.email;
    await supabase.from('messages').insert([
      {
        room_id: room.id,
        user_id: authUser.id,
        username: usernameToSend,
        content: input,
      },
    ]);
    setInput('');
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
    
    // Remove user from room
    console.log(`Removing user ${authUser.id} from room ${room.id}`);
    const { error: removeError } = await supabase.from('room_users').delete().eq('room_id', room.id).eq('user_id', authUser.id);
    if (removeError) {
      console.error('Error removing user from room:', removeError);
    } else {
      console.log('User successfully removed from room');
      // Trigger manual update of room count
      window.dispatchEvent(new CustomEvent('roomUserChanged', { detail: { roomId: room.id } }));
    }
    
    // Check if room is empty and delete if necessary
    const { data: usersLeft } = await supabase.from('room_users').select('id').eq('room_id', room.id);
    if (!usersLeft || usersLeft.length === 0) {
      await supabase.from('messages').delete().eq('room_id', room.id);
      await supabase.from('rooms').delete().eq('id', room.id);
    }
    
    // Remove from pinned rooms and close modal
    removeRoom(room.id);
    if (onRoomLeft) {
      onRoomLeft(room.id);
    } else {
      onClose();
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
            <h3 className="text-md font-semibold text-purple-300 mb-3">Room Users</h3>
            <div className="flex flex-wrap gap-3">
              {users.map(user => (
                <div key={user.id} className="flex items-center gap-3 bg-[#232046]/80 px-3 py-2 rounded-lg border border-purple-800 min-w-[180px]">
                  <img src={user.profile?.avatar_url || '/default-avatar.png'} alt={user.profile?.username || 'User'} className="w-9 h-9 rounded-full border-2 border-purple-400 object-cover" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-semibold text-purple-200 truncate">{user.profile?.username || 'User'}</span>
                    <span className="text-xs text-gray-400 truncate">{user.profile?.email}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {user.is_owner && (
                      <span className="text-xs bg-gradient-to-r from-green-400 to-green-300 text-[#18122B] rounded-full px-2 py-0.5 font-bold mb-1">Owner</span>
                    )}
                    <button
                      onClick={() => handleViewProfile(user.user_id)}
                      className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full px-3 py-1 font-semibold shadow hover:from-blue-600 hover:to-purple-600"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
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
