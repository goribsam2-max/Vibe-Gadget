
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useNotify } from '../components/Notifications';
import { uploadToImgbb } from '../services/imgbb';
import { motion } from 'framer-motion';

const Profile: React.FC<{ userData: UserProfile | null }> = ({ userData: initialUserData }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updating, setUpdating] = useState(false);
  const [localUserData, setLocalUserData] = useState<UserProfile | null>(initialUserData);

  useEffect(() => { 
    setLocalUserData(initialUserData); 
  }, [initialUserData]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('f_cart');
    navigate('/auth-selector');
  };

  const menuItems = [
    { label: 'Orders', icon: 'fas fa-shopping-bag', path: '/orders', desc: 'Manage your history' },
    { label: 'Favorites', icon: 'fas fa-heart', path: '/wishlist', desc: 'Saved gadgets' },
    { label: 'Settings', icon: 'fas fa-cog', path: '/settings', desc: 'Profile options' },
    { label: 'Support', icon: 'fas fa-headset', path: '/help-center', desc: 'Help desk' }
  ];

  const isAdmin = localUserData?.role === 'admin' || 
                  localUserData?.email?.toLowerCase().trim() === 'admin@vibe.shop';

  return (
    <div className="p-6 md:p-12 pb-48 bg-white max-w-4xl mx-auto min-h-screen font-inter">
       {localUserData ? (
          <div>
            <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-8 mb-12">
              <div className="relative mb-6 md:mb-0">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-[2.5rem] bg-zinc-50 border border-zinc-100 overflow-hidden"
                >
                   <img src={localUserData?.photoURL || `https://ui-avatars.com/api/?name=${localUserData.displayName}&background=000&color=fff`} className="w-full h-full object-cover" alt="" />
                </motion.div>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={updating} 
                  className="absolute bottom-0 right-0 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center border-4 border-white shadow-lg"
                >
                  <i className="fas fa-camera text-[10px]"></i>
                </motion.button>
                <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file || !auth.currentUser) return;
                    setUpdating(true);
                    try {
                        const url = await uploadToImgbb(file);
                        await updateProfile(auth.currentUser, { photoURL: url });
                        await updateDoc(doc(db, 'users', auth.currentUser.uid), { photoURL: url });
                        setLocalUserData(prev => prev ? { ...prev, photoURL: url } : null);
                        notify("Profile updated!", "success");
                    } catch(e) { notify("Update failed.", "error"); } finally { setUpdating(false); }
                }} />
              </div>
              
              <div className="text-center md:text-left pt-2">
                 <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-1">{localUserData?.displayName}</h2>
                 <p className="text-zinc-400 text-xs font-medium mb-6">{localUserData?.email}</p>
                 <div className="flex items-center justify-center md:justify-start space-x-2">
                    <span className="px-4 py-1.5 bg-zinc-900 text-white rounded-full text-[9px] font-bold uppercase tracking-widest">{isAdmin ? 'Admin' : 'Customer'}</span>
                    <span className="px-4 py-1.5 bg-zinc-50 text-zinc-400 rounded-full text-[9px] font-bold uppercase tracking-widest border border-zinc-100">Verified</span>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isAdmin && (
                <Link to="/admin" className="col-span-1 md:col-span-2 flex justify-between items-center p-8 bg-zinc-900 text-white rounded-[2rem] hover:scale-[1.01] transition-all group">
                   <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center"><i className="fas fa-user-shield text-lg"></i></div>
                      <div>
                        <span className="block font-bold text-sm tracking-tight">Admin Control Panel</span>
                        <span className="block text-[9px] text-white/40 font-bold uppercase mt-1">Manage Store & Orders</span>
                      </div>
                   </div>
                   <i className="fas fa-arrow-right text-[10px] opacity-30 group-hover:translate-x-2 transition-transform"></i>
                </Link>
              )}
              
              {menuItems.map((item, idx) => (
                <Link key={idx} to={item.path} className="flex justify-between items-center p-6 bg-white border border-zinc-100 rounded-[1.8rem] hover:bg-zinc-50 transition-all group">
                   <div className="flex items-center space-x-5">
                      <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center border border-zinc-100/50">
                        <i className={`${item.icon} text-zinc-400 group-hover:text-black`}></i>
                      </div>
                      <div>
                        <span className="block font-bold text-sm tracking-tight">{item.label}</span>
                        <span className="block text-[9px] text-zinc-300 font-bold uppercase tracking-widest mt-0.5">{item.desc}</span>
                      </div>
                   </div>
                   <i className="fas fa-chevron-right text-[10px] text-zinc-200 group-hover:translate-x-1 transition-transform"></i>
                </Link>
              ))}

              <button onClick={handleLogout} className="col-span-1 md:col-span-2 flex justify-between items-center p-6 bg-red-50/20 border border-red-100 rounded-[1.8rem] hover:bg-red-50 transition-all group">
                <div className="flex items-center space-x-5">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center"><i className="fas fa-sign-out-alt text-red-500"></i></div>
                  <span className="font-bold text-sm uppercase tracking-widest text-red-600">Logout</span>
                </div>
                <i className="fas fa-power-off text-xs text-red-200"></i>
              </button>
           </div>
          </div>
       ) : (
          <div className="flex flex-col items-center justify-center text-center py-24">
             <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mb-8 border border-zinc-100">
               <i className="fas fa-user text-2xl text-zinc-200"></i>
             </div>
             <h2 className="text-xl font-black mb-2 tracking-tight">Please Sign In</h2>
             <p className="text-xs text-zinc-400 mb-8 max-w-xs leading-relaxed">Login to track your orders and manage your profile.</p>
             <button onClick={() => navigate('/auth-selector')} className="px-12 py-4 bg-black text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg">Sign In Now</button>
          </div>
       )}
    </div>
  );
};

export default Profile;
