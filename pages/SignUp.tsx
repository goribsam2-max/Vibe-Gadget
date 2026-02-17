
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNotify } from '../components/Notifications';
import { motion } from 'framer-motion';

const SignUp: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const notify = useNotify();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) return notify("Please agree to the Terms & Conditions", "error");
    
    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      await updateProfile(user, { displayName: name });

      const userData = {
        uid: user.uid,
        email,
        displayName: name,
        role: 'user',
        isBanned: false,
        createdAt: Date.now(),
        registrationDate: Date.now(),
        lastActive: Date.now()
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      
      notify("Account created successfully!", "success");
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
        <h1 className="text-4xl font-black mb-3 tracking-tighter">Sign Up</h1>
        <p className="text-zinc-500 text-sm mb-12 font-medium leading-relaxed">Create your account to start exploring premium gadgets.</p>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 px-1">Full Name</label>
            <input 
              type="text" 
              placeholder="e.g. John Doe" 
              className="w-full bg-zinc-50 p-5 rounded-2xl outline-none border border-transparent focus:border-black transition-all font-bold text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
              placeholder="At least 6 characters" 
              className="w-full bg-zinc-50 p-5 rounded-2xl outline-none border border-transparent focus:border-black transition-all font-bold text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center space-x-3 px-1">
            <input 
              type="checkbox" 
              id="terms" 
              className="w-5 h-5 accent-black rounded-lg cursor-pointer" 
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <label htmlFor="terms" className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 cursor-pointer">I agree to the <span className="text-black underline">Terms & Conditions</span></label>
          </div>

          <button disabled={loading} className="w-full py-5 bg-black text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50">
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
      </div>

      <p className="mt-12 text-center text-xs font-medium text-zinc-400">
        Already have an account? <Link to="/signin" className="text-black font-bold underline ml-1">Sign In</Link>
      </p>
    </div>
  );
};

export default SignUp;
