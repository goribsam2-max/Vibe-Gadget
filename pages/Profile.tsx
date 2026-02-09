
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useNotify } from '../components/Notifications';
import { uploadToImgbb } from '../services/imgbb';

const Profile: React.FC<{ userData: UserProfile | null }> = ({ userData: initialUserData }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localUserData, setLocalUserData] = useState<UserProfile | null>(initialUserData);
  const [editName, setEditName] = useState(initialUserData?.displayName || '');

  useEffect(() => {
    setLocalUserData(initialUserData);
    setEditName(initialUserData?.displayName || '');
  }, [initialUserData]);

  const isAdmin = localUserData?.email === 'admin@vibe.shop' || auth.currentUser?.email === 'admin@vibe.shop';

  const menuItems = [
    { label: 'Payment Methods', svg: <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />, path: '/payment-methods' },
    { label: 'Order History', svg: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />, path: '/orders' },
    { label: 'Account Settings', svg: <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />, path: '/settings' },
    { label: 'Need Help?', svg: <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />, path: '/help-center' }
  ];

  const handleUpdateProfile = async () => {
    if (!auth.currentUser || !editName.trim()) return;
    setUpdating(true);
    try {
      await updateProfile(auth.currentUser, { displayName: editName.trim() });
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { displayName: editName.trim() });
      setLocalUserData(prev => prev ? { ...prev, displayName: editName.trim() } : null);
      notify("Name updated successfully!", "success");
      setIsEditing(false);
    } catch (e) {
      notify("Update failed", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;
    
    setUpdating(true);
    try {
      const url = await uploadToImgbb(file);
      await updateProfile(auth.currentUser, { photoURL: url });
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { photoURL: url });
      setLocalUserData(prev => prev ? { ...prev, photoURL: url } : null);
      notify("Profile picture updated!", "success");
    } catch (e) {
      notify("Upload failed", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    if(window.confirm('Sign out from your account?')) {
        try {
            await signOut(auth);
            localStorage.removeItem('f_cart');
            navigate('/auth-selector');
        } catch (error) {
            console.error("Logout failed", error);
        }
    }
  };

  return (
    <div className="p-6 pb-24 animate-fade-in bg-white max-w-md mx-auto min-h-screen">
       {localUserData ? (
          <>
            <div className="flex flex-col items-center mb-12">
              <div className="relative mb-6">
                <div className="w-28 h-28 rounded-[40px] bg-f-gray border-4 border-white shadow-2xl overflow-hidden ring-1 ring-gray-100">
                   {updating ? (
                     <div className="w-full h-full flex items-center justify-center bg-black/5">
                        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                     </div>
                   ) : (
                     <img src={localUserData?.photoURL || 'https://ui-avatars.com/api/?name=User&background=f3f3f3&color=000'} className="w-full h-full object-cover" alt="" />
                   )}
                </div>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={updating}
                    className="absolute -bottom-2 -right-2 w-10 h-10 bg-black rounded-2xl flex items-center justify-center border-4 border-white shadow-lg active:scale-95 transition-transform"
                >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>
                </button>
                <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
              </div>
              
              {isEditing ? (
                <div className="flex flex-col items-center w-full px-10">
                   <input 
                      type="text" 
                      className="w-full text-center bg-f-gray p-3 rounded-2xl font-bold mb-3 outline-none border border-transparent focus:border-black transition-all"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                   />
                   <div className="flex space-x-3">
                      <button onClick={handleUpdateProfile} disabled={updating} className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-4 py-2 rounded-xl">Save</button>
                      <button onClick={() => { setIsEditing(false); setEditName(localUserData?.displayName || ''); }} className="text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-4 py-2 rounded-xl">Cancel</button>
                   </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                   <h2 className="text-2xl font-bold tracking-tight">{localUserData?.displayName || 'User'}</h2>
                   <button onClick={() => setIsEditing(true)} className="p-1 opacity-20 hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                   </button>
                </div>
              )}
              <p className="text-[10px] font-bold text-f-gray uppercase tracking-widest mt-1 opacity-60">{localUserData?.email}</p>
           </div>

           {isAdmin && (
              <button 
                onClick={() => navigate('/admin')}
                className="w-full mb-8 p-5 bg-[#1F2029] text-white rounded-[24px] flex items-center justify-between shadow-xl shadow-black/10 transition-transform active:scale-[0.98]"
              >
                <div className="flex items-center space-x-4">
                   <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6V3.75c0-1.242 1.008-2.25 2.25-2.25h2.5c1.242 0 2.25 1.008 2.25 2.25V6m-10.5 0V3.75c0-1.242-1.008-2.25-2.25-2.25h-2.5c-1.242 0-2.25 1.008-2.25 2.25V6m0 0V21m10.5 0V6" /></svg>
                   </div>
                   <span className="font-bold text-sm">Admin Panel</span>
                </div>
                <svg className="w-4 h-4 opacity-40" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </button>
           )}

           <div className="space-y-4">
              {menuItems.map((item, idx) => (
                <Link 
                  key={idx} 
                  to={item.path} 
                  className="flex justify-between items-center p-5 bg-white border border-f-light rounded-[28px] hover:bg-f-gray transition-all active:scale-[0.99]"
                >
                   <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-f-gray rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            {item.svg}
                        </svg>
                      </div>
                      <span className="font-bold text-sm">{item.label}</span>
                   </div>
                   <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </Link>
              ))}
              
              <button 
                onClick={handleLogout}
                className="w-full flex justify-between items-center p-5 text-red-500 border border-red-50 rounded-[28px] hover:bg-red-100 transition-colors"
              >
                 <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                    </div>
                    <span className="font-bold text-sm">Log Out</span>
                 </div>
              </button>
           </div>
          </>
       ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="w-24 h-24 bg-f-gray rounded-[32px] flex items-center justify-center mb-8">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
             </div>
             <h2 className="text-xl font-bold mb-2">Welcome</h2>
             <p className="text-xs text-f-gray mb-10 px-10">Sign in to shop for gadgets and track your orders easily.</p>
             <div className="w-full space-y-4 px-4">
                <button onClick={() => navigate('/auth-selector')} className="btn-primary w-full shadow-lg">Login / Sign Up</button>
                <button onClick={() => navigate('/')} className="text-xs font-bold text-black underline uppercase tracking-widest">Back to Home</button>
             </div>
          </div>
       )}
    </div>
  );
};

export default Profile;
