
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserProfile } from '../../types';
import { useNotify } from '../../components/Notifications';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ManageUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState('');
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; user: UserProfile | null }>({ isOpen: false, user: null });
  const notify = useNotify();

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setUsers(snap.docs.map(d => ({ ...d.data() } as UserProfile)));
    });
    return unsubscribe;
  }, []);

  const toggleBan = async (uid: string, currentStatus: boolean) => {
    await updateDoc(doc(db, 'users', uid), { isBanned: !currentStatus });
    notify(currentStatus ? "User unblocked" : "User blocked", "info");
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.ipAddress?.includes(search)
  );

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 pb-32 min-h-screen bg-[#FDFDFD]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div className="flex items-center space-x-6">
           <button onClick={() => navigate('/admin')} className="p-4 bg-zinc-900 text-white rounded-2xl shadow-xl active:scale-90 transition-all">
             <i className="fas fa-chevron-left text-xs"></i>
           </button>
           <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-900">User List</h1>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Manage Customer Access</p>
           </div>
        </div>
        <div className="relative w-full sm:max-w-md group">
           <input 
             type="text" 
             placeholder="Search by name, email or IP..." 
             className="w-full p-5 bg-white rounded-2xl outline-none border border-zinc-100 focus:border-zinc-900 transition-all font-bold text-sm pl-14 shadow-sm"
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
           <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300"></i>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredUsers.map(user => (
          <motion.div 
            layout
            key={user.uid} 
            className="bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-500 group"
          >
             <div className="flex justify-between items-start mb-8">
                <div className="flex items-center space-x-5">
                   <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=000&color=fff`} className="w-16 h-16 rounded-2xl border-4 border-white shadow-md" alt="" />
                   <div>
                      <p className="font-black text-sm tracking-tight">{user.displayName}</p>
                      <p className="text-[10px] text-zinc-300 font-bold tracking-tight mb-2">{user.email}</p>
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-500'}`}>{user.role}</span>
                   </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${user.isBanned ? 'bg-red-500' : 'bg-green-500'}`}></div>
             </div>

             <div className="space-y-4 mb-10 p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-400">
                   <span>IP Address</span>
                   <code className="text-zinc-900">{user.ipAddress || 'UNKNOWN'}</code>
                </div>
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-400">
                   <span>Last Online</span>
                   <span className="text-zinc-900">{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'N/A'}</span>
                </div>
             </div>

             <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setDetailModal({ isOpen: true, user })}
                  className="flex-1 py-4 bg-zinc-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                >
                  View Profile
                </button>
                <button 
                  onClick={() => toggleBan(user.uid, user.isBanned)}
                  className={`p-4 rounded-2xl shadow-md active:scale-95 transition-all ${user.isBanned ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}
                >
                  <i className={`fas ${user.isBanned ? 'fa-unlock' : 'fa-user-slash'} text-xs`}></i>
                </button>
             </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {detailModal.isOpen && detailModal.user && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[1000] flex items-center justify-center p-6 md:p-12" onClick={() => setDetailModal({ isOpen: false, user: null })}>
            <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[90vh]"
               onClick={e => e.stopPropagation()}
            >
               <div className="w-full md:w-1/3 bg-zinc-900 p-12 text-white flex flex-col items-center justify-between text-center">
                  <div>
                    <img src={detailModal.user.photoURL || `https://ui-avatars.com/api/?name=${detailModal.user.displayName}&background=fff&color=000`} className="w-32 h-32 rounded-[2rem] border-4 border-white/10 shadow-xl mb-8 mx-auto" alt="" />
                    <h3 className="text-2xl font-black tracking-tight mb-2">{detailModal.user.displayName}</h3>
                    <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">{detailModal.user.email}</p>
                  </div>
                  <button onClick={() => setDetailModal({ isOpen: false, user: null })} className="w-full py-4 bg-white text-zinc-900 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Close</button>
               </div>
               <div className="flex-1 p-10 overflow-y-auto">
                  <h2 className="text-2xl font-black tracking-tight mb-8 text-zinc-900">User Information</h2>
                  <section className="space-y-4">
                    <DetailBit label="IP Address" value={detailModal.user.ipAddress} />
                    <DetailBit label="ISP" value={detailModal.user.isp} />
                    <DetailBit label="Time Zone" value={detailModal.user.timeZone} />
                    <DetailBit label="Operating System" value={detailModal.user.osName} />
                    <DetailBit label="Browser" value={detailModal.user.browserName} />
                    <DetailBit label="Last Location" value={detailModal.user.locationName} />
                    <DetailBit label="Joined Date" value={new Date(detailModal.user.createdAt).toLocaleString()} />
                  </section>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailBit = ({ label, value }: { label: string; value?: any }) => (
  <div className="flex justify-between items-center py-4 border-b border-zinc-50">
    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
    <span className="text-xs font-bold text-zinc-900">{value || 'N/A'}</span>
  </div>
);

export default ManageUsers;
