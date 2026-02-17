import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { useNotify } from '../components/Notifications';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsDeleting(true);
    try {
      // 1. Delete Firestore User Doc
      await deleteDoc(doc(db, 'users', user.uid));
      // 2. Delete Auth Account
      await deleteUser(user);
      
      notify("Account permanently deleted", "info");
      navigate('/auth-selector');
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        notify("Session expired. Please re-login to delete account.", "error");
        await auth.signOut();
        navigate('/signin');
      } else {
        notify("Process failed", "error");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const options = [
    { label: 'Notification Settings', path: '/notifications', icon: 'fas fa-bell' },
    { label: 'Password Manager', path: '/settings/password', icon: 'fas fa-lock' },
    { label: 'Privacy Policy', path: '/privacy', icon: 'fas fa-shield-alt' },
    { label: 'Delete Account', path: 'DELETE', danger: true, icon: 'fas fa-trash-alt' }
  ];

  return (
    <div className="p-6 pb-24 animate-fade-in min-h-screen bg-white max-w-md mx-auto">
       <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-f-gray rounded-2xl">
             <i className="fas fa-chevron-left text-sm"></i>
          </button>
          <h1 className="text-xl font-bold">Account Settings</h1>
       </div>

       <div className="space-y-4">
          {options.map((opt, i) => (
            <button 
               key={i} 
               onClick={() => opt.path === 'DELETE' ? setShowDeleteModal(true) : navigate(opt.path)}
               className={`w-full flex justify-between items-center p-5 bg-white border border-f-light rounded-[32px] hover:bg-f-gray transition-colors active:scale-95 ${opt.danger ? 'text-red-500 border-red-50 bg-red-50/10' : ''}`}
            >
               <div className="flex items-center space-x-4">
                  <i className={`${opt.icon} text-xs opacity-60`}></i>
                  <span className="font-bold text-sm">{opt.label}</span>
               </div>
               <i className="fas fa-chevron-right text-[10px] opacity-20"></i>
            </button>
          ))}
       </div>

       {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-8 animate-fade-in">
             <div className="bg-white rounded-[40px] p-8 w-full shadow-2xl border border-white/20">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                   <i className="fas fa-exclamation-triangle text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Wait, are you sure?</h3>
                <p className="text-xs text-f-gray text-center font-medium leading-relaxed mb-8 px-4">
                   Deleting your account is permanent. All your order history and profile data will be erased from our database.
                </p>
                <div className="space-y-3">
                   <button 
                      disabled={isDeleting}
                      onClick={handleDeleteAccount}
                      className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold text-xs uppercase tracking-widest active:scale-[0.98] transition-all disabled:opacity-50"
                   >
                      {isDeleting ? 'Deleting...' : 'Permanently Delete'}
                   </button>
                   <button 
                      onClick={() => setShowDeleteModal(false)}
                      className="w-full py-4 bg-f-gray text-black rounded-2xl font-bold text-xs uppercase tracking-widest active:scale-[0.98]"
                   >
                      Keep Account
                   </button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};

export default Settings;