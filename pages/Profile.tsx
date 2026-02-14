
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useNotify } from '../components/Notifications';
import { uploadToImgbb } from '../services/imgbb';

const Profile: React.FC<{ userData: UserProfile | null }> = ({ userData: initialUserData }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updating, setUpdating] = useState(false);
  const [localUserData, setLocalUserData] = useState<UserProfile | null>(initialUserData);

  useEffect(() => { setLocalUserData(initialUserData); }, [initialUserData]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('f_cart');
    navigate('/auth-selector');
  };

  const menuItems = [
    { label: 'My Orders', icon: 'fas fa-shopping-bag', path: '/orders' },
    { label: 'My Wishlist', icon: 'fas fa-heart', path: '/wishlist' },
    { label: 'Account Settings', icon: 'fas fa-cog', path: '/settings' },
    { label: 'Help Center', icon: 'fas fa-headset', path: '/help-center' }
  ];

  const isAdmin = localUserData?.role === 'admin' || localUserData?.email === 'admin@vibe.shop';

  return (
    <div className="p-6 pb-24 animate-fade-in bg-white max-w-5xl mx-auto min-h-screen md:flex md:items-center md:justify-center">
       {localUserData ? (
          <div className="w-full max-w-md">
            <div className="flex flex-col items-center mb-16">
              <div className="relative mb-8">
                <div className="w-32 h-32 rounded-[48px] bg-f-gray border-4 border-white shadow-2xl overflow-hidden ring-1 ring-black/5">
                   <img src={localUserData?.photoURL || `https://ui-avatars.com/api/?name=${localUserData.displayName}`} className="w-full h-full object-cover" alt="" />
                </div>
                <button onClick={() => fileInputRef.current?.click()} disabled={updating} className="absolute -bottom-2 -right-2 w-12 h-12 bg-black rounded-3xl flex items-center justify-center border-4 border-white shadow-xl active:scale-90 transition-all"><i className="fas fa-camera text-white text-sm"></i></button>
                <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0]; if (!file || !auth.currentUser) return;
                    setUpdating(true);
                    try {
                        const url = await uploadToImgbb(file);
                        await updateProfile(auth.currentUser, { photoURL: url });
                        await updateDoc(doc(db, 'users', auth.currentUser.uid), { photoURL: url });
                        setLocalUserData(prev => prev ? { ...prev, photoURL: url } : null);
                        notify("Profile Picture Updated", "success");
                    } catch(e) { notify("Upload failed", "error"); } finally { setUpdating(false); }
                }} />
              </div>
              
              <div className="text-center">
                 <h2 className="text-3xl font-bold tracking-tighter mb-1">{localUserData?.displayName}</h2>
                 <p className="text-[10px] font-bold text-f-gray uppercase tracking-[0.3em] opacity-40">{localUserData?.email}</p>
              </div>
           </div>

           <div className="space-y-4">
              {isAdmin && (
                <Link to="/admin" className="flex justify-between items-center p-6 bg-black text-white rounded-[40px] shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all">
                   <div className="flex items-center space-x-5"><div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><i className="fas fa-user-shield"></i></div><span className="font-bold text-sm uppercase tracking-widest">Admin Dashboard</span></div>
                   <i className="fas fa-chevron-right text-xs opacity-40"></i>
                </Link>
              )}
              {menuItems.map((item, idx) => (
                <Link key={idx} to={item.path} className="flex justify-between items-center p-6 bg-f-gray border border-f-light rounded-[40px] hover:bg-white transition-all active:scale-[0.98] shadow-sm">
                   <div className="flex items-center space-x-5"><div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><i className={`${item.icon} text-sm`}></i></div><span className="font-bold text-sm tracking-tight">{item.label}</span></div>
                   <i className="fas fa-chevron-right text-xs text-gray-200"></i>
                </Link>
              ))}
              <button onClick={handleLogout} className="w-full flex justify-between items-center p-6 text-red-500 bg-red-50/10 border border-red-100 rounded-[40px] active:scale-[0.98] transition-all"><div className="flex items-center space-x-5"><div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center"><i className="fas fa-sign-out-alt"></i></div><span className="font-bold text-sm uppercase tracking-widest">Log Out</span></div></button>
           </div>
          </div>
       ) : (
          <div className="flex flex-col items-center justify-center text-center max-w-sm"><div className="w-24 h-24 bg-f-gray rounded-[40px] flex items-center justify-center mb-10"><i className="fas fa-fingerprint text-4xl text-gray-300"></i></div><h2 className="text-3xl font-bold mb-3 tracking-tighter">Login Required</h2><p className="text-xs text-f-gray mb-12 px-10 leading-relaxed">Sign in to VibeGadget to view your orders and profile.</p><button onClick={() => navigate('/auth-selector')} className="btn-primary w-full shadow-2xl">Sign In Now</button></div>
       )}
    </div>
  );
};

export default Profile;
