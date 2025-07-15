import React, { useState, useEffect } from 'react';
import Filters from '../components/Filters';
import PinnedRoomsSidebar from '../components/PinnedRoomsSidebar';
import UserMenu from '../components/UserMenu';
import CreateRoomModal from '../modals/CreateRoomModal';
import { supabase } from '../lib/supabaseClient';
import { functionalRealtimeSystem } from '../lib/functionalRealtimeSystem';
import GoogleAdSense from '../components/GoogleAdSense';
import { initializeAdOptimizer } from '../lib/adSenseOptimizer';
import Footer from '../components/Footer';
import BackgroundParticles from '../components/BackgroundParticles';
import { usePinnedRoomsStore } from '../store/pinnedRoomsStore';
import { cleanEmptyRooms } from '../lib/roomOptions';
import { useUser } from '../context/UserContext';
import FeedbackModal from '../modals/FeedbackModal';
import ProfileCompletionBanner from '../components/ProfileCompletionBanner';
import Button from '../components/Button';
import { useToast } from '../components/Toast';
import { SkeletonRoomCard } from '../components/SkeletonLoader';
import Confetti from '../components/Confetti';
import { useSoundEffects } from '../hooks/useSoundEffects';
import Tooltip from '../components/Tooltip';
import SearchBar from '../components/SearchBar';
import AchievementBadge from '../components/AchievementBadge';
import ParallaxBackground from '../components/ParallaxBackground';
import { MessageCircleIcon, UsersIcon, GamepadIcon, CheckIcon } from '../components/Icons';
import Badge from '../components/Badge';
import { useIsMobile } from '../hooks/useMediaQuery';
import FloatingActionButton from '../components/FloatingActionButton';
import MobileNavigation from '../components/MobileNavigation';
import { useMobileOptimized } from '../hooks/useDevice';
import { SafeArea } from '../components/MobileBottomNavigation';
import { MobileCard, MobileButton, MobileGrid } from '../components/MobileOptimizedComponents';
import { SwipeableCard, PullToRefresh } from '../components/MobileGestures';

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
  system: '', // <-- Añadido para cumplir con el tipo requerido
};

