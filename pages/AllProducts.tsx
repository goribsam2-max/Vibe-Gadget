import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';

const AllProducts: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState(location.state?.category || 'All');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });
    return unsubscribe;
  }, []);

  const tabs = ['All', 'Mobile', 'Accessories', 'Gadgets', 'Chargers'];

  return (
    <div className="p-6 pb-24 animate-fade-in bg-white max-w-md mx-auto min-h-screen">
       <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-f-gray rounded-2xl">
             <i className="fas fa-chevron-left text-sm"></i>
          </button>
          <h1 className="text-xl font-bold tracking-tight">Full Inventory</h1>
       </div>

       <div className="flex space-x-3 mb-8 overflow-x-auto no-scrollbar pb-2">
          {tabs.map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all shrink-0 ${activeTab === tab ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100'}`}
            >
              {tab}
            </button>
          ))}
       </div>

       <div className="grid grid-cols-2 gap-5">
          {products.filter(p => activeTab === 'All' || p.category === activeTab).map(product => (
            <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="group cursor-pointer">
              <div className="aspect-[3/4] bg-f-gray rounded-[32px] mb-3 overflow-hidden relative shadow-sm">
                <img src={product.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" alt={product.name} />
              </div>
              <h4 className="font-bold text-sm mb-1 truncate px-1">{product.name}</h4>
              <p className="text-xs font-bold text-black opacity-60 px-1">৳{product.price}</p>
            </div>
          ))}
       </div>
    </div>
  );
};

export default AllProducts;