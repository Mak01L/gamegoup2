import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Room {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

const RoomSearch: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('rooms')
      .select('id, name, description, created_at')
      .ilike('name', `%${query}%`)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setRooms(data || []);
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #18122B 0%, #6D28D9 60%, #A78BFA 100%)',
      fontFamily: 'Inter, sans-serif',
      color: '#fff',
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#A78BFA', margin: '32px 0 12px', textShadow: '0 0 8px #A78BFA88' }}>
        Room Finder
      </h1>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <input
          type="text"
          placeholder="Search rooms by name..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            border: '1.5px solid #7C5CFA',
            background: 'rgba(40,30,70,0.85)',
            color: '#fff',
            fontSize: 16,
            minWidth: 180,
            outline: 'none',
            fontFamily: 'Inter, sans-serif',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 28px',
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 16,
            background: 'linear-gradient(90deg, #C084FC 0%, #A78BFA 100%)',
            color: '#18122B',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 0 12px 0 #A78BFA99',
            textShadow: '0 0 4px #F3E8FF',
            transition: 'box-shadow 0.2s, background 0.2s',
          }}
        >
          Search
        </button>
      </form>
      {loading && <div>Loading rooms...</div>}
      {error && <div style={{ color: '#F87171', marginBottom: 16 }}>{error}</div>}
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {rooms.length === 0 && !loading && (
          <div style={{ color: '#bdbdbd', textAlign: 'center' }}>No rooms found.</div>
        )}
        {rooms.map(room => (
          <div key={room.id} style={{
            background: 'rgba(40,30,70,0.55)',
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 4px 24px 0 #A78BFA22',
            border: '1.5px solid #7C5CFA44',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#C084FC' }}>{room.name}</div>
            {room.description && <div style={{ color: '#F3E8FF', fontSize: 15 }}>{room.description}</div>}
            <div style={{ color: '#bdbdbd', fontSize: 13, marginTop: 4 }}>
              Created: {new Date(room.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomSearch;
