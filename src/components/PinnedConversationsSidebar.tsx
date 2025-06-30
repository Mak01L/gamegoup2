import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';

interface Conversation {
  id: string;
  user: {
    id: string;
    username: string;
    avatar_url: string;
  };
}

interface PinnedConversationsSidebarProps {
  onOpenConversation: (conversationId: string, otherUser: { id: string; username: string; avatar_url: string }) => void;
}

const PinnedConversationsSidebar: React.FC<PinnedConversationsSidebarProps> = ({ onOpenConversation }) => {
  const { authUser } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) return;
    const fetchConversations = async () => {
      setLoading(true);
      // Buscar conversaciones donde el usuario es user1 o user2 y que sean amigos o match
      const { data, error } = await supabase
        .from('private_conversations')
        .select('id, user1_id, user2_id, user1:profiles!private_conversations_user1_id_fkey(id,username,avatar_url), user2:profiles!private_conversations_user2_id_fkey(id,username,avatar_url)')
        .or(`user1_id.eq.${authUser.id},user2_id.eq.${authUser.id}`);
      if (!error && data) {
        // Filtrar para mostrar solo amigos o matches (puedes ajustar la lógica según tu modelo)
        const filtered = data.map((conv: any) => {
          const other = conv.user1_id === authUser.id ? conv.user2 : conv.user1;
          return {
            id: conv.id,
            user: {
              id: other.id,
              username: other.username,
              avatar_url: other.avatar_url || '/default-avatar.png',
            },
          };
        });
        setConversations(filtered);
      }
      setLoading(false);
    };
    fetchConversations();
  }, [authUser]);

  if (!authUser) return null;

  return (
    <aside className="w-64 bg-[#221b3a] border-r border-purple-800 h-full flex flex-col p-4 gap-2 overflow-y-auto">
      <h3 className="text-purple-300 text-lg font-bold mb-2">Pinned Conversations</h3>
      {loading ? (
        <div className="text-purple-400 text-sm">Loading...</div>
      ) : conversations.length === 0 ? (
        <div className="text-purple-400 text-sm">No pinned conversations yet.</div>
      ) : (
        <ul className="flex flex-col gap-2">
          {conversations.map((conv) => (
            <li key={conv.id}>
              <button
                className="w-full flex items-center gap-3 p-2 rounded-lg bg-[#2d2350] hover:bg-purple-900/30 transition-colors border border-purple-700"
                onClick={() => onOpenConversation(conv.id, conv.user)}
              >
                <img src={conv.user.avatar_url} alt={conv.user.username} className="w-10 h-10 rounded-full border-2 border-purple-400 object-cover" />
                <span className="text-white font-semibold truncate">{conv.user.username}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default PinnedConversationsSidebar;
