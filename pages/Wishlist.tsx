
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';

const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWishlistItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)).slice(0, 4));
    });
    return unsubscribe;
  }, []);

  const categories = ['All', 'Accessories', 'Gadgets', 'Mobiles'];

  return (
    <div className="p-6 pb-24 animate-fade-in bg-white max-w-md mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-3 bg-f-gray rounded-2xl">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <h1 className="text-xl font-bold tracking-tight">My Wishlist</h1>
      </div>

      <div className="flex space-x-3 mb-8 overflow-x-auto no-scrollbar">
        {categories.map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all shrink-0 ${activeTab === tab ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 'bg-white text-gray-400 border-gray-100'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {wishlistItems.map(item => (
          <div key={item.id} className="block group cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
            <div className="aspect-[3/4] bg-f-gray rounded-[32px] mb-3 overflow-hidden relative shadow-sm">
              <img src={item.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" alt={item.name} />
              <button className="absolute top-4 right-4 p-2 bg-black text-white rounded-2xl shadow-lg active:scale-90 transition-transform">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>
            <div className="px-1 flex justify-between items-start">
               <div className="flex-1 min-w-0 pr-2">
                  <h4 className="font-bold text-sm mb-1 truncate">{item.name}</h4>
                  <p className="text-xs font-bold text-f-gray">৳{item.price}</p>
               </div>
               <div className="flex items-center text-[10px] font-bold bg-f-gray px-2 py-1 rounded-lg">
                  <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  {item.rating}
               </div>
            </div>
          </div>
        ))}
      </div>
      
      {wishlistItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
             <div className="w-20 h-20 bg-f-gray rounded-[32px] flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
             </div>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nothing saved yet</p>
             <button onClick={() => navigate('/')} className="mt-8 text-black font-bold underline text-xs uppercase tracking-widest">Explore Tech</button>
          </div>
      )}
    </div>
  );
};

export default Wishlist;
