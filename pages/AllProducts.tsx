
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const AllProducts: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState(location.state?.category || 'All');
  const [quickViewImg, setQuickViewImg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });
    return unsubscribe;
  }, []);

  const tabs = ['All', 'Mobile', 'Accessories', 'Gadgets', 'Chargers'];

  return (
    <div className="p-6 md:p-12 pb-48 animate-fade-in bg-white max-w-[1440px] mx-auto min-h-screen font-inter">
       <div className="flex items-center space-x-8 mb-14">
          <button onClick={() => navigate(-1)} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 shadow-sm hover:bg-black hover:text-white transition-all active:scale-90">
             <i className="fas fa-chevron-left text-sm"></i>
          </button>
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">Catalog.</h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.4em] mt-1">Full Stock Access</p>
          </div>
       </div>

       <div className="flex space-x-5 mb-20 overflow-x-auto no-scrollbar pb-3">
          {tabs.map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-10 py-4 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest border transition-all shrink-0 ${activeTab === tab ? 'bg-black text-white border-black shadow-2xl scale-105' : 'bg-white text-zinc-400 border-zinc-100 hover:border-black hover:text-black'}`}
            >
              {tab}
            </button>
          ))}
       </div>

       <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-6 gap-8 md:gap-12 space-y-8 md:space-y-12">
          {products.filter(p => activeTab === 'All' || p.category === activeTab).map(product => (
            <motion.div 
              layout
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="break-inside-avoid"
            >
              <div className="group cursor-pointer relative">
                <div onClick={() => navigate(`/product/${product.id}`)} className="bg-zinc-50 rounded-[3rem] mb-6 overflow-hidden relative border border-zinc-100 group-hover:shadow-2xl transition-all duration-700 shadow-sm group-hover:bg-white">
                  <img src={product.image} className="w-full h-auto object-contain p-8 md:p-10 transition-transform group-hover:scale-105 duration-1000 rounded-[20px]" alt={product.name} />
                  <div className="absolute top-5 right-5">
                    <div className="bg-white/95 backdrop-blur px-4 py-2.5 rounded-2xl text-[11px] font-black shadow-lg border border-zinc-100/50">
                      ৳{product.price}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewImg(product.image); }}
                  className="absolute top-5 left-5 w-12 h-12 bg-white/80 backdrop-blur rounded-2xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-black hover:text-white active:scale-90 shadow-xl border border-white/20"
                >
                   <i className="fas fa-eye text-xs"></i>
                </button>

                <div className="px-4 pb-2" onClick={() => navigate(`/product/${product.id}`)}>
                  <h4 className="font-black text-sm md:text-base truncate mb-1.5 tracking-tight group-hover:text-zinc-500 transition-colors uppercase">{product.name}</h4>
                  <div className="flex items-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    <i className="fas fa-star text-yellow-400 mr-2 text-[8px]"></i>{product.rating || 5.0}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
       </div>

       {products.filter(p => activeTab === 'All' || p.category === activeTab).length === 0 && (
         <div className="py-40 text-center opacity-30 flex flex-col items-center">
            <i className="fas fa-box-open text-6xl mb-8"></i>
            <p className="text-[12px] font-black uppercase tracking-[0.5em]">No Data in this sector</p>
         </div>
       )}

       <AnimatePresence>
        {quickViewImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-[50px] z-[1000] flex items-center justify-center p-6"
            onClick={() => setQuickViewImg(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              className="relative w-full max-w-2xl aspect-square bg-white rounded-[4rem] shadow-2xl p-12 md:p-20 flex items-center justify-center border border-white/20"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setQuickViewImg(null)} className="absolute top-8 right-8 w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm">
                 <i className="fas fa-times"></i>
              </button>
              <img src={quickViewImg} className="max-w-full max-h-full object-contain" alt="Quick preview" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllProducts;
