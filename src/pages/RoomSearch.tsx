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
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#6D28D9] to-[#A78BFA] font-inter text-white p-6 flex flex-col items-center">
      <h1 className="text-[2.2rem] font-bold text-purple-300 my-8 drop-shadow-[0_0_8px_rgba(167,139,250,0.53)]">
        Room Finder
      </h1>
      <form onSubmit={handleSearch} className="flex gap-3 mb-7">
        <input
          type="text"
          placeholder="Search rooms by name..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="px-4 py-3 rounded-lg border-2 border-purple-500 bg-[#281e46]/85 text-white text-base min-w-[180px] outline-none font-inter"
        />
        <button
          type="submit"
          className="px-7 py-3 rounded-lg font-bold text-base bg-gradient-to-r from-purple-300 to-purple-200 text-[#18122B] border-none cursor-pointer shadow-lg drop-shadow-[0_0_12px_rgba(167,139,250,0.6)] hover:from-purple-400 hover:to-purple-300 transition-all"
        >
          Search
        </button>
      </form>
      {loading && <div>Loading rooms...</div>}
      {error && <div className="text-red-400 mb-4">{error}</div>}
      <div className="w-full max-w-[420px] flex flex-col gap-5">
        {rooms.length === 0 && !loading && (
          <div className="text-gray-400 text-center">No rooms found.</div>
        )}
        {rooms.map(room => (
          <div key={room.id} className="bg-[#281e46]/55 rounded-2xl p-5 shadow-lg border-2 border-purple-400/20 flex flex-col gap-1.5">
            <div className="font-bold text-lg text-purple-300">{room.name}</div>
            {room.description && <div className="text-purple-100 text-[15px]">{room.description}</div>}
            <div className="text-gray-400 text-sm mt-1">
              Created: {new Date(room.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomSearch;
