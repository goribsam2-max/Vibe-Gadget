
import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserProfile } from '../../types';
import { useNotify } from '../../components/Notifications';

const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [notifModal, setNotifModal] = useState<{ isOpen: boolean; uid: string | 'all'; name: string }>({ isOpen: false, uid: '', name: '' });
  const [notifContent, setNotifContent] = useState({ title: '', message: '' });
  const notify = useNotify();

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    setUsers(snap.docs.map(d => ({ ...d.data() } as UserProfile)));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleBan = async (uid: string, currentStatus: boolean) => {
    await updateDoc(doc(db, 'users', uid), { isBanned: !currentStatus });
    notify(currentStatus ? "User Unbanned" : "User Banned", currentStatus ? "success" : "error");
    fetchUsers();
  };

  const sendNotification = async () => {
    if (!notifContent.title || !notifContent.message) return;
    try {
        await addDoc(collection(db, 'notifications'), {
            ...notifContent,
            userId: notifModal.uid,
            read: false,
            createdAt: Date.now()
        });
        notify("Notification Sent!", "success");
        setNotifModal({ isOpen: false, uid: '', name: '' });
        setNotifContent({ title: '', message: '' });
    } catch(e) {
        notify("Failed to send", "error");
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.ipAddress?.includes(search)
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">System Users</h1>
           <p className="text-xs text-f-gray font-bold uppercase tracking-widest mt-1">Manage network access & alerts</p>
        </div>
        <button 
           onClick={() => setNotifModal({ isOpen: true, uid: 'all', name: 'Broadcast to All' })}
           className="px-6 py-3 bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-black/10 active:scale-95 transition-transform"
        >
           Send Broadcast
        </button>
      </div>

      <div className="relative mb-8">
        <input 
          type="text" 
          placeholder="Search by name, email or IP address..." 
          className="w-full p-5 bg-f-gray rounded-[24px] outline-none border border-transparent focus:border-black transition-all font-medium text-sm pl-14"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196 7.5 7.5 0 0010.607 10.607z" /></svg>
      </div>

      <div className="bg-f-gray rounded-[40px] overflow-hidden border border-f-light">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              <tr className="border-b border-white/50">
                <th className="px-8 py-6">Identity</th>
                <th className="px-8 py-6">Network (IP)</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/50">
              {filteredUsers.map(user => (
                <tr key={user.uid} className="hover:bg-white/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=fff&color=000`} className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm" alt="" />
                      <div>
                        <p className="font-bold text-sm tracking-tight">{user.displayName}</p>
                        <p className="text-[10px] text-f-gray font-bold tracking-tight">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                       <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                       <code className="text-xs font-mono font-bold text-blue-600">{user.ipAddress || '0.0.0.0'}</code>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest ${user.isBanned ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-green-500 text-white shadow-lg shadow-green-200'}`}>
                      {user.isBanned ? 'Terminated' : 'Verified'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                       <button 
                         onClick={() => setNotifModal({ isOpen: true, uid: user.uid, name: user.displayName })}
                         className="p-3 bg-white text-black rounded-xl hover:bg-black hover:text-white transition-all shadow-sm active:scale-90"
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                       </button>
                       <button 
                         onClick={() => toggleBan(user.uid, user.isBanned)}
                         className={`p-3 rounded-xl transition-all shadow-sm active:scale-90 ${user.isBanned ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification Modal */}
      {notifModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-md rounded-[40px] p-8 animate-fade-in shadow-2xl">
              <h3 className="text-xl font-bold mb-1 tracking-tight">Send Alert</h3>
              <p className="text-[10px] text-f-gray font-bold uppercase tracking-widest mb-8">Target: {notifModal.name}</p>
              
              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Subject</label>
                    <input 
                       type="text" 
                       className="w-full bg-f-gray p-4 rounded-2xl outline-none border border-transparent focus:border-black transition-all"
                       value={notifContent.title}
                       onChange={e => setNotifContent({...notifContent, title: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Message Content</label>
                    <textarea 
                       className="w-full bg-f-gray p-4 rounded-2xl outline-none border border-transparent focus:border-black transition-all h-32"
                       value={notifContent.message}
                       onChange={e => setNotifContent({...notifContent, message: e.target.value})}
                    />
                 </div>
              </div>
              
              <div className="flex space-x-3 mt-10">
                 <button onClick={sendNotification} className="flex-1 btn-primary text-sm uppercase tracking-widest">Send Now</button>
                 <button onClick={() => setNotifModal({ isOpen: false, uid: '', name: '' })} className="px-8 py-4 text-xs font-bold uppercase text-f-gray">Cancel</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
