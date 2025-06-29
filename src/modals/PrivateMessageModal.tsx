import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender_username?: string;
}

interface PrivateMessageModalProps {
  onClose: () => void;
  otherUserId: string;
  otherUsername: string;
}

const PrivateMessageModal: React.FC<PrivateMessageModalProps> = ({ 
  onClose, 
  otherUserId, 
  otherUsername 
}) => {
  const { authUser } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!authUser || !otherUserId) return;
    
    const initializeConversation = async () => {
      try {
        // Find or create conversation
        let { data: conversation } = await supabase
          .from('private_conversations')
          .select('id')
          .or(`and(user1_id.eq.${authUser.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${authUser.id})`)
          .maybeSingle();

        if (!conversation) {
          const { data: newConv } = await supabase
            .from('private_conversations')
            .insert({
              user1_id: authUser.id,
              user2_id: otherUserId,
              last_message_at: new Date().toISOString()
            })
            .select('id')
            .single();
          
          conversation = newConv;
        }

        if (conversation) {
          setConversationId(conversation.id);
          await loadMessages(conversation.id);
        }
      } catch (error) {
        console.error('Error initializing conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeConversation();
  }, [authUser, otherUserId]);

  const loadMessages = async (convId: string) => {
    try {
      const { data } = await supabase
        .from('private_messages')
        .select(`
          id,
          content,
          sender_id,
          created_at,
          profiles!sender_id(username)
        `)
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (data) {
        const formattedMessages = data.map(msg => ({
          ...msg,
          sender_username: msg.profiles?.username || 'Unknown'
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !authUser) return;

    try {
      const { data } = await supabase
        .from('private_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: authUser.id,
          content: newMessage.trim()
        })
        .select(`
          id,
          content,
          sender_id,
          created_at
        `)
        .single();

      if (data) {
        const newMsg = {
          ...data,
          sender_username: 'You'
        };
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');

        // Update conversation timestamp
        await supabase
          .from('private_conversations')
          .update({ last_message_at: new Date().toISOString() })
          .eq('id', conversationId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#18122B]/90 backdrop-blur-md rounded-2xl p-8 text-white">
          Loading conversation...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#18122B]/90 backdrop-blur-md rounded-2xl w-full max-w-2xl h-[600px] shadow-2xl text-white flex flex-col border border-purple-400/30">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-400/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
              {otherUsername.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold">{otherUsername}</h3>
              <p className="text-xs text-purple-300">Private Message</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-purple-300 py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
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
                      : 'bg-[#221b3a] text-purple-100'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-purple-400/30">
          <div className="flex gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-[#221b3a] border border-purple-700 rounded-lg px-3 py-2 text-white resize-none"
              rows={2}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateMessageModal;