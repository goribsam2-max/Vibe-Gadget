
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useNotify } from '../components/Notifications';
import { motion } from 'framer-motion';

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
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      await updateDoc(doc(db, 'users', user.uid), {
        lastActive: Date.now()
      });

      notify("Welcome back!", "success");
      navigate('/');
    } catch (err: any) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 flex flex-col max-w-md mx-auto">
      <motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate(-1)} 
        className="p-3 bg-zinc-50 border border-zinc-100 rounded-2xl self-start mb-12 shadow-sm"
      >
        <i className="fas fa-chevron-left text-sm"></i>
      </motion.button>

      <div className="flex-1">
        <h1 className="text-4xl font-black mb-3 tracking-tighter">Sign In</h1>
        <p className="text-zinc-500 text-sm mb-12 font-medium leading-relaxed">Please log in to your account to continue shopping.</p>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">Email Address</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              className="w-full bg-zinc-50 p-5 rounded-2xl outline-none border border-transparent focus:border-black transition-all font-bold text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">Password</label>
            <input 
              type="password" 
              placeholder="Your password" 
              className="w-full bg-zinc-50 p-5 rounded-2xl outline-none border border-transparent focus:border-black transition-all font-bold text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button disabled={loading} className="w-full py-5 bg-black text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50">
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>
      </div>

      <p className="mt-12 text-center text-xs font-medium text-zinc-400">
        Don't have an account? <Link to="/signup" className="text-black font-bold underline ml-1">Create Account</Link>
      </p>
    </div>
  );
};

export default SignIn;
