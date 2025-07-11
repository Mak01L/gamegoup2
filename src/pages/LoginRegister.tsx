import React, { useState } from 'react';
import { supabase, reinitSupabaseClient } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import ProfileModal from '../modals/ProfileModal';
import SimpleBackgroundParticles from '../components/SimpleBackgroundParticles';
import ShinyText from '../components/ShinyText';
import GlareHover from '../components/GlareHover';
import GoogleAdSense from '../components/GoogleAdSense';

// Add Inter font to the document head
if (!document.getElementById('inter-font')) {
  const link = document.createElement('link');
  link.id = 'inter-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap';
  document.head.appendChild(link);
}

// Add Material Icons for input icons
if (!document.getElementById('material-icons')) {
  const link = document.createElement('link');
  link.id = 'material-icons';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
  document.head.appendChild(link);
}

const violets = {
  main: '#A78BFA',
  accent: '#7C5CFA',
  neon: '#C084FC',
  dark: '#6D28D9',
  bg: '#18122B',
  card: 'rgba(40,30,70,0.55)',
  border: '#7C5CFA',
  input: 'rgba(34,27,58,0.95)',
  glow: '#F3E8FF',
  error: '#F87171',
  success: '#C084FC',
  gray: '#bdbdbd',
  text: '#F3E8FF',
};

const glass = {
  background: 'rgba(40,30,70,0.55)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1.5px solid rgba(167,139,250,0.25)',
};

const LoginRegister: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [focusField, setFocusField] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [forceProfileUserId, setForceProfileUserId] = useState<string|null>(null);
  const { setAuthUser, setProfile } = useUser();
  const navigate = useNavigate();

  // Login handler
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    // Safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Login timeout. Please try again.');
    }, 10000); // 10 seconds timeout
    
    try {
      const form = e.currentTarget;
      const email = (form.elements.namedItem('email') as HTMLInputElement).value;
      const password = (form.elements.namedItem('password') as HTMLInputElement).value;
      const remember = (form.elements.namedItem('remember') as HTMLInputElement)?.checked;
      
      // Always persist sessions now
      await supabase.auth.signOut();
      
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (loginError) {
        setError(loginError.message);
        setLoading(false);
        return;
      }
      
      // Set user and redirect immediately
      if (data.user) {
        setAuthUser(data.user);
        setSuccess('Login successful! Redirecting...');
        setLoading(false);
        
        // Load profile asynchronously without blocking
        setTimeout(async () => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', data.user.id)
              .single();
            
            if (profile) {
              setProfile(profile);
            }
          } catch (error) {
            console.log('Profile not found, will be created later');
          }
        }, 100);
        
        setTimeout(() => navigate('/'), 800);
      } else {
        setError('Login failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
      setLoading(false);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // Register handler
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    const form = e.currentTarget;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value;
    if (password !== confirm) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    // Sign up with Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    // Do not create profile here. Only show confirmation message.
    setLoading(false);
    setSuccess('Registration successful! Check your email (including spam) to activate your account. Once confirmed, log in to create your profile.');
    // Do not redirect automatically, let the user confirm and then log in.
  };

  // Forgot password handler
  const handleForgotPassword = async (email: string) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) setError(error.message);
    else setSuccess('Password reset email sent! Check your inbox.');
  };

  // Handler to create profile after login if missing
  const handleCreateProfile = async () => {
    setProfileLoading(true);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      setError('User not found.');
      setProfileLoading(false);
      return;
    }
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: user.id,
        username: newUsername,
      },
    ]);
    setProfileLoading(false);
    if (profileError) {
      setError('Failed to create profile: ' + profileError.message);
    } else {
      setShowProfileModal(false);
      setSuccess('Profile created! Redirecting...');
      setTimeout(() => navigate('/'), 1200);
    }
  };

  // Removed session restore useEffect, now handled by UserProvider

  // --- UI ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#18122B] via-[#6D28D9] to-[#A78BFA] font-inter p-4 text-[#F3E8FF] relative overflow-hidden">
      <SimpleBackgroundParticles />
      {/* Futuristic Glow Effects */}
      <div className="absolute -top-10 -left-10 w-[400px] h-[400px] opacity-50 z-0 blur-3xl bg-[radial-gradient(circle,_#C084FC_0%,_transparent_70%)]" />
      <div className="absolute -bottom-10 -right-10 w-[400px] h-[400px] opacity-40 z-0 blur-3xl bg-[radial-gradient(circle,_#A78BFA_0%,_transparent_70%)]" />
      {/* Top AdSense Banner */}
      <div className="w-full max-w-4xl mb-6 z-20 flex justify-center">
        <GoogleAdSense 
          adSlot="1234567890"
          position="top"
        />
      </div>
      
      {/* Header */}
      <div className="mb-6 text-center z-20">
        <img src="/logo.png" alt="GameGoUp Logo" className="h-16 mx-auto mb-3 drop-shadow-[0_0_12px_rgba(167,139,250,0.5)]" />
        <p className="text-base text-[#A78BFA] font-medium m-0 drop-shadow-[0_0_4px_rgba(167,139,250,0.3)]">
          Connect, play, win. The easiest way to build your team.
        </p>
      </div>
      {/* Card */}
      <div className="w-full max-w-sm rounded-2xl p-6 flex flex-col items-stretch z-20 bg-[rgba(40,30,70,0.55)] shadow-2xl border border-[#7C5CFA]/25 backdrop-blur-lg">
        <div className="flex w-full mb-6" role="tablist" aria-label="Login or Register">
          <button
            role="tab"
            aria-selected={isLogin ? "true" : "false"}
            tabIndex={isLogin ? 0 : -1}
            className={`flex-1 py-3 rounded-tl-xl rounded-bl-xl font-semibold text-base transition-all outline-none ${isLogin ? 'bg-gradient-to-r from-[#C084FC] to-[#A78BFA] text-[#18122B] shadow-[0_0_16px_0_#C084FC] drop-shadow-[0_0_8px_#F3E8FF]' : 'bg-transparent text-[#bdbdbd]'}`}
            onClick={() => setIsLogin(true)}
            id="login-tab"
            aria-controls="login-panel"
          >
            Login
          </button>
          <button
            role="tab"
            aria-selected={!isLogin ? "true" : "false"}
            tabIndex={!isLogin ? 0 : -1}
            className={`flex-1 py-3 rounded-tr-xl rounded-br-xl font-semibold text-base transition-all outline-none ${!isLogin ? 'bg-gradient-to-r from-[#C084FC] to-[#A78BFA] text-[#18122B] shadow-[0_0_16px_0_#C084FC] drop-shadow-[0_0_8px_#F3E8FF]' : 'bg-transparent text-[#bdbdbd]'}`}
            onClick={() => setIsLogin(false)}
            id="register-tab"
            aria-controls="register-panel"
          >
            Register
          </button>
        </div>
        {error && <div className="w-full mb-2 text-[#F87171] text-center font-semibold text-[15px]">{error}</div>}
        {success && <div className="w-full mb-2 text-[#C084FC] text-center font-semibold text-[15px]">{success}</div>}
        {isLogin ? (
          <form
            id="login-panel"
            role="tabpanel"
            aria-labelledby="login-tab"
            hidden={!isLogin}
            className="w-full flex flex-col gap-4"
            onSubmit={handleLogin}
          >
            <ShinyText text="Email" className="font-semibold text-[15px] mb-0.5 ml-0.5" />
            <div className="relative mb-0">
              <span className={`material-icons absolute left-3 top-3 text-[20px] transition-colors ${focusField === 'email' ? 'text-purple-300' : 'text-gray-400'}`}>mail</span>
              <input name="email" type="email" placeholder="Email" autoComplete="username" required
                className="w-full max-w-xs mx-auto pl-10 pr-4 py-3 rounded-lg bg-[rgba(34,27,58,0.95)] text-white border border-[#3C2A6D] focus:border-[#C084FC] outline-none transition-colors" 
                onFocus={() => setFocusField('email')}
                onBlur={() => setFocusField(null)}
              />
            </div>
            <ShinyText text="Password" className="font-semibold text-[15px] mt-2 mb-0.5 ml-0.5" />
            <div className="relative mb-0">
              <span className={`material-icons absolute left-3 top-3 text-[20px] transition-colors ${focusField === 'password' ? 'text-purple-300' : 'text-gray-400'}`}>lock</span>
              <input name="password" type="password" placeholder="Password" autoComplete="current-password" required
                className="w-full max-w-xs mx-auto pl-10 pr-4 py-3 rounded-lg bg-[rgba(34,27,58,0.95)] text-white border border-[#3C2A6D] focus:border-[#C084FC] outline-none transition-colors"
                onFocus={() => setFocusField('password')}
                onBlur={() => setFocusField(null)}
              />
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <label className="flex items-center gap-1.5">
                <input name="remember" type="checkbox" className="accent-[#C084FC] mr-1" id="remember" title="Remember me" />
                <label htmlFor="remember" className="text-xs text-gray-300 select-none cursor-pointer">Remember me</label>
              </label>
              <button type="button" className="text-[#C084FC] bg-none border-none cursor-pointer underline font-medium text-sm" onClick={() => setShowForgot(true)}>Forgot password?</button>
            </div>
            <div className="flex justify-center mt-5">
              <GlareHover
                width="70%"
                height="44px"
                background="linear-gradient(to right, #C084FC, #A78BFA)"
                borderRadius="12px"
                borderColor="transparent"
                glareColor="#ffffff"
                glareOpacity={0.4}
                transitionDuration={600}
              >
                <button type="submit" className="w-full h-full rounded-xl font-bold text-lg bg-transparent text-[#18122B] border-none cursor-pointer transition-all shadow-lg drop-shadow-[0_0_8px_#F3E8FF] disabled:opacity-50 flex items-center justify-center" disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
              </GlareHover>
            </div>
          </form>
        ) : (
          <form
            id="register-panel"
            role="tabpanel"
            aria-labelledby="register-tab"
            hidden={isLogin}
            className="w-full flex flex-col gap-4"
            onSubmit={handleRegister}
          >
            <ShinyText text="Username" className="font-semibold text-[15px] mb-0.5 ml-0.5" />
            <div className="relative mb-0">
              <span className={`material-icons absolute left-3 top-3 text-[20px] transition-colors ${focusField === 'username' ? 'text-purple-300' : 'text-gray-400'}`}>person</span>
              <input name="username" type="text" placeholder="Username" required
                className="w-full max-w-xs mx-auto pl-10 pr-4 py-3 rounded-lg bg-[rgba(34,27,58,0.95)] text-white border border-[#3C2A6D] focus:border-[#C084FC] outline-none transition-colors"
                onFocus={() => setFocusField('username')}
                onBlur={() => setFocusField(null)}
              />
            </div>
            <ShinyText text="Email" className="font-semibold text-[15px] mt-2 mb-0.5 ml-0.5" />
            <div className="relative mb-0">
              <span className={`material-icons absolute left-3 top-3 text-[20px] transition-colors ${focusField === 'email' ? 'text-purple-300' : 'text-gray-400'}`}>mail</span>
              <input name="email" type="email" placeholder="Email" required
                className="w-full max-w-xs mx-auto pl-10 pr-4 py-3 rounded-lg bg-[rgba(34,27,58,0.95)] text-white border border-[#3C2A6D] focus:border-[#C084FC] outline-none transition-colors"
                onFocus={() => setFocusField('email')}
                onBlur={() => setFocusField(null)}
              />
            </div>
            <ShinyText text="Password" className="font-semibold text-[15px] mt-2 mb-0.5 ml-0.5" />
            <div className="relative mb-0">
              <span className={`material-icons absolute left-3 top-3 text-[20px] transition-colors ${focusField === 'password' ? 'text-purple-300' : 'text-gray-400'}`}>lock</span>
              <input name="password" type="password" placeholder="Password" required
                className="w-full max-w-xs mx-auto pl-10 pr-4 py-3 rounded-lg bg-[rgba(34,27,58,0.95)] text-white border border-[#3C2A6D] focus:border-[#C084FC] outline-none transition-colors"
                onFocus={() => setFocusField('password')}
                onBlur={() => setFocusField(null)}
              />
            </div>
            <ShinyText text="Confirm Password" className="font-semibold text-[15px] mt-2 mb-0.5 ml-0.5" />
            <div className="relative mb-0">
              <span className={`material-icons absolute left-3 top-3 text-[20px] transition-colors ${focusField === 'confirm' ? 'text-purple-300' : 'text-gray-400'}`}>lock</span>
              <input name="confirm" type="password" placeholder="Confirm Password" required
                className="w-full max-w-xs mx-auto pl-10 pr-4 py-3 rounded-lg bg-[rgba(34,27,58,0.95)] text-white border border-[#3C2A6D] focus:border-[#C084FC] outline-none transition-colors"
                onFocus={() => setFocusField('confirm')}
                onBlur={() => setFocusField(null)}
              />
            </div>
            <div className="flex justify-center mt-5">
              <GlareHover
                width="70%"
                height="44px"
                background="linear-gradient(to right, #C084FC, #A78BFA)"
                borderRadius="12px"
                borderColor="transparent"
                glareColor="#ffffff"
                glareOpacity={0.4}
                transitionDuration={600}
              >
                <button type="submit" className="w-full h-full rounded-xl font-bold text-lg bg-transparent text-[#18122B] border-none cursor-pointer transition-all shadow-lg drop-shadow-[0_0_8px_#F3E8FF] disabled:opacity-50 flex items-center justify-center" disabled={loading}>{loading ? 'Loading...' : 'Register'}</button>
              </GlareHover>
            </div>
          </form>
        )}
      </div>
      
      {/* Bottom AdSense Banner */}
      <div className="w-full max-w-4xl mt-6 z-20 flex justify-center">
        <GoogleAdSense 
          adSlot="0987654321"
          position="top"
        />
      </div>
      {/* Forgot password modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[rgba(40,30,70,0.55)] rounded-xl p-8 w-full max-w-sm flex flex-col items-center shadow-2xl border border-[#7C5CFA]/25 backdrop-blur-lg">
            <h2 className="text-lg font-bold text-[#C084FC] mb-3 drop-shadow-[0_0_8px_#C084FC]">Reset Password</h2>
            <input
              type="email"
              className="w-full max-w-xs mx-auto py-3 px-4 rounded-lg bg-[#221B3A] text-[#F3E8FF] border border-[#7C5CFA] font-inter text-base mb-3 outline-none"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
            />
            <div className="flex gap-2 w-full">
              <button
                className="w-full py-3 rounded-xl font-bold text-base bg-gradient-to-r from-[#C084FC] to-[#A78BFA] text-[#18122B] border-none cursor-pointer transition-all shadow-md drop-shadow-[0_0_8px_#F3E8FF] disabled:opacity-50"
                onClick={() => handleForgotPassword(forgotEmail)}
                disabled={loading || !forgotEmail}
              >
                {loading ? 'Sending...' : 'Send Email'}
              </button>
              <button
                className="w-full py-3 rounded-xl font-bold text-base bg-[#6D28D9] text-[#F3E8FF] border-none cursor-pointer"
                onClick={() => setShowForgot(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Profile creation modal (forced after login if no profile) */}
      {forceProfileUserId && (
        <ProfileModal
          userId={forceProfileUserId}
          onClose={async () => {
            // Create minimal profile and redirect without logging out
            const { data: userData } = await supabase.auth.getUser();
            if (userData?.user) {
              // Create basic profile
              await supabase.from('profiles').upsert([{
                user_id: userData.user.id,
                username: userData.user.email?.split('@')[0] || 'User',
                email: userData.user.email
              }], { onConflict: 'user_id' });
              
              // Set user context
              setAuthUser(userData.user);
              setProfile({
                user_id: userData.user.id,
                username: userData.user.email?.split('@')[0] || 'User',
                email: userData.user.email
              });
            }
            
            setForceProfileUserId(null);
            navigate('/');
          }}
        />
      )}
    </div>
  );
};

export default LoginRegister;