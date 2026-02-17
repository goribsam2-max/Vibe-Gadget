
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotify } from '../components/Notifications';

const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const notify = useNotify();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }
    
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'wishlist'),
      orderBy('addedAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const removeFromWishlist = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'wishlist', id));
      notify("Removed from wishlist", "info");
    } catch (err) {
      notify("Failed to remove item", "error");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="px-6 md:px-12 py-10 pb-48 bg-white max-w-7xl mx-auto min-h-screen">
      <div className="flex items-center space-x-6 mb-12">
        <button onClick={() => navigate(-1)} className="p-3.5 bg-zinc-50 rounded-2xl shadow-sm hover:bg-black hover:text-white transition-all">
          <i className="fas fa-chevron-left text-xs"></i>
        </button>
        <h1 className="text-2xl md:text-4xl font-black tracking-tight">Saved Items</h1>
      </div>

      {!auth.currentUser ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 bg-zinc-50 rounded-[40px] flex items-center justify-center mb-8 border border-zinc-100">
            <i className="fas fa-lock text-3xl text-zinc-300"></i>
          </div>
          <h2 className="text-xl font-bold mb-3 tracking-tight">Sign In Required</h2>
          <p className="text-sm text-zinc-400 mb-10 max-w-xs mx-auto">Please login to view and manage your saved tech essentials.</p>
          <button onClick={() => navigate('/auth-selector')} className="btn-primary px-12 text-xs uppercase tracking-widest font-black shadow-xl shadow-zinc-200">Sign In Now</button>
        </div>
      ) : items.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <div className="w-24 h-24 bg-zinc-50 rounded-[40px] flex items-center justify-center mb-8 border border-zinc-100">
            <i className="fas fa-heart text-3xl text-zinc-200"></i>
          </div>
          <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.4em]">Nothing saved yet</p>
          <button onClick={() => navigate('/')} className="mt-10 btn-primary px-12 text-xs uppercase tracking-widest shadow-xl shadow-zinc-200">Start Exploring</button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-10">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div 
                layout
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => navigate(`/product/${item.productId}`)}
                className="group cursor-pointer relative"
              >
                <div className="aspect-[3/4] bg-zinc-50 rounded-[32px] md:rounded-[48px] mb-4 overflow-hidden relative shadow-sm border border-zinc-100 group-hover:shadow-2xl transition-all duration-500">
                  <img src={item.image} className="w-full h-full object-contain p-6 md:p-8 transition-transform group-hover:scale-110 duration-700 rounded-[32px]" alt={item.name} />
                  <button 
                    onClick={(e) => removeFromWishlist(item.id, e)}
                    className="absolute top-4 right-4 p-3 bg-black text-white rounded-2xl shadow-xl active:scale-90 transition-transform z-10"
                  >
                    <i className="fas fa-heart text-xs"></i>
                  </button>
                </div>
                <div className="px-2">
                  <h4 className="font-bold text-xs md:text-sm truncate mb-1 tracking-tight group-hover:text-zinc-500 transition-colors">{item.name}</h4>
                  <p className="text-[10px] md:text-xs font-black text-zinc-900 tracking-tight">৳{item.price}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
