import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import ShinyText from './ShinyText';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  reply_to_message_id?: string;
  created_at: string;
  is_read: boolean;
  sender_username?: string;
}

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  last_message_at: string;
  other_user?: {
    username: string;
    avatar_url?: string;
  };
  unread_count?: number;
}

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  friend_username: string;
  friend_avatar?: string;
  is_online: boolean;
  last_seen?: string;
}

const MessagingSystem: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { authUser } = useUser();
  const [activeTab, setActiveTab] = useState<'conversations' | 'friends'>('conversations');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [friendSearch, setFriendSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authUser) {
      fetchConversations();
      fetchFriends();
    }
  }, [authUser]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      subscribeToMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!authUser) return;

    const { data, error } = await supabase
      .from('private_conversations')
      .select(`
        *,
        user1:profiles!private_conversations_user1_id_fkey(username, avatar_url),
        user2:profiles!private_conversations_user2_id_fkey(username, avatar_url)
      `)
      .or(`user1_id.eq.${authUser.id},user2_id.eq.${authUser.id}`)
      .order('last_message_at', { ascending: false });

    if (!error && data) {
      const formattedConversations = data.map(conv => ({
        ...conv,
        other_user: conv.user1_id === authUser.id ? conv.user2 : conv.user1
      }));
      setConversations(formattedConversations);
    }
  };

  const fetchFriends = async () => {
    if (!authUser) return;

    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        friend:profiles!friendships_user2_id_fkey(username, avatar_url)
      `)
      .eq('user1_id', authUser.id)
      .eq('status', 'accepted');

    if (!error && data) {
      const formattedFriends = data.map(friendship => ({
        ...friendship,
        friend_username: friendship.friend.username,
        friend_avatar: friendship.friend.avatar_url,
        is_online: Math.random() > 0.5 // Placeholder for online status
      }));
      setFriends(formattedFriends);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('private_messages')
      .select(`
        *,
        sender:profiles!private_messages_sender_id_fkey(username)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      const formattedMessages = data.map(msg => ({
        ...msg,
        sender_username: msg.sender.username
      }));
      setMessages(formattedMessages);
    }
  };

  const subscribeToMessages = (conversationId: string) => {
    const subscription = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'private_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        fetchMessages(conversationId);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !authUser) return;

    const { error } = await supabase
      .from('private_messages')
      .insert({
        conversation_id: selectedConversation,
        sender_id: authUser.id,
        content: newMessage.trim(),
        message_type: 'text'
      });

    if (!error) {
      setNewMessage('');
      // Update conversation last_message_at
      await supabase
        .from('private_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation);
    }
  };

  const startConversation = async (friendId: string) => {
    if (!authUser) return;

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('private_conversations')
      .select('id')
      .or(`and(user1_id.eq.${authUser.id},user2_id.eq.${friendId}),and(user1_id.eq.${friendId},user2_id.eq.${authUser.id})`)
      .single();

    if (existing) {
      setSelectedConversation(existing.id);
      setActiveTab('conversations');
      return;
    }

    // Create new conversation
    const { data, error } = await supabase
      .from('private_conversations')
      .insert({
        user1_id: authUser.id,
        user2_id: friendId,
        last_message_at: new Date().toISOString()
      })
      .select()
      .single();

    if (!error && data) {
      setSelectedConversation(data.id);
      setActiveTab('conversations');
      fetchConversations();
    }
  };

  const addFriend = async () => {
    if (!friendSearch.trim() || !authUser) return;

    // Find user by username
    const { data: user } = await supabase
      .from('profiles')
      .select('user_id, username')
      .eq('username', friendSearch.trim())
      .single();

    if (!user) {
      alert('Usuario no encontrado');
      return;
    }

    if (user.user_id === authUser.id) {
      alert('No puedes agregarte a ti mismo');
      return;
    }

    // Send friend request
    const { error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: authUser.id,
        receiver_id: user.user_id,
        status: 'pending'
      });

    if (!error) {
      setFriendSearch('');
      alert('Solicitud de amistad enviada');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#18122B] rounded-2xl w-full max-w-4xl h-[80vh] flex overflow-hidden border border-purple-400/30">
        {/* Sidebar */}
        <div className="w-80 bg-[#221b3a] border-r border-purple-400/30 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-purple-400/30">
            <div className="flex justify-between items-center mb-4">
              <ShinyText text="Messages" className="text-xl font-bold" />
              <button onClick={onClose} className="text-purple-400 hover:text-purple-200">
                ✕
              </button>
            </div>
            <div className="flex bg-[#2D2350] rounded-lg">
              <button
                onClick={() => setActiveTab('conversations')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'conversations'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                Chats
              </button>
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'friends'
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                Friends
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'conversations' ? (
              <div className="p-2">
                {conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                      selectedConversation === conv.id
                        ? 'bg-purple-600'
                        : 'hover:bg-[#2D2350]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={conv.other_user?.avatar_url || '/default-avatar.png'}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">
                          {conv.other_user?.username}
                        </div>
                        <div className="text-sm text-gray-400 truncate">
                          Last message...
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search username..."
                    value={friendSearch}
                    onChange={(e) => setFriendSearch(e.target.value)}
                    className="w-full px-3 py-2 bg-[#2D2350] border border-purple-400/30 rounded-lg text-white"
                    onKeyPress={(e) => e.key === 'Enter' && addFriend()}
                  />
                  <button
                    onClick={addFriend}
                    className="w-full mt-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Add Friend
                  </button>
                </div>
                {friends.map(friend => (
                  <div
                    key={friend.id}
                    className="p-3 rounded-lg hover:bg-[#2D2350] cursor-pointer mb-2"
                    onClick={() => startConversation(friend.friend_id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={friend.friend_avatar || '/default-avatar.png'}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#221b3a] ${
                          friend.is_online ? 'bg-green-500' : 'bg-gray-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">
                          {friend.friend_username}
                        </div>
                        <div className="text-sm text-gray-400">
                          {friend.is_online ? 'Online' : 'Offline'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-purple-400/30 bg-[#221b3a]">
                <div className="flex items-center gap-3">
                  <img
                    src="/default-avatar.png"
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-white">Chat User</div>
                    <div className="text-sm text-gray-400">Online</div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === authUser?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === authUser?.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-[#2D2350] text-white'
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-purple-400/30 bg-[#221b3a]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-[#2D2350] border border-purple-400/30 rounded-lg text-white"
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">💬</div>
                <ShinyText text="Select a conversation to start chatting" className="text-lg" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingSystem;