import React, { useState } from 'react';
import { useMobileOptimized } from '../hooks/useDevice';
import { MobileCard, MobileButton } from '../components/MobileOptimizedComponents';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import ProfileModal from '../modals/ProfileModal';
import SimpleBackgroundParticles from '../components/SimpleBackgroundParticles';

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



const LoginRegister: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forceProfileUserId, setForceProfileUserId] = useState<string|null>(null);
  const { setAuthUser, setProfile } = useUser();
  const navigate = useNavigate();

  // Login handler
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    let timeoutId: number | null = null;
    
    try {
      // Safety timeout to prevent infinite loading
      timeoutId = window.setTimeout(() => {
        setLoading(false);
        setError('Login timeout. Please try again.');
      }, 10000);
      
      const form = e.currentTarget;
      const email = (form.elements.namedItem('email') as HTMLInputElement).value;
      const password = (form.elements.namedItem('password') as HTMLInputElement).value;
      
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (loginError) {
        setError(loginError.message);
        return;
      }
      
      if (data.user) {
        setAuthUser(data.user);
        setSuccess('Login successful! Redirecting...');
        
        // Load profile asynchronously
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
        
        setTimeout(() => navigate('/'), 800);
      } else {
        setError('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  // Register handler
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      const form = e.currentTarget;
      const username = (form.elements.namedItem('username') as HTMLInputElement).value;
      const email = (form.elements.namedItem('email') as HTMLInputElement).value;
      const password = (form.elements.namedItem('password') as HTMLInputElement).value;
      const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value;
      
      if (password !== confirm) {
        setError('Passwords do not match');
        return;
      }
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });
      
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      
      setSuccess('Registration successful! Check your email (including spam) to activate your account. Once confirmed, log in to create your profile.');
    } catch (error) {
      console.error('Register error:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Forgot password handler
  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setError('Please enter your email address');
      return;
    }
    
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Password reset email sent! Check your inbox.');
        setShowForgot(false);
        setForgotEmail('');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };



  // Removed session restore useEffect, now handled by UserProvider

  const { containerClass } = useMobileOptimized();
  
  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#18122B] via-[#6D28D9] to-[#A78BFA] font-inter text-[#F3E8FF] relative overflow-hidden ${containerClass}`}>
      <SimpleBackgroundParticles />
      
      {/* Futuristic Glow Effects */}
      <div className="absolute -top-10 -left-10 w-[400px] h-[400px] opacity-50 z-0 blur-3xl bg-[radial-gradient(circle,_#C084FC_0%,_transparent_70%)]" />
      <div className="absolute -bottom-10 -right-10 w-[400px] h-[400px] opacity-40 z-0 blur-3xl bg-[radial-gradient(circle,_#A78BFA_0%,_transparent_70%)]" />
      
      <div className="flex flex-col items-center justify-center flex-grow w-full z-20 px-2">
        {/* Logo and tagline */}
        <div className="mb-6 text-center w-full">
          <img src="/logo.png" alt="GameGoUp Logo" className="h-16 mx-auto mb-3 drop-shadow-[0_0_12px_rgba(167,139,250,0.5)]" />
          <p className="text-base text-[#A78BFA] font-medium m-0 drop-shadow-[0_0_4px_rgba(167,139,250,0.3)]">
            Connect, play, win. The easiest way to build your team.
          </p>
        </div>
        
        <MobileCard className="w-full max-w-md p-6 flex flex-col items-stretch shadow-xl">
          {/* Tab buttons */}
          <div className="flex mb-6 bg-[rgba(34,27,58,0.95)] rounded-lg p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-200 ${
                isLogin
                  ? 'bg-[#7C5CFA] text-white shadow-lg'
                  : 'text-[#A78BFA] hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all duration-200 ${
                !isLogin
                  ? 'bg-[#7C5CFA] text-white shadow-lg'
                  : 'text-[#A78BFA] hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
          
          {/* Error and success messages */}
          {error && <div className="w-full mb-4 text-[#F87171] text-center font-semibold text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</div>}
          {success && <div className="w-full mb-4 text-[#C084FC] text-center font-semibold text-sm bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">{success}</div>}
          
          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  className="w-full px-4 py-3 bg-[rgba(34,27,58,0.95)] border border-[#7C5CFA]/25 rounded-lg text-[#F3E8FF] placeholder-[#A78BFA]/60 focus:outline-none focus:border-[#7C5CFA] focus:ring-2 focus:ring-[#7C5CFA]/20 transition-all"
                />
              </div>
              
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  className="w-full px-4 py-3 bg-[rgba(34,27,58,0.95)] border border-[#7C5CFA]/25 rounded-lg text-[#F3E8FF] placeholder-[#A78BFA]/60 focus:outline-none focus:border-[#7C5CFA] focus:ring-2 focus:ring-[#7C5CFA]/20 transition-all"
                />
              </div>
              
              <MobileButton
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#7C5CFA] to-[#A78BFA] text-white font-semibold rounded-lg hover:from-[#6D28D9] hover:to-[#7C5CFA] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </MobileButton>
              
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-[#A78BFA] text-sm hover:text-[#C084FC] transition-colors text-center"
              >
                Forgot password?
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="w-full flex flex-col gap-4">
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  required
                  className="w-full px-4 py-3 bg-[rgba(34,27,58,0.95)] border border-[#7C5CFA]/25 rounded-lg text-[#F3E8FF] placeholder-[#A78BFA]/60 focus:outline-none focus:border-[#7C5CFA] focus:ring-2 focus:ring-[#7C5CFA]/20 transition-all"
                />
              </div>
              
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  className="w-full px-4 py-3 bg-[rgba(34,27,58,0.95)] border border-[#7C5CFA]/25 rounded-lg text-[#F3E8FF] placeholder-[#A78BFA]/60 focus:outline-none focus:border-[#7C5CFA] focus:ring-2 focus:ring-[#7C5CFA]/20 transition-all"
                />
              </div>
              
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                  className="w-full px-4 py-3 bg-[rgba(34,27,58,0.95)] border border-[#7C5CFA]/25 rounded-lg text-[#F3E8FF] placeholder-[#A78BFA]/60 focus:outline-none focus:border-[#7C5CFA] focus:ring-2 focus:ring-[#7C5CFA]/20 transition-all"
                />
              </div>
              
              <div className="relative">
                <input
                  type="password"
                  name="confirm"
                  placeholder="Confirm Password"
                  required
                  className="w-full px-4 py-3 bg-[rgba(34,27,58,0.95)] border border-[#7C5CFA]/25 rounded-lg text-[#F3E8FF] placeholder-[#A78BFA]/60 focus:outline-none focus:border-[#7C5CFA] focus:ring-2 focus:ring-[#7C5CFA]/20 transition-all"
                />
              </div>
              
              <MobileButton
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#7C5CFA] to-[#A78BFA] text-white font-semibold rounded-lg hover:from-[#6D28D9] hover:to-[#7C5CFA] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </MobileButton>
            </form>
          )}
        </MobileCard>
      </div>
      
      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[rgba(40,30,70,0.95)] rounded-xl p-6 w-full max-w-sm backdrop-blur-lg border border-[#7C5CFA]/25">
            <h3 className="text-lg font-semibold text-[#F3E8FF] mb-4 text-center">Reset Password</h3>
            
            <div className="mb-4">
              <input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[rgba(34,27,58,0.95)] border border-[#7C5CFA]/25 rounded-lg text-[#F3E8FF] placeholder-[#A78BFA]/60 focus:outline-none focus:border-[#7C5CFA] focus:ring-2 focus:ring-[#7C5CFA]/20 transition-all"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowForgot(false);
                  setForgotEmail('');
                  setError(null);
                }}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                disabled={loading}
                className="flex-1 py-2 px-4 bg-[#7C5CFA] text-white rounded-lg hover:bg-[#6D28D9] transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Profile Modal */}
      {forceProfileUserId && (
        <ProfileModal
          userId={forceProfileUserId}
          onClose={() => {
            setForceProfileUserId(null);
            navigate('/');
          }}
        />
      )}
    </div>
  );
};

export default LoginRegister;