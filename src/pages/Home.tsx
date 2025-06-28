import React, { useState, useEffect } from 'react';
import Filters from '../components/Filters';
import PinnedRoomsSidebar from '../components/PinnedRoomsSidebar';
import UserMenu from '../components/UserMenu';
import CreateRoomModal from '../modals/CreateRoomModal';
import { supabase } from '../lib/supabaseClient';
import AdBanner from '../components/AdBanner';
import Footer from '../components/Footer';
import BackgroundParticles from '../components/BackgroundParticles';
import { usePinnedRoomsStore } from '../store/pinnedRoomsStore';
import { cleanEmptyRooms } from '../lib/roomOptions';
import { useUser } from '../context/UserContext';
import GlareHover from '../components/GlareHover';

interface Room {
  id: string;
  name: string;
  game: string;
  region: string;
  language: string;
  country?: string;
  description?: string;
  created_at: string;
  user_count?: number;
  user_previews?: { username: string; avatar_url: string }[];
}

const initialFilters = {
  name: '',
  game: '',
  region: '',
  language: '',
  country: '',
};

const Home: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { rooms: pinnedRooms, addRoom } = usePinnedRoomsStore();
  const { authUser } = useUser();

  // Auto-refresh on mount to show current user counts
  useEffect(() => {
    if (authUser) {
      handleApply();
    }
  }, [authUser]);

  // Automatic cleanup of empty rooms every 30 seconds
  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      console.log('Running automatic cleanup of empty rooms...');
      const deletedRoomIds = await cleanEmptyRooms();
      if (deletedRoomIds.length > 0) {
        setRooms(prevRooms => prevRooms.filter(room => !deletedRoomIds.includes(room.id)));
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(cleanupInterval);
  }, []);

  // Manual room count updates via custom events
  useEffect(() => {
    const updateRoomCount = async (event: any) => {
      const roomId = event.detail.roomId;
      console.log('Manual room count update for:', roomId);
      
      const { data: users } = await supabase.from('room_users').select('id').eq('room_id', roomId);
      const userCount = users?.length || 0;
      console.log(`Updating room ${roomId} to ${userCount} users`);
      
      setRooms(prevRooms => {
        const updatedRooms = prevRooms.map(room => 
          room.id === roomId ? { ...room, user_count: userCount } : room
        );
        console.log('Updated rooms state:', updatedRooms.find(r => r.id === roomId));
        return updatedRooms;
      });
    };

    window.addEventListener('roomUserChanged', updateRoomCount);
    return () => {
      window.removeEventListener('roomUserChanged', updateRoomCount);
    };
  }, []);

  // Global subscription to detect room changes (creation and deletion)
  useEffect(() => {
    const subscription = supabase
      .channel('rooms-global')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rooms' }, async (payload) => {
        console.log('New room created globally:', payload.new.id);
        // Add new room to local state with user count
        const { data: users } = await supabase.from('room_users').select('id').eq('room_id', payload.new.id);
        const newRoom = { ...payload.new, user_count: users?.length || 0 };
        setRooms(prevRooms => [newRoom, ...prevRooms]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'rooms' }, (payload) => {
        console.log('Room deleted globally:', payload.old.id);
        // Remove deleted room from local state for all users
        setRooms(prevRooms => prevRooms.filter(room => room.id !== payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleApply = async () => {
    setLoading(true);
    setError(null);
    
    let query = supabase.from('rooms').select('*').eq('is_active', true);
    if (filters.name) query = query.ilike('name', `%${filters.name}%`);
    if (filters.game) query = query.eq('game', filters.game);
    if (filters.region) query = query.eq('region', filters.region);
    if (filters.language) query = query.eq('language', filters.language);
    if (filters.country) query = query.eq('country', filters.country);
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      setError(error.message);
    } else if (data) {
      // Get user count and user previews for each room
      const roomsWithUserCount = await Promise.all(
        data.map(async (room) => {
          const { data: roomUsers } = await supabase
            .from('room_users')
            .select('user_id')
            .eq('room_id', room.id)
            .limit(3); // Only get first 3 users for preview
          
          // Get profiles for preview users
          const userPreviews = await Promise.all(
            (roomUsers || []).map(async (roomUser) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('username, avatar_url')
                .eq('user_id', roomUser.user_id)
                .single();
              
              return {
                username: profile?.username || 'User',
                avatar_url: profile?.avatar_url || '/default-avatar.png'
              };
            })
          );
          
          return { 
            ...room, 
            user_count: roomUsers?.length || 0,
            user_previews: userPreviews
          };
        })
      );
      setRooms(roomsWithUserCount);
    }
    setLoading(false);
  };

  const handleClear = () => {
    setFilters(initialFilters);
    setRooms([]);
    setError(null);
  };

  const handleRoomCreated = (room: Room) => {
    setShowCreateModal(false);
    addRoom({ id: room.id, name: room.name, game: room.game }); // Pin room automatically
    handleApply(); // Refresh room list
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] to-[#6D28D9] via-[#A78BFA] font-inter text-white flex flex-row relative">
      <BackgroundParticles />
      {/* Sidebar for pinned rooms */}
      <div className="min-w-[90px] max-w-[220px] w-[18vw] bg-[#281e46]/[0.55] border-r border-purple-400/30 flex flex-col z-20">
        <PinnedRoomsSidebar />
        <AdBanner position="sidebar" />
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center py-8 relative">
        {/* User menu top right */}
        <div className="absolute top-6 right-8 z-10">
          <UserMenu />
        </div>
        {/* Logo */}
        <div className="text-center mb-6 mt-4">
          <img src="/logo.png" alt="GameGoUp Logo" className="h-16 mx-auto drop-shadow-[0_0_12px_rgba(167,139,250,0.5)]" />
        </div>
        {/* Filtros y botones */}
        <div className="w-full max-w-[540px] mx-auto bg-[#281e46]/[0.55] rounded-2xl shadow-lg p-7 mb-4 relative">
          <AdBanner position="top" />
          <Filters values={filters} onChange={setFilters} onApply={handleApply} onClear={handleClear} />
          <div className="flex justify-end mt-4">
            <GlareHover
              width="auto"
              height="auto"
              background="linear-gradient(to right, rgb(196, 181, 253), rgb(221, 214, 254))"
              borderRadius="12px"
              borderColor="transparent"
              glareColor="#ffffff"
              glareOpacity={0.3}
              transitionDuration={500}
            >
              <button
                className="px-7 py-3 rounded-xl font-bold text-lg bg-transparent text-[#18122B] border-none cursor-pointer shadow-md focus:outline-none"
                onClick={() => setShowCreateModal(true)}
                type="button"
              >
                Create Room
              </button>
            </GlareHover>
          </div>
        </div>
        {/* Room search results */}
        <div className="w-full max-w-[900px] mx-auto">
          {loading && <div className="text-center">Loading rooms...</div>}
          {error && <div className="text-red-400 mb-4 text-center">{error}</div>}
          {rooms.length === 0 && !loading && (
            <div className="text-gray-400 text-center">No rooms found.</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room: Room) => (
              <div
                key={room.id}
                className="bg-[#281e46]/[0.55] rounded-xl p-4 shadow-lg border border-purple-400/30 flex flex-col gap-2 relative min-h-[160px]"
              >
                <div className="font-bold text-lg text-purple-300 truncate">{room.name}</div>
                <div className="text-purple-100 text-sm">{room.game}</div>
                <div className="text-purple-100 text-xs">{room.region} | {room.language} {room.country ? `| ${room.country}` : ''}</div>
                {room.description && <div className="text-gray-400 text-xs line-clamp-2">{room.description}</div>}
                {/* User previews */}
                {room.user_previews && room.user_previews.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex -space-x-2">
                      {room.user_previews.map((user, index) => (
                        <img
                          key={index}
                          src={user.avatar_url}
                          alt={user.username}
                          className="w-6 h-6 rounded-full border-2 border-purple-400 object-cover bg-[#18122B]"
                          title={user.username}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-purple-300">
                      {room.user_previews.map(user => user.username).join(', ')}
                      {room.user_count && room.user_count > 3 && ` +${room.user_count - 3} more`}
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center mt-auto">
                  <div className="text-gray-400 text-xs">
                    Created: {new Date(room.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-purple-300 text-xs font-semibold">
                    👥 {room.user_count || 0} users
                  </div>
                </div>
                {!pinnedRooms.some((r: Room) => r.id === room.id) ? (
                  <GlareHover
                    width="auto"
                    height="auto"
                    background="linear-gradient(to right, rgb(196, 181, 253), rgb(221, 214, 254))"
                    borderRadius="6px"
                    borderColor="transparent"
                    glareColor="#ffffff"
                    glareOpacity={0.3}
                    transitionDuration={400}
                    className="absolute top-3 right-3"
                  >
                    <button
                      className="px-2 py-1 rounded-md font-semibold text-xs border-none shadow-md focus:outline-none bg-transparent text-[#18122B] cursor-pointer"
                      onClick={async () => {
                        // Ensure profile exists before joining room
                        if (authUser) {
                          // Create/update profile first
                          await supabase.from('profiles').upsert([
                            {
                              user_id: authUser.id,
                              username: authUser.email?.split('@')[0] || 'User'
                            }
                          ], { onConflict: 'user_id' });
                          
                          // Then add to room_users
                          const { error } = await supabase.from('room_users').upsert([
                            { room_id: room.id, user_id: authUser.id }
                          ], { onConflict: 'room_id,user_id' });
                          
                          if (!error) {
                            // Trigger manual update of room count
                            window.dispatchEvent(new CustomEvent('roomUserChanged', { detail: { roomId: room.id } }));
                          }
                        }
                        addRoom({ id: room.id, name: room.name, game: room.game });
                      }}
                      type="button"
                    >
                      Join
                    </button>
                  </GlareHover>
                ) : (
                  <button
                    className="absolute top-3 right-3 px-2 py-1 rounded-md font-semibold text-xs border-none shadow-md focus:outline-none bg-[#2D2350] text-white cursor-not-allowed"
                    disabled={true}
                    type="button"
                  >
                    Joined
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Modal para crear sala */}
        {showCreateModal && (
          <CreateRoomModal
            onClose={() => setShowCreateModal(false)}
            onRoomCreated={handleRoomCreated}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Home;
