import React, { useState } from 'react';
import RoomModal from '../modals/RoomModal';
import { usePinnedRoomsStore } from '../store/pinnedRoomsStore';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';

const PinnedRoomsSidebar: React.FC = () => {
  const { rooms, maximized, removeRoom, toggleMaximized } = usePinnedRoomsStore();
  const { authUser } = useUser();
  const [openRoomId, setOpenRoomId] = useState<string | null>(null);
  const openRoom = rooms.find(r => r.id === openRoomId);
  // Get extended room info if it's pinned
  const extendedRoom = openRoomId && rooms.find(r => r.id === openRoomId);

  return (
    <>
      <aside className="w-full h-screen bg-gradient-to-b from-[#4f46e5] via-[#7c3aed] to-[#a21caf] flex flex-col items-center py-8 gap-6 border-r-4 border-purple-400/80 shadow-2xl">
        <div className="text-purple-100 font-extrabold text-2xl mb-4 tracking-wider drop-shadow-lg uppercase">Pinned Rooms</div>
        {rooms.length === 0 && (
          <div className="text-gray-200 text-base text-center font-semibold">No pinned rooms</div>
        )}
        {rooms.map(room => (
          <div
            key={room.id}
            className="w-[200px] bg-[#3c2864]/[0.92] rounded-2xl shadow-xl border-2 border-purple-300/60 mb-2 flex flex-col items-start px-5 py-4 gap-2 transition-transform hover:scale-105"
          >
            <div className="flex w-full items-center justify-between">
              <div className="font-extrabold text-purple-200 text-lg mb-1 uppercase tracking-wide">{room.name}</div>
              <button
                className="ml-2 bg-none border-none text-purple-200 font-extrabold text-lg cursor-pointer hover:text-purple-100 focus:outline-none"
                aria-label={maximized[room.id] ? 'Minimize room' : 'Maximize room'}
                onClick={() => toggleMaximized(room.id)}
                type="button"
              >
                {maximized[room.id] ? '−' : '+'}
              </button>
            </div>
            <div className="text-purple-300 text-xs font-semibold">{room.game}</div>
            <div className="flex gap-2 mt-2">
              <button
                className="px-3 py-1 rounded-lg font-bold text-xs bg-gradient-to-r from-blue-400 to-purple-400 text-[#18122B] border-none cursor-pointer shadow-md hover:from-blue-500 hover:to-purple-300 focus:outline-none"
                onClick={() => setOpenRoomId(room.id)}
                type="button"
              >
                Open
              </button>
              <button
                className="px-3 py-1 rounded-lg font-bold text-xs bg-[#2D2350] text-white border-none cursor-pointer hover:bg-purple-900/60 focus:outline-none"
                onClick={async () => {
                  // Leave room from database
                  if (authUser) {
                    try {
                      console.log(`Attempting to remove user ${authUser.id} from room ${room.id}`);
                      
                      const { data, error } = await supabase
                        .from('room_users')
                        .delete()
                        .eq('room_id', room.id)
                        .eq('user_id', authUser.id);
                      
                      if (error) {
                        console.error('Error leaving room:', error);
                      } else {
                        console.log(`Successfully removed user from room:`, data);
                        
                        // Trigger manual update of room count
                        window.dispatchEvent(new CustomEvent('roomUserChanged', { detail: { roomId: room.id } }));
                      }
                    } catch (error) {
                      console.error('Exception leaving room:', error);
                    }
                  }
                  
                  // Remove from sidebar
                  removeRoom(room.id);
                }}
                type="button"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </aside>
      {/* Renderiza el modal fuera del aside para que esté centrado */}
      {extendedRoom && createPortal(
        <RoomModal
          room={{
            ...extendedRoom,
            region: (extendedRoom as any).region || '',
            language: (extendedRoom as any).language || '',
            country: (extendedRoom as any).country || '',
            description: (extendedRoom as any).description || '',
            created_at: (extendedRoom as any).created_at || '',
          }}
          onClose={() => setOpenRoomId(null)}
          onRoomLeft={() => {
            removeRoom(extendedRoom.id);
            setOpenRoomId(null);
          }}
        />, document.body
      )}
    </>
  );
};

export default PinnedRoomsSidebar;