const Home: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joiningRoom, setJoiningRoom] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { rooms: pinnedRooms, addRoom } = usePinnedRoomsStore();
  const { authUser } = useUser();
  const { success, error: showError, ToastContainer } = useToast();
  const { playSound } = useSoundEffects({ enabled: true, volume: 0.2 });
  const isMobile = useIsMobile();
  const { 
    isMobile: isMobileDevice, 
    useBottomNav, 
    showSidebar,
    containerClass 
  } = useMobileOptimized();

  // Auto-refresh on mount to show current user counts
  useEffect(() => {
    if (authUser) {
      handleApply();
    }
  }, [authUser]);

  // Initialize AdSense optimizer for better monetization
  useEffect(() => {
    initializeAdOptimizer();
  }, []);

  // Silent cleanup of empty rooms every 5 minutes
  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.log('🧹 Silent cleanup of empty rooms...');
      }
      const deletedRoomIds = await cleanEmptyRooms();
      if (deletedRoomIds.length > 0) {
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.log(`🗑️ Removed ${deletedRoomIds.length} empty rooms`);
        }
        setRooms(prevRooms => prevRooms.filter(room => !deletedRoomIds.includes(room.id)));
      }
    }, 300000);

    return () => clearInterval(cleanupInterval);
  }, []);

  // Background room count updates (invisible)
  useEffect(() => {
    let updateTimeout: number;
    
    const updateRoomCount = async (event: any) => {
      const roomId = event.detail.roomId;
      
      // Clear previous timeout to debounce rapid updates
      if (updateTimeout) {
        window.clearTimeout(updateTimeout);
      }
      
      // Debounce updates by 3 seconds for smoother experience
      updateTimeout = window.setTimeout(async () => {
        if (import.meta.env.VITE_DEBUG === 'true') {
          console.log('🔄 Background room count update for:', roomId);
        }
        
        const { data: users } = await supabase.from('room_users').select('id').eq('room_id', roomId);
        const userCount = users?.length || 0;
        
        // Silent update - only if count actually changed
        setRooms(prevRooms => {
          return prevRooms.map(room => {
            if (room.id === roomId && room.user_count !== userCount) {
              return { ...room, user_count: userCount };
            }
            return room;
          });
        });
      }, 3000);
    };

    window.addEventListener('roomUserChanged', updateRoomCount);
    return () => {
      window.removeEventListener('roomUserChanged', updateRoomCount);
      if (updateTimeout) {
        window.clearTimeout(updateTimeout);
      }
    };
  }, []);

  // Global subscription to detect room changes using Functional Realtime System
  useEffect(() => {
    // Only subscribe if we have an authenticated user
    if (!authUser) return;

    if (import.meta.env.VITE_DEBUG === 'true') {
      console.log('🔗 [Home] Configurando sistema resiliente de tiempo real...');
    }

    // Crear suscripción resiliente que SIEMPRE funciona
    const { cleanup } = functionalRealtimeSystem.createResilientSubscription(
      'rooms-global',
      'rooms',
      {
        onInsert: async (payload) => {
          if (import.meta.env.VITE_DEBUG === 'true') {
            console.log('🆕 [Realtime] Nueva sala creada:', payload.new.id);
          }
          
          try {
            const { data: users } = await supabase.from('room_users').select('id').eq('room_id', payload.new.id);
            const newRoom = { ...payload.new, user_count: users?.length || 0 } as Room;
            
            setRooms(prevRooms => {
              const exists = prevRooms.some(room => room.id === newRoom.id);
              if (exists) return prevRooms;
              return [newRoom, ...prevRooms];
            });
          } catch (error) {
            // Error silenciado automáticamente
          }
        },
        
        onUpdate: async (payload) => {
          if (import.meta.env.VITE_DEBUG === 'true') {
            console.log('🔄 [Realtime] Sala actualizada:', payload.new.id);
          }
          
          try {
            const { data: users } = await supabase.from('room_users').select('id').eq('room_id', payload.new.id);
            const updatedRoom = { ...payload.new, user_count: users?.length || 0 } as Room;
            
            setRooms(prevRooms => 
              prevRooms.map(room => 
                room.id === updatedRoom.id ? updatedRoom : room
              )
            );
          } catch (error) {
            // Error silenciado automáticamente
          }
        },
        
        onDelete: (payload) => {
          if (import.meta.env.VITE_DEBUG === 'true') {
            console.log('🗑️ [Realtime] Sala eliminada:', payload.old.id);
          }
          setRooms(prevRooms => prevRooms.filter(room => room.id !== payload.old.id));
        },

        // Fallback para cuando tiempo real no funciona
        onData: (data) => {
          if (import.meta.env.VITE_DEBUG === 'true') {
            console.log('🔄 [Fallback] Datos actualizados via polling');
          }
          setRooms(data || []);
        }
      },
      {
        schema: 'public',
        // Query de fallback - mantiene funcionalidad sin tiempo real
        fallbackQuery: async () => {
          const { data: rooms } = await supabase
            .from('rooms')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (!rooms) return [];
          
          // Obtener user_count para cada room de manera segura
          const roomsWithUserCount = await Promise.all(
            rooms.map(async (room) => {
              const { count } = await supabase
                .from('room_users')
                .select('*', { count: 'exact', head: true })
                .eq('room_id', room.id);
              
              return {
                ...room,
                user_count: count || 0
              };
            })
          );
          
          return roomsWithUserCount;
        }
      }
    );

    // Cleanup al desmontar - sistema se limpia automáticamente
    return cleanup;
  }, [authUser]); // Solo re-suscribir cuando cambie el estado de auth

  const handleApply = async () => {
    setLoading(true);
    setError(null);
    
    try {
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
        const roomsWithUserCount = await Promise.all(
          data.map(async (room) => {
            const { data: roomUsers } = await supabase
              .from('room_users')
              .select('user_id')
              .eq('room_id', room.id)
              .limit(3);
            
            const userPreviews = await Promise.all(
              (roomUsers || []).map(async (roomUser) => {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('username, avatar_url')
                  .eq('user_id', roomUser.user_id)
                  .single();
                
                // Only show users who have created profiles
                if (!profile || !profile.username) {
                  return {
                    username: `User_${roomUser.user_id.slice(0, 8)}`,
                    avatar_url: '/default-avatar.png'
                  };
                }
                
                return {
                  username: profile.username,
                  avatar_url: profile.avatar_url || '/default-avatar.png'
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
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFilters(initialFilters);
    setRooms([]);
    setError(null);
  };

  const handleRoomCreated = (room: Room) => {
    setShowCreateModal(false);
    addRoom({ id: room.id, name: room.name, game: room.game });
    handleApply();
  };

  const handleJoinRoom = async (room: Room) => {
    if (!authUser || joiningRoom) return;
    
    setJoiningRoom(room.id);
    
    try {
      console.log('Joining room:', room.id);
      
      // Add to room_users directly (skip profile creation for now)
      const { error: roomError } = await supabase.from('room_users').upsert([
        { 
          room_id: room.id, 
          user_id: authUser.id,
          joined_at: new Date().toISOString()
        }
      ], { onConflict: 'room_id,user_id' });
      
      if (roomError) {
        console.error('Room join error:', roomError);
        throw new Error('Failed to join room');
      }
      
      // Add to pinned rooms
      addRoom({ id: room.id, name: room.name, game: room.game });
      
      // Trigger room count update
      window.dispatchEvent(new CustomEvent('roomUserChanged', { 
        detail: { roomId: room.id } 
      }));
      
      console.log('Successfully joined room:', room.id);
      success('Room Joined!', `You've successfully joined "${room.name}"`);
      playSound('join');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
    } catch (error) {
      console.error('Error joining room:', error);
      showError('Join Failed', 'Failed to join room. Please try again.');
    } finally {
      setJoiningRoom(null);
    }
  };

  const handleCreateRoom = () => {
    console.log('Create room button clicked');
    setShowCreateModal(true);
  };

  // Search functionality
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      // Generate smart suggestions based on existing rooms
      const suggestions = [
        { id: 'game-' + query, text: `${query} games`, category: 'Games', icon: '🎮' },
        { id: 'region-' + query, text: `${query} region`, category: 'Regions', icon: '🌍' },
        { id: 'lang-' + query, text: `${query} language`, category: 'Languages', icon: '💬' },
        { id: 'search-' + query, text: query, category: 'Search', icon: '🔍' }
      ];
      setSearchSuggestions(suggestions);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionSelect = (suggestion: any) => {
    setSearchQuery(suggestion.text);
    // Apply search filter
    const newFilters = { ...filters };
    if (suggestion.category === 'Games') {
      newFilters.game = suggestion.text.replace(' games', '');
    } else if (suggestion.category === 'Regions') {
      newFilters.region = suggestion.text.replace(' region', '');
    } else if (suggestion.category === 'Languages') {
      newFilters.language = suggestion.text.replace(' language', '');
    }
    setFilters(newFilters);
    handleApply();
  };

  const handleRefresh = async () => {
    await handleApply();
  };

  return (
    <SafeArea className="min-h-screen font-inter text-white flex flex-row relative overflow-hidden">
      <ParallaxBackground speed={0.3}>
        <BackgroundParticles />
      </ParallaxBackground>
      
      {/* Compact sidebar - Hidden on mobile */}
      {showSidebar && (
        <div className="w-[240px] glass-surface-strong border-r border-primary-500/20 flex flex-col z-20 animate-slide-in-left shadow-elevated">
          <PinnedRoomsSidebar />
        </div>
      )}
      
      {/* Main content with mobile optimization */}
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="flex-1 flex flex-col items-center relative max-w-full">
          {/* Mobile-optimized header */}
          <div className={`
            w-full flex items-center justify-between z-10 
            ${isMobileDevice ? 'p-4 sticky top-0 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800' : 'absolute top-6 inset-x-6'}
          `}>
            {isMobileDevice && (
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="GameGoUp" className="h-8" />
                <span className="font-bold text-lg text-white">GameGoUp</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 flex-wrap">
              <Tooltip content="Report bugs, request games, or suggest improvements" position="bottom">
                <MobileButton
                  onClick={() => setShowFeedbackModal(true)}
                  variant="outline"
                  size={isMobileDevice ? 'sm' : 'sm'}
                  className="bg-transparent hover:bg-white/5 border-white/20 text-white/80 hover:text-white backdrop-blur-sm"
                >
                  {isMobileDevice ? '💬' : <><MessageCircleIcon size={16} /> Feedback</>}
                </MobileButton>
              </Tooltip>
              
              {/* Social media links - hidden on mobile or condensed */}
              {!isMobileDevice && (
                <>
                  <a
                    href="https://x.com/GameGoUp"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GameGoUp on Twitter"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-none border border-purple-400 text-purple-300 hover:bg-purple-800/40 hover:text-white transition-colors shadow focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                      <path d="M22.162 5.656c-.793.352-1.646.59-2.54.698a4.48 4.48 0 0 0 1.963-2.475 8.93 8.93 0 0 1-2.828 1.08A4.466 4.466 0 0 0 11.07 9.03c0 .35.04.69.115 1.016-3.71-.186-7-1.963-9.197-4.664a4.48 4.48 0 0 0-.604 2.247c0 1.55.79 2.92 2 3.724a4.44 4.44 0 0 1-2.022-.56v.057a4.47 4.47 0 0 0 3.58 4.38c-.19.052-.39.08-.6.08-.146 0-.286-.014-.424-.04.287.89 1.12 1.54 2.11 1.56A8.97 8.97 0 0 1 2 19.54a12.67 12.67 0 0 0 6.88 2.02c8.26 0 12.78-6.84 12.78-12.77 0-.19-.01-.38-.02-.57a9.1 9.1 0 0 0 2.22-2.34z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61578022196836"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GameGoUp on Facebook"
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-none border border-purple-400 text-purple-300 hover:bg-purple-800/40 hover:text-white transition-colors shadow focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                      <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0" />
                    </svg>
                  </a>
                </>
              )}
              <UserMenu />
            </div>
          </div>
          
          {/* Main content area */}
          <div className={`w-full max-w-7xl mx-auto px-6 ${isMobileDevice ? 'pt-4' : 'py-8'}`}>
            
            {/* Logo - Desktop only, mobile has it in header */}
            {!isMobileDevice && (
              <div className="text-center mb-6 mt-4">
                <img src="/logo.png" alt="GameGoUp Logo" className="h-16 mx-auto drop-shadow-[0_0_12px_rgba(167,139,250,0.5)]" />
              </div>
            )}
        
            {/* Profile completion banner */}
            <div className={`w-full ${isMobileDevice ? 'mb-4' : 'max-w-[540px] mx-auto mb-4'}`}>
              <ProfileCompletionBanner />
            </div>
            
            {/* Search section */}
            <div className={`w-full ${isMobileDevice ? 'mb-4' : 'max-w-4xl mx-auto mb-6'}`}>
              <SearchBar
                placeholder="Search rooms, games, regions..."
                suggestions={searchSuggestions}
                onSearch={handleSearch}
                onSuggestionSelect={handleSuggestionSelect}
                loading={isSearching}
                className="animate-fade-in-up"
              />
            </div>

            {/* Professional filters section */}
            <MobileCard className={`w-full ${isMobileDevice ? 'mb-4' : 'max-w-6xl mx-auto mb-4'}`}>
              <GoogleAdSense 
                adSlot="1234567890" 
                adFormat="horizontal"
                position="top"
              />
              <Filters values={filters} onChange={setFilters} onApply={handleApply} onClear={handleClear} />
              <div className="flex justify-end mt-4">
                <MobileButton
                  onClick={handleCreateRoom}
                  variant="primary"
                  size="lg"
                  className="text-lg font-bold"
                >
                  Create New Room
                </MobileButton>
              </div>
            </MobileCard>
        
        {/* Room search results */}
        <div className="w-full max-w-7xl mx-auto">
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonRoomCard key={i} className={`stagger-${(i % 5) + 1}`} />
              ))}
            </div>
          )}
          
          {error && (
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 text-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <div className="text-error mb-2 text-lg font-semibold">Oops! Something went wrong</div>
              <div className="text-secondary-400 text-sm">{error}</div>
            </div>
          )}
          
          {rooms.length === 0 && !loading && !error && (
            <div className="text-center p-12">
              <div className="w-20 h-20 mx-auto mb-6 text-secondary-400 animate-bounce">
                <GamepadIcon size={80} />
              </div>
              <div className="text-secondary-300 text-xl mb-2">No rooms found</div>
              <div className="text-secondary-400 text-sm">Try adjusting your filters or create a new room!</div>
            </div>
          )}
          
          {!loading && rooms.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {rooms.map((room: Room, index) => (
              <div
                key={room.id}
                className={`
                  glass-surface rounded-xl p-6 shadow-professional border border-primary-500/20 
                  flex flex-col gap-3 relative min-h-[180px]
                  hover:glass-surface-light hover:shadow-elevated hover:border-primary-400/40
                  animate-fade-in-up transition-all var(--transition-normal)
                  stagger-${Math.min(index % 6 + 1, 5)}
                  group cursor-pointer
                  hover:transform hover:scale-[1.02]
                `}
              >
                <div className="font-bold text-lg text-primary-300 truncate">{room.name}</div>
                <div className="text-secondary-100 text-sm font-medium">{room.game}</div>
                <div className="text-secondary-300 text-xs">{room.region} | {room.language} {room.country ? `| ${room.country}` : ''}</div>
                {room.description && <div className="text-secondary-400 text-xs line-clamp-2">{room.description}</div>}
                
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
                  <div className="text-secondary-400 text-xs">
                    Created: {new Date(room.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-primary-300 text-xs font-semibold flex items-center gap-1">
                    <UsersIcon size={12} />
                    {room.user_count || 0} users
                  </div>
                </div>
                
                {/* Join/Joined button */}
                {!pinnedRooms.some((r: any) => r.id === room.id) ? (
                  <Tooltip content={`Join "${room.name}" room`} position="left">
                    <Button
                      onClick={() => handleJoinRoom(room)}
                      disabled={joiningRoom === room.id}
                      loading={joiningRoom === room.id}
                      variant="primary"
                      size="sm"
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      {joiningRoom === room.id ? 'Joining...' : 'Join'}
                    </Button>
                  </Tooltip>
                ) : (
                  <Tooltip content="You're already in this room" position="left">
                    <div className="absolute top-4 right-4">
                      <Badge 
                        variant="success" 
                        size="sm"
                        icon={<CheckIcon size={12} />}
                      >
                        Joined
                      </Badge>
                    </div>
                  </Tooltip>
                )}
              </div>
            ))}
            </div>
          )}
        </div>
        
        {/* Modal to create room */}
        {showCreateModal && (
          <CreateRoomModal
            onClose={() => setShowCreateModal(false)}
            onRoomCreated={handleRoomCreated}
          />
        )}
        
        {/* Feedback Modal */}
        {showFeedbackModal && (
          <FeedbackModal
            onClose={() => setShowFeedbackModal(false)}
          />
        )}
        </div>
        </div>
      </PullToRefresh>
      
      <Footer />
      
      {/* Mobile FAB - only show when not using bottom nav */}
      {isMobile && !useBottomNav && (
        <FloatingActionButton
          onClick={handleCreateRoom}
          className="animate-scale-in"
        />
      )}

      {/* Mobile Navigation - legacy, replaced by bottom nav */}
      {isMobile && !useBottomNav && (
        <MobileNavigation onCreateRoom={handleCreateRoom} />
      )}

      {/* Toast notifications */}
      <ToastContainer />
      
      {/* Confetti celebration */}
      <Confetti active={showConfetti} />
    </SafeArea>
  );
};

export default Home;