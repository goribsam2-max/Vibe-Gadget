
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNotify } from '../components/Notifications';
import { motion } from 'framer-motion';

const AuthSelector: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const [config, setConfig] = useState<any>({
    googleLogin: true,
    facebookLogin: false,
    appleLogin: false
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'platform'), (snap) => {
      if (snap.exists()) {
        setConfig(snap.data());
      }
    });
    return unsub;
  }, []);

  const captureUserDetails = async (user: any) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      
      const ipRes = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const ipData = ipRes ? await ipRes.json() : { ip: 'Unknown' };

      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Guest User',
          photoURL: user.photoURL || '',
          role: 'user',
          isBanned: false,
          createdAt: Date.now(),
          registrationDate: Date.now(),
          ipAddress: ipData.ip,
          lastActive: Date.now()
        });
      } else {
        await setDoc(userRef, { 
          lastActive: Date.now(),
          ipAddress: ipData.ip 
        }, { merge: true });
      }
    } catch (e) {
      console.error("Profile error:", e);
    }
  };

  const handleSocialLogin = (provider: string, enabled: boolean) => {
    if (!enabled) {
      notify(`${provider} login is not available right now.`, "info");
      return;
    }
    notify(`Logging in with ${provider}...`, "info");
  };

  return (
    <div className="h-screen flex flex-col p-10 items-center justify-between text-center bg-white max-w-md mx-auto font-inter">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-black rounded-[2rem] flex items-center justify-center mb-10 shadow-xl"
        >
          <i className="fas fa-shopping-bag text-white text-3xl"></i>
        </motion.div>
        
        <h1 className="text-4xl font-black mb-4 tracking-tight text-zinc-900">VibeGadget</h1>
        <p className="text-zinc-500 text-sm font-medium mb-12 px-4 leading-relaxed">
          Premium mobile accessories and gadgets delivered right to your doorstep in Bangladesh.
        </p>
        
        <div className="w-full space-y-4 px-2">
          <button 
            onClick={() => navigate('/signup')} 
            className="w-full py-5 bg-black text-white rounded-[1.5rem] font-bold text-sm uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all"
          >
            Create Account
          </button>
          <button 
            onClick={() => navigate('/signin')} 
            className="w-full py-5 border-2 border-zinc-100 bg-white rounded-[1.5rem] font-bold text-sm uppercase tracking-widest text-zinc-900 hover:border-black active:scale-[0.98] transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
      
      <div className="w-full pb-8">
         <div className="flex items-center space-x-4 mb-8 px-6">
            <div className="flex-1 h-px bg-zinc-100"></div>
            <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">Or social login</span>
            <div className="flex-1 h-px bg-zinc-100"></div>
         </div>
         <div className="flex justify-center space-x-6">
            <SocialBtn icon="fab fa-facebook-f" active={config.facebookLogin} onClick={() => handleSocialLogin('Facebook', config.facebookLogin)} color="text-blue-600" />
            <SocialBtn icon="fab fa-google" active={config.googleLogin} onClick={() => handleSocialLogin('Google', config.googleLogin)} color="text-zinc-900" />
            <SocialBtn icon="fab fa-apple" active={config.appleLogin} onClick={() => handleSocialLogin('Apple', config.appleLogin)} color="text-zinc-900" />
         </div>
      </div>
    </div>
  );
};

const SocialBtn = ({ icon, active, onClick, color }: any) => (
  <motion.button 
    whileTap={active ? { scale: 0.9 } : {}}
    onClick={onClick} 
    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 ${active ? `bg-white border-zinc-100 ${color} shadow-sm` : 'bg-zinc-50 border-transparent text-zinc-200 cursor-not-allowed'}`}
  >
      <i className={`${icon} text-lg`}></i>
  </motion.button>
);

export default AuthSelector;
