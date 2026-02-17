
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import { Notification, UserProfile } from '../types';
import { useNavigate } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!auth.currentUser) return;
      const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (snap.exists()) setUserProfile(snap.data() as UserProfile);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!auth.currentUser || !userProfile) return;
    
    // Query notifications
    const q = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      
      // Filter logic:
      // 1. Must be targeted to the user OR be a broadcast ('all')
      // 2. Must be created AFTER the user's registration date
      const filtered = allNotifs.filter(n => {
        const isTargeted = n.userId === auth.currentUser?.uid || n.userId === 'all';
        const isFresh = n.createdAt > (userProfile.registrationDate || userProfile.createdAt);
        return isTargeted && isFresh;
      });

      setNotifications(filtered);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile]);

  return (
    <div className="max-w-md mx-auto px-6 py-8 pb-24 min-h-screen bg-white">
      <div className="flex items-center space-x-4 mb-10">
        <button onClick={() => navigate(-1)} className="p-3 bg-f-gray rounded-2xl">
          <i className="fas fa-chevron-left text-sm"></i>
        </button>
        <h1 className="text-xl font-bold tracking-tight">System Alerts</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div></div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center opacity-30">
          <i className="fas fa-bell-slash text-5xl mb-6"></i>
          <p className="text-sm font-bold tracking-widest uppercase">No Alerts for You</p>
          <p className="text-[10px] mt-2 font-medium">New alerts will appear here after they are sent.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {notifications.map(notif => (
            <div key={notif.id} className="bg-f-gray p-6 rounded-[32px] border border-f-light shadow-sm animate-fade-in">
              {notif.image && (
                <div className="w-full h-40 rounded-2xl mb-5 overflow-hidden shadow-inner bg-white/50 border border-white">
                   <img src={notif.image} className="w-full h-full object-cover" alt="" />
                </div>
              )}
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-sm tracking-tight pr-2">{notif.title}</h3>
                <span className="text-[8px] font-bold text-gray-400 uppercase shrink-0">{new Date(notif.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">{notif.message}</p>
            </div>
          ))}
        </div>
      )}
      <p className="mt-12 text-[8px] text-center text-f-gray font-bold uppercase tracking-[0.4em] opacity-30">Vibegadget all rights reserved</p>
    </div>
  );
};

export default NotificationsPage;
