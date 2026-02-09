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

  useEffect(() => {
    setLocalUserData(initialUserData);
  }, [initialUserData]);

  const handleLogout = async () => {
    try {
        await signOut(auth);
        localStorage.removeItem('f_cart');
        localStorage.removeItem('vibe_recent_searches');
        navigate('/auth-selector');
    } catch (error) {
        console.error("Logout error", error);
    }
  };

  const menuItems = [
    { label: 'Purchases', icon: 'fas fa-shopping-bag', path: '/orders' },
    { label: 'Payment Hub', icon: 'fas fa-credit-card', path: '/payment-methods' },
    { label: 'Settings', icon: 'fas fa-cog', path: '/settings' },
    { label: 'Support Desk', icon: 'fas fa-headset', path: '/help-center' }
  ];

  const isAdmin = localUserData?.role === 'admin' || localUserData?.email === 'admin@vibe.shop';

  return (
    <div className="p-6 pb-24 animate-fade-in bg-white max-w-md mx-auto min-h-screen">
       {localUserData ? (
          <>
            <div className="flex flex-col items-center mb-12">
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-[40px] bg-f-gray border-4 border-white shadow-2xl overflow-hidden ring-1 ring-gray-100">
                   <img src={localUserData?.photoURL || `https://ui-avatars.com/api/?name=${localUserData.displayName}&background=f3f3f3&color=000`} className="w-full h-full object-cover" alt="" />
                </div>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={updating}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-black rounded-2xl flex items-center justify-center border-4 border-white shadow-lg active:scale-95 transition-transform"
                >
                    <i className="fas fa-camera text-white text-xs"></i>
                </button>
                <input type="file" hidden ref={fileInputRef} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !auth.currentUser) return;
                    setUpdating(true);
                    try {
                        const url = await uploadToImgbb(file);
                        await updateProfile(auth.currentUser, { photoURL: url });
                        await updateDoc(doc(db, 'users', auth.currentUser.uid), { photoURL: url });
                        setLocalUserData(prev => prev ? { ...prev, photoURL: url } : null);
                        notify("Avatar updated", "success");
                    } catch(e) { notify("Upload failed", "error"); } finally { setUpdating(false); }
                }} accept="image/*" />
              </div>
              
              <div className="text-center">
                 <h2 className="text-2xl font-bold tracking-tight mb-1">{localUserData?.displayName}</h2>
                 <p className="text-[10px] font-bold text-f-gray uppercase tracking-widest opacity-60">{localUserData?.email}</p>
                 {isAdmin && <span className="mt-2 inline-block px-3 py-1 bg-black text-white text-[9px] font-bold uppercase tracking-widest rounded-full">Administrator</span>}
              </div>
           </div>

           <div className="space-y-4">
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="flex justify-between items-center p-5 bg-black text-white rounded-[32px] hover:opacity-90 transition-all active:scale-[0.98] shadow-xl shadow-black/10"
                >
                   <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                        <i className="fas fa-user-shield text-sm"></i>
                      </div>
                      <span className="font-bold text-sm tracking-tight">Admin Terminal</span>
                   </div>
                   <i className="fas fa-chevron-right text-[10px] opacity-40"></i>
                </Link>
              )}

              {menuItems.map((item, idx) => (
                <Link 
                  key={idx} 
                  to={item.path} 
                  className="flex justify-between items-center p-5 bg-white border border-f-light rounded-[32px] hover:bg-f-gray transition-all active:scale-[0.98]"
                >
                   <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-f-gray rounded-2xl flex items-center justify-center">
                        <i className={`${item.icon} text-sm`}></i>
                      </div>
                      <span className="font-bold text-sm">{item.label}</span>
                   </div>
                   <i className="fas fa-chevron-right text-[10px] text-gray-300"></i>
                </Link>
              ))}
              
              <button 
                onClick={handleLogout}
                className="w-full flex justify-between items-center p-5 text-red-500 bg-red-50/10 border border-red-50 rounded-[32px] active:scale-[0.98] transition-all"
              >
                 <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center">
                        <i className="fas fa-sign-out-alt"></i>
                    </div>
                    <span className="font-bold text-sm">Log Out Terminal</span>
                 </div>
              </button>
           </div>
          </>
       ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="w-24 h-24 bg-f-gray rounded-[40px] flex items-center justify-center mb-8">
                <i className="fas fa-user-circle text-4xl text-gray-300"></i>
             </div>
             <h2 className="text-xl font-bold mb-2">Access Portal</h2>
             <p className="text-xs text-f-gray mb-10 px-10">Sign in to VibeGadget to manage your premium tech purchases.</p>
             <button onClick={() => navigate('/auth-selector')} className="btn-primary w-full shadow-lg">Login / Register</button>
          </div>
       )}
    </div>
  );
};

export default Profile;
