import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
// Debes crear este archivo JSON con la estructura { "País": ["Ciudad1", "Ciudad2", ...], ... }
// Ejemplo: { "Argentina": ["Buenos Aires", "Córdoba"], "México": ["CDMX", "Guadalajara"] }
import countriesDataRaw from '../assets/countries_cities.json';

// Ajuste de tipo para evitar error de indexación dinámica
type CountriesDataType = Record<string, string[]>;
const countriesData: CountriesDataType = countriesDataRaw as CountriesDataType;

interface SocialLink {
  id: string;
  type: string;
  url: string;
}

interface ProfileModalProps {
  onClose: () => void;
  userId?: string;
}

const socialTypes = [
  { type: 'discord', label: 'Discord' },
  { type: 'twitter', label: 'Twitter' },
  { type: 'twitch', label: 'Twitch' },
  { type: 'youtube', label: 'YouTube' },
  { type: 'steam', label: 'Steam' },
  { type: 'custom', label: 'Other' },
];

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, userId }) => {
  const { authUser, profile: selfProfile, setProfile } = useUser();
  const isSelf = !userId || userId === authUser?.id;
  // El modal inicia en modo solo lectura si userId está presente
  const [editMode, setEditMode] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [gameTags, setGameTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [steamCode, setSteamCode] = useState('');
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Refuerza: limpiar estados locales al cerrar el modal
  const handleClose = () => {
    setEditMode(false);
    setAvatarUrl('');
    setBio('');
    setBirthdate('');
    setCountry('');
    setCity('');
    setGameTags([]);
    setNewTag('');
    setSteamCode('');
    setSocialLinks([]);
    setEmail('');
    setUsername('');
    setCreatedAt('');
    setError('');
    setSuccess('');
    setLoading(false);
    onClose();
  };

  // Refuerza: recarga siempre el perfil más reciente tras guardar
  const fetchProfile = async () => {
    const id = userId || authUser?.id;
    if (!id) return;
    let data;
    if (isSelf && selfProfile) {
      data = selfProfile;
    } else {
      const { data: fetched } = await supabase.from('profiles').select('*').eq('user_id', id).single();
      data = fetched;
    }
    if (data) {
      setAvatarUrl(data.avatar_url || '');
      setBio(data.bio || '');
      setBirthdate(data.birthdate || '');
      setCountry(data.country || '');
      setCity(data.city || '');
      setGameTags(data.game_tags ? data.game_tags.split(',') : []);
      setSteamCode(data.steam_code || '');
      setSocialLinks(data.social_links ? JSON.parse(data.social_links) : []);
      setEmail(data.email || '');
      setUsername(data.username || '');
      setCreatedAt(data.created_at || '');
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, [userId, authUser, selfProfile]);

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    let uploadedAvatarUrl = avatarUrl;
    const { error: updateError } = await supabase.from('profiles').update({
      avatar_url: uploadedAvatarUrl,
      bio,
      birthdate: birthdate === '' ? null : birthdate,
      country,
      city,
      game_tags: gameTags.join(','),
      steam_code: steamCode,
      social_links: JSON.stringify(socialLinks),
    }).eq('user_id', authUser.id);
    setLoading(false);
    if (updateError) {
      setError(updateError.message || 'Error updating profile.');
    } else {
      setSuccess('Profile updated!');
      setEditMode(false);
      // Refuerza: recarga el perfil actualizado desde Supabase y actualiza el contexto
      const { data: updated } = await supabase.from('profiles').select('*').eq('user_id', authUser.id).single();
      if (isSelf && setProfile && updated) {
        setProfile(updated);
      }
      // Refresca el estado local con los datos más recientes
      if (updated) {
        setAvatarUrl(updated.avatar_url || '');
        setBio(updated.bio || '');
        setBirthdate(updated.birthdate || '');
        setCountry(updated.country || '');
        setCity(updated.city || '');
        setGameTags(updated.game_tags ? updated.game_tags.split(',') : []);
        setSteamCode(updated.steam_code || '');
        setSocialLinks(updated.social_links ? JSON.parse(updated.social_links) : []);
        setEmail(updated.email || '');
        setUsername(updated.username || '');
        setCreatedAt(updated.created_at || '');
      }
    }
  };

  const countryList = Object.keys(countriesData);
  const cityList = country ? countriesData[country] : [];

  const handleAddSocial = () => {
    setSocialLinks([...socialLinks, { id: Date.now().toString(), type: '', url: '' }]);
  };
  const handleSocialChange = (id: string, field: 'type' | 'url', value: string) => {
    setSocialLinks(socialLinks.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  const handleRemoveSocial = (id: string) => {
    setSocialLinks(socialLinks.filter(s => s.id !== id));
  };

  const handleAddTag = () => {
    if (newTag && !gameTags.includes(newTag)) {
      setGameTags([...gameTags, newTag]);
      setNewTag('');
    }
  };
  const handleRemoveTag = (tag: string) => {
    setGameTags(gameTags.filter(t => t !== tag));
  };

  // Avatares por defecto (agrega más nombres si tienes más imágenes)
  const defaultAvatars = [
    '/avatars/avatar1.png',
    '/avatars/avatar2.png',
    '/avatars/avatar3.png',
    '/avatars/avatar4.png',
    '/avatars/avatar5.png',
    '/avatars/avatar6.png',
    '/avatars/avatar7.png',
    '/avatars/avatar8.png',
    '/avatars/avatar9.png',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#18122B] rounded-2xl p-8 w-full max-w-lg shadow-2xl text-white flex flex-col items-stretch font-inter relative">
        {/* Avatar y nombre */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <img src={avatarUrl || '/default-avatar.png'} alt="avatar" className="w-28 h-28 rounded-full border-4 border-purple-400 object-cover bg-[#18122B]" />
            {/* Se elimina el botón y el input para subir avatar personalizado */}
          </div>
          {/* Galería de avatares por defecto */}
          {isSelf && editMode && (
            <div className="flex gap-2 mt-4 flex-wrap justify-center">
              {defaultAvatars.map((src) => (
                <button
                  key={src}
                  type="button"
                  className={`w-12 h-12 rounded-full border-2 ${avatarUrl === src ? 'border-green-400 ring-2 ring-green-400' : 'border-purple-700'} overflow-hidden focus:outline-none transition-all`}
                  onClick={() => { setAvatarUrl(src); }}
                  aria-label="Elegir avatar por defecto"
                >
                  <img src={src} alt="default avatar" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="mt-3 text-2xl font-bold text-purple-200">{username}</div>
          <div className="text-sm text-purple-400">{email}</div>
          <div className="text-xs text-gray-400 mt-1">Miembro desde {createdAt ? new Date(createdAt).toLocaleDateString() : ''}</div>
        </div>
        {/* Campos de perfil */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-purple-300 mb-1" htmlFor="birthdate">Fecha de nacimiento</label>
              <input id="birthdate" type="date" className="w-full px-3 py-2 rounded bg-[#221b3a] border border-purple-700 text-white" value={birthdate} onChange={e => setBirthdate(e.target.value)} disabled={!isSelf || !editMode} title="Fecha de nacimiento" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-purple-300 mb-1" htmlFor="country">País</label>
              <select id="country" className="w-full px-3 py-2 rounded bg-[#221b3a] border border-purple-700 text-white" value={country} onChange={e => { setCountry(e.target.value); setCity(''); }} disabled={!isSelf || !editMode} title="País">
                <option value="">Selecciona país</option>
                {countryList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-purple-300 mb-1" htmlFor="city">Ciudad</label>
              <select id="city" className="w-full px-3 py-2 rounded bg-[#221b3a] border border-purple-700 text-white" value={city} onChange={e => setCity(e.target.value)} disabled={!isSelf || !editMode || !country} title="Ciudad">
                <option value="">Selecciona ciudad</option>
                {cityList.map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {/* Game tags */}
          <div>
            <label className="block text-xs text-purple-300 mb-1">Juegos favoritos</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {gameTags.map(tag => (
                <span key={tag} className="bg-purple-800 text-purple-200 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                  {tag}
                  {isSelf && editMode && (
                    <button type="button" className="ml-1 text-red-400 hover:text-red-200" onClick={() => handleRemoveTag(tag)} aria-label="Remove tag">&times;</button>
                  )}
                </span>
              ))}
              {isSelf && editMode && (
                <>
                  <input type="text" className="bg-[#221b3a] border border-purple-700 rounded px-2 py-1 text-xs text-white w-28" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }} placeholder="Agregar juego" title="Agregar juego" />
                  <button type="button" className="bg-purple-700 text-white rounded px-2 py-1 text-xs ml-1" onClick={handleAddTag}>+</button>
                </>
              )}
            </div>
          </div>
          {/* Bio */}
          <div>
            <label className="block text-xs text-purple-300 mb-1" htmlFor="bio">Biografía</label>
            <textarea id="bio" className="w-full px-3 py-2 rounded bg-[#221b3a] border border-purple-700 text-white" maxLength={240} value={bio} onChange={e => setBio(e.target.value)} disabled={!isSelf || !editMode} placeholder="Cuéntanos sobre ti..." title="Biografía" />
            <div className="text-xs text-gray-400 text-right">{bio.length}/240</div>
          </div>
          {/* Steam code */}
          <div>
            <label className="block text-xs text-purple-300 mb-1" htmlFor="steamCode">Código amigo de Steam</label>
            <input id="steamCode" type="text" className="w-full px-3 py-2 rounded bg-[#221b3a] border border-purple-700 text-white" value={steamCode} onChange={e => setSteamCode(e.target.value)} disabled={!isSelf || !editMode} placeholder="Ej: 123456789" title="Código amigo de Steam" />
          </div>
          {/* Social links */}
          <div>
            <label className="block text-xs text-purple-300 mb-1">Redes sociales</label>
            <div className="flex flex-col gap-2">
              {socialLinks.map((s) => (
                <div key={s.id} className="flex gap-2 items-center">
                  <select className="bg-[#221b3a] border border-purple-700 rounded px-2 py-1 text-xs text-white" value={s.type} onChange={e => handleSocialChange(s.id, 'type', e.target.value)} disabled={!isSelf || !editMode} title="Tipo de red social">
                    <option value="">Tipo</option>
                    {socialTypes.map(st => <option key={st.type} value={st.type}>{st.label}</option>)}
                  </select>
                  <input type="text" className="bg-[#221b3a] border border-purple-700 rounded px-2 py-1 text-xs text-white flex-1" value={s.url} onChange={e => handleSocialChange(s.id, 'url', e.target.value)} disabled={!isSelf || !editMode} placeholder="Enlace o usuario" title="Enlace o usuario" />
                  {isSelf && editMode && (
                    <button type="button" className="text-red-400 hover:text-red-200 text-lg" onClick={() => handleRemoveSocial(s.id)} aria-label="Remove social">&times;</button>
                  )}
                </div>
              ))}
              {isSelf && editMode && (
                <button type="button" className="bg-purple-700 text-white rounded px-3 py-1 text-xs mt-1 self-start" onClick={handleAddSocial}>+ Agregar red social</button>
              )}
            </div>
          </div>
        </div>
        {/* Acciones */}
        <div className="flex gap-3 mt-8 justify-end">
          {isSelf && !editMode && (
            <button className="bg-gradient-to-r from-purple-400 to-purple-300 text-[#18122B] font-bold px-6 py-2 rounded-xl shadow hover:from-purple-500 hover:to-purple-400" onClick={() => setEditMode(true)}>Edit Profile</button>
          )}
          {isSelf && editMode && (
            <>
              <button className="bg-gradient-to-r from-green-400 to-green-300 text-[#18122B] font-bold px-6 py-2 rounded-xl shadow hover:from-green-500 hover:to-green-400" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
              <button className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold px-6 py-2 rounded-xl shadow" onClick={() => setEditMode(false)} disabled={loading}>Cancel</button>
            </>
          )}
          <button className="bg-none border border-purple-400 text-purple-300 font-bold px-6 py-2 rounded-xl shadow" onClick={handleClose}>Close</button>
        </div>
        {error && <div className="text-red-400 text-sm mt-2">{error}</div>}
        {success && <div className="text-green-400 text-sm mt-2">{success}</div>}
      </div>
    </div>
  );
};

export default ProfileModal;
