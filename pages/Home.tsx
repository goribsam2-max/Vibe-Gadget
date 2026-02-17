
import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { getReadableAddress } from '../services/location';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');
  const [locationName, setLocationName] = useState('Locating...');
  const [quickViewImg, setQuickViewImg] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const bannerContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: bannerContainerRef,
    offset: ["start end", "end start"]
  });
  
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const smoothY = useSpring(parallaxY, { stiffness: 80, damping: 20, restDelta: 0.001 });

  useEffect(() => {
    const qProds = query(collection(db, 'products'));
    const unsubscribeProds = onSnapshot(qProds, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });

    const qBanners = query(collection(db, 'banners'), orderBy('createdAt', 'desc'));
    const unsubscribeBanners = onSnapshot(qBanners, (snapshot) => {
      setBanners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const address = await getReadableAddress(position.coords.latitude, position.coords.longitude);
        setLocationName(address);
      }, () => setLocationName('Dhaka, Bangladesh'));
    }
    return () => { unsubscribeProds(); unsubscribeBanners(); };
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => setActiveBanner(prev => (prev + 1) % banners.length), 6000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const categories = [
    { name: 'Mobile', icon: 'fas fa-mobile-alt' },
    { name: 'Accessories', icon: 'fas fa-headphones' },
    { name: 'Gadgets', icon: 'fas fa-plug' },
    { name: 'Chargers', icon: 'fas fa-bolt' }
  ];

  return (
    <div className="px-6 md:px-12 py-10 pb-48 bg-white max-w-[1440px] mx-auto min-h-screen font-inter">
      <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-between items-center mb-8 md:mb-12">
        <div className="flex flex-col">
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Shipping to</p>
          <button className="flex items-center font-bold text-xs hover:text-zinc-600 transition-colors">
            <i className="fas fa-map-marker-alt text-black mr-2 text-[10px]"></i>
            {locationName}
          </button>
        </div>
        <button onClick={() => navigate('/notifications')} className="p-3 bg-zinc-50 rounded-xl relative border border-zinc-100 active:scale-95 transition-transform">
          <i className="fas fa-bell text-sm"></i>
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
        </button>
      </motion.div>

      <div className="mb-10 md:mb-16">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 leading-tight">Latest Gadgets.</h1>
        <motion.div onClick={() => navigate('/search')} className="relative cursor-pointer w-full max-w-md mt-6 group">
          <div className="w-full bg-zinc-50 py-5 pl-12 pr-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-zinc-400 border border-zinc-100 group-hover:bg-zinc-100 transition-all">Search for products...</div>
          <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300"></i>
        </motion.div>
      </div>

      {banners.length > 0 && (
        <motion.div 
          ref={bannerContainerRef}
          className="relative mb-16 overflow-hidden rounded-[2.5rem] border border-zinc-50 shadow-sm"
        >
          <div className="flex transition-transform duration-1000 ease-[cubic-bezier(0.23, 1, 0.32, 1)]" style={{ transform: `translateX(-${activeBanner * 100}%)` }}>
            {banners.map((banner, i) => (
              <div key={i} className="min-w-full bg-zinc-100 aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1] relative overflow-hidden">
                 <motion.img 
                  src={banner.imageUrl} 
                  style={{ y: smoothY, scale: 1.2 }}
                  className="absolute inset-0 w-full h-full object-cover origin-center" 
                  alt="" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                 <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 text-white max-w-xl">
                    <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-3 uppercase leading-none">{banner.title}</h2>
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-80 mb-6">{banner.description}</p>
                    <button onClick={() => banner.link && navigate(banner.link)} className="px-10 py-3.5 bg-white text-black rounded-full font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-transform">Shop Now</button>
                 </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-6 right-6 flex space-x-2">
             {banners.map((_, i) => (
               <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === activeBanner ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}></div>
             ))}
          </div>
        </motion.div>
      )}

      <div className="flex justify-start mb-16 overflow-x-auto no-scrollbar gap-8 md:gap-12 pb-2 px-2">
        {categories.map(cat => (
          <motion.button whileHover={{ y: -5 }} key={cat.name} onClick={() => setActiveCategory(cat.name === activeCategory ? 'All' : cat.name)} className={`flex flex-col items-center shrink-0 group`}>
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center mb-4 transition-all border ${activeCategory === cat.name ? 'bg-zinc-900 text-white border-zinc-900 scale-105 shadow-lg' : 'bg-zinc-50 border-zinc-100 hover:bg-zinc-100'}`}>
              <i className={`${cat.icon} text-lg md:text-2xl`}></i>
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${activeCategory === cat.name ? 'text-zinc-900' : 'text-zinc-400'}`}>{cat.name}</span>
          </motion.button>
        ))}
      </div>

      <div>
        <div className="flex justify-between items-end mb-10 px-2">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 mb-2">Our Collection</h3>
            <h2 className="text-2xl md:text-4xl font-black tracking-tight">New Arrivals.</h2>
          </div>
          <button onClick={() => navigate('/all-products')} className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors flex items-center">
            View All <i className="fas fa-arrow-right ml-2 text-[8px]"></i>
          </button>
        </div>
        
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-6 gap-6 md:gap-8 space-y-6 md:space-y-8">
          {products.filter(p => activeCategory === 'All' || p.category === activeCategory).map((product) => (
            <motion.div 
              layout
              key={product.id} 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="break-inside-avoid"
            >
              <div className="block group relative">
                <Link to={`/product/${product.id}`} className="block">
                  <div className="bg-zinc-50 rounded-[2.5rem] mb-4 overflow-hidden relative border border-zinc-100 group-hover:bg-white group-hover:shadow-xl transition-all duration-500">
                    <img src={product.image} className="w-full h-auto object-contain p-6 md:p-8 group-hover:scale-105 transition-transform duration-700" alt={product.name} />
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black shadow-sm border border-zinc-100">
                        ৳{product.price}
                      </div>
                    </div>
                  </div>
                </Link>
                
                <button 
                  onClick={(e) => { e.preventDefault(); setQuickViewImg(product.image); }}
                  className="absolute top-4 left-4 w-10 h-10 bg-white/80 backdrop-blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-black hover:text-white shadow-sm"
                >
                   <i className="fas fa-eye text-xs"></i>
                </button>
                
                <div className="px-3 pb-1">
                  <Link to={`/product/${product.id}`}>
                    <h4 className="font-bold text-sm truncate mb-1 tracking-tight group-hover:text-zinc-500 transition-colors uppercase">{product.name}</h4>
                  </Link>
                  <div className="flex items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <i className="fas fa-star text-yellow-400 mr-1.5 text-[8px]"></i>{product.rating}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {quickViewImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-xl z-[1000] flex items-center justify-center p-6"
            onClick={() => setQuickViewImg(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-xl aspect-square bg-white rounded-[3rem] shadow-2xl p-10 flex items-center justify-center border border-zinc-100"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setQuickViewImg(null)} className="absolute top-6 right-6 w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all">
                 <i className="fas fa-times text-xs"></i>
              </button>
              <img src={quickViewImg} className="max-w-full max-h-full object-contain" alt="Preview" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
