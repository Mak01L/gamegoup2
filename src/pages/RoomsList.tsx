import React, { useEffect, useState } from 'react';
import { useMobileOptimized } from '../hooks/useDevice';
import { MobileCard, MobileGrid } from '../components/MobileOptimizedComponents';
import { supabase } from '../lib/supabaseClient';
import { cleanEmptyRooms } from '../lib/roomOptions';

interface Room {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

const RoomsList: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      setError(null);
      await cleanEmptyRooms(); // Clean empty rooms before showing
      const { data, error } = await supabase
        .from('rooms')
        .select('id, name, description, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setRooms(data || []);
      setLoading(false);
    };
    fetchRooms();
  }, []);

  const { isMobile, containerClass, gridCols } = useMobileOptimized();
  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#18122B] via-purple-800 to-purple-300 font-inter text-white p-6 flex flex-col items-center ${containerClass}`}>
      <h1 className="text-3xl font-bold text-purple-300 mb-3 mt-8 drop-shadow-lg">
        Active Rooms
      </h1>
      {loading && <div>Loading rooms...</div>}
      {error && <div className="text-red-400 mb-4">{error}</div>}
      <MobileGrid className="w-full max-w-md">
        {rooms.length === 0 && !loading && (
          <div className="text-gray-400 text-center">No active rooms found.</div>
        )}
        {rooms.map((room) => (
          <MobileCard
            key={room.id}
            className="bg-[#281e46]/70 p-5 shadow-lg border border-purple-700 flex flex-col gap-1"
          >
            <div className="font-bold text-lg text-purple-200">{room.name}</div>
            {room.description && (
              <div className="text-purple-100 text-base">{room.description}</div>
            )}
            <div className="text-gray-400 text-xs mt-1">
              Created: {new Date(room.created_at).toLocaleString()}
            </div>
          </MobileCard>
        ))}
      </MobileGrid>
    </div>
  );
};

export default RoomsList;
