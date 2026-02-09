
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { Link, useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');
  const [locationName, setLocationName] = useState('Dhaka, Bangladesh');
  const navigate = useNavigate();

  const categories = [
    { name: 'Mobile', svg: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /> },
    { name: 'Accessories', svg: <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5v2.25m0-2.25l2.25 1.313m0 0l2.25 1.313m-2.25-1.313v2.25m2.25 1.313l2.25 1.313m-2.25-1.313v2.25" /> },
    { name: 'Gadgets', svg: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { name: 'Chargers', svg: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /> }
  ];

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
      navigator.geolocation.getCurrentPosition((position) => {
        setLocationName(`Lat: ${position.coords.latitude.toFixed(2)}, Lng: ${position.coords.longitude.toFixed(2)}`);
      }, (error) => {
        console.log("Geolocation error", error);
      });
    }

    return () => {
        unsubscribeProds();
        unsubscribeBanners();
    };
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setActiveBanner(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  return (
    <div className="p-6 pb-24 animate-fade-in bg-white max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-[10px] text-f-gray font-bold uppercase tracking-[0.2em]">Current Store</p>
          <button className="flex items-center font-bold text-sm hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4 mr-1 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            {locationName}
          </button>
        </div>
        <button onClick={() => navigate('/notifications')} className="p-3 bg-f-gray rounded-2xl relative shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-black rounded-full border-2 border-f-gray"></span>
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tighter mb-1">Vibe Gadget</h1>
        <p className="text-xs text-f-gray font-bold uppercase tracking-widest opacity-60">Tech and Mobile Shop</p>
      </div>

      <div onClick={() => navigate('/search')} className="relative mb-8 cursor-pointer group">
        <div className="w-full bg-f-gray py-4 pl-12 pr-12 rounded-[24px] text-sm text-gray-400 group-hover:bg-gray-100 transition-colors">Search for products...</div>
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196 7.5 7.5 0 0010.607 10.607z" /></svg>
      </div>

      {/* Dynamic Banner Carousel - Optimized Visuals */}
      <div className="relative mb-10 group overflow-hidden rounded-[40px] shadow-sm">
        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${activeBanner * 100}%)` }}>
          {banners.length > 0 ? banners.map((banner, i) => (
            <div key={i} className="min-w-full bg-f-gray aspect-[16/9] relative overflow-hidden">
               <img src={banner.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
            </div>
          )) : (
            <div className="min-w-full bg-[#1F2029] aspect-[16/9] flex items-center justify-center p-8 text-white">
               <p className="text-[10px] opacity-40 uppercase font-bold tracking-[0.3em]">Welcome to Vibe Gadget</p>
            </div>
          )}
        </div>
        
        {/* Indicators: Slim pill, blurred, bottom center, white dots */}
        {banners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
                {banners.map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === activeBanner ? 'bg-white scale-125 shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'bg-white/40'}`}></div>
                ))}
            </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-sm uppercase tracking-widest">Shop Categories</h3>
        <button className="text-[10px] font-bold text-gray-400 uppercase">View All</button>
      </div>

      <div className="flex justify-between mb-10 overflow-x-auto no-scrollbar gap-5">
        {categories.map(cat => (
          <button key={cat.name} className="flex flex-col items-center shrink-0">
            <div className="w-16 h-16 bg-f-gray rounded-[28px] flex items-center justify-center mb-2 hover:bg-black hover:text-white transition-all shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {cat.svg}
              </svg>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="flex space-x-3 overflow-x-auto no-scrollbar mb-8">
        {['All', 'Accessories', 'Mobile', 'Gadgets'].map(tab => (
          <button 
            key={tab} 
            className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${activeCategory === tab ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100'}`}
            onClick={() => setActiveCategory(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {products.filter(p => activeCategory === 'All' || p.category === activeCategory).map(product => (
          <Link to={`/product/${product.id}`} key={product.id} className="block group">
            <div className="aspect-[3/4] bg-f-gray rounded-[32px] mb-4 overflow-hidden relative shadow-sm">
              <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} />
              <button className="absolute top-4 right-4 p-2 bg-white/40 backdrop-blur-md rounded-2xl text-white hover:bg-black transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
              </button>
            </div>
            <div className="px-1">
              <h4 className="font-bold text-sm mb-1 truncate">{product.name}</h4>
              <div className="flex justify-between items-center">
                 <p className="text-xs font-bold text-black opacity-60">৳{product.price}</p>
                 <div className="flex items-center text-[10px] font-bold bg-f-gray px-2 py-1 rounded-lg">
                    <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    {product.rating}
                 </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
