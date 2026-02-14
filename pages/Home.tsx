
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
    <div className="p-4 md:p-10 pb-24 animate-fade-in bg-white container max-w-7xl mx-auto relative min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="text-[10px] text-f-gray font-bold uppercase tracking-[0.2em]">Active Store</p>
          <button className="flex items-center font-bold text-sm hover:text-gray-600 transition-colors">
            <i className="fas fa-map-marker-alt mr-2 text-black text-xs"></i>
            {locationName}
          </button>
        </div>
        <button onClick={() => navigate('/notifications')} className="p-3 bg-f-gray rounded-2xl relative shadow-sm hover:bg-black hover:text-white transition-all">
          <i className="fas fa-bell text-sm"></i>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-black rounded-full border-2 border-f-gray"></span>
        </button>
      </div>

      <div className="mb-8 md:mb-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-2">VibeGadget</h1>
        <p className="text-xs md:text-sm text-f-gray font-bold uppercase tracking-widest opacity-60">Your Premium Gadget Store</p>
      </div>

      <div onClick={() => navigate('/search')} className="relative mb-10 cursor-pointer group max-w-2xl">
        <div className="w-full bg-f-gray py-5 pl-14 pr-12 rounded-[28px] text-sm text-gray-400 group-hover:bg-gray-100 transition-all border border-transparent group-hover:border-gray-200">Search for gadgets...</div>
        <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-black transition-colors"></i>
      </div>

      <div className="relative mb-12 group overflow-hidden rounded-[40px] md:rounded-[60px] shadow-sm">
        <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${activeBanner * 100}%)` }}>
          {banners.length > 0 ? banners.map((banner, i) => (
            <div key={i} className="min-w-full bg-f-gray aspect-[21/9] md:aspect-[32/10] relative overflow-hidden">
               <img src={banner.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
            </div>
          )) : (
            <div className="min-w-full bg-[#1F2029] aspect-[21/9] flex items-center justify-center p-8 text-white">
               <p className="text-[10px] md:text-xs opacity-40 uppercase font-bold tracking-[0.3em]">Premium Tech Collection</p>
            </div>
          )}
        </div>
        
        {banners.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-white/20 backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/30 shadow-lg z-10">
                {banners.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ease-in-out ${i === activeBanner ? 'w-10 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'w-2.5 bg-white/40 blur-[0.5px]'}`}></div>
                ))}
            </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-8">
        <h3 className="font-bold text-sm md:text-base uppercase tracking-widest">Shop by Category</h3>
        <button onClick={() => navigate('/all-products')} className="text-[10px] md:text-xs font-bold text-gray-400 uppercase hover:text-black transition-colors">See All Products</button>
      </div>

      <div className="flex justify-start mb-12 overflow-x-auto no-scrollbar gap-6 md:gap-10">
        {categories.map(cat => (
          <button key={cat.name} onClick={() => { setActiveCategory(cat.name); navigate('/all-products', { state: { category: cat.name } }); }} className="flex flex-col items-center shrink-0 group">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-f-gray rounded-[32px] md:rounded-[40px] flex items-center justify-center mb-3 group-hover:bg-black group-hover:text-white transition-all shadow-sm group-hover:shadow-xl group-hover:-translate-y-1">
              <i className={`${cat.icon} text-2xl md:text-3xl`}></i>
            </div>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="flex space-x-4 overflow-x-auto no-scrollbar mb-10">
        {['All', 'Accessories', 'Mobile', 'Gadgets'].map(tab => (
          <button 
            key={tab} 
            className={`px-8 py-3.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border transition-all ${activeCategory === tab ? 'bg-black text-white border-black shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-black hover:text-black'}`}
            onClick={() => setActiveCategory(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-10">
        {filteredProducts.map((product, index) => (
          <Link 
            to={`/product/${product.id}`} 
            key={product.id} 
            className="block animate-fade-in group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="bg-f-gray rounded-[40px] mb-4 overflow-hidden relative shadow-sm aspect-[4/5] flex items-center justify-center">
              <img 
                src={product.image} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                alt={product.name} 
              />
              <button className="absolute top-5 right-5 p-3 bg-white/40 backdrop-blur-md rounded-2xl text-white hover:bg-black transition-all active:scale-90 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                <i className="far fa-heart"></i>
              </button>
            </div>
            <div className="px-2 pb-2">
              <h4 className="font-bold text-sm md:text-base leading-tight mb-2 truncate group-hover:text-gray-600 transition-colors">{product.name}</h4>
              <div className="flex justify-between items-center">
                 <p className="text-sm font-bold text-black opacity-80">৳{product.price}</p>
                 <div className="flex items-center text-[10px] font-bold bg-f-gray px-3 py-1 rounded-xl border border-black/5">
                    <i className="fas fa-star text-yellow-400 mr-1.5 text-[8px]"></i>
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
