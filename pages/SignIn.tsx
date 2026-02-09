
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNotify } from '../components/Notifications';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const notify = useNotify();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      notify("Welcome back!", "success");
      navigate('/');
    } catch (err: any) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const socialNotice = () => notify("This feature isn’t available in your location", "info");

  return (
    <div className="min-h-screen bg-white p-8 flex flex-col animate-fade-in max-w-md mx-auto">
      <button onClick={() => navigate('/')} className="p-3 bg-f-gray rounded-2xl self-start mb-10 shadow-sm active:scale-90 transition-transform">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
      </button>

      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-2 tracking-tighter">Welcome Back</h1>
        <p className="text-f-gray text-sm mb-10 font-medium">Log in to your account to continue shopping.</p>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="w-full bg-f-gray p-5 rounded-2xl border border-transparent focus:border-black outline-none transition-all font-medium text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
            <div className="relative">
              <input 
                type="password" 
                placeholder="Enter your password" 
                className="w-full bg-f-gray p-5 rounded-2xl border border-transparent focus:border-black outline-none transition-all font-medium text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button disabled={loading} className="btn-primary w-full mt-10 shadow-xl shadow-black/10 transition-transform active:scale-[0.98]">
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-12">
          <div className="flex items-center space-x-4 mb-8">
            <div className="flex-1 h-px bg-gray-100"></div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Or login with</span>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>
          <div className="flex justify-center space-x-6">
             <button onClick={socialNotice} className="w-14 h-14 bg-f-gray rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm active:scale-90">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 21.8-88.5 21.8-11.4 0-51.1-20.8-82.3-20.2-41.2.7-78.9 24.5-100.1 61.3-43.2 75-11.1 185.9 30.1 245.2 20.2 29.1 44.1 61.6 75.3 60.5 30.4-1.1 41.8-19.4 78.6-19.4 36.9 0 47.5 19.4 79.5 18.8 32.3-.5 53.4-29.6 73.4-58.7 23.2-33.9 32.7-66.8 33-68.4-.7-.3-63.5-24.5-63.7-96.1zM232.2 35.6c15.8-19.1 26.5-45.6 23.5-72.1-22.9 1-50.7 15.3-67.1 34.5-14.7 17-27.5 44-24.5 69.4 25.5 2 52.4-12.7 68.1-31.8z"/></svg>
             </button>
             <button onClick={socialNotice} className="w-14 h-14 bg-f-gray rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm active:scale-90">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 488 512"><path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/></svg>
             </button>
          </div>
        </div>
      </div>

      <p className="mt-12 text-center text-xs font-medium">
        Don't have an account? <Link to="/signup" className="font-bold underline ml-1">Sign Up</Link>
      </p>
    </div>
  );
};

export default SignIn;
