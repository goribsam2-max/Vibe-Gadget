
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { getReadableAddress } from '../services/location';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [activeCategory, setActiveCategory] = useState('All');
  const [locationName, setLocationName] = useState('Locating...');
  const navigate = useNavigate();

  const categories = [
    { name: 'Mobile', icon: 'fas fa-mobile-alt' },
    { name: 'Accessories', icon: 'fas fa-headphones' },
    { name: 'Gadgets', icon: 'fas fa-plug' },
    { name: 'Chargers', icon: 'fas fa-bolt' }
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
      navigator.geolocation.getCurrentPosition(async (position) => {
        const address = await getReadableAddress(position.coords.latitude, position.coords.longitude);
        setLocationName(address);
      }, () => {
        setLocationName('Dhaka, Bangladesh');
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

  const filteredProducts = products.filter(p => activeCategory === 'All' || p.category === activeCategory);

  return (
    <div className="p-6 pb-24 animate-fade-in bg-white max-w-md mx-auto relative min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-[10px] text-f-gray font-bold uppercase tracking-[0.2em]">Active Store</p>
          <button className="flex items-center font-bold text-sm hover:text-gray-600 transition-colors">
            <i className="fas fa-map-marker-alt mr-2 text-black text-xs"></i>
            {locationName}
          </button>
        </div>
        <button onClick={() => navigate('/notifications')} className="p-3 bg-f-gray rounded-2xl relative shadow-sm">
          <i className="fas fa-bell text-sm"></i>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-black rounded-full border-2 border-f-gray"></span>
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tighter mb-1">VibeGadget</h1>
        <p className="text-xs text-f-gray font-bold uppercase tracking-widest opacity-60">Premium Tech Ecosystem</p>
      </div>

      <div onClick={() => navigate('/search')} className="relative mb-8 cursor-pointer group">
        <div className="w-full bg-f-gray py-4 pl-12 pr-12 rounded-[24px] text-sm text-gray-400 group-hover:bg-gray-100 transition-colors">Find your next gadget...</div>
        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
      </div>

      <div className="relative mb-10 group overflow-hidden rounded-[40px] shadow-sm">
        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${activeBanner * 100}%)` }}>
          {banners.length > 0 ? banners.map((banner, i) => (
            <div key={i} className="min-w-full bg-f-gray aspect-[16/9] relative overflow-hidden">
               <img src={banner.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
            </div>
          )) : (
            <div className="min-w-full bg-[#1F2029] aspect-[16/9] flex items-center justify-center p-8 text-white">
               <p className="text-[10px] opacity-40 uppercase font-bold tracking-[0.3em]">Discover VibeGadget</p>
            </div>
          )}
        </div>
        
        {banners.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-white/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/30 shadow-lg z-10">
                {banners.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${i === activeBanner ? 'w-8 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'w-2 bg-white/40 blur-[0.5px]'}`}></div>
                ))}
            </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-sm uppercase tracking-widest">Shop Categories</h3>
        <button onClick={() => navigate('/all-products')} className="text-[10px] font-bold text-gray-400 uppercase">View All</button>
      </div>

      <div className="flex justify-between mb-10 overflow-x-auto no-scrollbar gap-5">
        {categories.map(cat => (
          <button key={cat.name} onClick={() => { setActiveCategory(cat.name); navigate('/all-products', { state: { category: cat.name } }); }} className="flex flex-col items-center shrink-0">
            <div className="w-16 h-16 bg-f-gray rounded-[28px] flex items-center justify-center mb-2 hover:bg-black hover:text-white transition-all shadow-sm">
              <i className={`${cat.icon} text-xl`}></i>
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

      <div className="columns-2 gap-4 space-y-4">
        {filteredProducts.map((product, index) => (
          <Link 
            to={`/product/${product.id}`} 
            key={product.id} 
            className="block break-inside-avoid animate-fade-in group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="bg-f-gray rounded-[32px] mb-3 overflow-hidden relative shadow-sm">
              <img 
                src={product.image} 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" 
                alt={product.name} 
              />
              <button className="absolute top-4 right-4 p-2 bg-white/40 backdrop-blur-md rounded-2xl text-white hover:bg-black transition-colors">
                <i className="far fa-heart"></i>
              </button>
            </div>
            <div className="px-2 pb-2">
              <h4 className="font-bold text-[13px] leading-tight mb-1 truncate">{product.name}</h4>
              <div className="flex justify-between items-center">
                 <p className="text-xs font-bold text-black opacity-60">৳{product.price}</p>
                 <div className="flex items-center text-[9px] font-bold bg-white/50 backdrop-blur px-2 py-0.5 rounded-md border border-black/5">
                    <i className="fas fa-star text-yellow-400 mr-1 text-[7px]"></i>
                    {product.rating}
                 </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Floating AI Assistant Button */}
      <button 
        onClick={() => navigate('/ai-assistant')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-black text-white rounded-[20px] shadow-2xl flex items-center justify-center z-50 animate-bounce active:scale-90 transition-transform hover:shadow-black/40 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <i className="fas fa-robot text-xl relative z-10"></i>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
      </button>
    </div>
  );
};

export default Home;
