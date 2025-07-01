import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import { usePinnedRoomsStore } from '../store/pinnedRoomsStore';
import { games, regions, languages, countries, maxPlayersOptions, systems } from '../lib/roomOptions';

interface CreateRoomModalProps {
  onClose: () => void;
  onRoomCreated?: (room: any) => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ onClose, onRoomCreated }) => {
  const { authUser } = useUser();
  const addRoom = usePinnedRoomsStore(state => state.addRoom);
  const [name, setName] = useState('');
  const [game, setGame] = useState('');
  const [region, setRegion] = useState('');
  const [language, setLanguage] = useState('');
  const [country, setCountry] = useState('');
  const [maxPlayers, setMaxPlayers] = useState<number | ''>('');
  const [system, setSystem] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !game.trim() || !region.trim() || !maxPlayers || !system.trim()) {
      setError('Room name, game, region, system, and max players are required.');
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    const realUserId = userData?.user?.id;
    if (!realUserId) {
      setError('You must be logged in.');
      return;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (typeof realUserId !== 'string' || !uuidRegex.test(realUserId)) {
      setError('User ID is invalid. Please re-login.');
      return;
    }
    setLoading(true);
    const { data: room, error: errRoom } = await supabase.from('rooms').insert({
      name,
      game,
      region,
      language,
      country,
      max_players: maxPlayers,
      owner_id: realUserId,
      system // Add system to room creation
    }).select().single();
    if (errRoom || !room) {
      setError('Supabase: ' + (errRoom?.message || 'Unknown error'));
      setLoading(false);
      return;
    }
    // Ensure profile exists first
    await supabase.from('profiles').upsert([
      {
        user_id: realUserId,
        username: authUser?.email?.split('@')[0] || 'User'
      }
    ], { onConflict: 'user_id' });
    
    // Add user to room with retry logic
    let userAdded = false;
    let attempts = 0;
    
    while (!userAdded && attempts < 3) {
      const { error: userError, data: userData } = await supabase
        .from('room_users')
        .insert({
          room_id: room.id,
          user_id: realUserId,
          is_owner: true
        })
        .select();
      
      if (!userError && userData) {
        console.log('Room creator added successfully:', userData);
        userAdded = true;
        // Trigger room count update
        window.dispatchEvent(new CustomEvent('roomUserChanged', { detail: { roomId: room.id } }));
      } else {
        attempts++;
        console.error(`Attempt ${attempts} failed:`, userError);
        if (attempts >= 3) {
          setError('Error adding user to room: ' + userError?.message);
          setLoading(false);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log(`Room created successfully: ${room.name} (${room.id})`);
    setLoading(false);
    if (onRoomCreated) onRoomCreated(room);
    addRoom({ id: room.id, name: room.name, game: room.game });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000]">
      <div className="bg-[#281e46]/[0.97] rounded-2xl p-8 min-w-[320px] max-w-[400px] w-[90vw] shadow-lg text-white flex flex-col items-stretch font-sans">
        <h2 className="text-purple-300 font-bold text-2xl mb-3">Create Room</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Room name"
            className="px-3 py-2 rounded-lg border-2 border-purple-500 bg-[#281e46]/[0.85] text-white text-base outline-none focus:ring-2 focus:ring-purple-400"
            maxLength={32}
            required
            aria-label="Room name"
          />
          <select
            value={game}
            onChange={e => setGame(e.target.value)}
            className="px-3 py-2 rounded-lg border-2 border-purple-500 bg-[#281e46]/[0.85] text-white text-base"
            required
            aria-label="Game"
          >
            <option value="">Select game</option>
            {games.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select
            value={system}
            onChange={e => setSystem(e.target.value)}
            className="px-3 py-2 rounded-lg border-2 border-blue-500 bg-[#1e2a46]/[0.85] text-white text-base"
            required
            aria-label="System"
          >
            <option value="">Select system</option>
            {systems.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={region}
            onChange={e => setRegion(e.target.value)}
            className="px-3 py-2 rounded-lg border-2 border-purple-500 bg-[#281e46]/[0.85] text-white text-base"
            required
            aria-label="Region"
          >
            <option value="">Select region</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="px-3 py-2 rounded-lg border-2 border-purple-500 bg-[#281e46]/[0.85] text-white text-base"
            aria-label="Language"
          >
            <option value="">Select language (optional)</option>
            {languages.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="px-3 py-2 rounded-lg border-2 border-purple-500 bg-[#281e46]/[0.85] text-white text-base"
            aria-label="Country"
          >
            <option value="">Select country (optional)</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={maxPlayers}
            onChange={e => setMaxPlayers(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border-2 border-purple-500 bg-[#281e46]/[0.85] text-white text-base"
            required
            aria-label="Max players"
          >
            <option value="">Max players</option>
            {maxPlayersOptions.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg font-bold text-base bg-gradient-to-r from-purple-400 to-purple-300 text-[#18122B] border-none cursor-pointer mt-2 disabled:opacity-70"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </form>
        <button
          onClick={onClose}
          className="mt-4 px-5 py-2 rounded-lg font-semibold text-base bg-none text-purple-300 border-2 border-purple-300 cursor-pointer self-center hover:bg-purple-900/30 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateRoomModal;
