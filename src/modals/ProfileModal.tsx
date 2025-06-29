import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import GlareHover from '../components/GlareHover';
import PrivateMessageModal from './PrivateMessageModal';
// You must create this JSON file with the structure { "Country": ["City1", "City2", ...], ... }
// Example: { "Argentina": ["Buenos Aires", "Córdoba"], "Mexico": ["Mexico City", "Guadalajara"] }
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
  
  // Debug logs (removed for production)
  // The modal starts in read-only mode if userId is present
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
  const [gender, setGender] = useState('');
  const [sexualOrientation, setSexualOrientation] = useState('');
  const [connectionTypes, setConnectionTypes] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Reinforces: clear local states when closing the modal
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

  // Always fetch fresh data from database to ensure persistence
  const fetchProfile = async () => {
    const id = userId || authUser?.id;
    if (!id) return;
    
    try {
      console.log('Fetching profile for user:', id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', id)
        .single();
      
      if (error) {
        console.error('Error fetching profile for user', id, ':', error);
        // If profile doesn't exist, show placeholder indicating no profile
        if (error.code === 'PGRST116') {
          console.log('No profile found for user:', id);
          setUsername('Profile not created');
          setAvatarUrl('/default-avatar.png');
          setBio('This user has not created a profile yet.');
          setError('This user has not created a profile yet.');
        } else {
          setError('Error loading profile: ' + error.message);
        }
        return;
      }
      
      if (data) {
        console.log('Profile loaded:', data);
        populateFields(data);
      }
    } catch (error) {
      console.error('Exception fetching profile:', error);
    }
  };
  
  const populateFields = (data: any) => {
    setAvatarUrl(data.avatar_url || '');
    setBio(data.bio || '');
    setBirthdate(data.birthdate || '');
    setCountry(data.country || '');
    setCity(data.city || '');
    setGameTags(data.game_tags ? data.game_tags.split(',').filter(Boolean) : []);
    setSteamCode(data.steam_code || '');
    try {
      setSocialLinks(data.social_links ? JSON.parse(data.social_links) : []);
    } catch {
      setSocialLinks([]);
    }
    setEmail(data.email || '');
    setUsername(data.username || '');
    setCreatedAt(data.created_at || '');
    setGender(data.gender || '');
    setSexualOrientation(data.sexual_orientation || '');
    setConnectionTypes(data.connection_types || []);
    setInterests(data.interests || []);
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, [userId, authUser, selfProfile]);

  const handleSave = async () => {
    if (!authUser) {
      setError('User not authenticated');
      return;
    }
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // Prepare all data for saving (excluding email as it's not in profiles table)
      const profileData = {
        user_id: authUser.id,
        username: username || authUser.email?.split('@')[0] || 'User',
        avatar_url: avatarUrl || null,
        bio: bio || null,
        birthdate: birthdate || null,
        country: country || null,
        city: city || null,
        game_tags: gameTags.length > 0 ? gameTags.join(',') : null,
        steam_code: steamCode || null,
        social_links: socialLinks.length > 0 ? JSON.stringify(socialLinks) : null,
        gender: gender || null,
        sexual_orientation: sexualOrientation || null,
        connection_types: connectionTypes.length > 0 ? connectionTypes : null,
        interests: interests.length > 0 ? interests : null
      };
      
      console.log('Saving profile data:', profileData);
      
      // Use upsert to ensure data is saved even if profile doesn't exist
      const { error: updateError, data: savedData } = await supabase
        .from('profiles')
        .upsert(profileData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();
      
      if (updateError) {
        console.error('Profile save error:', updateError);
        setError(`Error saving profile: ${updateError.message}`);
      } else {
        console.log('Profile saved successfully:', savedData);
        setSuccess('Profile saved successfully!');
        setEditMode(false);
        
        // Update context with saved data
        if (isSelf && setProfile && savedData) {
          setProfile(savedData);
        }
        
        // Refresh local state with confirmed saved data
        await fetchProfile();
      }
    } catch (error) {
      console.error('Exception saving profile:', error);
      setError('Unexpected error saving profile');
    } finally {
      setLoading(false);
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

  // Default avatars (add more names if you have more images)
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#18122B]/90 backdrop-blur-md rounded-2xl p-8 w-full max-w-lg shadow-2xl text-white flex flex-col items-stretch font-inter relative border border-purple-400/30">
        {/* Avatar and name */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <img src={avatarUrl || '/default-avatar.png'} alt="avatar" className="w-28 h-28 rounded-full border-4 border-purple-400 object-cover bg-[#18122B]" />
            {/* The button and input for uploading custom avatar are removed */}
          </div>
          {/* Default avatar gallery */}
          {isSelf && editMode && (
            <div className="flex gap-2 mt-4 flex-wrap justify-center">
              {defaultAvatars.map((src) => (
                <button
                  key={src}
                  type="button"
                  className={`w-12 h-12 rounded-full border-2 ${avatarUrl === src ? 'border-green-400 ring-2 ring-green-400' : 'border-purple-700'} overflow-hidden focus:outline-none transition-all`}
                  onClick={() => { setAvatarUrl(src); }}
                  aria-label="Choose default avatar"
                >
                  <img src={src} alt="default avatar" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="mt-3 text-2xl font-bold text-purple-200">{username}</div>
          <div className="text-sm text-purple-400">{email}</div>
          <div className="text-xs text-gray-400 mt-1">Member since {createdAt ? new Date(createdAt).toLocaleDateString() : ''}</div>
        </div>
        {/* Profile fields */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-purple-300 mb-1" htmlFor="birthdate">Date of birth</label>
              <input id="birthdate" type="date" className="w-full px-3 py-2 rounded bg-[#221b3a] border border-purple-700 text-white" value={birthdate} onChange={e => setBirthdate(e.target.value)} disabled={!isSelf || !editMode} title="Date of birth" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-purple-300 mb-1" htmlFor="country">Country</label>
              <select id="country" className="w-full px-3 py-2 rounded bg-[#221b3a] border border-purple-700 text-white" value={country} onChange={e => { setCountry(e.target.value); setCity(''); }} disabled={!isSelf || !editMode} title="Country">
                <option value="">Select country</option>
                {countryList.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-purple-300 mb-1" htmlFor="city">City</label>
              <select id="city" className="w-full px-3 py-2 rounded bg-[#221b3a] border border-purple-700 text-white" value={city} onChange={e => setCity(e.target.value)} disabled={!isSelf || !editMode || !country} title="City">
                <option value="">Select city</option>
                {cityList.map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {/* Game tags */}
          <div>
            <label className="block text-xs text-purple-300 mb-1">Favorite games</label>
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
                  <input type="text" className="bg-[#221b3a] border border-purple-700 rounded px-2 py-1 text-xs text-white w-28" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }} placeholder="Add game" title="Add game" />
                  <button type="button" className="bg-purple-700 text-white rounded px-2 py-1 text-xs ml-1" onClick={handleAddTag}>+</button>
                </>
              )}
            </div>
          </div>
          {/* Bio */}
          <div>
            <label className="block text-xs text-purple-300 mb-1" htmlFor="bio">Biography</label>
            <textarea id="bio" className="w-full px-3 py-2 rounded bg-[#221b3a] border border-purple-700 text-white" maxLength={240} value={bio} onChange={e => setBio(e.target.value)} disabled={!isSelf || !editMode} placeholder="Tell us about yourself..." title="Biography" />
            <div className="text-xs text-gray-400 text-right">{bio.length}/240</div>
          </div>
          {/* Steam code */}
          <div>
            <label className="block text-xs text-purple-300 mb-1" htmlFor="steamCode">Steam friend code</label>
            <input id="steamCode" type="text" className="w-full px-3 py-2 rounded bg-[#221b3a] border border-purple-700 text-white" value={steamCode} onChange={e => setSteamCode(e.target.value)} disabled={!isSelf || !editMode} placeholder="Ex: 123456789" title="Steam friend code" />
          </div>
          {/* Social Preferences */}
          <div>
            <label className="block text-xs text-purple-300 mb-1">Gender (optional)</label>
            <select className="w-full px-3 py-2 rounded bg-[#221b3a] border border-purple-700 text-white" value={gender} onChange={e => setGender(e.target.value)} disabled={!isSelf || !editMode}>
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-purple-300 mb-1">Sexual orientation (optional)</label>
            <select className="w-full px-3 py-2 rounded bg-[#221b3a] border border-purple-700 text-white" value={sexualOrientation} onChange={e => setSexualOrientation(e.target.value)} disabled={!isSelf || !editMode}>
              <option value="">Prefer not to say</option>
              <option value="heterosexual">Heterosexual</option>
              <option value="homosexual">Homosexual</option>
              <option value="bisexual">Bisexual</option>
              <option value="pansexual">Pansexual</option>
              <option value="asexual">Asexual</option>
              <option value="demisexual">Demisexual</option>
              <option value="queer">Queer</option>
              <option value="questioning">Questioning</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-purple-300 mb-1">Looking for connections</label>
            <div className="flex flex-wrap gap-2">
              {[{id: 'gaming', label: 'Gaming Partners'}, {id: 'chat', label: 'Chat Friends'}, {id: 'both', label: 'Both'}].map(type => (
                <label key={type.id} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={connectionTypes.includes(type.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConnectionTypes([...connectionTypes, type.id]);
                      } else {
                        setConnectionTypes(connectionTypes.filter(t => t !== type.id));
                      }
                    }}
                    disabled={!isSelf || !editMode}
                    className="accent-purple-500"
                  />
                  <span className="text-xs text-white">{type.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-purple-300 mb-1">Additional interests</label>
            <div className="flex flex-wrap gap-2">
              {['Anime', 'Music', 'Movies', 'Art', 'Books', 'Sports', 'Travel', 'Tech'].map(interest => (
                <label key={interest} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={interests.includes(interest)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setInterests([...interests, interest]);
                      } else {
                        setInterests(interests.filter(i => i !== interest));
                      }
                    }}
                    disabled={!isSelf || !editMode}
                    className="accent-purple-500"
                  />
                  <span className="text-xs text-white">{interest}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Social links */}
          <div>
            <label className="block text-xs text-purple-300 mb-1">Social networks</label>
            <div className="flex flex-col gap-2">
              {socialLinks.map((s) => (
                <div key={s.id} className="flex gap-2 items-center">
                  <select className="bg-[#221b3a] border border-purple-700 rounded px-2 py-1 text-xs text-white" value={s.type} onChange={e => handleSocialChange(s.id, 'type', e.target.value)} disabled={!isSelf || !editMode} title="Social network type">
                    <option value="">Type</option>
                    {socialTypes.map(st => <option key={st.type} value={st.type}>{st.label}</option>)}
                  </select>
                  <input type="text" className="bg-[#221b3a] border border-purple-700 rounded px-2 py-1 text-xs text-white flex-1" value={s.url} onChange={e => handleSocialChange(s.id, 'url', e.target.value)} disabled={!isSelf || !editMode} placeholder="Link or username" title="Link or username" />
                  {isSelf && editMode && (
                    <button type="button" className="text-red-400 hover:text-red-200 text-lg" onClick={() => handleRemoveSocial(s.id)} aria-label="Remove social">&times;</button>
                  )}
                </div>
              ))}
              {isSelf && editMode && (
                <button type="button" className="bg-purple-700 text-white rounded px-3 py-1 text-xs mt-1 self-start" onClick={handleAddSocial}>+ Add social network</button>
              )}
            </div>
          </div>
        </div>
        {/* Action buttons for other users */}
        {!isSelf && userId && authUser && (
          <div className="flex gap-3 mt-6">
            <button 
              onClick={async () => {
                console.log('🤝 ADD FRIEND CLICKED!');
                
                if (!authUser || !userId) {
                  setError('Missing user data');
                  return;
                }
                
                try {
                  const { error } = await supabase.from('friend_requests').insert({
                    sender_id: authUser.id,
                    receiver_id: userId,
                    status: 'pending'
                  });
                  
                  if (error) {
                    console.error('Friend request error:', error);
                    setError('Error: ' + error.message);
                  } else {
                    console.log('Friend request sent successfully!');
                    setSuccess('✅ Friend request sent!');
                  }
                } catch (error) {
                  console.error('Friend request exception:', error);
                  setError('❌ Failed to send friend request');
                }
              }}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              🤝 Add Friend
            </button>
            
            <button 
              onClick={async () => {
                console.log('💬 MESSAGE CLICKED!');
                
                if (!authUser || !userId) {
                  setError('Missing user data');
                  return;
                }
                
                try {
                  // Check if conversation exists
                  const { data: existing, error: findError } = await supabase
                    .from('private_conversations')
                    .select('id')
                    .or(`and(user1_id.eq.${authUser.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${authUser.id})`)
                    .maybeSingle();
                  
                  if (findError) {
                    console.error('Error finding conversation:', findError);
                  }
                  
                  if (!existing) {
                    console.log('Creating new conversation...');
                    // Create new conversation
                    const { error } = await supabase
                      .from('private_conversations')
                      .insert({
                        user1_id: authUser.id,
                        user2_id: userId,
                        last_message_at: new Date().toISOString()
                      });
                    
                    if (error) {
                      console.error('Error creating conversation:', error);
                      setError('❌ Error: ' + error.message);
                      return;
                    }
                    console.log('New conversation created!');
                  } else {
                    console.log('Existing conversation found:', existing);
                  }
                  
                  setSuccess('✅ Opening private message...');
                  setTimeout(() => {
                    setShowMessageModal(true);
                  }, 500);
                } catch (error) {
                  console.error('Message exception:', error);
                  setError('❌ Failed to start conversation');
                }
              }}
              className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-green-600 hover:to-teal-600 transition-all"
            >
              💬 Message
            </button>
          </div>
        )}
        
        {/* Actions */}
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
      
      {/* Private Message Modal */}
      {showMessageModal && userId && (
        <PrivateMessageModal
          onClose={() => setShowMessageModal(false)}
          otherUserId={userId}
          otherUsername={username || 'User'}
        />
      )}
    </div>
  );
};

export default ProfileModal;
